import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { Request, Response } from "express";
import { webOrigin } from "../env";
import type { StreamingDevice, StreamingPlan } from "./catalog";

export type SharedCheckoutSelection = {
  v: 2;
  package_id: number;
  device_id: number | null;
  amount_minor: number;
  total_minor: number;
  currency: string;
  exp: number;
  nonce: string;
};

const lifetimeSeconds = 86_400;
const secureCookie = new URL(webOrigin).protocol === "https:";
const ownerCookieName = secureCookie ? "__Host-opplexify-share-owner" : "opplexify-share-owner";

function signingSecret() {
  const secret = process.env.OPPLEX_HANDOFF_SECRET?.trim();
  if (!secret) throw new Error("Checkout sharing is not configured");
  return secret;
}

function digest(domain: string, value: string) {
  return createHmac("sha256", signingSecret()).update(`${domain}\n${value}`).digest();
}

export function isSharedCheckoutSelection(selection: unknown): boolean {
  if (typeof selection !== "string" || selection.length > 1024) return false;
  try {
    const payload = JSON.parse(Buffer.from(selection, "base64url").toString("utf8"));
    return payload?.v === 2;
  } catch {
    return false;
  }
}

export function createSharedCheckout(plan: StreamingPlan, deviceId: number | null, totalMinor: number) {
  const payload: SharedCheckoutSelection = {
    v: 2,
    package_id: plan.id,
    device_id: deviceId,
    amount_minor: Math.round(plan.price * 100),
    total_minor: totalMinor,
    currency: plan.currency,
    exp: Math.floor(Date.now() / 1000) + lifetimeSeconds,
    nonce: randomBytes(24).toString("hex")
  };
  const selection = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return {
    selection,
    signature: digest("opplexify:shared-checkout:v2", selection).toString("hex"),
    expiresAt: new Date(payload.exp * 1000).toISOString()
  };
}

export function verifySharedCheckout(
  selection: unknown,
  signature: unknown,
  plans: StreamingPlan[],
  devices: StreamingDevice[]
): SharedCheckoutSelection | null {
  if (typeof selection !== "string" || !/^[A-Za-z0-9_-]{1,1024}$/.test(selection) ||
      typeof signature !== "string" || !/^[a-f0-9]{64}$/i.test(signature)) return null;
  try {
    const expected = digest("opplexify:shared-checkout:v2", selection);
    const supplied = Buffer.from(signature, "hex");
    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;
    const payload = JSON.parse(Buffer.from(selection, "base64url").toString("utf8")) as SharedCheckoutSelection;
    const now = Math.floor(Date.now() / 1000);
    if (payload?.v !== 2 || !Number.isSafeInteger(payload.package_id) || payload.package_id <= 0 ||
        !Number.isSafeInteger(payload.exp) || payload.exp <= now || payload.exp > now + lifetimeSeconds ||
        typeof payload.nonce !== "string" || !/^[a-f0-9]{48}$/.test(payload.nonce) ||
        !Number.isSafeInteger(payload.amount_minor) || payload.amount_minor <= 0 ||
        !Number.isSafeInteger(payload.total_minor) || payload.total_minor < payload.amount_minor ||
        payload.total_minor > 2_147_483_647 ||
        typeof payload.currency !== "string" || !/^[A-Z]{3}$/.test(payload.currency) ||
        (payload.device_id !== null && (!Number.isSafeInteger(payload.device_id) || payload.device_id <= 0))) return null;
    const plan = plans.find((entry) => entry.id === payload.package_id && entry.available);
    if (!plan || plan.currency !== payload.currency || Math.round(plan.price * 100) !== payload.amount_minor ||
        (plan.type === "plan" && !devices.some((device) => device.id === payload.device_id)) ||
        (plan.type === "reseller" && payload.device_id !== null)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function sharedCheckoutKey(selection: SharedCheckoutSelection) {
  return `shared_${digest("opplexify:shared-checkout-key:v2", selection.nonce).toString("hex")}`;
}

export function sharedCheckoutPublicToken(selection: SharedCheckoutSelection, owner: string) {
  return `sp2_${digest("opplexify:shared-checkout-owner:v2", `${selection.nonce}\n${owner}`).toString("hex").slice(0, 32)}`;
}

export function sharedCheckoutOwner(req: Request): string | null {
  const values = (req.get("Cookie") || "").split(";")
    .map((part) => part.trim())
    .filter((part) => part.startsWith(`${ownerCookieName}=`));
  if (values.length !== 1) return null;
  const value = values[0].slice(ownerCookieName.length + 1);
  return /^[a-f0-9]{64}$/.test(value) ? value : null;
}

export function ensureSharedCheckoutOwner(req: Request, res: Response): string {
  const owner = sharedCheckoutOwner(req) || randomBytes(32).toString("hex");
  res.cookie(ownerCookieName, owner, {
    httpOnly: true,
    secure: secureCookie,
    sameSite: "lax",
    path: "/",
    maxAge: lifetimeSeconds * 1000
  });
  return owner;
}

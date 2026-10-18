import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { LandingAttribution, StreamingDevice, StreamingPlan, validLandingAttribution } from "./catalog";

export type ResumeCheckout = {
  v: 3;
  checkout_key: string;
  public_token: string;
  package_id: number;
  package_type: "plan" | "reseller";
  device_id: number | null;
  amount_minor: number;
  total_minor: number;
  currency: string;
  exp: number;
  owner: string;
  attribution?: LandingAttribution;
};

export type ResumableOrder = {
  checkoutKey: string;
  publicToken: string;
  sourcePackageId: number;
  packageType: string;
  amountMinor: number;
  currency: string;
  status: string;
  safepayTracker: string | null;
};

const lifetimeSeconds = 86_400;

function digest(domain: string, value: string) {
  const secret = process.env.OPPLEX_HANDOFF_SECRET?.trim();
  if (!secret) throw new Error("Checkout resume is not configured");
  return createHmac("sha256", secret).update(`${domain}\n${value}`).digest();
}

function attributionBinding(attribution?: LandingAttribution) {
  if (attribution !== undefined && !validLandingAttribution(attribution)) throw new Error("Invalid landing attribution");
  return attribution ? JSON.stringify([attribution.brand, attribution.session_id ?? null, attribution.locale ?? null, attribution.page ?? null]) : "null";
}

export function resumeCheckoutPublicToken(checkoutKey: string, owner: string, attribution?: LandingAttribution) {
  return `sp2_${digest("opplexify:resume-order-owner:v3", `${checkoutKey}\n${owner}\n${attributionBinding(attribution)}`).toString("hex").slice(0, 32)}`;
}

export function createResumeCheckout(
  plan: StreamingPlan, checkoutKey: string, publicToken: string, deviceId: number | null,
  totalMinor: number, owner: string, attribution?: LandingAttribution
) {
  attributionBinding(attribution);
  const payload: ResumeCheckout = {
    v: 3, checkout_key: checkoutKey, public_token: publicToken,
    package_id: plan.id, package_type: plan.type, device_id: deviceId, amount_minor: Math.round(plan.price * 100), total_minor: totalMinor,
    currency: plan.currency, exp: Math.floor(Date.now() / 1000) + lifetimeSeconds,
    owner: digest("opplexify:resume-browser:v3", owner).toString("hex"),
    ...(attribution ? { attribution } : {})
  };
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", digest("opplexify:resume-encryption:v3", "key"), iv);
  cipher.setAAD(Buffer.from("opplexify:resume:v3"));
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(payload), "utf8"), cipher.final()]);
  return { token: `rc3_${Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64url")}`, expiresAt: new Date(payload.exp * 1000).toISOString() };
}

export function verifyResumeCheckout(
  token: unknown, owner: string | null, plans: StreamingPlan[], devices: StreamingDevice[]
): ResumeCheckout | null {
  if (typeof token !== "string" || !/^rc3_[A-Za-z0-9_-]{60,2048}$/.test(token) || !owner || !/^[a-f0-9]{64}$/.test(owner)) return null;
  try {
    const bytes = Buffer.from(token.slice(4), "base64url");
    const decipher = createDecipheriv("aes-256-gcm", digest("opplexify:resume-encryption:v3", "key"), bytes.subarray(0, 12));
    decipher.setAuthTag(bytes.subarray(12, 28));
    decipher.setAAD(Buffer.from("opplexify:resume:v3"));
    const payload = JSON.parse(Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString("utf8")) as ResumeCheckout;
    const now = Math.floor(Date.now() / 1000);
    if (!payload || typeof payload !== "object" || Array.isArray(payload) ||
        Object.keys(payload).some((key) => !["v", "checkout_key", "public_token", "package_id", "package_type", "device_id", "amount_minor", "total_minor", "currency", "exp", "owner", "attribution"].includes(key)) ||
        payload.v !== 3 || typeof payload.checkout_key !== "string" || !/^(?:[A-Za-z0-9_-]{16,128}|shared_[a-f0-9]{64})$/.test(payload.checkout_key) ||
        typeof payload.public_token !== "string" || !/^sp2_[a-f0-9]{32}$/.test(payload.public_token) ||
        !Number.isSafeInteger(payload.package_id) || payload.package_id <= 0 ||
        !Number.isSafeInteger(payload.exp) || payload.exp <= now || payload.exp > now + lifetimeSeconds ||
        typeof payload.owner !== "string" || !/^[a-f0-9]{64}$/.test(payload.owner) ||
        !timingSafeEqual(Buffer.from(payload.owner, "hex"), digest("opplexify:resume-browser:v3", owner)) ||
        !Number.isSafeInteger(payload.amount_minor) || payload.amount_minor <= 0 ||
        !Number.isSafeInteger(payload.total_minor) || payload.total_minor < payload.amount_minor || payload.total_minor > 2_147_483_647 ||
        typeof payload.currency !== "string" || !/^[A-Z]{3}$/.test(payload.currency) ||
        (payload.device_id !== null && (!Number.isSafeInteger(payload.device_id) || payload.device_id <= 0)) ||
        (payload.attribution !== undefined && !validLandingAttribution(payload.attribution))) return null;
    const plan = plans.find((entry) => entry.id === payload.package_id && entry.available);
    if (!plan || plan.type !== payload.package_type || plan.currency !== payload.currency || Math.round(plan.price * 100) !== payload.amount_minor ||
        (plan.type === "plan" && payload.device_id !== null && !devices.some((device) => device.id === payload.device_id)) ||
        (plan.type === "reseller" && payload.device_id !== null)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function resumeCheckoutStatus(selection: ResumeCheckout, order: ResumableOrder | null) {
  if (!order || order.checkoutKey !== selection.checkout_key || order.publicToken !== selection.public_token ||
      order.sourcePackageId !== selection.package_id || order.packageType !== selection.package_type || order.amountMinor !== selection.total_minor || order.currency !== selection.currency) return "unavailable";
  if (order.status === "PAID") return "paid";
  if (order.status === "CANCELLED") return "cancelled";
  if (order.status === "FAILED") return "failed";
  if (!["PENDING", "CHECKOUT_STARTED"].includes(order.status)) return "unavailable";
  return order.safepayTracker && /^track_[A-Za-z0-9_-]+$/.test(order.safepayTracker) ? "available" : "processing";
}

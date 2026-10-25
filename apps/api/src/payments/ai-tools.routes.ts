import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { Router } from "express";
import { webOrigin } from "../env";
import { asyncHandler } from "../http";
import { prisma } from "../prisma/prisma.service";
import { ensureSharedCheckoutOwner, sharedCheckoutOwner } from "../streaming/shared-checkout";
import { createCheckoutRateLimit, hostedCheckoutUrl, safepayConfig, safepayRequest } from "./streaming-safepay.routes";

type AiSelection = {
  v: 1;
  source: "getaitools";
  tool_id: string;
  tool_name: string;
  plan_id: string;
  plan_name: string;
  amount_minor: number;
  currency: "USD";
  duration: string;
  access: string;
  note: string;
  exp: number;
};

async function verifiedSelection(selection: unknown, signature: unknown): Promise<AiSelection | null> {
  const secret = process.env.GETAI_CHECKOUT_SECRET?.trim();
  if (!secret || typeof selection !== "string" || !/^[A-Za-z0-9_-]{1,8192}$/.test(selection) ||
      typeof signature !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(signature)) return null;
  const expected = createHmac("sha256", secret).update(selection).digest();
  const supplied = Buffer.from(signature, "base64url");
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;
  let payload: AiSelection;
  try {
    payload = JSON.parse(Buffer.from(selection, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  const now = Math.floor(Date.now() / 1000);
  if (payload?.v !== 1 || payload.source !== "getaitools" || payload.currency !== "USD" ||
      !Number.isSafeInteger(payload.exp) || payload.exp <= now || payload.exp > now + 600 ||
      !Number.isSafeInteger(payload.amount_minor) || payload.amount_minor <= 0 || payload.amount_minor > 2_147_483_647 ||
      typeof payload.tool_id !== "string" || !/^[a-z0-9-]{1,100}$/.test(payload.tool_id) ||
      typeof payload.plan_id !== "string" || !/^[a-z0-9-]{1,160}$/.test(payload.plan_id) ||
      [payload.tool_name, payload.plan_name, payload.duration, payload.access].some((value) =>
        typeof value !== "string" || !value.trim() || value.length > 500 || /[\x00-\x1f\x7f]/.test(value)) ||
      typeof payload.note !== "string" || payload.note.length > 2000 || /[\x00-\x1f\x7f]/.test(payload.note)) return null;

  const url = new URL("https://getaitools.shop/checkout");
  url.searchParams.set("tool", payload.tool_id);
  url.searchParams.set("plan", payload.plan_id);
  url.searchParams.set("format", "json");
  const response = await fetch(url, { cache: "no-store", redirect: "error", signal: AbortSignal.timeout(8_000) });
  if (!response.ok) return null;
  const current = await response.json() as Partial<AiSelection>;
  const fields = ["v", "source", "tool_id", "tool_name", "plan_id", "plan_name", "amount_minor", "currency", "duration", "access", "note"] as const;
  return fields.every((key) => current[key] === payload[key]) ? payload : null;
}

export function createAiToolsRouter() {
  const router = Router();
  const checkoutRateLimit = createCheckoutRateLimit();
  router.use((_req, res, next) => {
    res.set("Cache-Control", "private, no-store");
    res.set("Referrer-Policy", "no-referrer");
    res.set("X-Robots-Tag", "noindex, nofollow");
    next();
  });

  router.get("/selection", asyncHandler(async (req, res) => {
    try {
      const selected = await verifiedSelection(req.query.selection, req.query.signature);
      if (!selected) {
        res.status(409).json({ message: "This GetAI Tools selection is invalid, expired or has changed. Return to the tool page for a fresh checkout link." });
        return;
      }
      ensureSharedCheckoutOwner(req, res);
      res.json(selected);
    } catch {
      res.status(503).json({ message: "We could not confirm the current GetAI Tools plan. Please try again shortly." });
    }
  }));

  router.get("/orders/:publicToken", asyncHandler(async (req, res) => {
    const token = typeof req.params.publicToken === "string" ? req.params.publicToken : "";
    if (!/^gai_[a-f0-9]{32}$/.test(token)) {
      res.status(404).json({ message: "Order not found." });
      return;
    }
    const order = await prisma.streamingOrder.findUnique({ where: { publicToken: token } });
    if (!order || order.packageType !== "ai_tool") {
      res.status(404).json({ message: "Order not found." });
      return;
    }
    res.json({ order: {
      publicToken: order.publicToken, packageName: order.packageName, providerName: order.providerName,
      durationLabel: order.durationLabel, amountMinor: order.amountMinor, currency: order.currency,
      status: order.status, paidAt: order.paidAt,
      invoiceUrl: order.status === "PAID" ? `/public/safepay/invoice/${order.publicToken}` : null
    } });
  }));

  router.post("/checkout", checkoutRateLimit, asyncHandler(async (req, res) => {
    const owner = sharedCheckoutOwner(req);
    if (req.get("Origin") !== webOrigin || !owner) {
      res.status(403).json({ message: "Open the GetAI checkout in this browser before continuing." });
      return;
    }
    const config = safepayConfig();
    if (!config) {
      res.status(503).json({ message: "Secure payment is temporarily unavailable. Please contact GetAI Tools." });
      return;
    }
    let orderToken: string | null = null;
    let orderId: string | null = null;
    let claimTime: Date | null = null;
    try {
      const selected = await verifiedSelection(req.body?.selection, req.body?.signature);
      if (!selected) {
        res.status(409).json({ message: "This plan link has expired or changed. Return to GetAI Tools for the current price." });
        return;
      }
      const digest = createHash("sha256").update(`${req.body.selection}\n${owner}`).digest("hex");
      const checkoutKey = `getai_${digest}`;
      const token = `gai_${digest.slice(0, 32)}`;
      const packageName = `${selected.tool_name} — ${selected.plan_name}`;
      if (packageName.length > 191 || selected.duration.length > 191) {
        res.status(422).json({ message: "Please contact GetAI Tools to confirm this plan." });
        return;
      }
      const order = await prisma.streamingOrder.upsert({
        where: { checkoutKey }, update: {},
        create: {
          checkoutKey, publicToken: token, sourcePackageId: 0, packageType: "ai_tool", providerName: "GetAI Tools",
          packageName, durationLabel: selected.duration, amount: selected.amount_minor / 100,
          amountMinor: selected.amount_minor, currency: "USD"
        }
      });
      orderToken = order.publicToken;
      orderId = order.id;
      if (order.packageType !== "ai_tool" || order.publicToken !== token || order.packageName !== packageName ||
          order.amountMinor !== selected.amount_minor || order.currency !== "USD" || order.durationLabel !== selected.duration) {
        res.status(409).json({ message: "This saved checkout no longer matches the selected plan.", orderToken });
        return;
      }
      if (order.status === "PAID" || order.status === "CANCELLED" || (order.status === "FAILED" && order.safepayTracker)) {
        res.json({ orderToken, status: order.status.toLowerCase() });
        return;
      }
      let tracker = order.safepayTracker;
      if (!tracker) {
        claimTime = new Date();
        const claimed = await prisma.streamingOrder.updateMany({
          where: { id: order.id, safepayTracker: null, OR: [
            { status: "PENDING" }, { status: "FAILED" },
            { status: "CHECKOUT_STARTED", updatedAt: { lt: new Date(claimTime.getTime() - 120_000) } }
          ] },
          data: { status: "CHECKOUT_STARTED", updatedAt: claimTime }
        });
        if (claimed.count !== 1) {
          res.status(409).json({ message: "This checkout is already starting. Check its status before retrying.", orderToken });
          return;
        }
        const session = await safepayRequest<{ data?: { tracker?: { token?: string }; capabilities?: Record<string, boolean> } }>(config, "/order/payments/v3/", {
          merchant_api_key: config.publicKey, intent: config.intent, mode: "payment", entry_mode: "raw",
          currency: order.currency, amount: order.amountMinor,
          metadata: { order_id: order.publicToken, source: "getaitools", tool_id: selected.tool_id, plan_id: selected.plan_id },
          include_fees: false
        });
        tracker = session.data?.tracker?.token ?? null;
        if (!tracker || session.data?.capabilities?.[config.intent] !== true) throw new Error("Payment session unavailable");
        const saved = await prisma.streamingOrder.updateMany({
          where: { id: order.id, status: "CHECKOUT_STARTED", safepayTracker: null, updatedAt: claimTime },
          data: { safepayTracker: tracker }
        });
        if (saved.count !== 1) {
          res.status(409).json({ message: "Please check this payment's status before retrying.", orderToken });
          return;
        }
      }
      const checkoutUrl = await hostedCheckoutUrl(config, tracker, orderToken);
      res.json({ checkoutUrl, orderToken });
    } catch {
      if (orderId && claimTime) await prisma.streamingOrder.updateMany({
        where: { id: orderId, safepayTracker: null, status: "CHECKOUT_STARTED", updatedAt: claimTime },
        data: { status: "FAILED" }
      });
      res.status(503).json({ message: "Secure checkout could not be opened. Check any saved order status before trying again.", ...(orderToken ? { orderToken } : {}) });
    }
  }));
  return router;
}

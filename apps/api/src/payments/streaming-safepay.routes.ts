import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { NextFunction, Request, Response, Router } from "express";
import { Prisma } from "../generated/prisma/client";
import { webOrigin } from "../env";
import { createPaymentInvoice } from "./payment-invoice";
import { asyncHandler } from "../http";
import { prisma } from "../prisma/prisma.service";
import { fetchStreamingCatalog, selectedPackageId, StreamingPlan } from "../streaming/catalog";

type SafepayEnvironment = "sandbox" | "production";

type SafepayConfig = {
  environment: SafepayEnvironment;
  apiBase: string;
  checkoutBase: string;
  publicKey: string;
  secretKey: string;
  webhookSecret: string | null;
  intent: string;
};

type PaymentSessionResponse = {
  data?: {
    capabilities?: Record<string, boolean>;
    tracker?: { token?: string };
  };
};

type PassportResponse = { data?: string };

const liveTestPlan = {
  id: 0,
  type: "test_payment",
  providerName: "Opplexify",
  name: "PKR 50 Test Payment",
  durationLabel: "One-time live test",
  price: 50,
  currency: "PKR",
  available: true
};

type PaymentReportResponse = {
  data?: {
    token?: string;
    environment?: string;
    state?: string;
    customer?: {
      first_name?: string;
      last_name?: string;
      email?: string;
      phone?: string;
    };
    metadata?: { order_id?: { value?: string } };
    purchase_totals?: {
      quote_amount?: {
        amount?: number | string;
        currency?: string;
      };
    };
  };
};

export function createStreamingSafepayRouter() {
  const router = Router();
  const checkoutRateLimit = createCheckoutRateLimit();

  router.get("/invoice/:publicToken", asyncHandler(async (req, res) => {
    res.set("Cache-Control", "private, no-store");
    res.set("X-Robots-Tag", "noindex, nofollow");
    const token = typeof req.params.publicToken === "string" ? req.params.publicToken : "";
    if (!/^(?:sp2_[a-f0-9]{32}|spt_[a-f0-9]{32}|c[a-z0-9]{24,31})$/.test(token)) {
      res.status(404).send("Invoice not found");
      return;
    }

    const order = await prisma.streamingOrder.findUnique({ where: { publicToken: token } });
    if (!order) {
      res.status(404).send("Invoice not found");
      return;
    }
    if (order.status !== "PAID" || !order.paidAt || !order.safepayTracker ||
        !Number.isSafeInteger(order.amountMinor) || order.amountMinor <= 0 ||
        !/^[A-Z]{3}$/.test(order.currency)) {
      res.status(409).send("An invoice is available only after payment has been verified.");
      return;
    }

    const config = safepayConfig();
    if (!config || config.environment !== "production") {
      res.status(503).send("Paid invoices are available only for verified live payments.");
      return;
    }

    try {
      const report = await safepayGet<PaymentReportResponse>(
        config,
        `/reporter/api/v1/payments/${encodeURIComponent(order.safepayTracker)}`,
        5_000
      );
      const verification = verifyReport(report, order.amountMinor, order.currency);
      if (report.data?.environment !== "production" || report.data?.token !== order.safepayTracker ||
          report.data?.metadata?.order_id?.value !== order.publicToken ||
          verification.state !== "TRACKER_ENDED" || !verification.amountMatches) {
        res.status(409).send("This payment could not be verified for a paid invoice. Please contact support.");
        return;
      }

      const pdf = await createPaymentInvoice({ ...order, paidAt: order.paidAt });
      res.set("Content-Disposition", `attachment; filename="Opplexify-invoice-${order.id.replace(/[^A-Za-z0-9_-]/g, "")}.pdf"`);
      res.type("application/pdf").send(pdf);
    } catch {
      res.status(503).send("The invoice is temporarily unavailable. Please try again shortly.");
    }
  }));

  router.all("/test-payment", (_req, res) => {
    res.set("Cache-Control", "no-store");
    res.set("X-Robots-Tag", "noindex, nofollow");
    res.status(410).send("This test payment is no longer available.");
  });

  router.get("/test-payment/orders/:publicToken", asyncHandler(async (req, res) => {
    const token = typeof req.params.publicToken === "string" ? req.params.publicToken : "";
    if (!/^spt_[a-f0-9]{32}$/.test(token)) {
      res.status(404).send("Not found");
      return;
    }

    const order = await prisma.streamingOrder.findUnique({ where: { publicToken: token } });
    if (!order || order.packageType !== liveTestPlan.type || order.sourcePackageId !== 0 ||
        order.currency !== "PKR" || order.amountMinor !== 5000) {
      res.status(404).send("Not found");
      return;
    }

    const paid = order.status === "PAID";
    const failed = order.status === "FAILED" || order.status === "CANCELLED";
    const title = paid ? "Test payment confirmed" : failed ? "Test payment not confirmed" : "Payment confirmation pending";
    liveTestPage(res, title, `
      <p class="badge">LIVE PAYMENT TEST</p>
      <h1>${title}</h1>
      <p>${paid
        ? "SafePay has verified your real PKR 50.00 test payment. No subscription or other service will be activated."
        : "This payment has not been verified as paid. If your bank shows a debit, do not pay again; refresh this page or contact support."}</p>
      <dl><dt>Product</dt><dd>PKR 50 Test Payment</dd><dt>Total</dt><dd>PKR 50.00</dd><dt>Order reference</dt><dd>${token}</dd></dl>
      ${paid ? `<p><a href="/public/safepay/invoice/${token}">Download invoice (PDF)</a></p>
      <p class="note">Download the PDF and attach it in WhatsApp or another app to share it.</p>` : ""}
      <a href="/public/safepay/test-payment/orders/${token}">Refresh payment status</a>
    `);
  }));

  router.post(
    "/checkout",
    checkoutRateLimit,
    asyncHandler(async (req, res) => {
      const isLiveTest = req.path === "/test-payment";
      const testAccess = isLiveTest ? liveTestAccess(req.body) : null;
      const packageId = isLiveTest ? 0 : Number(req.body?.package_id);
      const deviceId = isLiveTest || req.body?.device_id === undefined || req.body?.device_id === ""
        ? null
        : Number(req.body.device_id);
      const checkoutKey = testAccess
        ? `live_test_${testAccess.token}`
        : typeof req.body?.checkout_key === "string" ? req.body.checkout_key.trim() : "";
      const selection = typeof req.body?.selection === "string" ? req.body.selection.trim() : "";
      const signature = typeof req.body?.signature === "string" ? req.body.signature.trim() : "";
      const config = safepayConfig();

      if (isLiveTest && (!testAccess || config?.environment !== "production")) {
        res.status(404).send("Not found");
        return;
      }
      if (isLiveTest && (req.get("Origin") !== webOrigin || req.body?.confirm_live !== "yes")) {
        res.status(403).send("Open the private test link and confirm the live payment before continuing.");
        return;
      }

      if (
        !config ||
        !Number.isSafeInteger(packageId) ||
        (!isLiveTest && packageId <= 0) ||
        !/^[A-Za-z0-9_-]{16,128}$/.test(checkoutKey)
      ) {
        checkoutError(req, res, 422);
        return;
      }

      let orderToken: string | null = null;
      let checkoutClaimAt: Date | null = null;

      try {
        const catalog = isLiveTest ? null : await fetchStreamingCatalog();
        const signedPackageId = catalog ? selectedPackageId(selection, signature, catalog.plans) : null;
        const plan = isLiveTest
          ? liveTestPlan
          : catalog?.plans.find((entry) => entry.id === packageId && entry.available);
        if (!plan || (!isLiveTest && signedPackageId !== packageId)) {
          checkoutError(req, res, 404);
          return;
        }

        const device = deviceId === null
          ? null
          : catalog?.devices.find((entry) => entry.id === deviceId) ?? null;
        if ((plan.type === "plan" && !device) || (plan.type === "reseller" && deviceId !== null)) {
          checkoutError(req, res, 422);
          return;
        }

        const amountMinor = checkoutAmountMinor(plan);
        if ((isLiveTest || plan.currency.toUpperCase() === "USD") && Number(req.body?.quoted_total_minor) !== amountMinor) {
          checkoutError(req, res, 409);
          return;
        }
        const order = await prisma.streamingOrder.upsert({
          where: { checkoutKey },
          update: {},
          create: {
            checkoutKey,
            publicToken: `${isLiveTest ? "spt" : "sp2"}_${randomUUID().replace(/-/g, "")}`,
            sourcePackageId: plan.id,
            packageType: plan.type,
            providerName: plan.providerName,
            packageName: plan.name,
            durationLabel: plan.durationLabel,
            amount: amountMinor / 100,
            amountMinor,
            currency: plan.currency
          }
        });
        orderToken = order.publicToken;

        if (!matchesPlan(order, plan, amountMinor)) {
          checkoutError(req, res, 409, order.publicToken);
          return;
        }

        if (requiresIptvStorage(order.publicToken)) {
          await prepareIptvCheckout(order, deviceId, config.environment);
        }

        if (order.status === "PAID") {
          if (requiresIptvStorage(order.publicToken)) {
            const report = await safepayGet<PaymentReportResponse>(
              config,
              `/reporter/api/v1/payments/${encodeURIComponent(order.safepayTracker ?? "")}`
            );
            await markOrderPaid(order, report, config.environment);
          }
          checkoutStatus(req, res, order.publicToken, "success");
          return;
        }
        if (order.status === "CANCELLED") {
          checkoutStatus(req, res, order.publicToken, "cancelled");
          return;
        }

        if (order.status === "FAILED" && order.safepayTracker) {
          checkoutStatus(req, res, order.publicToken, "failed");
          return;
        }

        let tracker = order.safepayTracker;
        if (!tracker) {
          const claimTime = new Date();
          const claimed = await prisma.streamingOrder.updateMany({
            where: {
              id: order.id,
              safepayTracker: null,
              OR: [
                { status: "PENDING" },
                { status: "FAILED" },
                { status: "CHECKOUT_STARTED", updatedAt: { lt: new Date(claimTime.getTime() - 120_000) } }
              ]
            },
            data: { status: "CHECKOUT_STARTED", updatedAt: claimTime }
          });

          if (claimed.count === 0) {
            const current = await prisma.streamingOrder.findUnique({ where: { id: order.id } });
            if (current?.status === "PAID" || current?.status === "CANCELLED" || current?.status === "FAILED") {
              checkoutStatus(req, res, order.publicToken, current.status === "PAID" ? "success" : current.status.toLowerCase());
              return;
            }
            if (!current?.safepayTracker) {
              checkoutStatus(req, res, order.publicToken, "processing");
              return;
            }
            tracker = current.safepayTracker;
          } else {
            checkoutClaimAt = claimTime;
            const session = await safepayRequest<PaymentSessionResponse>(config, "/order/payments/v3/", {
              merchant_api_key: config.publicKey,
              intent: config.intent,
              mode: "payment",
              entry_mode: "raw",
              currency: order.currency,
              amount: order.amountMinor,
              metadata: {
                order_id: order.publicToken,
                source: "opplexify"
              },
              include_fees: false
            });
            tracker = session.data?.tracker?.token ?? null;
            if (!tracker) throw new Error("Safepay did not return a tracker token");
            if (session.data?.capabilities?.[config.intent] !== true) {
              throw new Error(`${config.intent} payments are not enabled for this Safepay account`);
            }

            const saved = await prisma.streamingOrder.updateMany({
              where: { id: order.id, status: "CHECKOUT_STARTED", safepayTracker: null, updatedAt: checkoutClaimAt },
              data: { safepayTracker: tracker }
            });
            if (saved.count === 0) {
              checkoutStatus(req, res, order.publicToken, "processing");
              return;
            }
          }
        }

        const checkoutUrl = await hostedCheckoutUrl(config, tracker, order.publicToken);
        if (wantsJson(req)) {
          res.json({ checkoutUrl, orderToken: order.publicToken });
          return;
        }
        res.redirect(303, checkoutUrl);
      } catch (error) {
        if (orderToken && checkoutClaimAt) {
          await prisma.streamingOrder.updateMany({
            where: { publicToken: orderToken, status: "CHECKOUT_STARTED", safepayTracker: null, updatedAt: checkoutClaimAt },
            data: { status: "FAILED" }
          });
        }
        console.error("Safepay checkout initialization failed", error instanceof Error ? error.message : error);
        checkoutError(req, res, 503, orderToken ?? undefined);
      }
    })
  );

  router.get(
    "/return",
    asyncHandler(async (req, res) => {
      const tracker = typeof req.query.tracker === "string" ? req.query.tracker : "";
      const config = safepayConfig();
      const order = tracker ? await prisma.streamingOrder.findUnique({ where: { safepayTracker: tracker } }) : null;

      if (!config || !order) {
        res.redirect(303, "/checkout?status=failed");
        return;
      }

      try {
        const report = await safepayGet<PaymentReportResponse>(
          config,
          `/reporter/api/v1/payments/${encodeURIComponent(tracker)}`
        );
        const verification = verifyReport(report, order.amountMinor, order.currency);

        if (verification.amountMatches && verification.state === "TRACKER_ENDED") {
          await markOrderPaid(order, report, config.environment);
          res.redirect(303, orderStatusUrl(order.publicToken, "success"));
          return;
        }

        if (!verification.amountMatches && verification.state === "TRACKER_ENDED") {
          await prisma.streamingOrder.updateMany({
            where: { id: order.id, status: { not: "PAID" } },
            data: { status: "FAILED" }
          });
          res.redirect(303, orderStatusUrl(order.publicToken, "failed"));
          return;
        }

        res.redirect(303, orderStatusUrl(order.publicToken, "processing"));
      } catch (error) {
        console.error("Safepay return verification failed", error instanceof Error ? error.message : error);
        res.redirect(303, orderStatusUrl(order.publicToken, "processing"));
      }
    })
  );

  router.get(
    "/cancel",
    asyncHandler(async (req, res) => {
      const orderToken = typeof req.query.order === "string" ? req.query.order : "";
      const order = orderToken ? await prisma.streamingOrder.findUnique({ where: { publicToken: orderToken } }) : null;
      if (!order) {
        res.redirect(303, "/checkout?status=cancelled");
        return;
      }

      if (order.status === "PAID") {
        res.redirect(303, orderStatusUrl(order.publicToken, "success"));
        return;
      }
      // A browser cancellation callback is not proof that no payment was made.
      res.redirect(303, order.safepayTracker
        ? `/public/safepay/return?tracker=${encodeURIComponent(order.safepayTracker)}`
        : orderStatusUrl(order.publicToken, "processing"));
    })
  );

  return router;
}

export const safepayWebhookHandler = asyncHandler(async (req, res) => {
  const config = safepayConfig();
  const rawBody = Buffer.isBuffer(req.body) ? req.body : null;
  const suppliedSignature = req.get("X-SFPY-SIGNATURE")?.trim() ?? "";

  if (!config?.webhookSecret || !rawBody) {
    res.status(401).json({ message: "Invalid webhook signature" });
    return;
  }

  let payload: Record<string, unknown>;
  try {
    const parsed = JSON.parse(rawBody.toString("utf8")) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid payload");
    payload = parsed as Record<string, unknown>;
  } catch {
    res.status(400).json({ message: "Invalid webhook payload" });
    return;
  }

  // The official SDK signs data; never trust unsigned envelope fields.
  const data = payload.data;
  if (data && typeof data === "object" && !Array.isArray(data) &&
      validWebhookSignature(Buffer.from(JSON.stringify(data)), suppliedSignature, config.webhookSecret)) {
    payload = data as Record<string, unknown>;
  } else if (!validWebhookSignature(rawBody, suppliedSignature, config.webhookSecret)) {
    res.status(401).json({ message: "Invalid webhook signature" });
    return;
  }

  const sourceEventKey = findString(payload, ["event_id", "eventId"]);
  const eventKey = createHash("sha256").update(sourceEventKey || JSON.stringify(payload)).digest("hex");
  const eventType = (findString(payload, ["event_type", "eventType", "type"]) || "unknown").slice(0, 191);
  let event = await prisma.safepayWebhookEvent.findUnique({ where: { eventKey } });

  if (event?.processedAt) {
    res.json({ received: true });
    return;
  }

  if (!event) {
    try {
      event = await prisma.safepayWebhookEvent.create({
        data: {
          eventKey,
          eventType,
          payload: payload as Prisma.InputJsonValue
        }
      });
    } catch {
      event = await prisma.safepayWebhookEvent.findUnique({ where: { eventKey } });
      if (!event) throw new Error("Could not persist Safepay webhook event");
    }
  }

  const tracker = findTracker(payload);
  if (!tracker) {
    res.status(409).json({ message: "Safepay payment tracker is not available yet" });
    return;
  }

  const order = await prisma.streamingOrder.findUnique({ where: { safepayTracker: tracker } });
  if (!order) {
    res.status(409).json({ message: "Safepay order is not available yet" });
    return;
  }

  const report = await safepayGet<PaymentReportResponse>(
    config,
    `/reporter/api/v1/payments/${encodeURIComponent(tracker)}`,
    5_000
  );
  const verification = verifyReport(report, order.amountMinor, order.currency);

  if (verification.state !== "TRACKER_ENDED" || !verification.amountMatches) {
    res.set("Retry-After", "15");
    res.status(503).json({ message: "Safepay payment confirmation is not available yet" });
    return;
  }

  await markOrderPaid(order, report, config.environment);
  await prisma.safepayWebhookEvent.update({
    where: { id: event.id },
    data: { processedAt: new Date() }
  });
  res.json({ received: true });
});

function safepayConfig(): SafepayConfig | null {
  const environment = process.env.SAFEPAY_ENVIRONMENT?.trim().toLowerCase() || "sandbox";
  if (environment !== "sandbox" && environment !== "production") return null;

  const publicKey = environment === "production" ? process.env.SAFEPAY_PUBLIC_KEY?.trim() : process.env.SAFEPAY_SANDBOX_PUBLIC_KEY?.trim();
  const secretKey = environment === "production" ? process.env.SAFEPAY_SECRET_KEY?.trim() : process.env.SAFEPAY_SANDBOX_SECRET_KEY?.trim();
  if (!publicKey || !secretKey) return null;

  const apiHost = environment === "production" ? "https://api.getsafepay.com" : "https://sandbox.api.getsafepay.com";
  return {
    environment,
    apiBase: apiHost,
    checkoutBase: environment === "production" ? "https://getsafepay.com/embedded/" : `${apiHost}/embedded/`,
    publicKey,
    secretKey,
    webhookSecret: process.env.SAFEPAY_WEBHOOK_SECRET?.trim() || null,
    intent: process.env.SAFEPAY_INTENT?.trim().toUpperCase() || "CYBERSOURCE"
  };
}

async function hostedCheckoutUrl(config: SafepayConfig, tracker: string, orderToken: string) {
  const passport = await safepayRequest<PassportResponse>(config, "/client/passport/v1/token", {});
  if (!passport.data) throw new Error("Safepay did not return an authentication token");

  const checkoutUrl = new URL(config.checkoutBase);
  checkoutUrl.searchParams.set("environment", config.environment);
  checkoutUrl.searchParams.set("tbt", passport.data);
  checkoutUrl.searchParams.set("tracker", tracker);
  checkoutUrl.searchParams.set("source", "hosted");
  checkoutUrl.searchParams.set("order_id", orderToken);
  checkoutUrl.searchParams.set("redirect_url", absoluteWebUrl("/public/safepay/return"));
  checkoutUrl.searchParams.set("cancel_url", absoluteWebUrl(`/public/safepay/cancel?order=${encodeURIComponent(orderToken)}`));
  return checkoutUrl.toString();
}

async function safepayRequest<T>(config: SafepayConfig, path: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${config.apiBase}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-SFPY-MERCHANT-SECRET": config.secretKey
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000)
  });

  if (!response.ok) throw new Error(`Safepay request failed with HTTP ${response.status}`);
  return (await response.json()) as T;
}

async function safepayGet<T>(config: SafepayConfig, path: string, timeoutMs = 15_000): Promise<T> {
  const response = await fetch(`${config.apiBase}${path}`, {
    headers: { "X-SFPY-MERCHANT-SECRET": config.secretKey },
    signal: AbortSignal.timeout(timeoutMs)
  });

  if (!response.ok) throw new Error(`Safepay request failed with HTTP ${response.status}`);
  return (await response.json()) as T;
}

function verifyReport(report: PaymentReportResponse, expectedAmount: number, expectedCurrency: string) {
  const payment = report.data;
  const quoteAmount = payment?.purchase_totals?.quote_amount;
  return {
    state: payment?.state ?? "",
    amountMatches: quoteAmount?.currency?.toUpperCase() === expectedCurrency.toUpperCase() && Number(quoteAmount?.amount) === expectedAmount
  };
}

function validWebhookSignature(rawBody: Buffer, signature: string, secret: string) {
  const normalized = signature.replace(/^sha512=/i, "");
  if (!/^[a-f0-9]{128}$/i.test(normalized)) return false;
  const expected = createHmac("sha512", secret).update(rawBody).digest();
  const provided = Buffer.from(normalized, "hex");
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

function findTracker(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const object = value as Record<string, unknown>;
  for (const key of ["tracker", "tracker_token", "trackerToken"]) {
    const candidate = object[key];
    if (typeof candidate === "string" && /^track_[A-Za-z0-9_-]+$/.test(candidate)) return candidate;
    if (candidate && typeof candidate === "object") {
      const token = (candidate as Record<string, unknown>).token;
      if (typeof token === "string" && /^track_[A-Za-z0-9_-]+$/.test(token)) return token;
    }
  }
  for (const candidate of Object.values(object)) {
    const tracker = findTracker(candidate);
    if (tracker) return tracker;
  }
  return null;
}

function findString(value: unknown, keys: string[]): string | null {
  if (!value || typeof value !== "object") return null;
  const object = value as Record<string, unknown>;
  for (const key of keys) {
    if (typeof object[key] === "string" && object[key]) return object[key] as string;
  }
  for (const candidate of Object.values(object)) {
    const match = findString(candidate, keys);
    if (match) return match;
  }
  return null;
}

type IptvCheckout = {
  id: string;
  publicToken: string;
  sourcePackageId: number;
  amountMinor: number;
  currency: string;
  safepayTracker: string | null;
};

function requiresIptvStorage(token: string) {
  // Existing gateway references keep their original callback behavior; only new checkouts use the bridge.
  return /^sp2_[a-f0-9]{32}$/.test(token);
}

async function prepareIptvCheckout(order: IptvCheckout, deviceId: number | null, environment: SafepayEnvironment) {
  const result = await iptvOrderRequest("prepare", {
    reference: order.publicToken,
    package_id: order.sourcePackageId,
    device_id: deviceId,
    amount_minor: order.amountMinor,
    currency: order.currency,
    environment
  });
  if (result.prepared !== true) throw new Error("IPTV checkout preparation was not acknowledged");
}

async function markOrderPaid(order: IptvCheckout, report: PaymentReportResponse, environment: SafepayEnvironment) {
  if (/^spt_[a-f0-9]{32}$/.test(order.publicToken)) {
    const verification = verifyReport(report, 5000, "PKR");
    if (environment !== "production" || order.sourcePackageId !== 0 || order.amountMinor !== 5000 ||
        order.currency !== "PKR" || !order.safepayTracker || report.data?.token !== order.safepayTracker ||
        report.data.environment !== environment || report.data.metadata?.order_id?.value !== order.publicToken ||
        verification.state !== "TRACKER_ENDED" || !verification.amountMatches) {
      throw new Error("SafePay payment does not match the live test checkout");
    }
  }

  if (requiresIptvStorage(order.publicToken)) {
    const verification = verifyReport(report, order.amountMinor, order.currency);
    if (!order.safepayTracker || report.data?.token !== order.safepayTracker ||
        report.data.environment !== environment || report.data.metadata?.order_id?.value !== order.publicToken ||
        verification.state !== "TRACKER_ENDED" || !verification.amountMatches) {
      throw new Error("SafePay payment does not match the IPTV checkout");
    }

    // Only the authenticated reporter supplies payer details, never browser input or unsigned webhook fields.
    const payer = report.data.customer;
    const firstName = typeof payer?.first_name === "string" ? payer.first_name.trim() : "";
    const lastName = typeof payer?.last_name === "string" ? payer.last_name.trim() : "";
    const email = typeof payer?.email === "string" ? payer.email.trim() : "";
    const phone = typeof payer?.phone === "string" ? payer.phone.trim() : null;
    if (!(firstName || lastName) || !email) {
      throw new Error("SafePay customer details are not available for IPTV order storage yet");
    }

    const saved = await iptvOrderRequest("complete", {
      reference: order.publicToken,
      package_id: order.sourcePackageId,
      amount_minor: order.amountMinor,
      currency: order.currency,
      tracker: order.safepayTracker,
      environment,
      customer: { first_name: firstName, last_name: lastName, email, phone }
    });
    if (!Number.isSafeInteger(saved.order_id) || Number(saved.order_id) <= 0) {
      throw new Error("IPTV order storage was not acknowledged");
    }
  }

  // A gateway attempt is complete only after the authoritative IPTV order is persisted.
  await prisma.streamingOrder.updateMany({
    where: { id: order.id, status: { not: "PAID" } },
    data: { status: "PAID", paidAt: new Date() }
  });
}

async function iptvOrderRequest(operation: "prepare" | "complete", payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  const catalogUrl = process.env.OPPLEX_CATALOG_URL?.trim();
  const secret = process.env.OPPLEX_HANDOFF_SECRET?.trim();
  if (!catalogUrl || !secret) throw new Error("IPTV order storage is not configured");

  const path = `/integrations/opplexify/orders/${operation}`;
  const url = new URL(path, catalogUrl);
  const body = JSON.stringify(payload);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const digest = createHash("sha256").update(body).digest("hex");
  const signature = createHmac("sha256", secret).update(`POST\n${path}\n${timestamp}\n${digest}`).digest("hex");
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Opplexify-Timestamp": timestamp,
      "X-Opplexify-Signature": signature
    },
    body,
    redirect: "error",
    signal: AbortSignal.timeout(10_000)
  });
  if (!response.ok) throw new Error(`IPTV order ${operation} failed with HTTP ${response.status}`);
  return (await response.json()) as Record<string, unknown>;
}

function matchesPlan(order: { sourcePackageId: number; amountMinor: number; currency: string; packageType: string }, plan: Pick<StreamingPlan, "id" | "currency"> & { type: string }, amountMinor: number) {
  return order.sourcePackageId === plan.id && order.packageType === plan.type && order.amountMinor === amountMinor && order.currency === plan.currency;
}

function toMinorUnits(amount: number) {
  const value = Math.round(amount * 100);
  if (!Number.isSafeInteger(value) || value <= 0) throw new Error("Invalid package amount");
  return value;
}

function checkoutAmountMinor(plan: Pick<StreamingPlan, "price" | "currency">) {
  const baseMinor = toMinorUnits(plan.price);
  // Match the disclosed estimate in StreamingPlans; not SafePay's confirmed fee schedule.
  const surchargeMinor = plan.currency.toUpperCase() === "USD"
    ? [71, 5, 12, 24].reduce((total, sampleMinor) => total + Math.round(baseMinor * sampleMinor / 1199), 0)
    : 0;
  const totalMinor = baseMinor + surchargeMinor;
  if (!Number.isSafeInteger(totalMinor)) throw new Error("Invalid checkout amount");
  return totalMinor;
}

function absoluteWebUrl(path: string) {
  return new URL(path, `${webOrigin.replace(/\/+$/, "")}/`).toString();
}

function orderStatusUrl(token: string, status: string) {
  if (/^spt_[a-f0-9]{32}$/.test(token)) return `/public/safepay/test-payment/orders/${token}`;
  return `/streaming-plans/order/${encodeURIComponent(token)}?status=${encodeURIComponent(status)}`;
}

function wantsJson(req: Request) {
  return req.get("Accept")?.includes("application/json") === true;
}

function checkoutStatus(req: Request, res: Response, token: string, status: string) {
  if (wantsJson(req)) {
    res.status(status === "success" ? 200 : 409).json({ orderToken: token, status });
    return;
  }
  res.redirect(303, orderStatusUrl(token, status));
}

function checkoutError(req: Request, res: Response, statusCode: number, token?: string) {
  if (wantsJson(req)) {
    res.status(statusCode).json({ message: "Checkout could not be started", orderToken: token ?? null });
    return;
  }
  if (req.path === "/test-payment" && !token) {
    res.status(statusCode).send("The live test checkout could not be started. Reopen your private test link to try again.");
    return;
  }
  res.redirect(303, token ? orderStatusUrl(token, "unavailable") : "/checkout?status=unavailable");
}

function liveTestAccess(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const values = input as Record<string, unknown>;
  const token = values.test_token;
  const expires = values.test_expires;
  const signature = values.test_signature;
  const secret = process.env.OPPLEX_HANDOFF_SECRET?.trim();
  if (!secret || typeof token !== "string" || !/^[a-f0-9]{32}$/.test(token) ||
      typeof expires !== "string" || !/^\d{10}$/.test(expires) ||
      typeof signature !== "string" || !/^[a-f0-9]{64}$/.test(signature)) return null;

  const now = Math.floor(Date.now() / 1000);
  if (Number(expires) <= now || Number(expires) > now + 86_400) return null;
  const expected = createHmac("sha256", secret)
    .update(`opplexify:live-test-payment:v1\nPKR\n5000\n${token}\n${expires}`)
    .digest();
  const supplied = Buffer.from(signature, "hex");
  if (!timingSafeEqual(supplied, expected)) return null;
  return { token, expires, signature };
}

function liveTestPage(res: Response, title: string, body: string) {
  res.set({
    "Cache-Control": "no-store",
    "X-Robots-Tag": "noindex, nofollow, noarchive",
    "Referrer-Policy": "strict-origin",
    "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self' https://getsafepay.com; frame-ancestors 'none'; base-uri 'none'"
  });
  res.type("html").send(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>${title} | Opplexify</title>
<style>body{margin:0;background:#151515;color:#f6f6f6;font:17px/1.6 system-ui,sans-serif}main{max-width:620px;margin:6vh auto;padding:32px;border:1px solid #444;border-radius:22px;background:#222}h1{line-height:1.2}.badge,a{color:#68b4ff}.badge{font-weight:700}button{display:block;width:100%;margin:24px 0;padding:16px;border:0;border-radius:12px;background:#198beb;color:#fff;font:700 18px system-ui;cursor:pointer}label{display:block}.note,dt{color:#bbb;font-size:14px}dd{margin:0 0 16px;overflow-wrap:anywhere}input[type=checkbox]{width:18px;height:18px;margin-right:8px}@media(max-width:700px){main{margin:24px 16px;padding:24px}}</style></head>
<body><main>${body}</main></body></html>`);
}

function createCheckoutRateLimit() {
  const clients = new Map<string, { count: number; resetAt: number }>();
  const windowMs = 15 * 60 * 1000;
  const maxRequests = 10;

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || "unknown";
    let client = clients.get(key);

    if (!client || client.resetAt <= now) {
      if (clients.size >= 10_000) {
        for (const [clientKey, entry] of clients) {
          if (entry.resetAt <= now) clients.delete(clientKey);
        }
      }
      if (clients.size >= 10_000) clients.delete(clients.keys().next().value!);
      client = { count: 0, resetAt: now + windowMs };
      clients.set(key, client);
    }

    client.count += 1;
    if (client.count > maxRequests) {
      checkoutError(req, res, 429);
      return;
    }

    next();
  };
}

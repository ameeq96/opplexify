import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { NextFunction, Request, Response, Router } from "express";
import { Prisma } from "../generated/prisma/client";
import { webOrigin } from "../env";
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

type PaymentReportResponse = {
  data?: {
    state?: string;
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

  router.post(
    "/checkout",
    checkoutRateLimit,
    asyncHandler(async (req, res) => {
      const packageId = Number(req.body?.package_id);
      const deviceId = req.body?.device_id === undefined || req.body?.device_id === ""
        ? null
        : Number(req.body.device_id);
      const checkoutKey = typeof req.body?.checkout_key === "string" ? req.body.checkout_key.trim() : "";
      const selection = typeof req.body?.selection === "string" ? req.body.selection.trim() : "";
      const signature = typeof req.body?.signature === "string" ? req.body.signature.trim() : "";
      const config = safepayConfig();

      if (
        !config ||
        !Number.isSafeInteger(packageId) ||
        packageId <= 0 ||
        !/^[A-Za-z0-9_-]{16,128}$/.test(checkoutKey)
      ) {
        checkoutError(req, res, 422);
        return;
      }

      let orderToken: string | null = null;

      try {
        const catalog = await fetchStreamingCatalog();
        const signedPackageId = selectedPackageId(selection, signature, catalog.plans);
        const plan = catalog.plans.find((entry) => entry.id === packageId && entry.available);
        if (!plan || signedPackageId !== packageId) {
          checkoutError(req, res, 404);
          return;
        }

        const device = deviceId === null
          ? null
          : catalog.devices.find((entry) => entry.id === deviceId) ?? null;
        if ((plan.type === "plan" && !device) || (plan.type === "reseller" && deviceId !== null)) {
          checkoutError(req, res, 422);
          return;
        }

        const amountMinor = toMinorUnits(plan.price);
        const order = await prisma.streamingOrder.upsert({
          where: { checkoutKey },
          update: {},
          create: {
            checkoutKey,
            sourcePackageId: plan.id,
            packageType: plan.type,
            providerName: plan.providerName,
            packageName: plan.name,
            durationLabel: plan.durationLabel,
            amount: plan.price,
            amountMinor,
            currency: plan.currency
          }
        });
        orderToken = order.publicToken;

        if (!matchesPlan(order, plan, amountMinor)) {
          checkoutError(req, res, 409, order.publicToken);
          return;
        }

        if (order.status === "PAID") {
          checkoutStatus(req, res, order.publicToken, "success");
          return;
        }
        if (order.status === "CANCELLED") {
          checkoutStatus(req, res, order.publicToken, "cancelled");
          return;
        }

        if (order.status === "FAILED" && !order.safepayTracker) {
          await prisma.streamingOrder.updateMany({
            where: { id: order.id, status: "FAILED", safepayTracker: null },
            data: { status: "PENDING" }
          });
          order.status = "PENDING";
        } else if (order.status === "FAILED") {
          checkoutStatus(req, res, order.publicToken, "failed");
          return;
        }

        let tracker = order.safepayTracker;
        if (!tracker) {
          const claimed = await prisma.streamingOrder.updateMany({
            where: { id: order.id, status: "PENDING", safepayTracker: null },
            data: { status: "CHECKOUT_STARTED" }
          });

          if (claimed.count === 0) {
            const current = await prisma.streamingOrder.findUnique({ where: { id: order.id } });
            if (!current?.safepayTracker) {
              checkoutStatus(req, res, order.publicToken, "processing");
              return;
            }
            tracker = current.safepayTracker;
          } else {
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

            await prisma.streamingOrder.update({
              where: { id: order.id },
              data: { safepayTracker: tracker }
            });
          }
        }

        const checkoutUrl = await hostedCheckoutUrl(config, tracker, order.publicToken);
        if (wantsJson(req)) {
          res.json({ checkoutUrl, orderToken: order.publicToken });
          return;
        }
        res.redirect(303, checkoutUrl);
      } catch (error) {
        if (orderToken) {
          await prisma.streamingOrder.updateMany({
            where: { publicToken: orderToken, status: "CHECKOUT_STARTED", safepayTracker: null },
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
          await markOrderPaid(order.id);
          res.redirect(303, orderStatusUrl(order.publicToken, "success"));
          return;
        }

        if (!verification.amountMatches) {
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

      await prisma.streamingOrder.updateMany({
        where: { id: order.id, status: { not: "PAID" } },
        data: { status: "CANCELLED" }
      });
      res.redirect(303, orderStatusUrl(order.publicToken, "cancelled"));
    })
  );

  return router;
}

export const safepayWebhookHandler = asyncHandler(async (req, res) => {
  const config = safepayConfig();
  const rawBody = Buffer.isBuffer(req.body) ? req.body : null;
  const suppliedSignature = req.get("X-SFPY-SIGNATURE")?.trim() ?? "";

  if (!config?.webhookSecret || !rawBody || !validWebhookSignature(rawBody, suppliedSignature, config.webhookSecret)) {
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

  const sourceEventKey = findString(payload, ["event_id", "eventId"]);
  const eventKey = createHash("sha256").update(sourceEventKey || rawBody).digest("hex");
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

  if (!verification.amountMatches) {
    await prisma.streamingOrder.updateMany({
      where: { id: order.id, status: { not: "PAID" } },
      data: { status: "FAILED" }
    });
  } else if (verification.state === "TRACKER_ENDED") {
    await markOrderPaid(order.id);
  }

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
    checkoutBase: `${apiHost}/embedded/`,
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

async function markOrderPaid(orderId: string) {
  await prisma.streamingOrder.updateMany({
    where: { id: orderId, status: { not: "PAID" } },
    data: { status: "PAID", paidAt: new Date() }
  });
}

function matchesPlan(order: { sourcePackageId: number; amountMinor: number; currency: string; packageType: string }, plan: StreamingPlan, amountMinor: number) {
  return order.sourcePackageId === plan.id && order.packageType === plan.type && order.amountMinor === amountMinor && order.currency === plan.currency;
}

function toMinorUnits(amount: number) {
  const value = Math.round(amount * 100);
  if (!Number.isSafeInteger(value) || value <= 0) throw new Error("Invalid package amount");
  return value;
}

function absoluteWebUrl(path: string) {
  return new URL(path, `${webOrigin.replace(/\/+$/, "")}/`).toString();
}

function orderStatusUrl(token: string, status: string) {
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
  res.redirect(303, token ? orderStatusUrl(token, "unavailable") : "/checkout?status=unavailable");
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

import { randomUUID } from "node:crypto";
import { NextFunction, Request, Response, Router } from "express";
import { webOrigin } from "../env";
import { asyncHandler } from "../http";

const SAFEPAY_API_BASE = "https://sandbox.api.getsafepay.com";
const SAFEPAY_CHECKOUT_BASE = "https://sandbox.api.getsafepay.com/embedded/";
const DEMO_AMOUNT = 10_000;
const DEMO_CURRENCY = "PKR";

type PaymentSessionResponse = {
  data?: {
    capabilities?: {
      CYBERSOURCE?: boolean;
    };
    tracker?: {
      token?: string;
    };
  };
};

type PassportResponse = {
  data?: string;
};

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

export function createSafepayRouter() {
  const router = Router();
  const checkoutRateLimit = createCheckoutRateLimit();
  const pendingTrackers = new Map<string, { expiresAt: number }>();

  router.post(
    "/checkout",
    checkoutRateLimit,
    asyncHandler(async (_req, res) => {
      const config = sandboxConfig();
      if (!config) {
        res.redirect(303, "/safepay-demo?status=unavailable");
        return;
      }

      const orderId = `opplexify-demo-${Date.now()}-${randomUUID()}`;

      try {
        const session = await safepayRequest<PaymentSessionResponse>("/order/payments/v3/", config.secretKey, {
          merchant_api_key: config.publicKey,
          intent: "CYBERSOURCE",
          mode: "payment",
          entry_mode: "raw",
          currency: DEMO_CURRENCY,
          amount: DEMO_AMOUNT,
          metadata: {
            order_id: orderId,
            source: "opplexify"
          },
          include_fees: false
        });
        const tracker = session.data?.tracker?.token;
        if (!tracker) throw new Error("Safepay did not return a tracker token");
        if (session.data?.capabilities?.CYBERSOURCE !== true) {
          throw new Error("Card payments are not enabled for this Safepay account");
        }

        const passport = await safepayRequest<PassportResponse>("/client/passport/v1/token", config.secretKey, {});
        if (!passport.data) throw new Error("Safepay did not return an authentication token");

        prunePendingTrackers(pendingTrackers);
        pendingTrackers.set(tracker, { expiresAt: Date.now() + 30 * 60 * 1000 });

        const checkoutUrl = new URL(SAFEPAY_CHECKOUT_BASE);
        checkoutUrl.searchParams.set("environment", "sandbox");
        checkoutUrl.searchParams.set("tbt", passport.data);
        checkoutUrl.searchParams.set("tracker", tracker);
        checkoutUrl.searchParams.set("source", "hosted");
        checkoutUrl.searchParams.set("order_id", orderId);
        checkoutUrl.searchParams.set("redirect_url", absoluteWebUrl("/public/safepay/return"));
        checkoutUrl.searchParams.set("cancel_url", absoluteWebUrl("/safepay-demo?status=cancelled"));

        res.redirect(303, checkoutUrl.toString());
      } catch (error) {
        console.error("Safepay sandbox checkout initialization failed", error instanceof Error ? error.message : error);
        res.redirect(303, "/safepay-demo?status=unavailable");
      }
    })
  );

  router.get(
    "/return",
    asyncHandler(async (req, res) => {
      const tracker = typeof req.query.tracker === "string" ? req.query.tracker : "";
      const config = sandboxConfig();
      const pending = pendingTrackers.get(tracker);

      if (!config || !/^track_[A-Za-z0-9-]+$/.test(tracker) || !pending || pending.expiresAt <= Date.now()) {
        pendingTrackers.delete(tracker);
        res.redirect(303, "/safepay-demo?status=failed");
        return;
      }

      try {
        const report = await safepayGet<PaymentReportResponse>(
          `/reporter/api/v1/payments/${encodeURIComponent(tracker)}`,
          config.secretKey
        );
        const payment = report.data;
        const quoteAmount = payment?.purchase_totals?.quote_amount;
        const verified =
          payment?.state === "TRACKER_ENDED" &&
          quoteAmount?.currency === DEMO_CURRENCY &&
          Number(quoteAmount.amount) === DEMO_AMOUNT;

        pendingTrackers.delete(tracker);
        res.redirect(303, `/safepay-demo?status=${verified ? "success" : "failed"}`);
      } catch (error) {
        pendingTrackers.delete(tracker);
        console.error("Safepay sandbox payment verification failed", error instanceof Error ? error.message : error);
        res.redirect(303, "/safepay-demo?status=failed");
      }
    })
  );

  return router;
}

function sandboxConfig() {
  const publicKey = process.env.SAFEPAY_SANDBOX_PUBLIC_KEY?.trim();
  const secretKey = process.env.SAFEPAY_SANDBOX_SECRET_KEY?.trim();
  if (!publicKey || !secretKey) return null;
  return { publicKey, secretKey };
}

async function safepayRequest<T>(path: string, secretKey: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${SAFEPAY_API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-SFPY-MERCHANT-SECRET": secretKey
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000)
  });

  if (!response.ok) throw new Error(`Safepay request failed with HTTP ${response.status}`);
  return (await response.json()) as T;
}

async function safepayGet<T>(path: string, secretKey: string): Promise<T> {
  const response = await fetch(`${SAFEPAY_API_BASE}${path}`, {
    headers: {
      "X-SFPY-MERCHANT-SECRET": secretKey
    },
    signal: AbortSignal.timeout(15_000)
  });

  if (!response.ok) throw new Error(`Safepay request failed with HTTP ${response.status}`);
  return (await response.json()) as T;
}

function absoluteWebUrl(path: string) {
  return new URL(path, `${webOrigin.replace(/\/+$/, "")}/`).toString();
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
      res.redirect(303, "/safepay-demo?status=unavailable");
      return;
    }

    next();
  };
}

function prunePendingTrackers(pendingTrackers: Map<string, { expiresAt: number }>) {
  const now = Date.now();
  for (const [tracker, entry] of pendingTrackers) {
    if (entry.expiresAt <= now) pendingTrackers.delete(tracker);
  }
}

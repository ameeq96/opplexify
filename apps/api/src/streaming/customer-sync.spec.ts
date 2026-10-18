import assert from "node:assert/strict";
import { createHash, createHmac } from "node:crypto";
import * as crypto from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { customerEventBody, customerSyncDestination, customerSyncHeaders, enqueueCustomerEvent, processCustomerSync, validCustomerEventData } from "./customer-sync";

type Row = Parameters<typeof customerEventBody>[0];
type Client = Parameters<typeof processCustomerSync>[0];
const now = new Date("2026-10-11T12:00:00.000Z");
const env = { CUSTOMER_SYNC_ENABLED: "true", NODE_ENV: "test", OPPLEX_CATALOG_URL: "http://127.0.0.1:8001/integrations/opplexify/catalog", OPPLEX_HANDOFF_SECRET: "local-test-secret" };
const event = { eventType: "checkout.started", entityType: "streaming_order", entityId: "order_1", dedupeKey: "created", occurredAt: now,
  data: { reference: `sp2_${"a".repeat(32)}`, status: "PENDING", amount_minor: 1200, currency: "USD" } } as const;

function fakeDatabase() {
  const rows: Row[] = [];
  let sequence = 0n;
  function matches(row: Row, where: Record<string, unknown>) {
    return Object.entries(where).every(([key, wanted]) => {
      const actual = (row as unknown as Record<string, any>)[key];
      if (wanted && typeof wanted === "object" && !(wanted instanceof Date)) {
        return Object.entries(wanted).every(([operator, value]) => {
          if (operator === "in") return (value as unknown[]).includes(actual);
          if (operator === "lt") return actual < (value as any);
          if (operator === "lte") return actual <= (value as any);
          if (operator === "gte") return actual >= (value as any);
          throw new Error(`Unsupported mock operator ${operator}`);
        });
      }
      return actual instanceof Date && wanted instanceof Date ? actual.getTime() === wanted.getTime() : actual === wanted;
    });
  }
  const db = { customerSyncOutbox: {
    async upsert({ where, create }: any) {
      const found = rows.find((row) => row.eventId === where.eventId);
      if (found) return structuredClone(found);
      const row = { sequence: ++sequence, status: "PENDING", attempts: 0, nextAttemptAt: now,
        claimToken: null, leaseExpiresAt: null, deliveredAt: null, lastErrorCode: null, createdAt: now, ...create } as Row;
      rows.push(row);
      return structuredClone(row);
    },
    async findMany({ where, take }: any) {
      return rows.filter((row) => matches(row, where)).slice(0, take).map((row) => structuredClone(row));
    },
    async updateMany({ where, data }: any) {
      let count = 0;
      for (const row of rows) {
        if (!matches(row, where)) continue;
        count++;
        for (const [key, value] of Object.entries(data)) {
          (row as any)[key] = value && typeof value === "object" && "increment" in value
            ? (row as any)[key] + (value as { increment: number }).increment : value;
        }
      }
      return { count };
    }
  } } as unknown as Client;
  return { db, rows };
}

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

test("capture is default-disabled without any database access", async () => {
  const db = {} as Client;
  assert.equal(await enqueueCustomerEvent(db, event, {}), null);
});

test("stable dedupe prevents a retry creating a second event or replacing its snapshot", async () => {
  const { db, rows } = fakeDatabase();
  const first = await enqueueCustomerEvent(db, event, env);
  const second = await enqueueCustomerEvent(db, { ...event, data: { ...event.data, status: "PAID" } }, env);
  assert.equal(rows.length, 1);
  assert.equal(first?.eventId, second?.eventId);
  assert.equal((rows[0].data as any).status, "PENDING");
  await enqueueCustomerEvent(db, { ...event, eventType: "checkout.tracker_attached", dedupeKey: "track_test" }, env);
  assert.equal(rows[1].sequence, 2n);
});

test("source events allow only the approved data and safe lengths", async () => {
  assert.equal(validCustomerEventData({ ...event.data, secret: "no" } as any), false);
  assert.equal(validCustomerEventData({ customer: { name: "A", card: "no" } } as any), false);
  assert.equal(validCustomerEventData({ amount_minor: 0 }), false);
  assert.equal(validCustomerEventData({ package_id: 1.5 }), false);
  assert.equal(validCustomerEventData({ status: "REFUNDED" }), false);
  assert.equal(validCustomerEventData({ reference: "https://example.com/secret" }), false);
  assert.equal(validCustomerEventData({ actor_hash: "raw_cookie" }), false);
  assert.equal(validCustomerEventData({ message: "a".repeat(10001) }), false);
  assert.equal(validCustomerEventData({ invoice_status: "RETRY", error_code: "SMTP_PRE_SEND_FAILURE" }), true);
  const email = `${"x".repeat(180)}@example.com`;
  assert.equal(validCustomerEventData({ customer: { email } }, "payment.verified"), false);
  assert.equal(validCustomerEventData({ customer: { email } }, "contact.submitted"), true);
  assert.equal(validCustomerEventData({ reference: "cmv2dzmer000l82qhg7xdydjz" }), true);
  const { db } = fakeDatabase();
  await assert.rejects(enqueueCustomerEvent(db, { ...event, data: { token: "not_allowed" } as any }, env), /CUSTOMER_EVENT_INVALID/);
});

test("shared-link actor is an opaque hash, never customer identity or URL", async () => {
  const { db, rows } = fakeDatabase();
  await enqueueCustomerEvent(db, { eventType: "share.opened", entityType: "shared_checkout", entityId: `shared_${"b".repeat(64)}`,
    dedupeKey: "c".repeat(64), occurredAt: now, data: { actor_hash: "c".repeat(64), amount_minor: 100, currency: "USD", package_id: 1 } }, env);
  const body = JSON.parse(customerEventBody(rows[0]));
  assert.equal(body.data.customer, undefined);
  assert.equal(body.data.reference, undefined);
  assert.equal(body.data.url, undefined);
  assert.equal(body.sequence, 1);
});

test("local runs reject remote destinations, credentials, redirects and disabled config", () => {
  assert.equal(customerSyncDestination({}), null);
  assert.equal(customerSyncDestination({ ...env, CUSTOMER_SYNC_ENABLED: "false" }), null);
  for (const url of ["https://opplexiptv.com/catalog", "http://127.0.0.1.evil.test", "http://user:password@127.0.0.1", "file:///tmp/data", "invalid"]) {
    assert.equal(customerSyncDestination({ ...env, OPPLEX_CATALOG_URL: url }), null);
  }
  assert.equal(customerSyncDestination(env), "http://127.0.0.1:8001/integrations/opplexify/customer-events");
  assert.equal(customerSyncDestination({ ...env, OPPLEX_CATALOG_URL: "http://[::1]:8001/" }), "http://[::1]:8001/integrations/opplexify/customer-events");
  assert.equal(customerSyncDestination({ ...env, NODE_ENV: "production", OPPLEX_CATALOG_URL: "http://opplexiptv.com" }), null);
});

test("signature binds method, exact path, timestamp and raw JSON bytes", () => {
  const body = '{"message":"a b"}';
  const timestamp = "1791720000";
  const headers = customerSyncHeaders(body, env.OPPLEX_HANDOFF_SECRET, timestamp);
  const expected = createHmac("sha256", env.OPPLEX_HANDOFF_SECRET)
    .update(`POST\n/integrations/opplexify/customer-events\n${timestamp}\n${createHash("sha256").update(body).digest("hex")}`).digest("hex");
  assert.equal(headers["X-Opplexify-Signature"], expected);
  assert.notEqual(customerSyncHeaders(body + " ", env.OPPLEX_HANDOFF_SECRET, timestamp)["X-Opplexify-Signature"], expected);
});

test("successful exact acknowledgement marks one leased event delivered", async () => {
  const { db, rows } = fakeDatabase();
  await enqueueCustomerEvent(db, event, env);
  let calls = 0;
  const fetcher = async (url: any, options: any) => {
    calls++;
    assert.equal(url, customerSyncDestination(env));
    assert.equal(options.redirect, "error");
    assert.ok(options.signal);
    const body = JSON.parse(options.body);
    assert.equal(body.event_id, rows[0].eventId);
    return response({ received: true, event_id: body.event_id });
  };
  await processCustomerSync(db, { env, now: () => now, fetcher: fetcher as typeof fetch });
  assert.equal(rows[0].status, "DELIVERED");
  assert.equal(rows[0].attempts, 1);
  assert.equal(rows[0].claimToken, null);
  assert.deepEqual(rows[0].deliveredAt, now);
  await processCustomerSync(db, { env, now: () => now, fetcher: fetcher as typeof fetch });
  assert.equal(calls, 1);
});

test("transient failure retries with stable event ID; receiver dedupe acknowledges retry", async () => {
  const { db, rows } = fakeDatabase();
  await enqueueCustomerEvent(db, event, env);
  const eventId = rows[0].eventId;
  await processCustomerSync(db, { env, now: () => now, fetcher: (async () => response({}, 503)) as typeof fetch });
  assert.equal(rows[0].status, "RETRY");
  assert.equal(rows[0].lastErrorCode, "HTTP_503");
  assert.equal(rows[0].nextAttemptAt.getTime(), now.getTime() + 30_000);
  await processCustomerSync(db, { env, now: () => new Date(now.getTime() + 30_001),
    fetcher: (async () => response({ received: true, event_id: eventId })) as typeof fetch });
  assert.equal(rows[0].status, "DELIVERED");
  assert.equal(rows[0].attempts, 2);
  assert.equal(rows[0].eventId, eventId);
});

test("ambiguous HTTP/network outcome safely retries identical idempotent event", async () => {
  const { db, rows } = fakeDatabase();
  await enqueueCustomerEvent(db, event, env);
  await processCustomerSync(db, { env, now: () => now, fetcher: (async () => { throw new Error("secret host detail"); }) as typeof fetch });
  assert.equal(rows[0].status, "RETRY");
  assert.equal(rows[0].lastErrorCode, "DELIVERY_FAILED");
  assert.ok(!JSON.stringify(rows[0].data).includes("secret host"));
});

test("wrong acknowledgement is not delivery; invalid payload response is terminal", async () => {
  const { db, rows } = fakeDatabase();
  await enqueueCustomerEvent(db, event, env);
  await processCustomerSync(db, { env, now: () => now, fetcher: (async () => response({ received: true, event_id: "different" })) as typeof fetch });
  assert.equal(rows[0].status, "RETRY");
  assert.equal(rows[0].lastErrorCode, "ACKNOWLEDGEMENT_INVALID");
  await processCustomerSync(db, { env, now: () => new Date(now.getTime() + 30_001), fetcher: (async () => response({}, 422)) as typeof fetch });
  assert.equal(rows[0].status, "FAILED");
});

test("expired lease is recoverable; active lease cannot be stolen", async () => {
  const { db, rows } = fakeDatabase();
  await enqueueCustomerEvent(db, event, env);
  rows[0].status = "SENDING";
  rows[0].claimToken = "previous";
  rows[0].attempts = 1;
  rows[0].leaseExpiresAt = new Date(now.getTime() + 1);
  let calls = 0;
  const fetcher = (async () => { calls++; return response({ received: true, event_id: rows[0].eventId }); }) as typeof fetch;
  await processCustomerSync(db, { env, now: () => now, fetcher });
  assert.equal(calls, 0);
  await processCustomerSync(db, { env, now: () => new Date(now.getTime() + 2), fetcher });
  assert.equal(calls, 1);
  assert.equal(rows[0].status, "DELIVERED");
});

test("exhausted retries stop; stale delivery cannot overwrite new lease", async () => {
  const { db, rows } = fakeDatabase();
  await enqueueCustomerEvent(db, event, env);
  rows[0].attempts = 12;
  let calls = 0;
  const fetcher = (async () => { calls++; return response({}); }) as typeof fetch;
  await processCustomerSync(db, { env, now: () => now, fetcher });
  assert.equal(rows[0].status, "FAILED");
  assert.equal(calls, 0);
  rows[0].status = "RETRY";
  rows[0].attempts = 1;
  await processCustomerSync(db, { env, now: () => now, fetcher: (async () => {
    rows[0].claimToken = "new-owner";
    return response({ received: true, event_id: rows[0].eventId });
  }) as typeof fetch });
  assert.equal(rows[0].status, "SENDING");
  assert.equal(rows[0].claimToken, "new-owner");
});

test("nonloopback local configuration does not touch DB or network", async () => {
  await processCustomerSync({} as Client, { env: { ...env, OPPLEX_CATALOG_URL: "https://opplexiptv.com" },
    fetcher: (async () => { throw new Error("must not run"); }) as typeof fetch });
});

test("unsafe sequence cannot silently lose integer precision", async () => {
  const { db, rows } = fakeDatabase();
  await enqueueCustomerEvent(db, event, env);
  rows[0].sequence = 9007199254740992n;
  assert.throws(() => customerEventBody(rows[0]), /CUSTOMER_EVENT_INVALID/);
});

function paymentHarness(options: { amount?: number; bridgeFailure?: boolean; outboxFailure?: boolean } = {}) {
  const { db: outboxDb, rows } = fakeDatabase();
  const order: any = { id: "order_1", publicToken: event.data.reference, checkoutKey: "checkout_key_for_local_test",
    sourcePackageId: 7, packageType: "plan", providerName: "Example", packageName: "Example plan", durationLabel: "Monthly",
    amount: 12, amountMinor: 1200, currency: "USD", status: "CHECKOUT_STARTED", safepayTracker: "track_local_test",
    paidAt: null, createdAt: now, updatedAt: now, iptvOrderId: null, iptvCustomerId: null };
  const deliveries: any[] = [];
  const webhooks: any[] = [];
  const requests: { url: string; options: any }[] = [];
  const db: any = {
    customerSyncOutbox: outboxDb.customerSyncOutbox,
    streamingOrder: {
      findUnique: async () => structuredClone(order),
      update: async ({ data }: any) => { Object.assign(order, data); return structuredClone(order); },
      updateMany: async ({ where, data }: any) => {
        if (where.status?.not === order.status) return { count: 0 };
        Object.assign(order, data);
        return { count: 1 };
      }
    },
    invoiceEmailDelivery: { create: async ({ data }: any) => { deliveries.push(structuredClone(data)); return data; } },
    safepayWebhookEvent: {
      findUnique: async ({ where }: any) => webhooks.find((value) => value.eventKey === where.eventKey) ?? null,
      create: async ({ data }: any) => { const value = { id: "webhook_1", ...data }; webhooks.push(value); return value; },
      update: async ({ data }: any) => Object.assign(webhooks[0], data)
    },
    $transaction: async (action: (tx: any) => Promise<any>) => {
      const snapshot = structuredClone({ order, rows, deliveries });
      try { return await action(db); }
      catch (error) {
        Object.assign(order, snapshot.order);
        rows.splice(0, rows.length, ...snapshot.rows);
        deliveries.splice(0, deliveries.length, ...snapshot.deliveries);
        throw error;
      }
    }
  };
  const modules: Record<string, any> = {
    "node:crypto": crypto,
    "express": { Router: () => ({ get() {}, post() {}, all() {} }) },
    "../env": { webOrigin: "http://127.0.0.1:3000" },
    "./payment-invoice": { createPaymentInvoice: () => { throw new Error("PDF rendering not expected"); } },
    "./invoice-email": { invoiceEmailRecipient: (value: string) => value || null },
    "../http": { asyncHandler: (handler: unknown) => handler },
    "../prisma/prisma.service": { prisma: db },
    "../streaming/catalog": {}, "../streaming/shared-checkout": {},
    "../streaming/resume-checkout": {},
    "../streaming/customer-sync": { customerSyncEnabled: () => true, validCustomerEventData,
      enqueueCustomerEvent: async (tx: Client, input: Parameters<typeof enqueueCustomerEvent>[1]) => {
        if (options.outboxFailure && input.eventType === "invoice.pending") throw new Error("FAKE_OUTBOX_FAILURE");
        return enqueueCustomerEvent(tx, input, env);
      } }
  };
  const exported: any = {};
  const source = readFileSync(resolve(__dirname, "../payments/streaming-safepay.routes.ts"), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const runtimeEnv = { ...env, SAFEPAY_ENVIRONMENT: "production", SAFEPAY_PUBLIC_KEY: "fake-public", SAFEPAY_SECRET_KEY: "fake-secret", SAFEPAY_WEBHOOK_SECRET: "fake-webhook" };
  runInNewContext(compiled, {
    exports: exported, module: { exports: exported }, Buffer, URL, URLSearchParams, Date, AbortSignal,
    console: { error() {} }, process: { env: runtimeEnv },
    require: (name: string) => {
      if (!(name in modules)) throw new Error(`Unexpected module ${name}`);
      return modules[name];
    },
    fetch: async (target: string | URL, request: any) => {
      const url = String(target);
      requests.push({ url, options: request });
      if (url.includes("/reporter/api/")) return response({ data: {
        token: order.safepayTracker, environment: "production", state: "TRACKER_ENDED",
        metadata: { order_id: { value: order.publicToken } }, purchase_totals: { quote_amount: { amount: options.amount ?? 1200, currency: "USD" } },
        customer: { first_name: "Actual", last_name: "Payer", email: "payer@example.test", phone: "+12345678901" }
      } });
      if (url === "http://127.0.0.1:8001/integrations/opplexify/orders/complete") {
        if (options.bridgeFailure) return response({}, 503);
        return response({ order_id: 42, customer_id: 17, created: true });
      }
      throw new Error(`Unexpected fake network route ${url}`);
    }
  });
  const payload = Buffer.from(JSON.stringify({ event_id: "evt_local", tracker: order.safepayTracker, event_type: "payment.success" }));
  const signature = createHmac("sha512", runtimeEnv.SAFEPAY_WEBHOOK_SECRET).update(payload).digest("hex");
  const res: any = { statusCode: 200, body: null, status(code: number) { this.statusCode = code; return this; },
    json(body: any) { this.body = body; return this; }, set() { return this; } };
  return { order, rows, requests, deliveries, res,
    run: (validSignature = true) => exported.safepayWebhookHandler({ body: payload,
      get: () => validSignature ? signature : "0".repeat(128) }, res) };
}

test("actual webhook code keeps payer ownership, verifies payment, maps IPTV and queues invoice atomically", async () => {
  const harness = paymentHarness();
  await harness.run();
  assert.equal(harness.order.status, "PAID");
  assert.equal(harness.order.iptvOrderId, 42);
  assert.equal(harness.order.iptvCustomerId, 17);
  const bridge = harness.requests.find((request) => request.url.includes("/orders/complete"))!;
  assert.equal(bridge.options.redirect, "error");
  const body = JSON.parse(bridge.options.body);
  assert.deepEqual(body.customer, { first_name: "Actual", last_name: "Payer", email: "payer@example.test", phone: "+12345678901" });
  assert.equal(body.reference, event.data.reference);
  assert.equal(harness.deliveries[0].recipient, "payer@example.test");
  assert.deepEqual(harness.rows.map((row) => row.eventType), ["payment.verified", "payment.bridge_completed", "invoice.pending"]);
  assert.deepEqual(JSON.parse(JSON.stringify(harness.rows[0].data)).customer, { name: "Actual Payer", email: "payer@example.test", phone: "+12345678901" });
  assert.deepEqual(JSON.parse(JSON.stringify(harness.rows[1].data)).customer, JSON.parse(JSON.stringify(harness.rows[0].data)).customer);
  const paidAt = harness.order.paidAt.getTime();
  await harness.run();
  assert.equal(harness.rows.length, 3);
  assert.equal(harness.deliveries.length, 1);
  assert.equal(harness.order.paidAt.getTime(), paidAt);
});

test("actual webhook rejects invalid signature or wrong amount without paid event/order changes", async () => {
  const unsigned = paymentHarness();
  await unsigned.run(false);
  assert.equal(unsigned.res.statusCode, 401);
  assert.equal(unsigned.requests.length, 0);
  assert.equal(unsigned.rows.length, 0);
  const mismatch = paymentHarness({ amount: 1 });
  await mismatch.run();
  assert.equal(mismatch.res.statusCode, 503);
  assert.equal(mismatch.order.status, "CHECKOUT_STARTED");
  assert.equal(mismatch.deliveries.length, 0);
  assert.equal(mismatch.rows.length, 0);
});

test("verified but failed IPTV bridge remains unfinished and durably records its repair state", async () => {
  const harness = paymentHarness({ bridgeFailure: true });
  await assert.rejects(harness.run(), /IPTV order complete failed/);
  assert.equal(harness.order.status, "CHECKOUT_STARTED");
  assert.equal(harness.deliveries.length, 0);
  assert.deepEqual(harness.rows.map((row) => row.eventType), ["payment.verified", "payment.bridge_failed"]);
  assert.equal((harness.rows[1].data as any).error_code, "IPTV_ORDER_SYNC_FAILED");
});

test("failed transactional outbox write rolls back PAID, mapping and invoice creation together", async () => {
  const harness = paymentHarness({ outboxFailure: true });
  await assert.rejects(harness.run(), /FAKE_OUTBOX_FAILURE/);
  assert.equal(harness.order.status, "CHECKOUT_STARTED");
  assert.equal(harness.order.iptvOrderId, null);
  assert.equal(harness.order.iptvCustomerId, null);
  assert.equal(harness.deliveries.length, 0);
  assert.deepEqual(harness.rows.map((row) => row.eventType), ["payment.verified"]);
});

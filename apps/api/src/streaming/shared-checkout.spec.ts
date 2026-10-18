import assert from "node:assert/strict";
import * as crypto from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { after, before, test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import * as catalog from "./catalog";

const secret = "isolated-shared-attribution-test-secret";
const sessionId = "ab6d1c03-1a7e-4d42-a22e-1f53c71ee6d5";
const origin = "https://checkout.example.test";
const owner = "a".repeat(64);
const previousSecret = process.env.OPPLEX_HANDOFF_SECRET;
const plan: catalog.StreamingPlan = { id: 17, type: "plan", providerKey: "geo", providerName: "Geo",
  name: "Plan", description: "", durationLabel: "Monthly", durationMonths: 1, credits: null,
  price: 10, currency: "PKR", features: [], featured: false, available: true };
const attribution: catalog.LandingAttribution = { brand: "geo", session_id: sessionId };
const env = { OPPLEX_HANDOFF_SECRET: secret, OPPLEX_CATALOG_URL: "http://127.0.0.1:8001/integrations/opplexify/catalog",
  SAFEPAY_ENVIRONMENT: "sandbox", SAFEPAY_SANDBOX_PUBLIC_KEY: "fake-public", SAFEPAY_SANDBOX_SECRET_KEY: "fake-secret" };

before(() => { process.env.OPPLEX_HANDOFF_SECRET = secret; });
after(() => {
  if (previousSecret === undefined) delete process.env.OPPLEX_HANDOFF_SECRET;
  else process.env.OPPLEX_HANDOFF_SECRET = previousSecret;
});

function loadSource(file: string, modules: Record<string, unknown>, extra: Record<string, unknown> = {}) {
  const source = readFileSync(resolve(__dirname, file), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exported: Record<string, any> = {};
  runInNewContext(compiled, { exports: exported, module: { exports: exported }, Buffer, URL, URLSearchParams, Date, AbortSignal,
    process: { env }, console: { error() {} }, require(name: string) {
      if (!(name in modules)) throw new Error(`Unexpected test module: ${name}`);
      return modules[name];
    }, ...extra });
  return exported;
}

const shared = loadSource("shared-checkout.ts", {
  "node:crypto": crypto, "../env": { webOrigin: origin }, "./catalog": catalog
}) as typeof import("./shared-checkout");
const resume = loadSource("resume-checkout.ts", {
  "node:crypto": crypto, "./catalog": catalog
}) as typeof import("./resume-checkout");

function signPayload(payload: unknown, domain = "opplexify:shared-checkout:v2") {
  const selection = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return { selection, signature: crypto.createHmac("sha256", secret).update(`${domain}\n${selection}`).digest("hex") };
}

function originalLink(value?: unknown) {
  const payload = { v: 1, package_id: plan.id, exp: Math.floor(Date.now() / 1000) + 600,
    ...(value === undefined ? {} : { attribution: value }) };
  const selection = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return { selection, signature: crypto.createHmac("sha256", secret).update(selection).digest("hex") };
}

function decoded(selection: string) { return JSON.parse(Buffer.from(selection, "base64url").toString("utf8")); }

test("shared links preserve signed origin attribution and keep legacy links valid", () => {
  for (const value of [undefined, { brand: "trex" } as const, attribution]) {
    const link = shared.createSharedCheckout(plan, null, 1000, value);
    const verified = shared.verifySharedCheckout(link.selection, link.signature, [plan], []);
    assert.ok(verified);
    assert.deepEqual(JSON.parse(JSON.stringify(verified.attribution ?? null)), value ?? null);
    assert.equal(verified.total_minor, 1000);
    assert.equal(verified.device_id, null);
  }
});

test("shared attribution cannot be changed, stripped or forged with the v1 signing domain", () => {
  const link = shared.createSharedCheckout(plan, null, 1000, attribution);
  const payload = decoded(link.selection);
  const changed = { ...payload, attribution: { brand: "5g" } };
  const without = { ...payload };
  delete without.attribution;
  for (const value of [changed, without]) {
    assert.equal(shared.verifySharedCheckout(signPayload(value).selection, link.signature, [plan], []), null);
  }
  const v1Signature = crypto.createHmac("sha256", secret).update(link.selection).digest("hex");
  assert.equal(shared.verifySharedCheckout(link.selection, v1Signature, [plan], []), null);
});

test("malformed shared attribution is rejected even with an authentic signature", () => {
  const base = decoded(shared.createSharedCheckout(plan, null, 1000).selection);
  for (const value of [null, [], {}, { brand: "bad" }, { brand: "geo", session_id: "bad" },
    { brand: "geo", email: "not-allowed@example.test" }]) {
    const signed = signPayload({ ...base, attribution: value });
    assert.equal(shared.verifySharedCheckout(signed.selection, signed.signature, [plan], []), null);
    assert.throws(() => shared.createSharedCheckout(plan, null, 1000, value as any), /Invalid landing attribution/);
  }
});

test("attribution does not replace shared nonce/browser ownership or existing quote checks", () => {
  const link = shared.createSharedCheckout(plan, null, 1000, attribution);
  const value = shared.verifySharedCheckout(link.selection, link.signature, [plan], [])!;
  const without = { ...value };
  delete without.attribution;
  assert.equal(shared.sharedCheckoutKey(value), shared.sharedCheckoutKey(without));
  assert.equal(shared.sharedCheckoutPublicToken(value, owner), shared.sharedCheckoutPublicToken(without, owner));
  assert.notEqual(shared.sharedCheckoutPublicToken(value, owner), shared.sharedCheckoutPublicToken(value, "b".repeat(64)));
  assert.equal(shared.verifySharedCheckout(link.selection, link.signature, [{ ...plan, price: 11 }], []), null);
  for (const change of [{ exp: Math.floor(Date.now() / 1000) - 1 }, { total_minor: 999 }, { device_id: 999 }]) {
    const signed = signPayload({ ...value, ...change });
    assert.equal(shared.verifySharedCheckout(signed.selection, signed.signature, [plan], []), null);
  }
});

function routeHarness(options: { prepareStatus?: number; foreignOwner?: boolean } = {}) {
  const routes = new Map<string, (req: any, res: any) => Promise<void>>();
  const requests: { url: string; options: any }[] = [];
  const savedOrders: any[] = [];
  const db: any = { streamingOrder: { upsert: async ({ create }: any) => {
    const order = { ...create, id: "fake-order", status: "CANCELLED", safepayTracker: null, createdAt: new Date(),
      ...(options.foreignOwner ? { publicToken: `sp2_${"f".repeat(32)}` } : {}) };
    savedOrders.push(order);
    return order;
  } }, $transaction: (action: (tx: any) => Promise<any>) => action(db) };
  const router = { get() {}, all() {}, post(path: string, ...handlers: any[]) { routes.set(path, handlers[handlers.length - 1]); } };
  const exported = loadSource("../payments/streaming-safepay.routes.ts", {
    "node:crypto": crypto, "express": { Router: () => router }, "../env": { webOrigin: origin },
    "./payment-invoice": {}, "./invoice-email": {}, "../http": { asyncHandler: (handler: unknown) => handler },
    "../prisma/prisma.service": { prisma: db },
    "../streaming/catalog": { ...catalog, fetchStreamingCatalog: async () => ({ plans: [plan], devices: [] }) },
    "../streaming/shared-checkout": shared,
    "../streaming/resume-checkout": resume,
    "../streaming/customer-sync": { enqueueCustomerEvent: async () => null }
  }, { fetch: async (target: string | URL, request: any) => {
    const url = String(target);
    requests.push({ url, options: request });
    assert.equal(url, "http://127.0.0.1:8001/integrations/opplexify/orders/prepare", "No payment/network operation is permitted in these tests");
    return new Response(JSON.stringify({ prepared: true }), { status: options.prepareStatus ?? 200 });
  } });
  exported.createStreamingSafepayRouter();
  return { requests, savedOrders, async run(path: string, body: Record<string, unknown>, headers: Record<string, string> = {}) {
    const request = { path, body, get(name: string) {
      return { Origin: origin, Accept: "application/json", Cookie: `__Host-opplexify-share-owner=${owner}`, ...headers }[name];
    } };
    const response: any = { statusCode: 200, body: null, set() { return this; },
      status(code: number) { this.statusCode = code; return this; }, json(value: unknown) { this.body = value; return this; } };
    await routes.get(path)!(request, response);
    return response;
  } };
}

function checkoutBody(link: { selection: string; signature: string }) {
  return { package_id: plan.id, device_id: null, quoted_total_minor: 1000,
    checkout_key: "isolated_checkout_key", ...link, attribution: { brand: "trex", email: "unsigned@example.test" } };
}

test("share route forwards only original signed attribution, not unsigned browser fields", async () => {
  for (const value of [undefined, attribution]) {
    const harness = routeHarness();
    const result = await harness.run("/share-checkout", checkoutBody(originalLink(value)));
    assert.equal(result.statusCode, 201);
    const url = new URL(result.body.url);
    const verified = shared.verifySharedCheckout(url.searchParams.get("selection"), url.searchParams.get("signature"), [plan], []);
    assert.ok(verified);
    assert.deepEqual(JSON.parse(JSON.stringify(verified.attribution ?? null)), value ?? null);
    assert.equal(harness.requests.length, 0);
  }
});

test("normal and shared checkout authenticate unchanged attribution in the IPTV prepare body", async () => {
  const context: catalog.LandingAttribution = { ...attribution, locale: "ur", page: "setup" };
  for (const link of [originalLink(), originalLink(attribution), originalLink(context),
    shared.createSharedCheckout(plan, null, 1000, attribution), shared.createSharedCheckout(plan, null, 1000, context)]) {
    const harness = routeHarness();
    const result = await harness.run("/checkout", checkoutBody(link));
    assert.equal(result.statusCode, 409);
    assert.equal(result.body.status, "cancelled");
    assert.equal(harness.requests.length, 1);
    const request = harness.requests[0].options;
    const body = JSON.parse(request.body);
    assert.deepEqual(body.attribution, decoded(link.selection).attribution);
    assert.equal(body.package_id, plan.id);
    assert.equal(body.reference, harness.savedOrders[0].publicToken);
    assert.equal(body.customer, undefined);
    const hash = crypto.createHash("sha256").update(request.body).digest("hex");
    const expected = crypto.createHmac("sha256", secret)
      .update(`POST\n/integrations/opplexify/orders/prepare\n${request.headers["X-Opplexify-Timestamp"]}\n${hash}`).digest("hex");
    assert.equal(request.headers["X-Opplexify-Signature"], expected);
    assert.equal(request.redirect, "error");
  }
});

test("legacy normal checkout without a resume cookie and existing public references retain their original behavior", async () => {
  for (const [headers, existingReference] of [[{ Cookie: "" }, false], [{}, true]] as const) {
    const harness = routeHarness({ foreignOwner: existingReference });
    const result = await harness.run("/checkout", checkoutBody(originalLink(attribution)), headers);
    assert.equal(result.statusCode, 409);
    assert.equal(result.body.status, "cancelled");
    assert.match(harness.savedOrders[0].publicToken, /^sp2_[a-f0-9]{32}$/);
    if (existingReference) assert.equal(harness.savedOrders[0].publicToken, `sp2_${"f".repeat(32)}`);
    assert.equal(harness.requests.length, 1);
  }
});

test("malformed signed attribution fails before any order or prepare is created", async () => {
  for (const path of ["/checkout", "/share-checkout"]) {
    const harness = routeHarness();
    const result = await harness.run(path, checkoutBody(originalLink({ brand: "geo", session_id: "not-a-uuid" })));
    assert.equal(result.statusCode, 404);
    assert.equal(harness.savedOrders.length, 0);
    assert.equal(harness.requests.length, 0);
  }
});

test("shared payer-browser protection and failed attribution binding prevent payment initialization", async () => {
  const link = shared.createSharedCheckout(plan, null, 1000, attribution);
  const foreign = routeHarness({ foreignOwner: true });
  const foreignResult = await foreign.run("/checkout", checkoutBody(link));
  assert.equal(foreignResult.body.status, "share_in_use");
  assert.equal(foreign.requests.length, 0);
  const missingCookie = routeHarness();
  assert.equal((await missingCookie.run("/checkout", checkoutBody(link), { Cookie: "" })).statusCode, 403);
  assert.equal(missingCookie.savedOrders.length, 0);
  const conflict = routeHarness({ prepareStatus: 409 });
  const result = await conflict.run("/checkout", checkoutBody(originalLink(attribution)));
  assert.equal(result.statusCode, 503);
  assert.equal(conflict.requests.length, 1);
  assert.equal(result.body.checkoutUrl, undefined);
});

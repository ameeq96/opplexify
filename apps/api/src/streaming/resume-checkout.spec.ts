import assert from "node:assert/strict";
import * as crypto from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { after, before, test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import * as catalog from "./catalog";
import * as resume from "./resume-checkout";

const secret = "isolated-resume-test-secret-not-a-real-credential";
const previousSecret = process.env.OPPLEX_HANDOFF_SECRET;
const origin = "https://checkout.example.test";
const owner = "a".repeat(64);
const checkoutKey = "private_test_checkout_12345678";
const attribution: catalog.LandingAttribution = { brand: "geo", session_id: "ab6d1c03-1a7e-4d42-a22e-1f53c71ee6d5", locale: "ur", page: "setup" };
const plan: catalog.StreamingPlan = { id: 17, type: "plan", providerKey: "geo", providerName: "Geo", name: "Plan", description: "",
  durationLabel: "Monthly", durationMonths: 1, credits: null, price: 10, currency: "PKR", features: [], featured: false, available: true };
const publicToken = () => resume.resumeCheckoutPublicToken(checkoutKey, owner, attribution);
const link = () => resume.createResumeCheckout(plan, checkoutKey, publicToken(), null, 1000, owner, attribution);
const order = () => ({ id: "fake-order", checkoutKey, publicToken: publicToken(), sourcePackageId: 17,
  packageType: "plan", amountMinor: 1000, amount: 10, currency: "PKR", status: "CHECKOUT_STARTED", safepayTracker: "track_existing_mock_only",
  providerName: "Geo", packageName: "Plan", durationLabel: "Monthly", createdAt: new Date(), paidAt: null });

before(() => { process.env.OPPLEX_HANDOFF_SECRET = secret; });
after(() => { if (previousSecret === undefined) delete process.env.OPPLEX_HANDOFF_SECRET; else process.env.OPPLEX_HANDOFF_SECRET = previousSecret; });

function encrypted(payload: unknown) {
  const key = crypto.createHmac("sha256", secret).update("opplexify:resume-encryption:v3\nkey").digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(Buffer.from("opplexify:resume:v3"));
  const bytes = Buffer.concat([cipher.update(JSON.stringify(payload), "utf8"), cipher.final()]);
  return `rc3_${Buffer.concat([iv, cipher.getAuthTag(), bytes]).toString("base64url")}`;
}

test("private links encrypt the order/selection and bind the original browser for at most 24 hours", () => {
  const saved = link();
  const value = resume.verifyResumeCheckout(saved.token, owner, [plan], []);
  assert.ok(value);
  assert.equal(value.checkout_key, checkoutKey);
  assert.equal(value.public_token, publicToken());
  assert.deepEqual(value.attribution, attribution);
  assert.equal(value.exp, Math.floor(Date.parse(saved.expiresAt) / 1000));
  assert.ok(value.exp <= Math.floor(Date.now() / 1000) + 86_400);
  assert.notEqual(saved.token, link().token);
  for (const privateValue of [checkoutKey, publicToken(), "track_", "package_id", "email", "phone"]) assert.equal(saved.token.includes(privateValue), false);
  assert.equal(resume.verifyResumeCheckout(saved.token, "b".repeat(64), [plan], []), null);
  assert.equal(resume.verifyResumeCheckout(saved.token, null, [plan], []), null);
  assert.equal(resume.verifyResumeCheckout(saved.token.slice(0, -4) + "AAAA", owner, [plan], []), null);
  assert.equal(resume.verifyResumeCheckout("x".repeat(3000), owner, [plan], []), null);
});

test("expired, future, forged context, changed quotes/devices and secret rotation fail closed", () => {
  const value = resume.verifyResumeCheckout(link().token, owner, [plan], [])!;
  for (const changes of [{ exp: Math.floor(Date.now() / 1000) - 1 }, { exp: Math.floor(Date.now() / 1000) + 86_401 },
    { owner: "b".repeat(64) }, { v: 2 }, { total_minor: 999 }, { amount_minor: 999 }, { currency: "USD" },
    { device_id: 999 }, { package_id: 18 }, { email: "not-allowed@example.test" },
    { attribution: { brand: "geo", locale: "ur" } }, { attribution: { ...attribution, page: "setup?name=private" } }]) {
    assert.equal(resume.verifyResumeCheckout(encrypted({ ...value, ...changes }), owner, [plan], []), null);
  }
  assert.equal(resume.verifyResumeCheckout(link().token, owner, [{ ...plan, available: false }], []), null);
  assert.equal(resume.verifyResumeCheckout(link().token, owner, [{ ...plan, price: 11 }], []), null);
  const saved = link();
  process.env.OPPLEX_HANDOFF_SECRET = "rotated-isolated-secret";
  try { assert.equal(resume.verifyResumeCheckout(saved.token, owner, [plan], []), null); }
  finally { process.env.OPPLEX_HANDOFF_SECRET = secret; }
});

test("owner-derived normal order tokens bind checkout key and signed source without changing their public format", () => {
  const expected = publicToken();
  assert.match(expected, /^sp2_[a-f0-9]{32}$/);
  assert.equal(expected, resume.resumeCheckoutPublicToken(checkoutKey, owner, { page: "setup", locale: "ur", session_id: attribution.session_id, brand: "geo" }));
  assert.notEqual(expected, resume.resumeCheckoutPublicToken(checkoutKey + "different", owner, attribution));
  assert.notEqual(expected, resume.resumeCheckoutPublicToken(checkoutKey, "b".repeat(64), attribution));
  for (const changed of [{ ...attribution, brand: "opplex" as const }, { ...attribution, locale: "ar" as const }, { ...attribution, page: "packages" }, { brand: "geo" as const }]) {
    assert.notEqual(expected, resume.resumeCheckoutPublicToken(checkoutKey, owner, changed));
  }
});

test("only the matching existing open order with an attached tracker can resume", () => {
  const value = resume.verifyResumeCheckout(link().token, owner, [plan], [])!;
  assert.equal(resume.resumeCheckoutStatus(value, order()), "available");
  assert.equal(resume.resumeCheckoutStatus(value, null), "unavailable");
  for (const changes of [{ checkoutKey: "another_checkout_key" }, { publicToken: `sp2_${"f".repeat(32)}` }, { sourcePackageId: 18 }, { amountMinor: 999 }, { currency: "USD" }]) {
    assert.equal(resume.resumeCheckoutStatus(value, { ...order(), ...changes }), "unavailable");
  }
  for (const [status, result] of [["PAID", "paid"], ["CANCELLED", "cancelled"], ["FAILED", "failed"], ["PENDING", "available"], ["UNKNOWN", "unavailable"]]) {
    assert.equal(resume.resumeCheckoutStatus(value, { ...order(), status }), result);
  }
  assert.equal(resume.resumeCheckoutStatus(value, { ...order(), safepayTracker: null }), "processing");
});

function loadSource(file: string, modules: Record<string, unknown>, extra: Record<string, unknown> = {}) {
  const compiled = ts.transpileModule(readFileSync(resolve(__dirname, file), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  const exported: Record<string, any> = {};
  runInNewContext(compiled, { exports: exported, module: { exports: exported }, Buffer, URL, URLSearchParams, Date, AbortSignal,
    process: { env: { OPPLEX_HANDOFF_SECRET: secret, SAFEPAY_ENVIRONMENT: "sandbox", SAFEPAY_SANDBOX_PUBLIC_KEY: "fake-public", SAFEPAY_SANDBOX_SECRET_KEY: "fake-secret" } },
    console: { error() {} }, require(name: string) { assert.ok(name in modules, `Unexpected module ${name}`); return modules[name]; }, ...extra });
  return exported;
}

function harness(existing: (resume.ResumableOrder & Record<string, unknown>) | null = order()) {
  const routes = new Map<string, (req: any, res: any) => Promise<void>>();
  const requests: { url: string; body: unknown }[] = [];
  const writes: unknown[] = [];
  const cookies: unknown[] = [];
  const db = { streamingOrder: { findUnique: async () => existing }, $transaction: () => { writes.push(true); throw new Error("Resume must never create/update an order"); } };
  const router = { get(path: string, ...handlers: any[]) { routes.set(`GET ${path}`, handlers.at(-1)); },
    post(path: string, ...handlers: any[]) { routes.set(`POST ${path}`, handlers.at(-1)); }, all() {} };
  const shared = loadSource("shared-checkout.ts", { "node:crypto": crypto, "../env": { webOrigin: origin }, "./catalog": catalog });
  const modules = { "node:crypto": crypto, "express": { Router: () => router }, "../env": { webOrigin: origin },
    "./payment-invoice": {}, "./invoice-email": {}, "../http": { asyncHandler: (fn: unknown) => fn }, "../prisma/prisma.service": { prisma: db },
    "../streaming/catalog": { ...catalog, fetchStreamingCatalog: async () => ({ plans: [plan], devices: [] }) },
    "../streaming/shared-checkout": shared, "../streaming/resume-checkout": resume, "../streaming/customer-sync": {},
    "./catalog": { ...catalog, fetchStreamingCatalog: async () => ({ plans: [plan], devices: [] }) }, "./shared-checkout": shared,
    "./resume-checkout": resume, "./customer-sync": { enqueueCustomerEvent: () => { throw new Error("Read-only status must not enqueue"); } } };
  const payments = loadSource("../payments/streaming-safepay.routes.ts", modules, { fetch: async (target: string, options: any) => {
    requests.push({ url: String(target), body: JSON.parse(options.body || "{}") });
    assert.equal(String(target), "https://sandbox.api.getsafepay.com/client/passport/v1/token", "No new payment session or network request is permitted");
    return new Response(JSON.stringify({ data: "fake-existing-session-passport" }), { status: 200 });
  } });
  payments.createStreamingSafepayRouter();
  loadSource("streaming.routes.ts", modules).createStreamingRouter();
  return { requests, writes, cookies, async run(path: string, body: Record<string, unknown>, headers: Record<string, string> = {}, method = "POST") {
    const response: any = { statusCode: 200, body: null, headers: {}, set(name: string, value: string) { this.headers[name] = value; return this; },
      setHeader(name: string, value: string) { this.headers[name] = value; }, cookie(...args: unknown[]) { cookies.push(args); },
      status(status: number) { this.statusCode = status; return this; }, json(value: unknown) { this.body = value; return this; }, send(value: unknown) { this.body = value; return this; } };
    const request = { path, body, params: body, get(name: string) { return { Origin: origin, Accept: "application/json", Cookie: `__Host-opplexify-share-owner=${owner}`, ...headers }[name]; } };
    await routes.get(`${method} ${path}`)!(request, response);
    return response;
  } };
}

function original() {
  const selection = Buffer.from(JSON.stringify({ v: 1, package_id: plan.id, exp: Math.floor(Date.now() / 1000) + 600, attribution })).toString("base64url");
  return { selection, signature: crypto.createHmac("sha256", secret).update(selection).digest("hex") };
}

test("manual save creates an encrypted fragment link without starting payments or storing records", async () => {
  for (const existing of [null, order()]) {
    const app = harness(existing);
    const saved = await app.run("/resume-checkout", { ...original(), package_id: 17, checkout_key: checkoutKey, quoted_total_minor: 1000 });
    assert.equal(saved.statusCode, 201);
    assert.equal(saved.headers["Referrer-Policy"], "no-referrer");
    assert.equal(saved.headers["Cache-Control"], "private, no-store");
    const url = new URL(saved.body.url);
    assert.equal(url.origin, origin);
    assert.equal(url.search, "");
    assert.ok(resume.verifyResumeCheckout(new URLSearchParams(url.hash.slice(1)).get("resume"), owner, [plan], []));
    assert.equal(app.requests.length, 0);
    assert.equal(app.writes.length, 0);
  }
});

test("manual save rejects another order owner/source, bad quote and completed/closed orders without creating a replacement", async () => {
  for (const existing of [{ ...order(), publicToken: `sp2_${"f".repeat(32)}` }, { ...order(), status: "PAID" },
    { ...order(), status: "CANCELLED" }, { ...order(), status: "FAILED" }]) {
    const app = harness(existing);
    assert.equal((await app.run("/resume-checkout", { ...original(), package_id: 17, checkout_key: checkoutKey, quoted_total_minor: 1000 })).statusCode, 409);
    assert.equal(app.requests.length, 0);
    assert.equal(app.writes.length, 0);
  }
  const app = harness();
  const body = { ...original(), package_id: 17, checkout_key: checkoutKey, quoted_total_minor: 1000 };
  assert.equal((await app.run("/resume-checkout", { ...body, quoted_total_minor: 1100 })).statusCode, 409);
  assert.equal((await app.run("/resume-checkout", body, { Cookie: "" })).statusCode, 403);
  assert.equal((await app.run("/resume-checkout", body, { Origin: "https://untrusted.example" })).statusCode, 403);
  const forged = Buffer.from(JSON.stringify({ v: 1, package_id: 17, exp: Math.floor(Date.now() / 1000) + 600, attribution: { ...attribution, locale: "ar" } })).toString("base64url");
  assert.equal((await app.run("/resume-checkout", { ...body, selection: forged })).statusCode, 404);
  assert.equal(app.requests.length, 0);
});

test("saved payment status exposes no tracker/key or payer and protects all terminal/missing/foreign states", async () => {
  for (const [existing, expected] of [[order(), "available"], [null, "unavailable"], [{ ...order(), status: "PAID" }, "paid"],
    [{ ...order(), status: "CANCELLED" }, "cancelled"], [{ ...order(), status: "FAILED" }, "failed"],
    [{ ...order(), safepayTracker: null }, "processing"]] as const) {
    const app = harness(existing);
    const result = await app.run("/checkout-resume", { resume_token: link().token });
    assert.equal(result.statusCode, 200);
    assert.equal(result.body.resumeCheckout.status, expected);
    for (const field of ["checkout_key", "public_token", "safepayTracker", "email", "phone"]) assert.equal(JSON.stringify(result.body).includes(field), false);
    assert.equal(app.writes.length, 0);
    assert.equal(app.requests.length, 0);
    assert.equal((await app.run("/checkout-resume", { resume_token: link().token }, { Cookie: "" })).statusCode, 404);
    assert.equal((await app.run("/checkout-resume", { resume_token: link().token }, { Origin: "https://untrusted.example" })).statusCode, 403);
  }
});

test("resume reuses exactly the original tracker/order even under repeated clicks, never the normal upsert/session path", async () => {
  const app = harness();
  const saved = link();
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const result = await app.run("/checkout", { resume_token: saved.token, checkout_key: "attacker-supplied-key", package_id: 999, selection: "ignored" });
    assert.equal(result.statusCode, 200);
    const url = new URL(result.body.checkoutUrl);
    assert.equal(url.searchParams.get("tracker"), order().safepayTracker);
    assert.equal(url.searchParams.get("order_id"), publicToken());
    assert.equal(result.body.orderToken, publicToken());
  }
  assert.equal(app.requests.length, 2);
  assert.equal(app.writes.length, 0);
});

test("paid, processing, closed, foreign, changed and expired attempts never fall back to a fresh payment", async () => {
  for (const existing of [null, { ...order(), status: "PAID" }, { ...order(), status: "FAILED" }, { ...order(), status: "CANCELLED" },
    { ...order(), safepayTracker: null }, { ...order(), amountMinor: 1100 }, { ...order(), publicToken: `sp2_${"f".repeat(32)}` }]) {
    const app = harness(existing);
    const result = await app.run("/checkout", { resume_token: link().token, ...original(), checkout_key: checkoutKey, package_id: 17, quoted_total_minor: 1000 });
    assert.ok(result.statusCode >= 400);
    assert.equal(app.writes.length, 0);
    assert.equal(app.requests.length, 0);
  }
  for (const body of [{ resume_token: "" }, { resume_token: "invalid" }, { resume_token: encrypted({ ...resume.verifyResumeCheckout(link().token, owner, [plan], [])!, exp: 1 }) }]) {
    const app = harness();
    assert.equal((await app.run("/checkout", { ...original(), package_id: 17, checkout_key: checkoutKey, ...body })).statusCode, 404);
    assert.equal(app.requests.length, 0);
    assert.equal(app.writes.length, 0);
  }
  const app = harness();
  assert.equal((await app.run("/checkout", { resume_token: link().token }, { Cookie: "" })).statusCode, 404);
  assert.equal((await app.run("/checkout", { resume_token: link().token }, { Origin: "https://untrusted.example" })).statusCode, 403);
  assert.equal(app.requests.length, 0);
});

test("original public order-status and invoice validation still accepts legacy and new token formats", async () => {
  for (const token of [`c${"a".repeat(24)}`, `spt_${"c".repeat(32)}`, `sp2_${"d".repeat(32)}`, publicToken()]) {
    const app = harness({ ...order(), publicToken: token });
    const status = await app.run("/orders/:publicToken", { publicToken: token }, { Cookie: "" }, "GET");
    assert.equal(status.statusCode, 200);
    assert.equal(status.body.order.token, token);
    const invoice = await app.run("/invoice/:publicToken", { publicToken: token }, { Cookie: "" }, "GET");
    assert.equal(invoice.statusCode, 409, "Recognized unpaid references must retain the paid-invoice gate, not fail a changed token format");
    assert.equal(app.requests.length, 0);
    assert.equal(app.writes.length, 0);
  }
});

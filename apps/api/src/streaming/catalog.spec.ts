import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { after, before, test } from "node:test";
import { selectedPackageId, verifiedCheckoutSelection, validLandingAttribution, StreamingPlan } from "./catalog";

const secret = "isolated-landing-attribution-test-secret";
const sessionId = "ab6d1c03-1a7e-4d42-a22e-1f53c71ee6d5";
const previousSecret = process.env.OPPLEX_HANDOFF_SECRET;
const plans: StreamingPlan[] = [{ id: 17, type: "plan", providerKey: "geo", providerName: "Geo",
  name: "Plan", description: "", durationLabel: "Monthly", durationMonths: 1, credits: null,
  price: 10, currency: "USD", features: [], featured: false, available: true }];

before(() => { process.env.OPPLEX_HANDOFF_SECRET = secret; });
after(() => {
  if (previousSecret === undefined) delete process.env.OPPLEX_HANDOFF_SECRET;
  else process.env.OPPLEX_HANDOFF_SECRET = previousSecret;
});

function signed(overrides: Record<string, unknown> = {}) {
  const payload = { v: 1, package_id: 17, exp: Math.floor(Date.now() / 1000) + 600, ...overrides };
  const selection = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return { selection, signature: createHmac("sha256", secret).update(selection).digest("hex") };
}

test("legacy signed selections keep their selected package without attribution", () => {
  const link = signed();
  assert.deepEqual(verifiedCheckoutSelection(link.selection, link.signature, plans), { package_id: 17 });
  assert.equal(selectedPackageId(link.selection, link.signature, plans), 17);
});

test("all approved brands preserve only their signed optional consented session", () => {
  for (const brand of ["trex", "opplex", "geo", "5g"]) {
    for (const attribution of [{ brand }, { brand, session_id: sessionId }]) {
      const link = signed({ attribution });
      assert.deepEqual(verifiedCheckoutSelection(link.selection, link.signature, plans), { package_id: 17, attribution });
      assert.equal(selectedPackageId(link.selection, link.signature, plans), 17);
    }
  }
});

test("even correctly signed malformed attribution fails closed instead of becoming a legacy link", () => {
  const malformed = [null, "geo", [], {}, { brand: "unknown" }, { brand: "GEO" },
    { brand: "geo", session_id: null }, { brand: "geo", session_id: "" },
    { brand: "geo", session_id: sessionId.replace("4d42", "1d42") },
    { brand: "geo", session_id: sessionId.replace("a22e", "122e") },
    { brand: "geo", session_id: ` ${sessionId}` },
    { brand: "geo", email: "not-allowed@example.test" },
    { brand: "geo", source: "geoiptv" }, { brand: "geo", v: 1 }];
  for (const attribution of malformed) {
    assert.equal(validLandingAttribution(attribution), false);
    const link = signed({ attribution });
    assert.equal(verifiedCheckoutSelection(link.selection, link.signature, plans), null);
    assert.equal(selectedPackageId(link.selection, link.signature, plans), null);
  }
});

test("changing, stripping or injecting attribution invalidates the original signature", () => {
  const original = signed({ attribution: { brand: "geo", session_id: sessionId } });
  for (const replacement of [signed(), signed({ attribution: { brand: "trex", session_id: sessionId } }),
    signed({ attribution: { brand: "geo", session_id: "d51d1d21-4e89-45fa-bad1-aa3e3273feae" } })]) {
    assert.equal(verifiedCheckoutSelection(replacement.selection, original.signature, plans), null);
  }
  const legacy = signed();
  assert.equal(verifiedCheckoutSelection(original.selection, legacy.signature, plans), null);
});

test("expiry, signature, version and current package availability checks remain enforced", () => {
  for (const overrides of [{ exp: Math.floor(Date.now() / 1000) - 1 }, { v: 2 }, { package_id: 18 }]) {
    const link = signed(overrides);
    assert.equal(verifiedCheckoutSelection(link.selection, link.signature, plans), null);
  }
  const valid = signed({ attribution: { brand: "geo" } });
  assert.equal(verifiedCheckoutSelection(valid.selection, valid.signature, [{ ...plans[0], available: false }]), null);
  assert.equal(verifiedCheckoutSelection(valid.selection, "0".repeat(64), plans), null);
  assert.equal(verifiedCheckoutSelection(valid.selection, "bad-signature", plans), null);
  assert.equal(verifiedCheckoutSelection("x".repeat(513), valid.signature, plans), null);
  delete process.env.OPPLEX_HANDOFF_SECRET;
  try { assert.equal(verifiedCheckoutSelection(valid.selection, valid.signature, plans), null); }
  finally { process.env.OPPLEX_HANDOFF_SECRET = secret; }
});

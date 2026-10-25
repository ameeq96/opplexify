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
  for (const brand of ["trex", "opplex", "geo", "5g", "iptvsubscription", "getiptv"]) {
    for (const attribution of [{ brand }, { brand, session_id: sessionId }]) {
      const link = signed({ attribution });
      assert.deepEqual(verifiedCheckoutSelection(link.selection, link.signature, plans), { package_id: 17, attribution });
      assert.equal(selectedPackageId(link.selection, link.signature, plans), 17);
    }
  }
});

test("consented locale and page context are bounded and remain inside the signed attribution", () => {
  for (const locale of ["en", "es", "fr", "it", "nl", "pt", "ru", "ur", "ar", "hi"]) {
    for (const page of ["", "packages", "setup", "blogs/compare-playback-in-your-own-setup"]) {
      const attribution = { brand: "geo", session_id: sessionId, locale, page };
      const link = signed({ attribution });
      assert.deepEqual(verifiedCheckoutSelection(link.selection, link.signature, plans), { package_id: 17, attribution });
    }
  }
  for (const attribution of [{ brand: "geo", locale: "en" }, { brand: "geo", page: "packages" },
    { brand: "geo", session_id: sessionId, locale: "xx" }, { brand: "geo", session_id: sessionId, locale: null },
    { brand: "geo", session_id: sessionId, page: "packages?email=private@example.test" },
    { brand: "geo", session_id: sessionId, page: "packages/" },
    { brand: "geo", session_id: sessionId, page: "blogs/check-your-playback-chain" },
    { brand: "geo", session_id: sessionId, page: null }]) {
    assert.equal(validLandingAttribution(attribution), false);
    const link = signed({ attribution });
    assert.equal(verifiedCheckoutSelection(link.selection, link.signature, plans), null);
  }
  const original = signed({ attribution: { brand: "geo", session_id: sessionId, locale: "ur", page: "setup" } });
  const changed = signed({ attribution: { brand: "geo", session_id: sessionId, locale: "ar", page: "setup" } });
  assert.equal(verifiedCheckoutSelection(changed.selection, original.signature, plans), null);
});

test("new landing brands keep their own signed guide context", () => {
  const guides = {
    iptvsubscription: ["choosing-an-iptv-subscription", "iptv-subscription-renewal-checklist", "iptv-device-and-player-costs"],
    getiptv: ["how-to-get-iptv-on-your-device", "iptv-setup-before-checkout", "troubleshoot-an-iptv-connection"]
  };
  for (const [brand, slugs] of Object.entries(guides)) {
    for (const slug of slugs) {
      const attribution = { brand, session_id: sessionId, locale: "it", page: `blogs/${slug}` };
      const link = signed({ attribution });
      assert.deepEqual(verifiedCheckoutSelection(link.selection, link.signature, plans), { package_id: 17, attribution });
      const other = brand === "getiptv" ? "iptvsubscription" : "getiptv";
      assert.equal(validLandingAttribution({ ...attribution, brand: other }), false);
      const tampered = signed({ attribution: { ...attribution, brand: other } });
      assert.equal(verifiedCheckoutSelection(tampered.selection, link.signature, plans), null);
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

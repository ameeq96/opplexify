import type { Metadata } from "next";
import { PublicShell } from "../../components/site/PublicShell";
import { SAFEPAY_MERCHANT_NAME, seoMetadata } from "../../lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Safepay Sandbox Demo - Opplexify",
  description: "Test the Opplexify Safepay Sandbox checkout with a fixed PKR 100 demo product.",
  path: "/safepay-demo"
});

const statusMessages: Record<string, string> = {
  success: "Sandbox payment verified successfully.",
  cancelled: "Sandbox checkout was cancelled. You can try again whenever you are ready.",
  failed: "The Sandbox payment could not be verified. No real funds were charged.",
  unavailable: "Safepay Sandbox is not configured yet. Add the Sandbox API credentials, then try again."
};

type SafepayDemoPageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function SafepayDemoPage({ searchParams }: SafepayDemoPageProps) {
  const { status } = await searchParams;
  const message = status ? statusMessages[status] : undefined;

  return (
    <PublicShell>
      <main className="digital-agency-template dark body-wrapper body-digital-agency pricing-page-template">
        <section className="pricing-area rr-bg-primary" style={{ paddingBottom: 0 }}>
          <div className="container">
            <div className="hero">
              <div>
                <span className="section-subtitle">Safepay Sandbox</span>
                <h1 style={{ fontSize: "clamp(46px, 4.8vw, 72px)", maxWidth: "760px" }}>
                  PKR 100 checkout demo.
                </h1>
                <p style={{ maxWidth: "660px", marginTop: "24px" }}>
                  This test product validates the hosted Safepay checkout for {SAFEPAY_MERCHANT_NAME}. It is
                  Sandbox-only: no product is delivered and no real funds move.
                </p>
                {message ? (
                  <p className="notice" role="status" style={{ maxWidth: "660px", marginTop: "28px" }}>
                    {message}
                  </p>
                ) : null}
              </div>

              <article className="pricing-card featured">
                <span className="pricing-label">Test mode</span>
                <h3>Safepay Sandbox Demo</h3>
                <p className="pricing-copy">A fixed-price demo item used only to test the Safepay payment journey.</p>
                <div className="pricing-price">
                  <strong>PKR 100</strong>
                  <span>one-time sandbox payment</span>
                </div>
                <span className="pricing-time">No real charge</span>
                <ul className="pricing-features">
                  <li>Hosted Safepay Sandbox checkout</li>
                  <li>Server-controlled PKR 100 amount</li>
                  <li>Return verification against Safepay</li>
                </ul>
                <div style={{ marginTop: "24px", borderTop: "1px solid var(--line)", paddingTop: "20px" }}>
                  <span className="pricing-label">Sandbox test card</span>
                  <strong
                    style={{
                      display: "block",
                      marginTop: "10px",
                      color: "var(--text)",
                      fontSize: "clamp(20px, 2vw, 26px)",
                      letterSpacing: "0.04em"
                    }}
                  >
                    4456 5300 0000 1005
                  </strong>
                  <p className="pricing-copy" style={{ marginTop: "8px" }}>
                    Use any future expiry date and CVV 123. Never enter a real card in Sandbox.
                  </p>
                </div>
                <form action="/public/safepay-demo/checkout" method="post" style={{ marginTop: "24px" }}>
                  <button className="pricing-btn" type="submit" style={{ width: "100%" }}>
                    Pay PKR 100 in Sandbox
                  </button>
                </form>
              </article>
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}

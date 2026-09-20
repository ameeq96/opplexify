import type { Metadata } from "next";
import { PublicShell } from "../../components/site/PublicShell";
import {
  FREELANCER_PAYMENT_DISCLOSURE,
  LEGAL_NAME,
  LLC_PAYMENT_DISCLOSURE,
  PAYMENT_SEPARATION_DISCLOSURE,
  PROVIDER_SELECTION_DISCLOSURE,
  SAFEPAY_MERCHANT_NAME,
  breadcrumbList,
  seoMetadata
} from "../../lib/seo";
import { PRICING_PACKAGES as packages, pricingOfferCatalog } from "../../lib/pricing";

export const metadata: Metadata = seoMetadata({
  title: "Custom Software Development Pricing | Opplexify",
  description:
    "Explore starting prices for Opplexify website development, custom web applications, SaaS products, mobile apps, dashboards, and backend systems.",
  path: "/pricing"
});

const pricingJsonLd = {
  "@context": "https://schema.org",
  ...pricingOfferCatalog("Opplexify development packages")
};

const breadcrumbJsonLd = breadcrumbList([
  { name: "Home", path: "/" },
  { name: "Pricing", path: "/pricing" }
]);

export default function PricingPage() {
  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <main className="digital-agency-template dark body-wrapper body-digital-agency pricing-page-template">
        <section className="pricing-area rr-bg-primary">
          <div className="container rr-container-1650">
            <div className="pricing-area-inner section-spacing-top">
              <div className="pricing-header fade-anim">
                <span className="section-subtitle">Pricing</span>
                <div className="pricing-title-wrap">
                  <h1 className="pricing-title rr_title_anim">
                    Clear starting points for your next digital product.
                  </h1>
                  <p>
                    These packages make early budgeting easier. Your final quote reflects the actual scope,
                    integrations, content, revision needs, and delivery plan—so you know what is included before work begins.
                  </p>
                </div>
              </div>
              <div className="pricing-grid fade-anim">
                {packages.map((pkg) => (
                  <article className={pkg.featured ? "pricing-card featured" : "pricing-card"} key={pkg.title}>
                    <span className="pricing-label">{pkg.label}</span>
                    <h3>{pkg.title}</h3>
                    <p className="pricing-copy">{pkg.description}</p>
                    <div className="pricing-price">
                      <strong>{pkg.price}</strong>
                      <span>{pkg.suffix ?? "starting"}</span>
                    </div>
                    <span className="pricing-time">{pkg.timeline}</span>
                    <ul className="pricing-features">
                      {pkg.features.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                    <a href={pkg.href ?? "/contact"} className="pricing-btn">{pkg.ctaLabel ?? "Request Package"}</a>
                  </article>
                ))}
              </div>
              <section className="provider-disclosure provider-disclosure--embedded" aria-labelledby="pricing-provider-title">
                <span className="section-subtitle">Contracting provider</span>
                <h2 id="pricing-provider-title">Your quote identifies who you are hiring</h2>
                <p>{PROVIDER_SELECTION_DISCLOSURE}</p>
                <div className="provider-disclosure__grid">
                  <article>
                    <h3>{LEGAL_NAME}</h3>
                    <p>{LLC_PAYMENT_DISCLOSURE}</p>
                  </article>
                  <article>
                    <h3>{SAFEPAY_MERCHANT_NAME}</h3>
                    <p>{FREELANCER_PAYMENT_DISCLOSURE}</p>
                  </article>
                </div>
                <p className="provider-disclosure__separation">{PAYMENT_SEPARATION_DISCLOSURE}</p>
                <a className="rr-btn-underline" href="/payment-information">Read payment information</a>
              </section>
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}

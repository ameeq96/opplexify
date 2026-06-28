import type { Metadata } from "next";
import { PublicShell } from "../../components/site/PublicShell";
import { breadcrumbList, seoMetadata } from "../../lib/seo";
import { PRICING_PACKAGES as packages, pricingOfferCatalog } from "../../lib/pricing";

export const metadata: Metadata = seoMetadata({
  title: "Pricing - Website, Web App, SaaS & Mobile App Development | Opplexify",
  description:
    "Starting ranges for Opplexify LLC custom website, SaaS, dashboard, mobile app, backend API, and automation projects. Final pricing depends on project scope.",
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
                    Website, web app, SaaS and mobile app development pricing.
                  </h1>
                  <p>
                    Starting ranges for custom software projects. Final pricing depends on scope, integrations,
                    content, revisions, and delivery requirements.
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
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}

import type { Metadata } from "next";
import { PublicShell } from "../../components/site/PublicShell";
import { seoMetadata } from "../../lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Pricing - Website, Web App, SaaS & Mobile App Development | Opplexify",
  description:
    "Starting ranges for Opplexify LLC custom website, SaaS, dashboard, mobile app, backend API, and automation projects. Final pricing depends on project scope.",
  path: "/pricing"
});

type Package = {
  label: string;
  title: string;
  price: string;
  suffix?: string;
  timeline: string;
  description: string;
  features: string[];
  href?: string;
  ctaLabel?: string;
  featured?: boolean;
};

const packages: Package[] = [
  {
    label: "Starter",
    title: "Simple Website",
    price: "$149",
    timeline: "3-5 days",
    description:
      "A clean starter website for a small business, portfolio, or service page with a professional first impression.",
    features: ["Responsive landing page", "Core content sections", "Contact CTA", "Mobile-friendly layout"],
    ctaLabel: "Request Package",
    href: "/contact"
  },
  {
    label: "Business",
    title: "Business Website",
    price: "$499",
    timeline: "1-2 weeks",
    description:
      "A stronger business website with multiple pages, clear service presentation, and a proper contact flow.",
    features: ["Up to 5 pages", "Contact form", "Basic SEO setup", "Performance-focused structure"],
    ctaLabel: "Request Package",
    href: "/contact",
    featured: true
  },
  {
    label: "Pro",
    title: "Custom Website + Dashboard",
    price: "$999",
    timeline: "2-4 weeks",
    description:
      "A custom website package with more advanced UI, backend-ready structure, or a lightweight dashboard workflow.",
    features: ["Custom UI sections", "Admin/dashboard starter", "Backend/API setup", "Launch handover"],
    ctaLabel: "Request Package",
    href: "/contact"
  }
];

export default function PricingPage() {
  return (
    <PublicShell>
      <main className="digital-agency-template dark body-wrapper body-digital-agency pricing-page-template">
        <section className="pricing-area rr-bg-primary">
          <div className="container rr-container-1650">
            <div className="pricing-area-inner section-spacing-top">
              <div className="pricing-header fade-anim">
                <span className="section-subtitle">Pricing</span>
                <div className="pricing-title-wrap">
                  <h1 className="pricing-title rr_title_anim">
                    Website development pricing.
                  </h1>
                  <p>
                    Simple starting packages for websites and small web projects. Final pricing can change after scope,
                    content, and delivery requirements are reviewed.
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

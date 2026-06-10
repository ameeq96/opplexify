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
    label: "5 Page Presence",
    title: "Custom Website",
    price: "$750+",
    timeline: "1-3 weeks",
    description:
      "A focused business website with responsive pages, contact routing, basic SEO setup, and service content structure.",
    features: ["Written scope", "Responsive pages", "Contact form", "Foundational SEO", "One revision round"],
    ctaLabel: "Request a Quote",
    href: "/contact"
  },
  {
    label: "Full-Stack App",
    title: "Complete Web Application",
    price: "$3,500+",
    timeline: "3-8 weeks",
    description:
      "A custom web app with database-backed workflows, authentication, dashboards, and backend API development.",
    features: ["Project proposal", "Authentication", "User dashboard", "Backend API", "Milestone billing"],
    ctaLabel: "Request a Quote",
    href: "/contact"
  },
  {
    label: "Subscription-Ready",
    title: "Complete SaaS Solution",
    price: "$6,500+",
    timeline: "6-12 weeks",
    description:
      "A SaaS platform foundation with product workflows, account roles, admin controls, data models, and API architecture.",
    features: ["SaaS workflows", "Admin dashboard", "Database and API", "Launch handover", "Milestone invoices"],
    ctaLabel: "Request a Quote",
    href: "/contact",
    featured: true
  },
  {
    label: "App Plus Control Room",
    title: "Mobile App with Admin Dashboard",
    price: "$4,500+",
    timeline: "5-10 weeks",
    description:
      "A mobile app experience connected to a backend API and admin dashboard for managing real project workflows.",
    features: ["Mobile screens", "Admin dashboard", "Backend API", "Testing pass", "Revision terms"],
    ctaLabel: "Request a Quote",
    href: "/contact"
  },
  {
    label: "Complete Product Suite",
    title: "Complete Mobile App + Web App",
    price: "$9,500+",
    timeline: "8-16 weeks",
    description:
      "A larger scoped build with web app, mobile app, backend API, database, admin dashboard, and handover support.",
    features: ["Written proposal", "Contract and invoices", "Milestone delivery", "Defined revisions", "Final handover"],
    ctaLabel: "Request a Quote",
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
                    Website, SaaS, mobile app and software development pricing.
                  </h1>
                  <p>
                    Starting ranges for custom software work. Final quotes depend on scope, integrations, content,
                    revisions, and delivery requirements.
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

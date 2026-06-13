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
    title: "Simple Website",
    price: "$150",
    timeline: "1-3 weeks",
    description:
      "A concise, responsive, SEO-friendly business website designed for credibility, lead capture, and clear service presentation.",
    features: ["5 responsive pages", "Contact form", "Foundational SEO", "Performance-focused structure"],
    ctaLabel: "Request Package",
    href: "/contact"
  },
  {
    label: "Full-Stack App",
    title: "Complete Web Application",
    price: "$500",
    timeline: "3-8 weeks",
    description:
      "A full-stack web application with authentication, dashboards, APIs, database integration, and structured workflows.",
    features: ["Authentication", "User dashboard", "Backend API", "Database integration"],
    ctaLabel: "Request Package",
    href: "/contact"
  },
  {
    label: "Subscription-Ready",
    title: "Complete SaaS Solution",
    price: "$1,000",
    timeline: "6-12 weeks",
    description:
      "A scalable SaaS development foundation with product workflows, admin controls, database models, and subscription-ready architecture.",
    features: ["SaaS platform", "Admin dashboard", "Subscription-ready structure", "Database and API"],
    ctaLabel: "Request Package",
    href: "/contact",
    featured: true
  },
  {
    label: "App Plus Control Room",
    title: "Mobile App with Admin Dashboard",
    price: "$1,500",
    timeline: "5-10 weeks",
    description:
      "A mobile application connected to a secure backend API and an operational admin dashboard for real business workflows.",
    features: ["Mobile app", "Admin dashboard", "Backend API", "Push notification-ready"],
    ctaLabel: "Request Package",
    href: "/contact"
  },
  {
    label: "Complete Product Suite",
    title: "Complete Mobile App + Web App",
    price: "$2,000",
    timeline: "8-16 weeks",
    description:
      "A coordinated mobile app, web app, API, database, and admin dashboard system for a complete digital product launch.",
    features: ["Mobile app", "Web app", "Admin dashboard", "Complete full-stack solution"],
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

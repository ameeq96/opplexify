import type { Metadata } from "next";
import Link from "next/link";
import { opplexifyCompany } from "@adon/shared";
import { PageHero, SectionHead } from "../../components/site/Blocks";
import { PublicShell } from "../../components/site/PublicShell";
import { seoMetadata } from "../../lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Pricing - Custom Software Development Quotes | Opplexify LLC",
  description:
    "Pricing information for Opplexify LLC custom website, SaaS, dashboard, mobile app, backend/API, and automation development services.",
  path: "/pricing"
});

const packages = [
  {
    label: "Website Project",
    title: "Custom Website Development",
    price: "Custom quote",
    time: "Typical timeline: 1-4 weeks",
    description: "For business websites, service pages, landing pages, and contact-focused web presence work.",
    features: ["Written scope", "Responsive pages", "Contact form setup", "Basic technical SEO", "Launch support"]
  },
  {
    label: "Software Build",
    title: "SaaS, Dashboard or Web App",
    price: "Custom quote",
    time: "Typical timeline: 4-12+ weeks",
    description: "For product workflows, user accounts, dashboards, APIs, admin panels, and database-backed systems.",
    features: ["Discovery and planning", "Milestone delivery", "Backend/API work", "Admin controls", "Handover notes"],
    featured: true
  },
  {
    label: "App or Integration",
    title: "Mobile App, Backend or Automation",
    price: "Custom quote",
    time: "Timeline depends on scope",
    description: "For mobile app workflows, API integrations, backend systems, and business process automation.",
    features: ["Feature scope", "API connection", "Testing", "Revision terms", "Deployment support"]
  }
];

const notes = [
  "Final pricing depends on project scope, feature complexity, content readiness, integrations, and delivery timeline.",
  "Opplexify LLC can provide written proposals, invoices, contracts, and milestone-based billing.",
  "Deposits, milestone payments, revision terms, cancellation terms, and delivery terms are confirmed in writing before work begins.",
  "Third-party costs such as hosting, paid APIs, domains, app store fees, or licensed assets are separate unless included in the written proposal."
];

export default async function PricingPage() {
  return (
    <PublicShell>
      <PageHero
        eyebrow="Pricing"
        title="Custom Software Development Pricing"
        subtitle="Opplexify LLC prices custom work after reviewing scope. The goal is to confirm a realistic project plan before development begins."
      />
      <section className="section">
        <div className="container rr-container-1650">
          <div className="grid pricing-cards">
            {packages.map((pkg) => (
              <article className={pkg.featured ? "card card-featured" : "card"} key={pkg.title}>
                <p className="eyebrow">{pkg.label}</p>
                <h3>{pkg.title}</h3>
                <p>{pkg.description}</p>
                <strong>
                  {pkg.price} <span className="price-note">after scope review</span>
                </strong>
                <p className="price-note">{pkg.time}</p>
                <ul>
                  {pkg.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <Link className="btn secondary" href="/contact">
                  Request a Quote
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container rr-container-1650">
          <SectionHead title="Payment and Scope Notes" subtitle={opplexifyCompany.complianceNote} />
          <div className="grid">
            {notes.map((note) => (
              <article className="card" key={note}>
                <p>{note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "../../components/site/Blocks";
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
  time: string;
  description: string;
  features: string[];
  featured?: boolean;
};

const packages: Package[] = [
  {
    label: "5 Page Presence",
    title: "Custom Website",
    price: "$750+",
    time: "1-3 weeks",
    description:
      "A focused business website with responsive pages, contact routing, basic SEO setup, and service content structure.",
    features: ["Written scope", "Responsive pages", "Contact form", "Foundational SEO", "One revision round"]
  },
  {
    label: "Full-Stack App",
    title: "Complete Web Application",
    price: "$3,500+",
    time: "3-8 weeks",
    description:
      "A custom web app with database-backed workflows, authentication, dashboards, and backend API development.",
    features: ["Project proposal", "Authentication", "User dashboard", "Backend API", "Milestone billing"]
  },
  {
    label: "Subscription-Ready",
    title: "Complete SaaS Solution",
    price: "$6,500+",
    time: "6-12 weeks",
    description:
      "A SaaS platform foundation with product workflows, account roles, admin controls, data models, and API architecture.",
    features: ["SaaS workflows", "Admin dashboard", "Database and API", "Launch handover", "Milestone invoices"],
    featured: true
  },
  {
    label: "App Plus Control Room",
    title: "Mobile App with Admin Dashboard",
    price: "$4,500+",
    time: "5-10 weeks",
    description:
      "A mobile app experience connected to a backend API and admin dashboard for managing real project workflows.",
    features: ["Mobile screens", "Admin dashboard", "Backend API", "Testing pass", "Revision terms"]
  },
  {
    label: "Complete Product Suite",
    title: "Complete Mobile App + Web App",
    price: "$9,500+",
    time: "8-16 weeks",
    description:
      "A larger scoped build with web app, mobile app, backend API, database, admin dashboard, and handover support.",
    features: ["Written proposal", "Contract and invoices", "Milestone delivery", "Defined revisions", "Final handover"]
  }
];

export default async function PricingPage() {
  return (
    <PublicShell>
      <PageHero
        eyebrow="Pricing"
        title="Website, web app, SaaS and mobile app development pricing"
        subtitle="Starting ranges for custom software work. Final pricing depends on project scope, integrations, content, revisions, and delivery requirements. Projects use written proposals, invoices, contracts when needed, and milestone-based billing."
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
                  {pkg.price} <span className="price-note">starting</span>
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
    </PublicShell>
  );
}

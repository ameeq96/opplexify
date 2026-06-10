import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "../../components/site/Blocks";
import { PublicShell } from "../../components/site/PublicShell";
import { seoMetadata } from "../../lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Pricing - Website, Web App, SaaS & Mobile App Development | Opplexify",
  description:
    "Transparent starting packages for SEO-friendly websites, full-stack web applications, SaaS platforms, mobile apps, admin dashboards, and complete product builds.",
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
    title: "Simple Website",
    price: "$149",
    time: "4-7 days",
    description:
      "A concise, responsive, SEO-friendly business website designed for credibility, lead capture, and clear service presentation.",
    features: ["5 responsive pages", "Contact form", "Foundational SEO", "Performance-focused structure"]
  },
  {
    label: "Full-Stack App",
    title: "Complete Web Application",
    price: "$499",
    time: "2-3 weeks",
    description:
      "A full-stack web application with authentication, dashboards, APIs, database integration, and structured workflows.",
    features: ["Authentication", "User dashboard", "Backend API", "Database integration"]
  },
  {
    label: "Subscription-Ready",
    title: "Complete SaaS Solution",
    price: "$999",
    time: "3-5 weeks",
    description:
      "A scalable SaaS development foundation with product workflows, admin controls, database models, and subscription-ready architecture.",
    features: ["SaaS platform", "Admin dashboard", "Subscription-ready structure", "Database and API"],
    featured: true
  },
  {
    label: "App Plus Control Room",
    title: "Mobile App with Admin Dashboard",
    price: "$1200",
    time: "4-6 weeks",
    description:
      "A mobile application connected to a secure backend API and an operational admin dashboard for real business workflows.",
    features: ["Mobile app", "Admin dashboard", "Backend API", "Push notification-ready"]
  },
  {
    label: "Complete Product Suite",
    title: "Complete Mobile App + Web App",
    price: "$1699",
    time: "6-8 weeks",
    description:
      "A coordinated mobile app, web app, API, database, and admin dashboard system for a complete digital product launch.",
    features: ["Mobile app", "Web app", "Admin dashboard", "Complete full-stack solution"]
  }
];

export default async function PricingPage() {
  return (
    <PublicShell>
      <PageHero
        eyebrow="Pricing"
        title="Website, web app, SaaS and mobile app development pricing"
        subtitle="Transparent starting packages for SEO-friendly websites, full-stack web applications, SaaS platforms, admin dashboards, and complete product builds. Final quotes are confirmed after a short scoping call."
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
                  Request Package
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

import { SITE_NAME, absoluteUrl, siteUrl } from "./seo";

export type PricingPackage = {
  label: string;
  title: string;
  /** Display string, e.g. "$1,000". */
  price: string;
  /** Numeric starting amount used for schema.org pricing. */
  priceValue: number;
  suffix?: string;
  timeline: string;
  description: string;
  features: string[];
  href?: string;
  ctaLabel?: string;
  featured?: boolean;
};

/**
 * Single source of truth for the development packages shown on /pricing and
 * surfaced as an OfferCatalog in structured data (pricing page + Organization).
 * Prices are "starting from" figures, modelled as PriceSpecification.minPrice.
 */
export const PRICING_PACKAGES: PricingPackage[] = [
  {
    label: "5 Page Presence",
    title: "Simple Website",
    price: "$150",
    priceValue: 150,
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
    priceValue: 500,
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
    priceValue: 1000,
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
    priceValue: 1500,
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
    priceValue: 2000,
    timeline: "8-16 weeks",
    description:
      "A coordinated mobile app, web app, API, database, and admin dashboard system for a complete digital product launch.",
    features: ["Mobile app", "Web app", "Admin dashboard", "Complete full-stack solution"],
    ctaLabel: "Request Package",
    href: "/contact"
  }
];

/**
 * schema.org OfferCatalog built from the real pricing packages. Returned
 * WITHOUT an @context so it can be nested (e.g. Organization.hasOfferCatalog)
 * or spread into a top-level node with its own @context on the pricing page.
 */
export function pricingOfferCatalog(name = "Opplexify software development packages") {
  return {
    "@type": "OfferCatalog",
    name,
    url: absoluteUrl("/pricing"),
    itemListElement: PRICING_PACKAGES.map((pkg, index) => ({
      "@type": "Offer",
      position: index + 1,
      name: pkg.title,
      description: `${pkg.description} Starting from ${pkg.price}; typical timeline ${pkg.timeline}.`,
      category: pkg.label,
      url: absoluteUrl("/pricing"),
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: "USD",
        minPrice: pkg.priceValue
      },
      itemOffered: {
        "@type": "Service",
        name: pkg.title,
        serviceType: "Software development",
        provider: { "@type": "Organization", name: SITE_NAME, url: siteUrl() }
      }
    }))
  };
}

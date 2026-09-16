import { SITE_NAME, absoluteUrl, siteUrl } from "./seo";

export type PricingPackage = {
  label: string;
  title: string;
  /** Display string, e.g. "USD 1,000". */
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
    label: "Business Website",
    title: "5-Page Website",
    price: "USD 150",
    priceValue: 150,
    timeline: "1-3 weeks",
    description:
      "A focused, responsive website that explains what you do, builds trust, and gives potential customers a clear way to contact you.",
    features: ["5 responsive pages", "Contact form", "On-page SEO foundations", "Performance-focused build"],
    ctaLabel: "Discuss This Package",
    href: "/contact"
  },
  {
    label: "Custom Web Application",
    title: "Full-Stack Web App",
    price: "USD 500",
    priceValue: 500,
    timeline: "3-8 weeks",
    description:
      "A custom web application for a defined business workflow, with the frontend, backend, and data layer working as one system.",
    features: ["Secure authentication", "User dashboard", "Backend API", "Database integration"],
    ctaLabel: "Discuss This Package",
    href: "/contact"
  },
  {
    label: "SaaS Product",
    title: "SaaS MVP Foundation",
    price: "USD 1,000",
    priceValue: 1000,
    timeline: "6-12 weeks",
    description:
      "A practical SaaS development foundation for validating your core product experience with users, administration, data, and billing-ready workflows.",
    features: ["Core SaaS workflow", "Admin dashboard", "Billing-ready structure", "Database and API"],
    ctaLabel: "Discuss This Package",
    href: "/contact",
    featured: true
  },
  {
    label: "Mobile Product",
    title: "Mobile App with Admin Dashboard",
    price: "USD 1,500",
    priceValue: 1500,
    timeline: "5-10 weeks",
    description:
      "A mobile app connected to a secure backend API and a practical admin dashboard for managing users, content, and daily operations.",
    features: ["Mobile app", "Admin dashboard", "Secure backend API", "Notification-ready structure"],
    ctaLabel: "Discuss This Package",
    href: "/contact"
  },
  {
    label: "Connected Product Suite",
    title: "Mobile App + Web Platform",
    price: "USD 2,000",
    priceValue: 2000,
    timeline: "8-16 weeks",
    description:
      "A connected mobile and web product backed by one API, database, and admin system, planned for a coordinated launch and easier day-to-day management.",
    features: ["Mobile app", "Web application", "Admin dashboard", "Shared backend system"],
    ctaLabel: "Discuss This Package",
    href: "/contact"
  }
];

/**
 * schema.org OfferCatalog built from the real pricing packages. Returned
 * WITHOUT an @context so it can be nested (e.g. Organization.hasOfferCatalog)
 * or spread into a top-level node with its own @context on the pricing page.
 */
export function pricingOfferCatalog(name = "Opplexify custom software development packages") {
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

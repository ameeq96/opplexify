import type { Metadata } from "next";

export const SITE_NAME = "Opplexify";
export const LEGAL_NAME = "Opplexify LLC";
export const BUSINESS_EMAIL = "admin@opplexify.com";
export const BUSINESS_PHONE = "+1 (307) 443-5144";
export const BUSINESS_PHONE_TEL = "+13074435144";
export const BUSINESS_MAILING_ADDRESS = "Business mailing address: 525 Randall Ave Ste 100 PMB 1203, Cheyenne, WY 82001, United States";
export const BUSINESS_STREET_ADDRESS = "525 Randall Ave Ste 100 PMB 1203";
export const BUSINESS_ADDRESS_LOCALITY = "Cheyenne";
export const BUSINESS_ADDRESS_REGION = "WY";
export const BUSINESS_POSTAL_CODE = "82001";
export const BUSINESS_ADDRESS_COUNTRY = "US";
export const LINKEDIN_URL = "https://www.linkedin.com/company/opplexify-llc/";
export const COMPLIANCE_NOTE = "For business verification or compliance inquiries, contact admin@opplexify.com.";
export const COMPANY_DESCRIPTION =
  "Opplexify LLC helps businesses plan, design, and build websites, SaaS platforms, dashboards, backend systems, APIs, mobile apps, and workflow automations.";
export const DEFAULT_TITLE = "Opplexify LLC - Custom Websites, SaaS Platforms & Business Software";
export const DEFAULT_DESCRIPTION =
  COMPANY_DESCRIPTION;
export const DEFAULT_OG_IMAGE = "/portfolio/thumbs/portfolio-001.webp";
export const DEFAULT_OG_IMAGE_ALT = "Opplexify web development portfolio preview";
export const SITE_LOCALE = "en_US";
export const THEME_COLOR = "#050505";
export const DEFAULT_KEYWORDS = [
  "software development company",
  "website development services",
  "Next.js development",
  "full-stack web application development",
  "SaaS development company",
  "mobile app development",
  "admin dashboard development",
  "NestJS backend development",
  "Prisma development",
  "SEO-friendly websites",
  "Opplexify"
];

export const DEFAULT_OG_IMAGE_TYPE = "image/webp";

/** Shared schema.org PostalAddress so every entity declares the address identically. */
export const BUSINESS_POSTAL_ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: BUSINESS_STREET_ADDRESS,
  addressLocality: BUSINESS_ADDRESS_LOCALITY,
  addressRegion: BUSINESS_ADDRESS_REGION,
  postalCode: BUSINESS_POSTAL_CODE,
  addressCountry: BUSINESS_ADDRESS_COUNTRY
} as const;

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://opplexify.com").replace(/\/+$/, "");
}

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl()}${normalizedPath}`;
}

export function metadataBaseUrl() {
  return new URL(siteUrl());
}

type SeoMetadataOptions = {
  title: string;
  description?: string | null;
  path?: string;
  canonical?: string | null;
  image?: string | null;
  type?: "website" | "article" | "profile";
  noIndex?: boolean;
  keywords?: string[];
};

function robots(noIndex: boolean): Metadata["robots"] {
  if (noIndex) {
    return {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false
      }
    };
  }

  return {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  };
}

/**
 * Builds a schema.org BreadcrumbList from an ordered list of crumbs.
 * Used on detail routes so search/AI engines render breadcrumb rich results
 * and better understand the site hierarchy.
 */
export function breadcrumbList(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path)
    }))
  };
}

export function seoMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  canonical,
  image = DEFAULT_OG_IMAGE,
  type = "website",
  noIndex = false
}: SeoMetadataOptions): Metadata {
  const resolvedDescription = description?.trim() || DEFAULT_DESCRIPTION;
  const canonicalUrl = absoluteUrl(canonical ?? path);
  const imageUrl = absoluteUrl(image || DEFAULT_OG_IMAGE);

  return {
    title,
    description: resolvedDescription,
    alternates: { canonical: canonicalUrl },
    robots: robots(noIndex),
    openGraph: {
      title,
      description: resolvedDescription,
      url: canonicalUrl,
      siteName: SITE_NAME,
      images: [{ url: imageUrl, alt: DEFAULT_OG_IMAGE_ALT, type: DEFAULT_OG_IMAGE_TYPE }],
      locale: SITE_LOCALE,
      type
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: resolvedDescription,
      images: [imageUrl]
    }
  };
}

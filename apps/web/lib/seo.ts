import type { Metadata } from "next";
import { BUSINESS_IDENTITY } from "../../../packages/shared/src";

export { BUSINESS_IDENTITY };

export const SITE_NAME = BUSINESS_IDENTITY.brand.name;
export const LEGAL_NAME = BUSINESS_IDENTITY.llc.legalName;
export const FOUNDER_NAME = BUSINESS_IDENTITY.llc.founderName;
export const LLC_DESCRIPTOR = BUSINESS_IDENTITY.llc.descriptor;
export const BUSINESS_EMAIL = BUSINESS_IDENTITY.llc.contact.email;
export const BUSINESS_PHONE = BUSINESS_IDENTITY.llc.contact.phone;
export const BUSINESS_PHONE_TEL = BUSINESS_IDENTITY.llc.contact.phoneTel;
export const BUSINESS_ADDRESS_LABEL = BUSINESS_IDENTITY.llc.contact.addressLabel;
export const BUSINESS_ADDRESS = BUSINESS_IDENTITY.llc.contact.address;
export const BUSINESS_MAILING_ADDRESS = `${BUSINESS_ADDRESS_LABEL}: ${BUSINESS_ADDRESS}`;
export const BUSINESS_STREET_ADDRESS = BUSINESS_IDENTITY.llc.contact.postalAddress.streetAddress;
export const BUSINESS_ADDRESS_LOCALITY = BUSINESS_IDENTITY.llc.contact.postalAddress.addressLocality;
export const BUSINESS_ADDRESS_REGION = BUSINESS_IDENTITY.llc.contact.postalAddress.addressRegion;
export const BUSINESS_POSTAL_CODE = BUSINESS_IDENTITY.llc.contact.postalAddress.postalCode;
export const BUSINESS_ADDRESS_COUNTRY = BUSINESS_IDENTITY.llc.contact.postalAddress.addressCountry;
export const SAFEPAY_MERCHANT_NAME = BUSINESS_IDENTITY.freelancer.legalName;
export const FREELANCER_DESCRIPTOR = BUSINESS_IDENTITY.freelancer.descriptor;
export const PAKISTAN_ADDRESS_LABEL = BUSINESS_IDENTITY.freelancer.contact.addressLabel;
export const PAKISTAN_CONTACT_ADDRESS = BUSINESS_IDENTITY.freelancer.contact.address;
export const PAKISTAN_SUPPORT_PHONE = BUSINESS_IDENTITY.freelancer.contact.phone;
export const PAKISTAN_SUPPORT_PHONE_TEL = BUSINESS_IDENTITY.freelancer.contact.phoneTel;
export const PAKISTAN_BUSINESS_POSTAL_ADDRESS = {
  "@type": "PostalAddress",
  ...BUSINESS_IDENTITY.freelancer.contact.postalAddress
} as const;
export const LINKEDIN_URL = BUSINESS_IDENTITY.brand.linkedinUrl;
export const COMPANY_DESCRIPTION = BUSINESS_IDENTITY.brand.description;
export const PROVIDER_SELECTION_DISCLOSURE = BUSINESS_IDENTITY.disclosures.providerSelection;
export const LLC_PAYMENT_DISCLOSURE = BUSINESS_IDENTITY.disclosures.llcPayment;
export const FREELANCER_PAYMENT_DISCLOSURE = BUSINESS_IDENTITY.disclosures.freelancerPayment;
export const PAYMENT_SEPARATION_DISCLOSURE = BUSINESS_IDENTITY.disclosures.paymentSeparation;
export const SEPARATE_PERSONS_DISCLOSURE = BUSINESS_IDENTITY.disclosures.separatePersons;
export const APPLICABLE_PROVIDER_REFERENCE = BUSINESS_IDENTITY.disclosures.applicableProviderReference;
export const DEFAULT_TITLE = "Custom Software Development for Startups | Opplexify";
export const DEFAULT_DESCRIPTION =
  COMPANY_DESCRIPTION;
export const DEFAULT_OG_IMAGE = "/opengraph-image";
export const DEFAULT_OG_IMAGE_ALT = "Opplexify custom software development";
export const SITE_LOCALE = "en_US";
export const THEME_COLOR = "#050505";
export const DEFAULT_KEYWORDS = [
  "custom software development",
  "custom web application development",
  "website development services",
  "SaaS development services",
  "dashboard and admin panel development",
  "mobile app development services",
  "backend API development",
  "workflow automation services",
  "API integration services",
  "startup software development",
  "Opplexify"
];

export const DEFAULT_OG_IMAGE_TYPE = "image/png";

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
  return (process.env.NEXT_PUBLIC_SITE_URL ?? BUSINESS_IDENTITY.brand.websiteUrl).replace(/\/+$/, "");
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
    title: { absolute: title },
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

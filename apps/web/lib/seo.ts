import type { Metadata } from "next";

export const SITE_NAME = "Opplexify";
export const DEFAULT_DESCRIPTION =
  "Opplexify is a full-stack web development agency building SEO-friendly websites, SaaS platforms, mobile apps, admin dashboards, and scalable backend systems.";
export const DEFAULT_OG_IMAGE = "/portfolio/thumbs/portfolio-001.webp";
export const DEFAULT_KEYWORDS = [
  "web development agency",
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

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://opplexify.com").replace(/\/+$/, "");
}

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl()}${normalizedPath}`;
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

export function seoMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  canonical,
  image = DEFAULT_OG_IMAGE,
  type = "website",
  noIndex = false,
  keywords = DEFAULT_KEYWORDS
}: SeoMetadataOptions): Metadata {
  const resolvedDescription = description?.trim() || DEFAULT_DESCRIPTION;
  const canonicalUrl = absoluteUrl(canonical ?? path);
  const imageUrl = absoluteUrl(image || DEFAULT_OG_IMAGE);

  return {
    title,
    description: resolvedDescription,
    keywords,
    alternates: { canonical: canonicalUrl },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      title,
      description: resolvedDescription,
      url: canonicalUrl,
      siteName: SITE_NAME,
      images: [{ url: imageUrl }],
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

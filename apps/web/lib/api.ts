import type { Metadata } from "next";
import {
  BUSINESS_EMAIL,
  BUSINESS_MAILING_ADDRESS,
  BUSINESS_PHONE,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  LINKEDIN_URL,
  SITE_NAME,
  seoMetadata
} from "./seo";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

function apiEndpoint(path: string) {
  if (typeof window !== "undefined") return `${API_URL}${path}`;
  const internalBase = (process.env.INTERNAL_API_URL || API_URL || `http://127.0.0.1:${process.env.API_PORT || 4000}`).replace(/\/+$/, "");
  return `${internalBase}${path}`;
}

export type MenuItem = {
  id: string;
  label: string;
  url: string;
  target?: string | null;
  sortOrder: number;
};

export type SitePayload = {
  settings: {
    site?: Record<string, string>;
    social?: Record<string, string>;
    seo?: Record<string, string>;
    footer?: Record<string, any>;
    theme?: Record<string, string>;
  };
  menus: Array<{ location: string; items: MenuItem[] }>;
};

export type SectionCta = {
  label?: string;
  href?: string;
};

export type SectionContent = Record<string, any> & {
  eyebrow?: string;
  image?: string;
  lightImage?: string;
  headline?: string;
  body?: string;
  paragraphs?: string[];
  primaryCta?: SectionCta;
  secondaryCta?: SectionCta;
  cta?: SectionCta;
  metaItems?: string[];
  items?: Array<Record<string, any>>;
  logos?: Array<Record<string, string>>;
  fallbackItems?: Array<Record<string, string>>;
  limit?: number;
};

export type Section = {
  id: string;
  key: string;
  type: string;
  title?: string | null;
  subtitle?: string | null;
  content?: SectionContent | null;
};

export type Page = {
  id: string;
  title: string;
  slug: string;
  pageType?: string | null;
  summary?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
  sections: Section[];
};

export type Service = {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  icon?: string | null;
  image?: string | null;
  gallery?: string[] | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
};

export type Project = {
  id: string;
  title: string;
  slug: string;
  client?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  mainImage?: string | null;
  gallery?: string[] | null;
  videoUrl?: string | null;
  date?: string | null;
  contentBlocks?: Array<Record<string, any>> | null;
  category?: { name: string; slug: string } | null;
  tools?: string | null;
  duration?: string | null;
  location?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
};

export type PortfolioItem = {
  id: string;
  title: string;
  tag?: string | null;
  mediaUrl: string;
  mediaType: "image" | "video" | string;
  alt?: string | null;
  featured: boolean;
  sortOrder: number;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  featuredImage?: string | null;
  publishedAt?: string | null;
  category?: { name: string; slug: string } | null;
  author?: { name: string } | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
};

export type TeamMember = {
  id: string;
  name: string;
  slug: string;
  role: string;
  bio?: string | null;
  image?: string | null;
  skills?: string[] | null;
  socialLinks?: Record<string, string> | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImage?: string | null;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  category?: string | null;
};

export type Testimonial = {
  id: string;
  clientName: string;
  position?: string | null;
  company?: string | null;
  rating: number;
  image?: string | null;
  reviewText: string;
};

type FetchApiInit = RequestInit & {
  noStore?: boolean;
  revalidate?: number | false;
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
};

const FETCH_TIMEOUT_MS = 8000;

export async function fetchApi<T>(path: string, fallback: T, init: FetchApiInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const { noStore = false, revalidate = 60, next, ...requestInit } = init;
    const method = String(requestInit.method ?? "GET").toUpperCase();
    const shouldBypassCache = noStore || method !== "GET" || process.env.NODE_ENV === "development";
    const cacheOptions = shouldBypassCache
      ? ({ cache: "no-store" } as const)
      : ({
          next: {
            ...next,
            revalidate: next?.revalidate ?? revalidate
          }
        } as const);

    const response = await fetch(apiEndpoint(path), {
      ...requestInit,
      ...cacheOptions,
      signal: controller.signal
    });

    if (!response.ok) return fallback;
    return (await response.json()) as T;
  } catch {
    // Network error, non-OK, or timeout abort — fall back to the safe default.
    return fallback;
  } finally {
    clearTimeout(timeout);
  }
}

export function assetUrl(src?: string | null) {
  if (!src) return "/template-assets/dark/assets/imgs/project/image-s-4.webp";
  try {
    if (new URL(src, "https://opplexify.local").pathname.startsWith("/portfolio/images/")) return DEFAULT_OG_IMAGE;
  } catch {
    if (src.startsWith("/portfolio/images/")) return DEFAULT_OG_IMAGE;
  }
  if (src.startsWith("http") || src.startsWith("/template-assets")) return src;
  if (src.startsWith("/uploads")) return `${API_URL}${src}`;
  return src;
}

export function pageMetadata(page?: Partial<Page> | null, fallbackTitle = SITE_NAME, path = "/"): Metadata {
  const title = page?.seoTitle ?? page?.title ?? fallbackTitle;
  const description = page?.seoDescription ?? page?.summary ?? DEFAULT_DESCRIPTION;
  const image = assetUrl(page?.ogImage);

  return seoMetadata({
    title,
    description,
    path,
    canonical: page?.canonicalUrl,
    image
  });
}

export function getMenu(site: SitePayload, location: string) {
  return site.menus.find((menu) => menu.location === location)?.items ?? [];
}

export function getSection(page: Page | null | undefined, key: string) {
  return page?.sections?.find((section) => section.key === key);
}

export const emptySite: SitePayload = {
  settings: {
    site: {
      title: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
      logoLight: "/template-assets/dark/assets/imgs/logo/opplexify-logo-full.png",
      logoDark: "/template-assets/dark/assets/imgs/logo/opplexify-logo-dark.svg",
      email: BUSINESS_EMAIL,
      phone: BUSINESS_PHONE,
      address: BUSINESS_MAILING_ADDRESS
    },
    footer: {
      text: DEFAULT_DESCRIPTION,
      copyright: "Copyright 2026 Opplexify LLC."
    },
    social: { linkedin: LINKEDIN_URL }
  },
  menus: [
    {
      location: "header",
      items: [
        { id: "home", label: "Home", url: "/", sortOrder: 1 },
        { id: "about", label: "About", url: "/about", sortOrder: 2 },
        { id: "portfolio", label: "Portfolio", url: "/portfolio", sortOrder: 3 },
        { id: "services", label: "Services", url: "/services", sortOrder: 4 },
        { id: "contact", label: "Contact Us", url: "/contact", sortOrder: 5 }
      ]
    }
  ]
};

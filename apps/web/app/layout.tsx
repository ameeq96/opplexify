import type { Metadata, Viewport } from "next";
import { opplexifyCompany, opplexifyServices } from "@adon/shared";
import {
  absoluteUrl,
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_ALT,
  DEFAULT_TITLE,
  metadataBaseUrl,
  SITE_LOCALE,
  SITE_NAME,
  siteUrl,
  THEME_COLOR
} from "../lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: metadataBaseUrl(),
  title: {
    default: DEFAULT_TITLE,
    template: "%s | Opplexify"
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: DEFAULT_KEYWORDS,
  authors: [{ name: SITE_NAME, url: siteUrl() }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "technology",
  manifest: "/manifest.webmanifest",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  },
  alternates: {
    canonical: absoluteUrl("/")
  },
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: absoluteUrl("/"),
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    images: [{ url: absoluteUrl(DEFAULT_OG_IMAGE), alt: DEFAULT_OG_IMAGE_ALT }],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [absoluteUrl(DEFAULT_OG_IMAGE)]
  },
  icons: {
    icon: [
      { url: "/template-assets/dark/assets/imgs/logo/favicon.svg", type: "image/svg+xml" },
      { url: "/template-assets/dark/assets/imgs/logo/favicon.webp", sizes: "64x64", type: "image/webp" },
      { url: "/template-assets/dark/assets/imgs/logo/app-icon-192.webp", sizes: "192x192", type: "image/webp" },
      { url: "/template-assets/dark/assets/imgs/logo/app-icon-512.webp", sizes: "512x512", type: "image/webp" }
    ],
    shortcut: [{ url: "/template-assets/dark/assets/imgs/logo/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/template-assets/dark/assets/imgs/logo/apple-touch-icon.webp", sizes: "180x180", type: "image/webp" }]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  }
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: THEME_COLOR
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: opplexifyCompany.brandName,
    legalName: opplexifyCompany.legalName,
    description: DEFAULT_DESCRIPTION,
    url: siteUrl(),
    logo: absoluteUrl("/template-assets/dark/assets/imgs/logo/opplexify-logo-light.svg"),
    email: opplexifyCompany.email,
    telephone: opplexifyCompany.phone,
    foundingDate: "2026-05-28",
    sameAs: [opplexifyCompany.linkedin],
    address: {
      "@type": "PostalAddress",
      name: opplexifyCompany.mailingAddressLabel,
      streetAddress: opplexifyCompany.streetAddress,
      addressLocality: opplexifyCompany.addressLocality,
      addressRegion: opplexifyCompany.addressRegion,
      postalCode: opplexifyCompany.postalCode,
      addressCountry: opplexifyCompany.addressCountry
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "business inquiries",
      email: opplexifyCompany.email,
      telephone: opplexifyCompany.phone,
      areaServed: "Worldwide",
      availableLanguage: ["English"]
    },
    makesOffer: opplexifyServices.map((service) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: service.title,
        description: service.shortDescription
      }
    }))
  };
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: opplexifyCompany.legalName,
    url: siteUrl(),
    description: DEFAULT_DESCRIPTION,
    inLanguage: "en"
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        {children}
      </body>
    </html>
  );
}

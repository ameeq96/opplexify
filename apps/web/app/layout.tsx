import type { Metadata, Viewport } from "next";
import {
  absoluteUrl,
  BUSINESS_EMAIL,
  BUSINESS_PHONE,
  BUSINESS_POSTAL_ADDRESS,
  COMPANY_DESCRIPTION,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_ALT,
  DEFAULT_OG_IMAGE_TYPE,
  DEFAULT_TITLE,
  LEGAL_NAME,
  LINKEDIN_URL,
  metadataBaseUrl,
  SITE_LOCALE,
  SITE_NAME,
  siteUrl,
  THEME_COLOR
} from "../lib/seo";
import { pricingOfferCatalog } from "../lib/pricing";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: metadataBaseUrl(),
  title: {
    default: DEFAULT_TITLE,
    template: "%s | Opplexify"
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
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
    images: [{ url: absoluteUrl(DEFAULT_OG_IMAGE), alt: DEFAULT_OG_IMAGE_ALT, type: DEFAULT_OG_IMAGE_TYPE }],
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
      { url: "/template-assets/dark/assets/imgs/logo/opplexify-mark-64.webp", sizes: "64x64", type: "image/webp" },
      { url: "/template-assets/dark/assets/imgs/logo/opplexify-mark-192.webp", sizes: "192x192", type: "image/webp" },
      { url: "/template-assets/dark/assets/imgs/logo/opplexify-mark-512.webp", sizes: "512x512", type: "image/webp" }
    ],
    shortcut: [{ url: "/template-assets/dark/assets/imgs/logo/opplexify-mark-64.webp", type: "image/webp" }],
    apple: [{ url: "/template-assets/dark/assets/imgs/logo/opplexify-mark-180.webp", sizes: "180x180", type: "image/webp" }]
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
    name: SITE_NAME,
    legalName: LEGAL_NAME,
    url: siteUrl(),
    logo: absoluteUrl("/template-assets/dark/assets/imgs/logo/opplexify-logo-full.png"),
    email: BUSINESS_EMAIL,
    telephone: BUSINESS_PHONE,
    foundingDate: "2026-05-28",
    description: COMPANY_DESCRIPTION,
    sameAs: [LINKEDIN_URL],
    address: BUSINESS_POSTAL_ADDRESS,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "business verification and project inquiries",
      email: BUSINESS_EMAIL,
      telephone: BUSINESS_PHONE,
      areaServed: "Worldwide",
      availableLanguage: ["English"]
    },
    knowsAbout: [
      "custom website development",
      "SaaS platform development",
      "mobile app development",
      "dashboard and admin panel development",
      "backend API development",
      "workflow automation"
    ],
    makesOffer: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Custom website development" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "SaaS platform development" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Dashboard and admin panel development" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Mobile app development" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Backend API development" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Automation and integrations" } }
    ],
    hasOfferCatalog: pricingOfferCatalog("Opplexify software development packages")
  };
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteUrl(),
    description: DEFAULT_DESCRIPTION,
    inLanguage: "en"
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Warm the TLS connection to Google Fonts — style.css @imports DM Sans from gstatic. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body suppressHydrationWarning>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        {children}
      </body>
    </html>
  );
}

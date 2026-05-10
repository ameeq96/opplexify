import type { Metadata } from "next";
import { absoluteUrl, DEFAULT_DESCRIPTION, DEFAULT_KEYWORDS, DEFAULT_OG_IMAGE, SITE_NAME, siteUrl } from "../lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Opplexify - Web Development Agency for Websites, SaaS & Apps",
    template: "%s | Opplexify"
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: DEFAULT_KEYWORDS,
  authors: [{ name: SITE_NAME, url: siteUrl() }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: absoluteUrl("/")
  },
  openGraph: {
    title: "Opplexify - Web Development Agency for Websites, SaaS & Apps",
    description: DEFAULT_DESCRIPTION,
    url: absoluteUrl("/"),
    siteName: SITE_NAME,
    images: [{ url: absoluteUrl(DEFAULT_OG_IMAGE) }],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Opplexify - Web Development Agency for Websites, SaaS & Apps",
    description: DEFAULT_DESCRIPTION,
    images: [absoluteUrl(DEFAULT_OG_IMAGE)]
  },
  icons: {
    icon: "/template-assets/dark/assets/imgs/logo/favicon.svg",
    shortcut: "/template-assets/dark/assets/imgs/logo/favicon.svg",
    apple: "/template-assets/dark/assets/imgs/logo/favicon.svg"
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    legalName: "Opplexify",
    url: siteUrl(),
    logo: absoluteUrl("/template-assets/dark/assets/imgs/logo/opplexify-logo-light.svg"),
    email: "hello@opplexify.com",
    description: DEFAULT_DESCRIPTION,
    sameAs: ["https://www.instagram.com/", "https://www.facebook.com/", "https://x.com/", "https://www.linkedin.com/"],
    knowsAbout: [
      "Next.js web development",
      "SaaS platform development",
      "mobile app development",
      "admin dashboard development",
      "NestJS API development"
    ],
    makesOffer: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Website development services" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Full-stack web application development" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "SaaS platform development" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Mobile app development" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Admin dashboard development" } }
    ]
  };
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteUrl(),
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl()}/portfolio?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
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

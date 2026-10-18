import type { Metadata, Viewport } from "next";
import Script from "next/script";
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
  PAKISTAN_BUSINESS_POSTAL_ADDRESS,
  PAKISTAN_SUPPORT_PHONE,
  SAFEPAY_MERCHANT_NAME,
  SITE_LOCALE,
  SITE_NAME,
  siteUrl,
  THEME_COLOR
} from "../lib/seo";
import { pricingOfferCatalog } from "../lib/pricing";
import "./globals.css";

const GOOGLE_ANALYTICS_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID?.trim();
const GOOGLE_SITE_VERIFICATION = process.env.GOOGLE_SITE_VERIFICATION?.trim();

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
  },
  verification: GOOGLE_SITE_VERIFICATION ? { google: GOOGLE_SITE_VERIFICATION } : undefined
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: THEME_COLOR
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl()}#organization`,
    name: SITE_NAME,
    legalName: LEGAL_NAME,
    url: siteUrl(),
    logo: absoluteUrl("/template-assets/dark/assets/imgs/logo/opplexify-logo-full.png"),
    email: BUSINESS_EMAIL,
    telephone: BUSINESS_PHONE,
    description: COMPANY_DESCRIPTION,
    sameAs: [LINKEDIN_URL],
    address: BUSINESS_POSTAL_ADDRESS,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales and project inquiries",
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
    hasOfferCatalog: pricingOfferCatalog("Opplexify custom software development services")
  };
  const safepayMerchantJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteUrl()}#safepay-merchant`,
    name: SAFEPAY_MERCHANT_NAME,
    jobTitle: "Independent Freelancer",
    url: absoluteUrl("/ownership-statement"),
    telephone: PAKISTAN_SUPPORT_PHONE,
    address: PAKISTAN_BUSINESS_POSTAL_ADDRESS,
    knowsAbout: [
      "custom website development",
      "SaaS platform development",
      "mobile app development",
      "backend API development"
    ]
  };
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteUrl(),
    description: DEFAULT_DESCRIPTION,
    inLanguage: "en",
    publisher: { "@id": `${siteUrl()}#organization` }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(safepayMerchantJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        {GOOGLE_ANALYTICS_ID ? (
          <Script id="opplexify-google-analytics" strategy="lazyOnload">
            {`(() => {
const id = ${JSON.stringify(GOOGLE_ANALYTICS_ID)};
const disable = 'ga-disable-' + id;
let started = false;
let previousPublic = '';
function privateUrl(value) {
  try {
    const url = new URL(value || location.href, location.href);
    return /^\\/(?:checkout|streaming-plans)(?:\\/|$)/.test(url.pathname) || new URLSearchParams(url.hash.slice(1)).has('resume');
  } catch { return true; }
}
function sync() {
  const blocked = privateUrl(location.href);
  window[disable] = blocked;
  if (blocked) return;
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) window.gtag = function(){window.dataLayer.push(arguments);};
  window.gtag('set', { page_location: location.href, page_referrer: previousPublic || (privateUrl(document.referrer) ? location.origin : document.referrer) });
  previousPublic = location.href;
  if (started) return;
  started = true;
  window.gtag('js', new Date());
  window.gtag('config', id, { anonymize_ip: true });
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
  document.head.appendChild(script);
}
for (const method of ['pushState', 'replaceState']) {
  const original = history[method];
  history[method] = function(state, unused, url) {
    if (privateUrl(url == null ? location.href : url)) window[disable] = true;
    const result = original.apply(this, arguments);
    sync();
    return result;
  };
}
document.addEventListener('click', event => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = event.target?.closest?.('a[href]');
  if (link && (!link.target || link.target === '_self') && privateUrl(link.href)) window[disable] = true;
}, true);
window.addEventListener('popstate', sync, true);
window.addEventListener('hashchange', sync, true);
sync();
})();`}
          </Script>
        ) : null}
        {children}
      </body>
    </html>
  );
}

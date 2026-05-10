import type { Metadata } from "next";
import { StaticTemplatePage } from "../../components/site/StaticTemplatePage";
import { contactHtml } from "../../components/site/templateHtml";
import { fetchApi, getSection, pageMetadata, type Page } from "../../lib/api";
import { absoluteUrl, siteUrl } from "../../lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchApi<Page | null>("/public/pages/contact", null);
  return pageMetadata(page, "Contact Opplexify - Hire Web, SaaS & App Developers", "/contact");
}

const contactPageHtml = contactHtml
  .replace(
    /<h2 class="page-title ">Let’s <span>talk<\/span><\/h2>/,
    `<h1 class="page-title ">Hire <span>Opplexify</span></h1>`
  )
  .replace(
    /Let's work together\. feel free to drop ua line <br>\s*about your project\./,
    "Tell us about your website, web app, SaaS platform, mobile app, admin dashboard, or backend API project."
  )
  .replace(/Direct Contact/g, "Development Project Contact")
  .replace(/The topic you want to talk/g, "Website, SaaS, mobile app, dashboard, or API project")
  .replace(/Write your message\*/g, "Share your goals, timeline, features, budget, and launch requirements")
  .replace(/<h3 class="title"> Offices <br> world-wide\s*<\/h3>/, `<h3 class="title"> Remote <br> development team</h3>`)
  .replace(/<h3 class="title">Montreal<\/h3>/g, `<h3 class="title">Website Development</h3>`)
  .replace(/<h3 class="title">Toronto<\/h3>/g, `<h3 class="title">SaaS Development</h3>`)
  .replace(/<h3 class="title">New York<\/h3>/g, `<h3 class="title">Mobile App Development</h3>`)
  .replace(/438 McGill street #200[\s\S]*?H2Y 2G1/g, "SEO-friendly business websites, landing pages, and service pages built to convert visitors into leads.")
  .replace(/67 Mowat Avenue #433[\s\S]*?M6K 3E3/g, "Subscription-ready SaaS platforms, admin dashboards, secure APIs, and database-backed workflows.")
  .replace(/407 N\. Maple Drive, Ground 1[\s\S]*?90210/g, "Mobile apps, web apps, backend systems, launch support, and ongoing product improvements.")
  .replace(
    /<div class="socail-media">[\s\S]*?<div class="direct-contact">/,
    `<div class="socail-media">
                                            <div class="socail-media__item">
                                                <a href="https://www.instagram.com/" class="icon">
                                                    <i class="fa-brands fa-instagram"></i>
                                                </a>
                                                <div class="text">
                                                    <a href="https://www.instagram.com/">Instagram</a>
                                                    <span>@opplexify</span>
                                                </div>
                                            </div>
                                            <div class="socail-media__item">
                                                <a href="https://www.facebook.com/" class="icon">
                                                    <i class="fa-brands fa-facebook-f"></i>
                                                </a>
                                                <div class="text">
                                                    <a href="https://www.facebook.com/">Facebook</a>
                                                    <span>@opplexify</span>
                                                </div>
                                            </div>
                                            <div class="socail-media__item">
                                                <a href="https://x.com/" class="icon">
                                                    <i class="fa-brands fa-twitter"></i>
                                                </a>
                                                <div class="text">
                                                    <a href="https://x.com/">Twitter</a>
                                                    <span>@opplexify</span>
                                                </div>
                                            </div>
                                            <div class="socail-media__item">
                                                <a href="https://www.linkedin.com/" class="icon">
                                                    <i class="fa-brands fa-linkedin-in"></i>
                                                </a>
                                                <div class="text">
                                                    <a href="https://www.linkedin.com/">LinkedIn</a>
                                                    <span>@opplexify</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="direct-contact">`
  );

const contactJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact Opplexify",
  url: absoluteUrl("/contact"),
  description:
    "Contact Opplexify to hire a full-stack development team for websites, SaaS platforms, mobile apps, admin dashboards, and backend APIs.",
  isPartOf: { "@type": "WebSite", name: "Opplexify", url: siteUrl() },
  mainEntity: {
    "@type": "ProfessionalService",
    name: "Opplexify",
    url: siteUrl(),
    email: "hello@opplexify.com",
    areaServed: "Worldwide"
  }
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function applyContactCms(html: string, page: Page | null) {
  const intro = getSection(page, "contact-hero") ?? getSection(page, "hero");
  const title = intro?.title ?? page?.title;
  const subtitle = intro?.subtitle ?? page?.summary;

  return html
    .replace(/<h1 class="page-title ">[\s\S]*?<\/h1>/, title ? `<h1 class="page-title ">${escapeHtml(title)}</h1>` : "$&")
    .replace(/Tell us about your website, web app, SaaS platform, mobile app, admin dashboard, or backend API project\./, subtitle ? escapeHtml(subtitle) : "$&");
}

export default async function ContactPage() {
  const page = await fetchApi<Page | null>("/public/pages/contact", null);
  const jsonLd = { ...contactJsonLd, name: page?.title ?? contactJsonLd.name, description: page?.seoDescription ?? page?.summary ?? contactJsonLd.description };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <StaticTemplatePage html={applyContactCms(contactPageHtml, page)} bodyClassName="body-about-us" />
    </>
  );
}

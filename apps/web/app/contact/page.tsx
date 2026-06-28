import type { Metadata } from "next";
import { StaticTemplatePage } from "../../components/site/StaticTemplatePage";
import { contactHtml } from "../../components/site/templateHtml";
import { emptySite, fetchApi, getSection, pageMetadata, type Page, type SitePayload } from "../../lib/api";
import {
  BUSINESS_EMAIL,
  BUSINESS_MAILING_ADDRESS,
  BUSINESS_PHONE,
  BUSINESS_POSTAL_ADDRESS,
  LEGAL_NAME,
  LINKEDIN_URL,
  absoluteUrl,
  breadcrumbList,
  siteUrl
} from "../../lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchApi<Page | null>("/public/pages/contact", null);
  return pageMetadata(page, "Contact Opplexify LLC - Software Development Inquiries", "/contact");
}

const contactPageHtml = contactHtml
  .replace(
    /<h2 class="page-title ">Let’s <span>talk<\/span><\/h2>/,
    `<h1 class="page-title ">Contact <span>Opplexify LLC</span></h1>`
  )
  .replace(
    /Let's work together\. feel free to drop ua line <br>\s*about your project\./,
    "Tell us about your website, SaaS platform, mobile app, dashboard, backend API, or automation project. For business verification or compliance inquiries, contact admin@opplexify.com."
  )
  .replace(/Direct Contact/g, "Business Contact")
  .replace(/The topic you want to talk/g, "Website, SaaS, mobile app, dashboard, or API project")
  .replace(/Write your message\*/g, "Share your goals, timeline, features, budget, and launch requirements")
  .replace(/<h3 class="title"> Offices <br> world-wide\s*<\/h3>/, `<h3 class="title"> Business <br> contact</h3>`)
  .replace(/<h3 class="title">Montreal<\/h3>/g, `<h3 class="title">Business Mailing Address</h3>`)
  .replace(/<h3 class="title">Toronto<\/h3>/g, `<h3 class="title">Business Email</h3>`)
  .replace(/<h3 class="title">New York<\/h3>/g, `<h3 class="title">Business Phone</h3>`)
  .replace(/438 McGill street #200[\s\S]*?H2Y 2G1/g, BUSINESS_MAILING_ADDRESS)
  .replace(/67 Mowat Avenue #433[\s\S]*?M6K 3E3/g, `Email: ${BUSINESS_EMAIL}`)
  .replace(/407 N\. Maple Drive, Ground 1[\s\S]*?90210/g, `Phone: ${BUSINESS_PHONE}`)
  .replace(
    /<div class="socail-media">[\s\S]*?<div class="direct-contact">/,
    `<div class="socail-media">
                                            <div class="socail-media__item">
                                                <a href="${LINKEDIN_URL}" class="icon">
                                                    <i class="fa-brands fa-linkedin-in"></i>
                                                </a>
                                                <div class="text">
                                                    <a href="${LINKEDIN_URL}">LinkedIn</a>
                                                    <span>Opplexify LLC</span>
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
    "Contact Opplexify LLC for custom website, SaaS, mobile app, dashboard, backend API, and automation development inquiries.",
  isPartOf: { "@type": "WebSite", name: "Opplexify", url: siteUrl() },
  mainEntity: {
    "@type": "Organization",
    name: "Opplexify",
    legalName: LEGAL_NAME,
    url: siteUrl(),
    email: BUSINESS_EMAIL,
    telephone: BUSINESS_PHONE,
    sameAs: [LINKEDIN_URL],
    address: BUSINESS_POSTAL_ADDRESS
  }
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function socialEntries(site: SitePayload) {
  return Object.entries(site.settings.social ?? {}).filter(([name, href]) => name.toLowerCase() === "linkedin" && Boolean(href));
}

function socialIcon(name: string) {
  const key = name.toLowerCase();
  if (key.includes("linkedin")) return "fa-linkedin-in";
  return "fa-linkedin-in";
}

function socialLabel(name: string) {
  if (name.toLowerCase() === "linkedin") return "LinkedIn";
  if (name.toLowerCase() === "x") return "X";
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function renderSocialHtml(site: SitePayload) {
  const entries = socialEntries(site);
  const links = entries.length ? entries : [["linkedin", LINKEDIN_URL]];

  return `<div class="socail-media">
    ${links
      .map(
        ([name]) => `<div class="socail-media__item">
          <a href="${escapeHtml(LINKEDIN_URL)}" class="icon"><i class="fa-brands ${escapeHtml(socialIcon(name))}"></i></a>
          <div class="text"><a href="${escapeHtml(LINKEDIN_URL)}">${escapeHtml(socialLabel(name))}</a><span>Opplexify LLC</span></div>
        </div>`
      )
      .join("")}
  </div>`;
}

function findDivEnd(html: string, startIndex: number) {
  const divTag = /<\/?div\b[^>]*>/g;
  divTag.lastIndex = startIndex;
  let depth = 0;
  let match: RegExpExecArray | null;

  while ((match = divTag.exec(html))) {
    depth += match[0].startsWith("</") ? -1 : 1;
    if (depth === 0) return divTag.lastIndex;
  }

  return -1;
}

function replaceDivBlock(html: string, marker: string, replacement: string) {
  const start = html.indexOf(marker);
  const end = start === -1 ? -1 : findDivEnd(html, start);
  if (start === -1 || end === -1) return html;
  return html.slice(0, start) + replacement + html.slice(end);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cleanBusinessAddress(address: string, email: string, phone: string) {
  return address
    .replace(/^Business mailing address:\s*/i, "")
    .replace(new RegExp(escapeRegExp(email), "gi"), "")
    .replace(/\badmin@opplexify\.com\b/gi, "")
    .replace(new RegExp(escapeRegExp(phone), "gi"), "")
    .replace(/\+?1?\s*\(?307\)?[\s-]*443[\s-]*5144\.?/gi, "")
    .replace(/\b(?:Email|Phone):\s*/gi, "")
    .replace(/\s*\|\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+,/g, ",")
    .trim();
}

function renderContactInfoHtml(email: string, phone: string, address: string) {
  const cleanAddress = cleanBusinessAddress(address, email, phone);
  const digits = phone.replace(/[^\d]/g, "");
  const tel = digits ? `+${digits}` : "+13074435144";

  return `<div class="contact-us__info opplexify-contact-cards">
    <div class="contact-us__item opplexify-contact-card">
      <h3 class="title">Business Mailing Address</h3>
      <p class="contact-value">${escapeHtml(cleanAddress)}</p>
    </div>
    <div class="contact-us__item opplexify-contact-card">
      <h3 class="title">Business Email</h3>
      <a class="contact-value" href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>
    </div>
    <div class="contact-us__item opplexify-contact-card">
      <h3 class="title">Business Phone</h3>
      <a class="contact-value" href="tel:${escapeHtml(tel)}">${escapeHtml(phone)}</a>
    </div>
  </div>`;
}

function applyContactCms(html: string, page: Page | null, site: SitePayload) {
  const intro = getSection(page, "contact-hero") ?? getSection(page, "hero");
  const contactInfo = getSection(page, "contact-info");
  const siteSettings = site.settings.site ?? {};
  const title = intro?.title ?? page?.title;
  const subtitle = intro?.subtitle ?? page?.summary;
  const email = String(contactInfo?.content?.email ?? siteSettings.email ?? BUSINESS_EMAIL);
  const phone = String(contactInfo?.content?.phone ?? siteSettings.phone ?? BUSINESS_PHONE);
  const address = String(contactInfo?.content?.address ?? siteSettings.address ?? BUSINESS_MAILING_ADDRESS);

  let rendered = html
    .replace(/<h1 class="page-title ">[\s\S]*?<\/h1>/, title ? `<h1 class="page-title ">${escapeHtml(title)}</h1>` : "$&")
    .replace(/Tell us about your website, web app, SaaS platform, mobile app, admin dashboard, or backend API project\./, subtitle ? escapeHtml(subtitle) : "$&");

  const socialHtml = renderSocialHtml(site);
  if (socialHtml) {
    rendered = rendered.replace(/<div class="socail-media">[\s\S]*?<div class="direct-contact">/, `${socialHtml}<div class="direct-contact">`);
  }
  if (email) {
    rendered = rendered.replace(/infoO@opplexifycreative\.com|hello@opplexify\.com/g, escapeHtml(email));
  }
  if (phone) {
    rendered = rendered.replace(/\(505\) 555-0125/g, escapeHtml(phone));
  }
  if (address) {
    rendered = rendered.replace(/Remote <br> development team/g, "Project <br> contact");
    rendered = rendered.replace(BUSINESS_MAILING_ADDRESS, escapeHtml(address));
    rendered = rendered.replace(`Email: ${BUSINESS_EMAIL}`, `Email: ${escapeHtml(email)}`);
    rendered = rendered.replace(`Phone: ${BUSINESS_PHONE}`, `Phone: ${escapeHtml(phone)}`);
  }

  return replaceDivBlock(rendered, '<div class="contact-us__info">', renderContactInfoHtml(email, phone, address));
}

export default async function ContactPage() {
  const [page, site] = await Promise.all([
    fetchApi<Page | null>("/public/pages/contact", null),
    fetchApi<SitePayload>("/public/site", emptySite)
  ]);
  const jsonLd = { ...contactJsonLd, name: page?.title ?? contactJsonLd.name, description: page?.seoDescription ?? page?.summary ?? contactJsonLd.description };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])) }} />
      <StaticTemplatePage html={applyContactCms(contactPageHtml, page, site)} bodyClassName="body-about-us" />
    </>
  );
}

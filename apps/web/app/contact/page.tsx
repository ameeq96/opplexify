import type { Metadata } from "next";
import { StaticTemplatePage } from "../../components/site/StaticTemplatePage";
import { contactHtml } from "../../components/site/templateHtml";
import { emptySite, fetchApi, getSection, pageMetadata, type Page, type SitePayload } from "../../lib/api";
import {
  BUSINESS_ADDRESS,
  BUSINESS_ADDRESS_LABEL,
  BUSINESS_EMAIL,
  BUSINESS_MAILING_ADDRESS,
  BUSINESS_PHONE,
  BUSINESS_PHONE_TEL,
  BUSINESS_POSTAL_ADDRESS,
  FOUNDER_NAME,
  FREELANCER_DESCRIPTOR,
  LEGAL_NAME,
  LINKEDIN_URL,
  LLC_DESCRIPTOR,
  PAKISTAN_ADDRESS_LABEL,
  PAKISTAN_BUSINESS_POSTAL_ADDRESS,
  PAKISTAN_CONTACT_ADDRESS,
  PAKISTAN_SUPPORT_PHONE,
  PAKISTAN_SUPPORT_PHONE_TEL,
  PROVIDER_SELECTION_DISCLOSURE,
  SAFEPAY_MERCHANT_NAME,
  absoluteUrl,
  breadcrumbList,
  siteUrl
} from "../../lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchApi<Page | null>("/public/pages/contact", null);
  return pageMetadata(page, "Contact Opplexify | Discuss Your Software Project", "/contact");
}

const contactPageHtml = contactHtml
  .replace(
    /<h2 class="page-title ">Let’s <span>talk<\/span><\/h2>/,
    `<h1 class="page-title ">Let’s build something <span>useful</span></h1>`
  )
  .replace(
    /Let's work together\. feel free to drop ua line <br>\s*about your project\./,
    "Tell us what you are building, who it is for, and where you need help—from product planning and UI/UX to development, integration, and launch."
  )
  .replace(/Direct Contact/g, "Project Contact")
  .replace(/The topic you want to talk/g, "What would you like to build or improve?")
  .replace(/Write your message\*/g, "Share your goals, priorities, timeline, and any useful context")
  .replace(`<label>Name*</label>`, `<label for="full-name">Name*</label>`)
  .replace(`<label>Email*</label>`, `<label for="email">Email*</label>`)
  .replace(`<label>Phone (Optional)</label>`, `<label for="phone">Phone (Optional)</label>`)
  .replace(`<label>Subject*</label>`, `<label for="subject">Subject*</label>`)
  .replace(`<label>Message*</label>`, `<label for="message">Message*</label>`)
  .replace(`name="name" id="full-name"`, `name="name" id="full-name" autocomplete="name" required`)
  .replace(`type="email" name="email" id="email"`, `type="email" name="email" id="email" autocomplete="email" required`)
  .replace(`type="text" name="phone" id="phone"`, `type="tel" name="phone" id="phone" autocomplete="tel"`)
  .replace(`type="text" name="subject" id="subject"`, `type="text" name="subject" id="subject" required`)
  .replace(
    /<input type="text" name="message" id="message"\s+placeholder="Share your goals, priorities, timeline, and any useful context">/,
    `<textarea name="message" id="message" rows="6" minlength="10" placeholder="Share your goals, priorities, timeline, and any useful context" required></textarea>`
  )
  .replace(`<button type="submit" class="rr-btn">`, `<button type="submit" class="rr-btn" aria-label="Submit contact form">`)
  .replace(`<span class="text-two">Submit now</span>`, `<span class="text-two" aria-hidden="true">Submit now</span>`)
  .replace(
    `<div class="ajax-response" style="display:none;"></div>`,
    `<div class="ajax-response" role="status" aria-live="polite" aria-atomic="true" style="display:none;"></div>`
  )
  .replace(/<h3 class="title"> Offices <br> world-wide\s*<\/h3>/, `<h3 class="title"> Let’s discuss <br> your project</h3>`)
  .replace(`<a href="#">Let’s talk</a>`, `<a href="#contact__form">Let’s talk</a>`)
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
                                                    <span>Opplexify</span>
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
    "Contact Opplexify to discuss custom website development, SaaS products, web applications, mobile apps, admin dashboards, backend APIs, or workflow automation.",
  isPartOf: { "@type": "WebSite", name: "Opplexify", url: siteUrl() },
  mainEntity: [
    {
      "@type": "Organization",
      "@id": `${siteUrl()}#organization`,
      name: "Opplexify",
      legalName: LEGAL_NAME,
      url: siteUrl(),
      email: BUSINESS_EMAIL,
      telephone: BUSINESS_PHONE,
      contactPoint: {
        "@type": "ContactPoint",
        telephone: BUSINESS_PHONE,
        contactType: "international customer service"
      },
      sameAs: [LINKEDIN_URL],
      address: BUSINESS_POSTAL_ADDRESS
    },
    {
      "@type": "Person",
      "@id": `${siteUrl()}#safepay-merchant`,
      name: SAFEPAY_MERCHANT_NAME,
      jobTitle: "Independent Freelancer",
      url: absoluteUrl("/ownership-statement"),
      telephone: PAKISTAN_SUPPORT_PHONE,
      address: PAKISTAN_BUSINESS_POSTAL_ADDRESS,
      contactPoint: {
        "@type": "ContactPoint",
        telephone: PAKISTAN_SUPPORT_PHONE,
        contactType: "customer service",
        areaServed: "PK"
      }
    }
  ]
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
          <div class="text"><a href="${escapeHtml(LINKEDIN_URL)}">${escapeHtml(socialLabel(name))}</a><span>Opplexify</span></div>
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

function renderContactInfoHtml() {
  return `<div class="contact-us__info opplexify-contact-cards">
    <div class="contact-us__item opplexify-contact-card">
      <h3 class="title">${escapeHtml(LEGAL_NAME)}</h3>
      <p class="contact-value">${escapeHtml(LLC_DESCRIPTOR)}</p>
      <p class="contact-value">Founder and Owner: ${escapeHtml(FOUNDER_NAME)}</p>
      <p class="contact-value">${escapeHtml(BUSINESS_ADDRESS_LABEL)}: ${escapeHtml(BUSINESS_ADDRESS)}</p>
    </div>
    <div class="contact-us__item opplexify-contact-card">
      <h3 class="title">Website and Project Enquiries</h3>
      <a class="contact-value" href="mailto:${escapeHtml(BUSINESS_EMAIL)}">${escapeHtml(BUSINESS_EMAIL)}</a>
      <a class="contact-value" href="tel:${escapeHtml(BUSINESS_PHONE_TEL)}">${escapeHtml(BUSINESS_PHONE)}</a>
    </div>
    <div class="contact-us__item opplexify-contact-card">
      <h3 class="title">${escapeHtml(SAFEPAY_MERCHANT_NAME)}</h3>
      <p class="contact-value">${escapeHtml(FREELANCER_DESCRIPTOR)}</p>
      <p class="contact-value">${escapeHtml(PAKISTAN_ADDRESS_LABEL)}: ${escapeHtml(PAKISTAN_CONTACT_ADDRESS)}</p>
      <a class="contact-value" href="tel:${escapeHtml(PAKISTAN_SUPPORT_PHONE_TEL)}">${escapeHtml(PAKISTAN_SUPPORT_PHONE)}</a>
    </div>
    <div class="contact-us__item opplexify-contact-card opplexify-contact-card--wide">
      <h3 class="title">Before the integration call, please ensure:</h3>
      <p class="contact-value">&#8226; Safepay Sandbox &amp; Production login credentials</p>
      <p class="contact-value">&#8226; Website admin access</p>
      <a class="contact-value" href="/safepay-demo">&#8226; A test product (~PKR 100) set up</a>
      <p class="contact-value">&#8226; A debit/credit card available for testing</p>
    </div>
    <div class="contact-us__item opplexify-contact-card opplexify-contact-card--wide">
      <h3 class="title">Before payment</h3>
      <p class="contact-value">${escapeHtml(PROVIDER_SELECTION_DISCLOSURE)}</p>
      <a class="contact-value" href="/payment-information">Read provider and payment information</a>
    </div>
  </div>`;
}

function applyContactCms(html: string, page: Page | null, site: SitePayload) {
  const intro = getSection(page, "contact-hero") ?? getSection(page, "hero");
  const title = intro?.title ?? page?.title;
  const subtitle = intro?.subtitle ?? page?.summary;

  let rendered = html
    .replace(/<h1 class="page-title ">[\s\S]*?<\/h1>/, title ? `<h1 class="page-title ">${escapeHtml(title)}</h1>` : "$&")
    .replace(/Tell us what you are building, who it is for, and where you need help—from product planning and UI\/UX to development, integration, and launch\./, subtitle ? escapeHtml(subtitle) : "$&");

  const socialHtml = renderSocialHtml(site);
  if (socialHtml) {
    rendered = rendered.replace(/<div class="socail-media">[\s\S]*?<div class="direct-contact">/, `${socialHtml}<div class="direct-contact">`);
  }
  rendered = rendered.replace(/infoO@opplexifycreative\.com|hello@opplexify\.com/g, escapeHtml(BUSINESS_EMAIL));
  rendered = rendered.replace(/\(505\) 555-0125/g, escapeHtml(BUSINESS_PHONE));
  rendered = rendered.replace(/Remote <br> development team/g, "Project <br> contact");

  return replaceDivBlock(rendered, '<div class="contact-us__info">', renderContactInfoHtml());
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

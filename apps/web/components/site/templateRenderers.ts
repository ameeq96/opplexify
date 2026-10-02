import { assetUrl, emptySite, getMenu, type MenuItem, type SitePayload } from "../../lib/api";
import {
  BUSINESS_ADDRESS,
  BUSINESS_ADDRESS_LABEL,
  BUSINESS_EMAIL,
  BUSINESS_PHONE,
  BUSINESS_PHONE_TEL,
  FREELANCER_DESCRIPTOR,
  FREELANCER_PAYMENT_DISCLOSURE,
  LEGAL_NAME,
  LINKEDIN_URL,
  LLC_DESCRIPTOR,
  LLC_PAYMENT_DISCLOSURE,
  PAKISTAN_ADDRESS_LABEL,
  PAKISTAN_CONTACT_ADDRESS,
  PAKISTAN_SUPPORT_PHONE,
  PAKISTAN_SUPPORT_PHONE_TEL,
  PAYMENT_SEPARATION_DISCLOSURE,
  PROVIDER_SELECTION_DISCLOSURE,
  SAFEPAY_MERCHANT_NAME
} from "../../lib/seo";
import { TEMPLATE_ASSET_BASE as A } from "./templateAssets";

type FooterServiceLink = {
  label: string;
  href: string;
};

const defaultServiceLinks: FooterServiceLink[] = [
  { label: "Websites & Web Apps", href: "/services" },
  { label: "SaaS Development", href: "/services" },
  { label: "Mobile App Development", href: "/services" },
  { label: "APIs & Automation", href: "/services" }
];

const socialOrder = ["instagram", "facebook", "twitter", "linkedin"];
const DEFAULT_FOOTER_COPYRIGHT = "Copyright 2026 Opplexify. All rights reserved.";

export function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function socialLabel(name: string) {
  if (name.toLowerCase() === "linkedin") return "LinkedIn";
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function orderedSocialLinks(social?: Record<string, unknown>) {
  return Object.entries(social ?? {})
    .filter(([name, href]) => name.toLowerCase() === "linkedin" && Boolean(href))
    .sort(([a], [b]) => socialRank(a) - socialRank(b))
    .map(([name]) => [name, LINKEDIN_URL] as const);
}

export function footerServiceLinks(footer?: Record<string, unknown>): FooterServiceLink[] {
  if (!Array.isArray(footer?.serviceLinks)) return defaultServiceLinks;

  return footer.serviceLinks
    .map((item) => {
      const record = item && typeof item === "object" && !Array.isArray(item) ? (item as Record<string, unknown>) : {};
      return {
        label: String(record.label ?? "Service"),
        href: String(record.href ?? "/services")
      };
    })
    .filter((item) => item.label.trim() && item.href.trim());
}

export function footerContactInfo(site: SitePayload) {
  void site;
  const email = BUSINESS_EMAIL;
  const phone = BUSINESS_PHONE;
  const tel = BUSINESS_PHONE_TEL;
  const address = BUSINESS_ADDRESS;

  return { address, email, phone, tel };
}

export function renderProviderDisclosureHtml() {
  return `<section class="provider-disclosure-area rr-bg-primary" aria-labelledby="provider-disclosure-title">
  <div class="container rr-container-1650">
    <div class="provider-disclosure section-spacing">
      <span class="section-subtitle">Contracting provider</span>
      <h2 id="provider-disclosure-title">One provider, identified before payment</h2>
      <p>${escapeHtml(PROVIDER_SELECTION_DISCLOSURE)}</p>
      <div class="provider-disclosure__grid">
        <article>
          <h3>${escapeHtml(LEGAL_NAME)}</h3>
          <p>${escapeHtml(LLC_DESCRIPTOR)}.</p>
          <p>${escapeHtml(LLC_PAYMENT_DISCLOSURE)}</p>
        </article>
        <article>
          <h3>${escapeHtml(SAFEPAY_MERCHANT_NAME)}</h3>
          <p>${escapeHtml(FREELANCER_DESCRIPTOR)}.</p>
          <p>${escapeHtml(FREELANCER_PAYMENT_DISCLOSURE)}</p>
        </article>
      </div>
      <p class="provider-disclosure__separation">${escapeHtml(PAYMENT_SEPARATION_DISCLOSURE)}</p>
      <a class="rr-btn-underline" href="/payment-information">Read payment information</a>
    </div>
  </div>
</section>`;
}

export function renderTemplateSideInfoHtml(site: SitePayload) {
  const logoDark = assetUrl(site.settings.site?.logoDark ?? `${A}/imgs/logo/opplexify-logo-light.svg`).replace(/opplexify-logo-full(?:-v2)?\.png$/, "opplexify-logo-light.svg");
  const logoLight = assetUrl(site.settings.site?.logoLight ?? `${A}/imgs/logo/opplexify-logo-light.svg`).replace(/opplexify-logo-full(?:-v2)?\.png$/, "opplexify-logo-light.svg");

  return `<aside class="fix" aria-label="Navigation and project contact">
  <div class="side-info" id="mobile-navigation" role="dialog" aria-label="Navigation and project contact" aria-modal="true" aria-hidden="true" inert>
    <div class="side-info-content">
      <div class="offset-widget offset-header">
        <div class="offset-logo">
          <a href="/">
            <img class="show-light" src="${escapeHtml(logoDark)}" alt="Opplexify logo" width="560" height="160" decoding="async">
            <img class="show-dark" src="${escapeHtml(logoLight)}" alt="Opplexify logo" width="560" height="160" decoding="async">
          </a>
        </div>
        <button id="side-info-close" class="side-info-close" type="button" aria-label="Close navigation menu">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="mobile-menu d-xl-none fix"></div>
      <div class="offset-button">
        <a href="/contact" class="rr-btn"><span class="btn-wrap"><span class="text-one">Let's Talk</span><span class="text-two" aria-hidden="true">Let's Talk</span></span></a>
      </div>
      <div class="offset-widget-box">
        <h2 class="title">Project Contact</h2>
        <div class="contact-meta">
          <div class="contact-item"><span class="icon"><i class="fa-solid fa-building"></i></span><span class="text"><strong>${escapeHtml(LEGAL_NAME)}</strong><br> ${escapeHtml(LLC_DESCRIPTOR)}</span></div>
          <div class="contact-item"><span class="icon"><i class="fa-solid fa-location-dot"></i></span><span class="text">${escapeHtml(BUSINESS_ADDRESS_LABEL)}: ${escapeHtml(BUSINESS_ADDRESS)}</span></div>
          <div class="contact-item"><span class="icon"><i class="fa-solid fa-envelope"></i></span><span class="text"><a href="mailto:${escapeHtml(BUSINESS_EMAIL)}">${escapeHtml(BUSINESS_EMAIL)}</a></span></div>
          <div class="contact-item"><span class="icon"><i class="fa-solid fa-phone"></i></span><span class="text"><a href="tel:${escapeHtml(BUSINESS_PHONE_TEL)}">${escapeHtml(BUSINESS_PHONE)}</a></span></div>
          <div class="contact-item"><span class="icon"><i class="fa-solid fa-user"></i></span><span class="text"><strong>${escapeHtml(SAFEPAY_MERCHANT_NAME)}</strong><br> ${escapeHtml(FREELANCER_DESCRIPTOR)}</span></div>
          <div class="contact-item"><span class="icon"><i class="fa-solid fa-location-dot"></i></span><span class="text">${escapeHtml(PAKISTAN_ADDRESS_LABEL)}: ${escapeHtml(PAKISTAN_CONTACT_ADDRESS)}</span></div>
          <div class="contact-item"><span class="icon"><i class="fa-solid fa-phone"></i></span><span class="text"><a href="tel:${escapeHtml(PAKISTAN_SUPPORT_PHONE_TEL)}">${escapeHtml(PAKISTAN_SUPPORT_PHONE)}</a></span></div>
          <div class="contact-item"><span class="icon"><i class="fa-solid fa-file-invoice"></i></span><span class="text">${escapeHtml(PROVIDER_SELECTION_DISCLOSURE)}<br><a href="/payment-information">Provider and payment information</a></span></div>
        </div>
      </div>
    </div>
  </div>
</aside>`;
}

export function footerCopyright(footer?: Record<string, unknown>) {
  const raw = typeof footer?.copyright === "string" ? footer.copyright.trim() : "";
  if (!raw) return DEFAULT_FOOTER_COPYRIGHT;

  if (!/(admin@opplexify\.com|\+1\s*\(307\)\s*443[-\u2013]5144|Business mailing address:|US mailing\/registered address:)/i.test(raw)) {
    return raw;
  }

  return raw
    .split(/admin@opplexify\.com|\+1\s*\(307\)\s*443[-\u2013]5144|Business mailing address:|US mailing\/registered address:/i)[0]
    .replace(/\s*[|,;:-]\s*$/, "")
    .trim() || DEFAULT_FOOTER_COPYRIGHT;
}

export function renderMenuHtml(items: MenuItem[]) {
  const links = items.length ? items : emptySite.menus[0].items;
  return `<nav class="main-menu" aria-label="Primary navigation">
  <ul>
    ${links.map((item) => `<li><a href="${escapeHtml(item.url)}"${item.target ? ` target="${escapeHtml(item.target)}"` : ""}>${escapeHtml(item.label)}</a></li>`).join("")}
  </ul>
</nav>`;
}

export function renderFooterMenuHtml(items: MenuItem[]) {
  const links = items.length ? items : emptySite.menus[0].items;
  return `<ul class="footer-nav-list">
    ${links.map((item) => `<li><a href="${escapeHtml(item.url)}"${item.target ? ` target="${escapeHtml(item.target)}"` : ""}>${escapeHtml(item.label)}</a></li>`).join("")}
  </ul>`;
}

export function renderTemplateHeaderHtml(site: SitePayload) {
  const logoLight = assetUrl(site.settings.site?.logoLight ?? `${A}/imgs/logo/opplexify-logo-light.svg`).replace(/opplexify-logo-full(?:-v2)?\.png$/, "opplexify-logo-light.svg");
  return `<header class="header-area">
  <div class="header-main">
    <div class="container rr-container-1650">
      <div class="header-area__inner">
        <div class="header__logo">
          <a href="/">
            <img src="${escapeHtml(logoLight)}" class="normal-logo" alt="Opplexify logo" width="560" height="160" decoding="async">
          </a>
        </div>
        <div class="header__shape">
          <svg width="13" height="40" viewBox="0 0 13 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" width="1" height="40" fill="white" fill-opacity="0.1" />
            <rect y="10" width="1" height="20" fill="white" fill-opacity="0.1" />
            <rect x="12" y="10" width="1" height="20" fill="white" fill-opacity="0.1" />
          </svg>
        </div>
        <div class="header__nav">
          ${renderMenuHtml(getMenu(site, "header"))}
        </div>
        <div class="header__navicon d-xl-none">
          <button class="side-toggle" type="button" aria-label="Open navigation menu" aria-controls="mobile-navigation" aria-expanded="false"><i class="fa-solid fa-bars"></i></button>
        </div>
      </div>
    </div>
  </div>
</header>`;
}

export function renderTemplateFooterHtml(site: SitePayload) {
  const footer = site.settings.footer ?? {};
  const companyItems = getMenu(site, "footer").length ? getMenu(site, "footer") : getMenu(site, "header");
  const contact = footerContactInfo(site);
  const logoLight = assetUrl(site.settings.site?.logoLight ?? `${A}/imgs/logo/opplexify-logo-light.svg`).replace(/opplexify-logo-full(?:-v2)?\.png$/, "opplexify-logo-light.svg");
  const serviceLinksHtml = footerServiceLinks(footer)
    .map((item) => `<li><a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a></li>`)
    .join("");

  return `<footer class="footer-area">
  <div class="container rr-container-1650">
    <div class="footer-widget-wrapper-box">
      <div class="footer-widget-wrapper">
        <div class="footer-widget-box content">
          <a href="/" class="footer-logo">
            <img src="${escapeHtml(logoLight)}" alt="Opplexify logo" width="560" height="160" decoding="async">
          </a>
          <div class="title-wrapper">
            <h2 class="title rr_title_anim">${escapeHtml(footer.headline ?? "Custom software")} <br> ${escapeHtml(footer.headlineLine2 ?? "for startups and")} <br> ${escapeHtml(footer.headlineLine3 ?? "growing businesses")}</h2>
          </div>
          <a href="/contact" class="rr-btn-underline">${escapeHtml(footer.ctaLabel ?? "Discuss your project")}</a>
        </div>
        <div class="footer-widget-box">
          <h2 class="title">Company</h2>
          ${renderFooterMenuHtml(companyItems)}
        </div>
        <div class="footer-widget-box">
          <h2 class="title">Services</h2>
          <ul class="footer-nav-list">${serviceLinksHtml}</ul>
        </div>
        <div class="footer-widget-box">
          <h2 class="title">Legal</h2>
          <ul class="footer-nav-list">
            <li><a href="/pricing">Pricing</a></li>
            <li><a href="/payment-information">Payment Information</a></li>
            <li><a href="/terms">Terms and Conditions</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/refund-policy">Cancellation, Return and Refund Policy</a></li>
            <li><a href="/ownership-statement">Ownership Statement</a></li>
          </ul>
        </div>
        <div class="footer-widget-box">
          <h2 class="title">Contact</h2>
          <ul class="footer-nav-list footer-contact-list">
            <li><strong>${escapeHtml(LEGAL_NAME)}</strong><br> <span>${escapeHtml(LLC_DESCRIPTOR)}</span></li>
            <li><a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a></li>
            <li><a href="tel:${escapeHtml(contact.tel)}">${escapeHtml(contact.phone)}</a></li>
            <li><span>${escapeHtml(BUSINESS_ADDRESS_LABEL)}: ${escapeHtml(contact.address)}</span></li>
            <li><strong>${escapeHtml(SAFEPAY_MERCHANT_NAME)}</strong><br> <span>${escapeHtml(FREELANCER_DESCRIPTOR)}</span></li>
            <li><a href="tel:${escapeHtml(PAKISTAN_SUPPORT_PHONE_TEL)}">${escapeHtml(PAKISTAN_SUPPORT_PHONE)}</a></li>
            <li><span>${escapeHtml(PAKISTAN_ADDRESS_LABEL)}: ${escapeHtml(PAKISTAN_CONTACT_ADDRESS)}</span></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  <div class="copyright-area">
    <div class="copyright-area-inner">
      <div class="copyright-text">
        <p class="text">${escapeHtml(footerCopyright(footer))}</p>
      </div>
      <a class="copyright-social" href="${escapeHtml(LINKEDIN_URL)}" aria-label="Opplexify on LinkedIn">
        <i class="fa-brands fa-linkedin-in"></i>
      </a>
    </div>
  </div>
</footer>`;
}

function socialRank(name: string) {
  const index = socialOrder.indexOf(name);
  return index === -1 ? socialOrder.length : index;
}

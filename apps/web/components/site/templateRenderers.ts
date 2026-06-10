import { opplexifyCompany } from "@adon/shared";
import { assetUrl, emptySite, getMenu, type MenuItem, type SitePayload } from "../../lib/api";
import { TEMPLATE_ASSET_BASE as A } from "./templateAssets";

type FooterServiceLink = {
  label: string;
  href: string;
};

const allowedMenuUrls = new Set(["/", "/about", "/portfolio", "/services", "/pricing", "/faq", "/contact"]);

const defaultServiceLinks: FooterServiceLink[] = [
  { label: "Custom Website Development", href: "/services/custom-website-development" },
  { label: "SaaS Platform Development", href: "/services/saas-platform-development" },
  { label: "Dashboard & Admin Panel Development", href: "/services/dashboard-admin-panel-development" },
  { label: "Backend/API Development", href: "/services/backend-api-development" }
];

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

export function orderedSocialLinks(_social?: Record<string, unknown>) {
  return [["linkedin", opplexifyCompany.linkedin] as const];
}

export function footerServiceLinks(_footer?: Record<string, unknown>): FooterServiceLink[] {
  return defaultServiceLinks;
}

function visibleLinks(items: MenuItem[]) {
  return (items.length ? items : emptySite.menus[0].items).filter((item) => allowedMenuUrls.has(item.url));
}

export function renderMenuHtml(items: MenuItem[]) {
  const links = visibleLinks(items);
  return `<nav class="main-menu">
  <ul>
    ${links.map((item) => `<li><a href="${escapeHtml(item.url)}"${item.target ? ` target="${escapeHtml(item.target)}"` : ""}>${escapeHtml(item.label)}</a></li>`).join("")}
  </ul>
</nav>`;
}

export function renderFooterMenuHtml(items: MenuItem[]) {
  const links = visibleLinks(items);
  return `<ul class="footer-nav-list">
    ${links.map((item) => `<li><a href="${escapeHtml(item.url)}"${item.target ? ` target="${escapeHtml(item.target)}"` : ""}>${escapeHtml(item.label)}</a></li>`).join("")}
  </ul>`;
}

export function renderTemplateHeaderHtml(site: SitePayload) {
  const logoLight = assetUrl(site.settings.site?.logoLight ?? `${A}/imgs/logo/opplexify-logo-light.svg`);
  return `<header class="header-area">
  <div class="header-main">
    <div class="container rr-container-1650">
      <div class="header-area__inner">
        <div class="header__logo">
          <a href="/">
            <img src="${escapeHtml(logoLight)}" class="normal-logo" alt="Opplexify LLC logo" decoding="async">
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
          <button class="side-toggle"><i class="fa-solid fa-bars"></i></button>
        </div>
      </div>
    </div>
  </div>
</header>`;
}

export function renderTemplateFooterHtml(site: SitePayload) {
  const companyItems = getMenu(site, "footer").length ? getMenu(site, "footer") : getMenu(site, "header");
  const socialHtml = orderedSocialLinks()
    .map(([name, href]) => `<li><a href="${escapeHtml(href)}">${escapeHtml(socialLabel(name))}</a></li>`)
    .join("");
  const serviceLinksHtml = footerServiceLinks()
    .map((item) => `<li><a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a></li>`)
    .join("");

  return `<footer class="footer-area">
  <div class="container rr-container-1650">
    <div class="footer-widget-wrapper-box">
      <div class="footer-widget-wrapper">
        <div class="footer-widget-box content">
          <div class="title-wrapper">
            <h2 class="title rr_title_anim">Plan, build, <br> and maintain <br> business software</h2>
          </div>
          <a href="/contact" class="rr-btn-underline">Request a Quote</a>
        </div>
        <div class="footer-widget-box">
          <h2 class="title">Company</h2>
          ${renderFooterMenuHtml(companyItems)}
        </div>
        <div class="footer-widget-box">
          <h2 class="title">Social</h2>
          <ul class="footer-nav-list">${socialHtml}</ul>
        </div>
        <div class="footer-widget-box">
          <h2 class="title">Services</h2>
          <ul class="footer-nav-list">${serviceLinksHtml}</ul>
        </div>
        <div class="footer-widget-box">
          <h2 class="title">Legal</h2>
          <ul class="footer-nav-list">
            <li><a href="/pricing">Pricing</a></li>
            <li><a href="/terms">Terms of Service</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/refund-policy">Refund Policy</a></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  <div class="copyright-area">
    <div class="copyright-area-inner">
      <div class="copyright-text">
        <p class="text">${escapeHtml(`Copyright 2026 ${opplexifyCompany.legalName}. All rights reserved.`)}</p>
      </div>
    </div>
  </div>
</footer>`;
}

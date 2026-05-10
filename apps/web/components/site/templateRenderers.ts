import { assetUrl, emptySite, getMenu, type MenuItem, type SitePayload } from "../../lib/api";
import { TEMPLATE_ASSET_BASE as A } from "./templateAssets";

type FooterServiceLink = {
  label: string;
  href: string;
};

const defaultServiceLinks: FooterServiceLink[] = [
  { label: "Website Development", href: "/services" },
  { label: "SaaS Development", href: "/services" },
  { label: "Mobile Apps", href: "/services" },
  { label: "Admin Dashboards", href: "/services" }
];

const socialOrder = ["instagram", "facebook", "twitter", "linkedin"];

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
    .filter(([, href]) => Boolean(href))
    .sort(([a], [b]) => socialRank(a) - socialRank(b))
    .map(([name, href]) => [name, String(href)] as const);
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

export function renderMenuHtml(items: MenuItem[]) {
  const links = items.length ? items : emptySite.menus[0].items;
  return `<nav class="main-menu">
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
  const logoLight = assetUrl(site.settings.site?.logoLight ?? `${A}/imgs/logo/opplexify-logo-light.svg`);
  return `<header class="header-area">
  <div class="header-main">
    <div class="container rr-container-1650">
      <div class="header-area__inner">
        <div class="header__logo">
          <a href="/">
            <img src="${escapeHtml(logoLight)}" class="normal-logo" alt="Opplexify logo" decoding="async">
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
  const footer = site.settings.footer ?? {};
  const companyItems = getMenu(site, "footer").length ? getMenu(site, "footer") : getMenu(site, "header");
  const socialLinks = orderedSocialLinks(site.settings.social);
  const socialHtml = (socialLinks.length ? socialLinks : [["linkedin", "https://www.linkedin.com/"] as const])
    .map(([name, href]) => `<li><a href="${escapeHtml(href)}">${escapeHtml(socialLabel(String(name)))}</a></li>`)
    .join("");
  const serviceLinksHtml = footerServiceLinks(footer)
    .map((item) => `<li><a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a></li>`)
    .join("");

  return `<footer class="footer-area">
  <div class="container rr-container-1650">
    <div class="footer-widget-wrapper-box">
      <div class="footer-widget-wrapper">
        <div class="footer-widget-box content">
          <div class="title-wrapper">
            <h2 class="title rr_title_anim">${escapeHtml(footer.headline ?? "Build a website,")} <br> ${escapeHtml(footer.headlineLine2 ?? "app or SaaS product")} <br> ${escapeHtml(footer.headlineLine3 ?? "that converts")}</h2>
          </div>
          <a href="/contact" class="rr-btn-underline">${escapeHtml(footer.ctaLabel ?? "Get a development quote")}</a>
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
      </div>
    </div>
  </div>
  <div class="copyright-area">
    <div class="copyright-area-inner">
      <div class="copyright-text">
        <p class="text">${escapeHtml(footer.copyright ?? "© 2026 Opplexify. All rights reserved.")}</p>
      </div>
    </div>
  </div>
</footer>`;
}

function socialRank(name: string) {
  const index = socialOrder.indexOf(name);
  return index === -1 ? socialOrder.length : index;
}

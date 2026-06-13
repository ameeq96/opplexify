import { DigitalAgencyRuntime } from "./DigitalAgencyRuntime";
import { emptySite, fetchApi, getMenu, type SitePayload } from "../../lib/api";
import { BUSINESS_EMAIL, BUSINESS_MAILING_ADDRESS, BUSINESS_PHONE } from "../../lib/seo";
import { TEMPLATE_ASSET_BASE as A } from "./templateAssets";
import { TemplateAssetLinks } from "./TemplateAssetLinks";
import { escapeHtml, renderFooterMenuHtml, renderMenuHtml, renderTemplateFooterHtml, renderTemplateHeaderHtml } from "./templateRenderers";

type StaticTemplatePageProps = {
  html: string;
  bodyClassName?: string;
};

export function normalizeTemplateHtml(html: string, site: SitePayload = emptySite) {
  const headerHtml = renderTemplateHeaderHtml(site);
  const footerHtml = renderTemplateFooterHtml(site);
  const dynamicMenuHtml = renderMenuHtml(getMenu(site, "header"));
  const dynamicFooterMenuHtml = renderFooterMenuHtml(getMenu(site, "footer").length ? getMenu(site, "footer") : getMenu(site, "header"));
  const settings = site.settings.site ?? {};
  const email = escapeHtml(settings.email ?? BUSINESS_EMAIL);
  const phone = escapeHtml(settings.phone ?? BUSINESS_PHONE);
  const tel = `+${phone.replace(/[^\d]/g, "")}`;
  const address = escapeHtml(settings.address ?? BUSINESS_MAILING_ADDRESS);

  return html
    .replace(/<!-- Header area start -->[\s\S]*?<!-- Header area end -->\s*(?:<!-- Header area end -->)?/g, headerHtml)
    .replace(/<!-- footer area start\s+-->[\s\S]*?<!-- footer area end\s+-->/gi, footerHtml)
    .replace(/<header class="header-area">[\s\S]*?<\/header>/g, headerHtml)
    .replace(/<footer class="footer-area">[\s\S]*?<\/footer>/g, footerHtml)
    .replace(/<nav class="main-menu">[\s\S]*?<\/nav>/g, dynamicMenuHtml)
    .replace(/\/template-assets\/dark\/assets\/imgs\/logo\/dark-logo\.webp/g, `${A}/imgs/logo/opplexify-logo-dark.svg`)
    .replace(/\/template-assets\/dark\/assets\/imgs\/logo\/light-logo\.webp/g, `${A}/imgs/logo/opplexify-logo-full.png`)
    .replace(/(<h2 class="title">Company<\/h2>\s*)<ul class="footer-nav-list">[\s\S]*?<\/ul>/g, (_match, heading) => `${heading}${dynamicFooterMenuHtml}`)
    .replace(/action="http:\/\/localhost:4000\/public\/contact"/g, 'action="/contact"')
    .replace(/infoO@opplexifycreative\.com|hello@opplexify\.com/g, email)
    .replace(/\(505\) 555-0125/g, phone)
    .replace(/\+1 22 6126877|\+1 36 3126827/g, phone)
    .replace(/href="tell:\d+"/g, `href="tel:${tel}"`)
    .replace(/href="tel:\(505\)555-0125"/g, `href="tel:${tel}"`)
    .replace(/<h2 class="title">Contact US<\/h2>/g, '<h2 class="title">Project Contact</h2>')
    .replace(/3891 Ranchview Dr\. Richardson|Remote web development team/g, address)
    .replace(/\/template-assets\/dark\/assets\/imgs\/gallery\/contact-us-r-1\.webp/g, `${A}/imgs/gallery/gallery-s-1.webp`);
}

export async function StaticTemplatePage({ html, bodyClassName = "" }: StaticTemplatePageProps) {
  const site = await fetchApi<SitePayload>("/public/site", emptySite);
  const normalizedHtml = normalizeTemplateHtml(html, site);

  return (
    <>
      <TemplateAssetLinks />
      <div
        className={["opplexify-template-page", "body-wrapper", "dark", bodyClassName].filter(Boolean).join(" ")}
        dangerouslySetInnerHTML={{ __html: normalizedHtml }}
      />
      <DigitalAgencyRuntime bodyClassName={bodyClassName} />
    </>
  );
}

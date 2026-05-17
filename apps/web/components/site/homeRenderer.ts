import { assetUrl, getSection, type Page, type PortfolioItem, type Section, type Service, type SitePayload, type TeamMember } from "../../lib/api";
import { normalizeTemplateHtml } from "./StaticTemplatePage";
import { TEMPLATE_ASSET_BASE as A } from "./templateAssets";
import { escapeHtml } from "./templateRenderers";

type ContentRecord = Record<string, unknown>;

function headlineHtml(value: string) {
  const parts = value.split(/\s*[\n|]\s*/).filter(Boolean);
  if (parts.length > 1) return parts.map(escapeHtml).join("<br>");
  return escapeHtml(value);
}

function lineBreakHtml(value: unknown) {
  return escapeHtml(value).replace(/\n/g, "<br>");
}

function asRecord(value: unknown): ContentRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as ContentRecord) : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" && value ? value : fallback;
}

function darkServiceIcon(value: string) {
  if (!value.includes("/imgs/icon/icon-s-") || value.includes("-dark.")) return value;
  return value.replace(/(\.[a-z0-9]+)(\?.*)?$/i, "-dark$1$2");
}

function section(page: Page | null, key: string) {
  return getSection(page, key);
}

function sectionContent(item?: Section | null) {
  return asRecord(item?.content);
}

function replaceWhen(source: string, pattern: RegExp, replacement: string | null) {
  return replacement ? source.replace(pattern, replacement) : source;
}

function renderHomeAbout(item?: Section | null) {
  if (!item) return null;
  const content = sectionContent(item);
  const paragraphs = asArray(content.paragraphs).length
    ? asArray(content.paragraphs)
    : typeof content.body === "string"
      ? [content.body]
      : [];
  const cta = asRecord(content.cta);
  const image = assetUrl(stringValue(content.image, `${A}/imgs/gallery/gallery-s-1.webp`));

  return String.raw`
        <section class="about-area-2">
          <div class="container rr-container-1650">
            <div class="about-area-2-inner section-spacing-top">
              <div class="section-header">
                <div class="section-title-wrapper">
                  <div class="title-wrapper rr_title_anim">
                    <h2 class="section-title font-bdogrotesk-regular">${escapeHtml(
                      item.title ?? "We build high-converting digital products for businesses ready to grow."
                    )}</h2>
                  </div>
                </div>
              </div>
              <div class="section-content-wrapper">
                <div class="area-shape-1">
                  <img class="fade-anim show-light" data-fade-from="bottom" src="${A}/imgs/shape/shape-s-1.webp" alt="image" data-speed="0.8" loading="lazy" decoding="async">
                  <img class="fade-anim show-dark" data-fade-from="bottom" src="${A}/imgs/shape/shape-s-1-light.webp" alt="image" data-speed="0.8" loading="lazy" decoding="async">
                </div>
                <div class="section-subtitle-wrapper fade-anim">
                  <div class="subtitle-wrapper">
                    <span class="section-subtitle-3">(${escapeHtml(item.subtitle ?? "Who we are")})</span>
                  </div>
                  <div class="thumb" data-speed="1.2">
                    <img src="${escapeHtml(image)}" alt="${escapeHtml(item.title ?? "Opplexify")}" loading="lazy" decoding="async" sizes="(max-width: 760px) 100vw, 34vw">
                  </div>
                </div>
                <div class="section-content fade-anim">
                  <div class="text-wrapper">
                    ${paragraphs.map((paragraph) => `<p class="text">${escapeHtml(paragraph)}</p>`).join("")}
                  </div>
                  <div class="btn-wrapper">
                    <a href="${escapeHtml(stringValue(cta.href, "/about"))}" class="rr-btn-underline">${escapeHtml(
                      stringValue(cta.label, "Learn more about Opplexify")
                    )}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>`;
}

function renderHomeWork(item: Section | null | undefined, portfolioItems: PortfolioItem[]) {
  if (!item) return null;
  const content = sectionContent(item);
  const cta = asRecord(content.cta);
  const limit = Number(content.limit ?? 4);
  const cmsVideos = portfolioItems
    .filter((portfolioItem) => portfolioItem.mediaType === "video")
    .slice(0, Number.isFinite(limit) && limit > 0 ? limit : 4)
    .map((portfolioItem) => ({
      title: portfolioItem.title,
      tag: portfolioItem.tag ?? "Motion",
      date: "2026",
      href: "/portfolio",
      mediaUrl: portfolioItem.mediaUrl
    }));
  const fallbackItems = asArray(content.fallbackItems);
  const items = cmsVideos.length ? cmsVideos : fallbackItems;
  if (!items.length) return null;
  const titleParts = String(item.title ?? "recent work").split(/\s+/).filter(Boolean);
  const first = titleParts.slice(0, -1).join(" ") || titleParts[0] || "recent";
  const last = titleParts.length > 1 ? titleParts[titleParts.length - 1] : "work";

  return String.raw`
        <section class="work-area">
          <div class="container rr-container-1650">
            <div class="work-area-inner section-spacing-top">
              <div class="work-header-meta fade-anim">
                <span>(${escapeHtml(content.eyebrow ?? "Portfolio videos")})</span>
                <span>(All - ${items.length})</span>
                <span><a class="rr-btn-underline" href="${escapeHtml(stringValue(cta.href, "/portfolio"))}">${escapeHtml(
                  stringValue(cta.label, "Browse all work")
                )}</a></span>
              </div>
              <div class="section-header">
                <div class="section-title-wrapper">
                  <div class="title-wrapper">
                    <h2 class="section-title work-title"><span class="first">${escapeHtml(first)}</span> <span class="last">${escapeHtml(
                      last
                    )}</span></h2>
                  </div>
                </div>
              </div>
              <div class="works-wrapper-box section-spacing-top">
                <div class="works-wrapper">
                  ${items
                    .map((work) => {
                      const record = asRecord(work);
                      const href = stringValue(record.href, "/portfolio");
                      return `<div class="work-box fade-anim">
                    <div class="thumb"><div class="image scale" data-cursor-text="View Details" data-cursor-class="-big"><a href="${escapeHtml(
                      href
                    )}"><video class="home-work-video" autoplay muted loop playsinline preload="metadata"><source src="${escapeHtml(
                      assetUrl(stringValue(record.mediaUrl))
                    )}" type="video/mp4"></video></a></div></div>
                    <div class="content"><h3 class="title"><a href="${escapeHtml(href)}">${escapeHtml(
                      stringValue(record.title, "Portfolio video")
                    )}</a></h3><div class="meta"><span class="tag">${escapeHtml(stringValue(record.tag, "Motion"))}</span><span class="date">(${escapeHtml(
                      stringValue(record.date, "2026")
                    )})</span></div></div>
                  </div>`;
                    })
                    .join("")}
                </div>
              </div>
            </div>
          </div>
        </section>`;
}

function renderHomePricing(item?: Section | null) {
  if (!item) return null;
  const content = sectionContent(item);
  const items = asArray(content.items);
  if (!items.length) return null;

  return String.raw`
        <section class="pricing-area rr-bg-primary">
          <div class="container rr-container-1650">
            <div class="pricing-area-inner section-spacing-top">
              <div class="pricing-header fade-anim">
                <span class="section-subtitle">${escapeHtml(content.eyebrow ?? "Pricing")}</span>
                <div class="pricing-title-wrap">
                  <h2 class="pricing-title rr_title_anim">${escapeHtml(item.title ?? "Development pricing")}</h2>
                  <p>${escapeHtml(item.subtitle ?? "")}</p>
                </div>
              </div>
              <div class="pricing-grid fade-anim">
                ${items
                  .map((priceItem) => {
                    const record = asRecord(priceItem);
                    const features = asArray(record.features);
                    return `<div class="pricing-card ${record.featured ? "featured" : ""}">
                  <span class="pricing-label">${escapeHtml(record.label ?? "")}</span>
                  <h3>${escapeHtml(record.title ?? "Package")}</h3>
                  <p class="pricing-copy">${escapeHtml(record.description ?? "")}</p>
                  <div class="pricing-price"><strong>${escapeHtml(record.price ?? "")}</strong><span>${escapeHtml(
                    record.suffix ?? "starting"
                  )}</span></div>
                  <span class="pricing-time">${escapeHtml(record.timeline ?? "")}</span>
                  <ul class="pricing-features">
                    ${features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join("")}
                  </ul>
                  <a href="${escapeHtml(stringValue(record.href, "/contact"))}" class="pricing-btn">${escapeHtml(
                    stringValue(record.ctaLabel, "Request Package")
                  )}</a>
                </div>`;
                  })
                  .join("")}
              </div>
            </div>
          </div>
        </section>`;
}

function serviceTitleHtml(value: string) {
  const parts = value.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return escapeHtml(value);
  return `${escapeHtml(parts[0])} <br> ${escapeHtml(parts.slice(1).join(" "))}`;
}

function renderHomeServices(item: Section | null | undefined, services: Service[]) {
  if (!item || !services.length) return null;
  const content = sectionContent(item);
  const mockupCta = asRecord(content.mockupCta);

  return String.raw`
        <section class="service-area rr-ov-hidden">
          <div class="container rr-container-1650">
            <div class="service-area-inner section-spacing-top">
              <div class="section-header">
                <div class="section-title-wrapper">
                  <div class="title-wrapper">
                    <h2 class="section-title font-bdogrotesk-regular rr_title_anim">${escapeHtml(item.title ?? "Development services")}</h2>
                  </div>
                </div>
              </div>
              <div class="services-wrapper-box section-spacing-top">
                <div class="phone-mockup">
                  <div class="mockup-header">
                    <div class="mockup-logo">
                      <img class="show-light" src="${A}/imgs/logo/opplexify-logo-dark.svg" alt="Opplexify logo" decoding="async">
                      <img class="show-dark" src="${A}/imgs/logo/opplexify-logo-light.svg" alt="Opplexify logo" decoding="async">
                    </div>
                    <div class="mockup-offcanvas">
                      <svg width="30" height="13" viewBox="0 0 30 13" xmlns="http://www.w3.org/2000/svg">
                        <path d="M30 6L30 7L-4.37114e-08 7L0 6L30 6Z" />
                        <path d="M30 1.31134e-07L30 1L13 0.999999L13 -7.43094e-07L30 1.31134e-07Z" />
                        <path d="M30 12L30 13L13 13L13 12L30 12Z" />
                      </svg>
                    </div>
                  </div>
                  <ul class="mockup-text">
                    <li>${escapeHtml(content.mockupLabel ?? "Development")}</li>
                    <li><a href="${escapeHtml(stringValue(mockupCta.href, "/services"))}"><span class="underline">${escapeHtml(
                      stringValue(mockupCta.label, "Explore")
                    )}</span></a></li>
                  </ul>
                </div>
                <div class="services-wrapper-1 services-box-anim">
                  ${services
                    .slice(0, 5)
                    .map((service, index) => {
                      const icon = assetUrl(service.icon);
                      const darkIcon = darkServiceIcon(icon);
                      return `<a href="/services/${escapeHtml(service.slug)}" class="service-box-1 item-${index + 1}"><div class="thumb"><img class="show-light" src="${escapeHtml(
                        icon
                      )}" alt="${escapeHtml(service.title)} icon" loading="lazy" decoding="async"><img class="show-dark" src="${escapeHtml(darkIcon)}" alt="${escapeHtml(
                        service.title
                      )} icon" loading="lazy" decoding="async"></div><div class="content"><h3 class="title">${serviceTitleHtml(service.title)}</h3></div></a>`;
                    })
                    .join("")}
                </div>
                <div class="add">
                  <div class="add-shape-wrapper">
                    <svg class="add-shape" width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="25" cy="25" r="25" />
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M26.5 16.5H23.5V23.5L16.5 23.5V26.5H23.5V33.5H26.5V26.5H33.5V23.5H26.5V16.5ZM26.5 23.5V26.5H23.5V23.5H26.5Z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>`;
}

function renderHomeTeam(item: Section | null | undefined, team: TeamMember[]) {
  if (!item || !team.length) return null;
  const content = sectionContent(item);
  const limit = Number(content.limit ?? 3);
  const members = team.slice(0, Number.isFinite(limit) && limit > 0 ? limit : 3);

  return String.raw`
        <section class="team-area-1 rr-bg-primary opplexify-home-team">
          <div class="container rr-container-1650">
            <div class="team-area-1-inner section-spacing-top">
              <div class="section-header">
                <div class="section-title-wrapper">
                  <div class="title-wrapper">
                    <h2 class="section-title font-bdogrotesk-regular rr_title_anim">${escapeHtml(item.title ?? "A focused team")}</h2>
                  </div>
                </div>
              </div>
              <div class="team-wrapper-box">
                <div class="team-wrapper fade-anim">
                  ${members
                    .map(
                      (member) =>
                        `<div class="team-box-1 fade-anim"><div class="thumb"><a href="/team/${escapeHtml(
                          member.slug
                        )}"><img src="${escapeHtml(assetUrl(member.image))}" alt="${escapeHtml(member.name)}" loading="lazy" decoding="async" sizes="(max-width: 760px) 100vw, 33vw"></a></div><div class="content"><h3 class="name"><a href="/team/${escapeHtml(
                          member.slug
                        )}">${escapeHtml(member.name)}</a></h3><span class="post">${escapeHtml(member.role)}</span></div></div>`
                    )
                    .join("")}
                </div>
              </div>
            </div>
          </div>
        </section>`;
}

function renderHomeMarquee(item?: Section | null) {
  if (!item) return null;
  return String.raw`
        <section class="marquee-text-area rr-bg-primary marquee-text-area--padding section-spacing-bottom">
          <div class="moving-text section">
            <div class="wrapper-text">
              <h2 class="section-title">${escapeHtml(item.title ?? "")}</h2>
            </div>
          </div>
        </section>`;
}

function renderHomeLogoStrip(item?: Section | null) {
  if (!item) return null;
  const logos = asArray(sectionContent(item).logos);
  if (!logos.length) return null;

  return String.raw`
        <div class="client-area rr-bg-primary">
          <div class="container rr-container-1650">
            <div class="client-area-inner">
              <div class="section-header">
                <div class="section-title-wrapper">
                  <div class="title-wrapper">
                    <h2 class="section-title rr_title_anim">${escapeHtml(item.title ?? "")}</h2>
                  </div>
                </div>
              </div>
              <div class="clients-wrapper-box fade-anim">
                <div class="clients-wrapper">
                  <div class="swiper client-slider-active">
                    <div class="swiper-wrapper">
                      ${logos
                        .map((logo) => {
                          const record = asRecord(logo);
                          const lightImage = assetUrl(stringValue(record.lightImage, stringValue(record.image)));
                          const darkImage = assetUrl(stringValue(record.image, stringValue(record.lightImage)));
                          return `<div class="swiper-slide"><img class="show-light" src="${escapeHtml(
                            lightImage
                          )}" alt="${escapeHtml(record.alt ?? "Client logo")}" loading="lazy" decoding="async"><img class="show-dark" src="${escapeHtml(
                            darkImage
                          )}" alt="${escapeHtml(record.alt ?? "Client logo")}" loading="lazy" decoding="async"></div>`;
                        })
                        .join("")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>`;
}

function renderHomeCapabilities(item?: Section | null) {
  if (!item) return null;
  const items = asArray(sectionContent(item).items);
  if (!items.length) return null;

  return String.raw`
        <section class="award-area rr-bg-primary">
          <div class="container rr-container-1650">
            <div class="award-area-inner section-spacing">
              <div class="section-header">
                <div class="section-title-wrapper">
                  <div class="title-wrapper fade-anim" data-direction="left">
                    <h2 class="section-title font-bdogrotesk-regular rr_title_anim">${escapeHtml(item.title ?? "")}</h2>
                  </div>
                </div>
              </div>
              <div class="award-wrapper-box">
                <div class="award-wrapper fade-anim" data-direction="right">
                  ${items
                    .map((capability) => {
                      const record = asRecord(capability);
                      return `<div class="award-box"><span class="category">${escapeHtml(record.category ?? "")}</span><p class="award">${escapeHtml(
                        record.text ?? ""
                      )}</p><span class="year">${escapeHtml(record.year ?? "")}</span></div>`;
                    })
                    .join("")}
                </div>
              </div>
            </div>
          </div>
        </section>`;
}

export function applyHomeCms(
  html: string,
  page: Page | null,
  site: SitePayload,
  portfolioItems: PortfolioItem[],
  services: Service[],
  team: TeamMember[]
) {
  const hero = getSection(page, "hero");
  const content = asRecord(hero?.content);
  const title = typeof content.headline === "string" ? content.headline : hero?.title ?? "Websites,\nSaaS apps and\ndashboards";
  const subtitle =
    hero?.subtitle ??
    "Opplexify is a full-stack web development agency building SEO-friendly websites, Next.js web apps, SaaS platforms, mobile apps, admin dashboards, and backend systems.";
  const primary = asRecord(content.primaryCta);
  const siteSettings = site.settings.site ?? {};

  const metaItems = asArray(content.metaItems);

  let rendered = normalizeTemplateHtml(html, site)
    .replace(/<h1 class="section-title rr_title_anim">[\s\S]*?<\/h1>/, `<h1 class="section-title rr_title_anim">${headlineHtml(title)}</h1>`)
    .replace(/<p class="text">Opplexify is a full-stack web development agency[\s\S]*?<\/p>/, `<p class="text">${escapeHtml(subtitle)}</p>`)
    .replace(/<span class="text">Remote web development team<\/span>/g, `<span class="text">${escapeHtml(siteSettings.address ?? "Remote web development team")}</span>`)
    .replace(/<a href="mailto:hello@opplexify\.com">hello@opplexify\.com<\/a>/g, `<a href="mailto:${escapeHtml(siteSettings.email ?? "hello@opplexify.com")}">${escapeHtml(siteSettings.email ?? "hello@opplexify.com")}</a>`)
    .replace(/<a href="tel:\(505\)555-0125">\(505\) 555-0125<\/a>/g, `<a href="tel:${escapeHtml(siteSettings.phone ?? "(505) 555-0125")}">${escapeHtml(siteSettings.phone ?? "(505) 555-0125")}</a>`)
    .replace(/<a class="rr-btn-underline" href="\/portfolio">Browse all work<\/a>/g, `<a class="rr-btn-underline" href="${escapeHtml(stringValue(primary.href, "/portfolio"))}">${escapeHtml(stringValue(primary.label, "Browse all work"))}</a>`);

  if (metaItems.length >= 2) {
    rendered = rendered.replace(
      /<div class="meta-list">\s*<ul>[\s\S]*?<\/ul>\s*<\/div>/,
      `<div class="meta-list">
                  <ul>
                    ${metaItems.map((item) => `<li>${lineBreakHtml(item)}</li>`).join("")}
                  </ul>
                </div>`
    );
  }

  rendered = replaceWhen(rendered, /<section class="about-area-2">[\s\S]*?<\/section>/, renderHomeAbout(section(page, "about-preview")));
  rendered = replaceWhen(rendered, /<section class="work-area">[\s\S]*?<\/section>/, renderHomeWork(section(page, "work-showcase"), portfolioItems));
  rendered = replaceWhen(rendered, /<section class="pricing-area rr-bg-primary">[\s\S]*?<\/section>/, renderHomePricing(section(page, "pricing")));
  rendered = replaceWhen(rendered, /<section class="service-area rr-ov-hidden">[\s\S]*?<\/section>/, renderHomeServices(section(page, "service-showcase"), services));
  rendered = replaceWhen(rendered, /<section class="team-area-1 rr-bg-primary opplexify-home-team">[\s\S]*?<\/section>/, renderHomeTeam(section(page, "team-showcase"), team));
  rendered = replaceWhen(rendered, /<section class="marquee-text-area rr-bg-primary marquee-text-area--padding section-spacing-bottom">[\s\S]*?<\/section>/, renderHomeMarquee(section(page, "marquee")));
  rendered = replaceWhen(rendered, /<div class="client-area rr-bg-primary">[\s\S]*?(?=\s*<section class="award-area rr-bg-primary">)/, renderHomeLogoStrip(section(page, "logo-strip")));
  rendered = replaceWhen(rendered, /<section class="award-area rr-bg-primary">[\s\S]*?<\/section>/, renderHomeCapabilities(section(page, "capability-list")));

  return rendered;
}

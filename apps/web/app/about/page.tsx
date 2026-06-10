import type { Metadata } from "next";
import { StaticTemplatePage } from "../../components/site/StaticTemplatePage";
import { aboutHtml } from "../../components/site/templateHtml";
import { assetUrl, fetchApi, getSection, pageMetadata, type Page, type Section, type TeamMember } from "../../lib/api";
import { absoluteUrl, siteUrl } from "../../lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchApi<Page | null>("/public/pages/about", null);
  return pageMetadata(page, "About Opplexify - Full-Stack Web Development Agency", "/about");
}

const capabilityCategories = ["Websites", "Web Apps", "SaaS", "Mobile Apps", "Dashboards"];
let capabilityCategoryIndex = 0;

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

function removeTeamBoxContaining(html: string, marker: string) {
  const markerIndex = html.indexOf(marker);
  if (markerIndex === -1) return html;

  const boxStart = html.lastIndexOf('<div class="team-box-1 fade-anim">', markerIndex);
  const boxEnd = boxStart === -1 ? -1 : findDivEnd(html, boxStart);

  if (boxStart === -1 || boxEnd === -1) return html;
  return html.slice(0, boxStart) + html.slice(boxEnd);
}

function keepFirstThreeAboutTeamMembers(html: string) {
  return ["team-s-4.webp", "team-s-5.webp", "team-s-6.webp", "Explore all team"].reduce(removeTeamBoxContaining, html);
}

const aboutPageHtml = keepFirstThreeAboutTeamMembers(
  aboutHtml
  .replace(
    /<p class="text">— We help <br>[\s\S]*?<\/p>/,
    `<p class="text">— We help <br>
                                                founders and businesses <br>
                                                launch SEO-friendly <br>
                                                digital products</p>`
  )
  .replace(/\(2017 - 2025\)/g, "(Websites - SaaS - Apps)")
  .replace(
    /<h2 class="section-title-2 rr_title_anim">[\s\S]*?<\/h2>/,
    `<h1 class="section-title-2 rr_title_anim">We build
                                            websites, SaaS platforms,
                                            mobile apps and <span>dashboards</span> </h1>`
  )
  .replace(
    /<p class="designation text-gray mb-40 fade-anim">[\s\S]*?<\/p>/,
    `<p class="designation text-gray mb-40 fade-anim">
                                    Opplexify is a full-stack web development agency for companies that need more than a static website.
                                    We build SEO-friendly business websites, Next.js web applications, SaaS platforms, mobile apps,
                                    admin dashboards, and backend APIs that are planned around real operational goals.
                                </p>`
  )
  .replace(
    /<p class="designation text-gray fade-anim">[\s\S]*?<\/p>/,
    `<p class="designation text-gray fade-anim">Our process connects product strategy, UI/UX design,
                                    frontend development, NestJS backend architecture, database planning, admin workflows, and launch support.
                                    The result is a maintainable digital product that can rank, convert, and scale after launch.</p>`
  )
  .replace(/<p>years of experience<\/p>/g, "<p>years building web products</p>")
  .replace(/<p>crafted digital products<\/p>/g, "<p>websites, apps and dashboards</p>")
  .replace(/<p>skilled team players<\/p>/g, "<p>full-stack delivery skills</p>")
  .replace(/<span class="section-subtitle">Why choose us<\/span>/g, `<span class="section-subtitle">Why choose Opplexify</span>`)
  .replace(/src="\/template-assets\/dark\/assets\/imgs\/team\/team-s-1.webp"/g, `src="/team/ameeq-khan.webp"`)
  .replace(/src="\/template-assets\/dark\/assets\/imgs\/team\/team-s-2.webp"/g, `src="/team/atiq-khan.webp"`)
  .replace(/src="\/template-assets\/dark\/assets\/imgs\/team\/team-s-3.webp"/g, `src="/team/emmad-khan.webp"`)
  .replace(
    /<h2 class="section-title rr_title_anim">Mee the <span>squad<\/span> <br>[\s\S]*?<\/h2>/,
    `<h2 class="section-title rr_title_anim">A development team for <span>websites</span>, <br>
                                        SaaS products, mobile apps and dashboards
                                    </h2>`
  )
  .replace(/CEO & Founder/g, "Full-Stack Product Lead")
  .replace(/Lead Designer/g, "SEO Planning and Launch Support")
  .replace(/Lead Developer/g, "UI/UX and Frontend Design")
  .replace(/Head of Marketing/g, "SEO Planning and Launch Support")
  .replace(/WP Developer/g, "Backend Development")
  .replace(/Brand Designer/g, "Launch Support")
  .replace(/Cristian Vargas/g, "Ameeq Khan")
  .replace(/Joey Dello Russo/g, "Atiq Khan")
  .replace(/Michelle Gasparov/g, "Emmad Khan")
  .replace(/Courtney Gayer/g, "Atiq Khan")
  .replace(/Bruno Larry Vargas/g, "Ameeq Khan")
  .replace(/Sara Lenartowicz/g, "Emmad Khan")
  .replace(/Awards/g, "Capabilities")
  .replace(
    /<span class="category">[^<]+<\/span>/g,
    () => `<span class="category">${capabilityCategories[capabilityCategoryIndex++] ?? "Launch Support"}</span>`
  )
  .replace(/We make brand big and bolder/g, "We build websites, SaaS products, mobile apps and dashboards")
  .replace(/3x creative <br> agency of the day/g, "SEO-friendly <br> website development")
  .replace(/1x agency of <br> the year/g, "Full-stack <br> web applications")
  .replace(/5x honorable <br> mentioned/g, "SaaS platform <br> development")
  .replace(/2x Featured <br> design of the week/g, "Mobile app <br> development")
  .replace(/8x Best design <br> of the day/g, "Admin dashboard <br> development")
  .replace(/Help to brands growing up and show their\s*success stories to the world/g, "Helping businesses launch SEO-friendly websites, SaaS products, mobile apps and backend systems")
  .replace(/We <span>learn<\/span> and[\s\S]*?together\./, "We <span>plan</span> and <span>build</span> <br> <span>launch-ready</span> digital products")
);

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About Opplexify",
  url: absoluteUrl("/about"),
  description:
    "Opplexify is a full-stack web development agency for SEO-friendly websites, Next.js web apps, SaaS platforms, mobile apps, admin dashboards, and backend APIs.",
  isPartOf: { "@type": "WebSite", name: "Opplexify", url: siteUrl() },
  about: {
    "@type": "Organization",
    name: "Opplexify",
    url: siteUrl()
  }
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function replaceDivBlock(html: string, marker: string, replacement: string) {
  const start = html.indexOf(marker);
  const end = start === -1 ? -1 : findDivEnd(html, start);
  if (start === -1 || end === -1) return html;
  return html.slice(0, start) + replacement + html.slice(end);
}

function renderStats(section?: Section) {
  const items = asArray(section?.content?.items);
  if (!items.length) return null;

  return `<div class="choose-us__warpper choose-us--about fade-anim">
    ${items
      .slice(0, 4)
      .map((item, index) => {
        const record = asRecord(item);
        return `<div class="choose-us__item item-${index + 1}">
          <p>${escapeHtml(record.label ?? "Metric")}</p>
          <h2>${escapeHtml(record.value ?? "0")}</h2>
        </div>`;
      })
      .join("")}
  </div>`;
}

function renderTeam(section: Section | undefined, team: TeamMember[]) {
  const limit = Number(section?.content?.limit ?? 3);
  const members = team.slice(0, Number.isFinite(limit) && limit > 0 ? limit : 3);
  if (!members.length) return null;

  return `<div class="team-wrapper fade-anim">
    ${members
      .map(
        (member) => `<div class="team-box-1 fade-anim">
          <div class="thumb"><a href="/team/${escapeHtml(member.slug)}"><img src="${escapeHtml(assetUrl(member.image))}" alt="${escapeHtml(member.name)}"></a></div>
          <div class="content"><h3 class="name"><a href="/team/${escapeHtml(member.slug)}">${escapeHtml(member.name)}</a></h3><span class="post">${escapeHtml(member.role)}</span></div>
        </div>`
      )
      .join("")}
  </div>`;
}

function renderCapabilities(section?: Section) {
  const items = asArray(section?.content?.items);
  if (!items.length) return null;

  return `<div class="award-wrapper fade-anim">
    ${items
      .map((item, index) => {
        const record = asRecord(item);
        return `<div class="award-box">
          <span class="category">${escapeHtml(record.category ?? "Capability")}</span>
          <p class="award">${escapeHtml(record.text ?? record.title ?? "")}</p>
          <span class="year">${escapeHtml(record.year ?? String(index + 1).padStart(2, "0"))}</span>
        </div>`;
      })
      .join("")}
  </div>`;
}

function applyAboutCms(html: string, page: Page | null, team: TeamMember[]) {
  const intro = getSection(page, "intro");
  const stats = getSection(page, "stats");
  const teamSection = getSection(page, "team-showcase");
  const marquee = getSection(page, "marquee");
  const capabilities = getSection(page, "capability-list");
  const title = intro?.title ?? page?.title;
  const subtitle = intro?.subtitle ?? page?.summary;
  const body = typeof intro?.content?.body === "string" ? intro.content.body : undefined;
  const image = typeof intro?.content?.image === "string" ? assetUrl(intro.content.image) : undefined;

  let rendered = html
    .replace(/<h1 class="section-title-2 rr_title_anim">[\s\S]*?<\/h1>/, title ? `<h1 class="section-title-2 rr_title_anim">${escapeHtml(title)}</h1>` : "$&")
    .replace(/<p class="designation text-gray mb-40 fade-anim">[\s\S]*?<\/p>/, subtitle ? `<p class="designation text-gray mb-40 fade-anim">${escapeHtml(subtitle)}</p>` : "$&")
    .replace(/<p class="designation text-gray fade-anim">[\s\S]*?<\/p>/, body ? `<p class="designation text-gray fade-anim">${escapeHtml(body)}</p>` : "$&");

  if (image) {
    rendered = rendered.replace(
      /<div class="about-us__media parallax-view">\s*<img data-speed="0\.6" src="[^"]*" alt="">\s*<\/div>/,
      `<div class="about-us__media parallax-view"><img data-speed="0.6" src="${escapeHtml(image)}" alt="${escapeHtml(title ?? "Opplexify")}"></div>`
    );
  }

  const statsHtml = renderStats(stats);
  if (statsHtml) rendered = replaceDivBlock(rendered, '<div class="choose-us__warpper choose-us--about fade-anim">', statsHtml);

  if (teamSection?.title) {
    rendered = rendered.replace(
      /<h2 class="section-title rr_title_anim">A development team for[\s\S]*?<\/h2>/,
      `<h2 class="section-title rr_title_anim">${escapeHtml(teamSection.title)}</h2>`
    );
  }
  const teamHtml = renderTeam(teamSection, team);
  if (teamHtml) rendered = replaceDivBlock(rendered, '<div class="team-wrapper fade-anim">', teamHtml);

  if (marquee?.title) {
    rendered = rendered.replace(/We build websites, SaaS products, mobile apps and dashboards/g, escapeHtml(marquee.title));
  }

  if (capabilities?.title) {
    rendered = rendered.replace(
      /<h2 class="section-title rr_title_anim">We <span>plan<\/span>[\s\S]*?<\/h2>/,
      `<h2 class="section-title rr_title_anim">${escapeHtml(capabilities.title)}</h2>`
    );
  }
  const capabilityHtml = renderCapabilities(capabilities);
  if (capabilityHtml) rendered = replaceDivBlock(rendered, '<div class="award-wrapper fade-anim">', capabilityHtml);

  return rendered;
}

export default async function AboutPage() {
  const [page, team] = await Promise.all([
    fetchApi<Page | null>("/public/pages/about", null),
    fetchApi<TeamMember[]>("/public/team", [])
  ]);
  const jsonLd = { ...aboutJsonLd, name: page?.title ?? aboutJsonLd.name, description: page?.seoDescription ?? page?.summary ?? aboutJsonLd.description };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <StaticTemplatePage html={applyAboutCms(aboutPageHtml, page, team)} bodyClassName="body-about-us" />
    </>
  );
}

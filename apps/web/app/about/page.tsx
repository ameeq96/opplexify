import type { Metadata } from "next";
import { StaticTemplatePage } from "../../components/site/StaticTemplatePage";
import { aboutHtml } from "../../components/site/templateHtml";
import { assetUrl, fetchApi, getSection, pageMetadata, type Page, type Section, type TeamMember } from "../../lib/api";
import { BUSINESS_MAILING_ADDRESS, COMPANY_DESCRIPTION, LEGAL_NAME, LINKEDIN_URL, absoluteUrl, siteUrl } from "../../lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchApi<Page | null>("/public/pages/about", null);
  return pageMetadata(page, "About Opplexify LLC - Custom Software Development Company", "/about");
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

function keepFounderAboutTeamMember(html: string) {
  return ["team-s-2.webp", "team-s-3.webp", "team-s-4.webp", "team-s-5.webp", "team-s-6.webp", "Explore all team"].reduce(
    removeTeamBoxContaining,
    html
  );
}

function sequenceCapabilityYears(html: string) {
  let index = 0;
  return html.replace(/<span class="year">[^<]*<\/span>/g, () => {
    index += 1;
    return `<span class="year">${String(index).padStart(2, "0")}</span>`;
  });
}

const aboutPageHtml = sequenceCapabilityYears(keepFounderAboutTeamMember(
  aboutHtml
  .replace(
    /<p class="text">— We help <br>[\s\S]*?<\/p>/,
    `<p class="text">— We help <br>
                                                businesses plan <br>
                                                and build custom <br>
                                                software</p>`
  )
  .replace(/\(2017 - 2025\)/g, "(Websites - SaaS - Apps)")
  .replace(
    /<h2 class="section-title-2 rr_title_anim">[\s\S]*?<\/h2>/,
    `<h1 class="section-title-2 rr_title_anim">Opplexify LLC builds
                                            websites, SaaS platforms,
                                            mobile apps and <span>dashboards</span> </h1>`
  )
  .replace(
    /<p class="designation text-gray mb-40 fade-anim">[\s\S]*?<\/p>/,
    `<p class="designation text-gray mb-40 fade-anim">
                                    Opplexify LLC is a Wyoming-formed software development company providing remote software development services.
                                    The company helps businesses plan, design, and build websites, SaaS platforms, dashboards,
                                    mobile apps, backend systems, APIs, and workflow automations.
                                </p>`
  )
  .replace(
    /<p class="designation text-gray fade-anim">[\s\S]*?<\/p>/,
    `<p class="designation text-gray fade-anim">Our process connects product strategy, UI/UX design,
                                    frontend development, backend architecture, database planning, admin workflows, and launch support.
                                    Projects use written scopes, milestone-based delivery, clear communication, proposals, and invoices.</p>`
  )
  .replace(/<!-- choose-us area start  -->[\s\S]*?<!-- choose-us area end  -->/g, "")
  .replace(/<span class="section-subtitle">Why choose us<\/span>/g, `<span class="section-subtitle">Why choose Opplexify LLC</span>`)
  .replace(/src="\/template-assets\/dark\/assets\/imgs\/team\/team-s-1.webp"/g, `src="/team/emmad-khan.webp"`)
  .replace(/src="\/template-assets\/dark\/assets\/imgs\/team\/team-s-2.webp"/g, `src="/team/atiq-khan.webp"`)
  .replace(/src="\/template-assets\/dark\/assets\/imgs\/team\/team-s-3.webp"/g, `src="/team/emmad-khan.webp"`)
  .replace(
    /<h2 class="section-title rr_title_anim">Mee the <span>squad<\/span> <br>[\s\S]*?<\/h2>/,
    `<h2 class="section-title rr_title_anim">Founder-led software development <br>
                                        for scoped client projects
                                    </h2>`
  )
  .replace(/CEO & Founder/g, "Founder and Owner")
  .replace(/Lead Designer/g, "SEO Planning and Launch Support")
  .replace(/Lead Developer/g, "UI/UX and Frontend Design")
  .replace(/Head of Marketing/g, "SEO Planning and Launch Support")
  .replace(/WP Developer/g, "Backend Development")
  .replace(/Brand Designer/g, "Launch Support")
  .replace(/Cristian Vargas/g, "Muhammad Emmad Khan")
  .replace(/Joey Dello Russo/g, "Muhammad Emmad Khan")
  .replace(/Michelle Gasparov/g, "Muhammad Emmad Khan")
  .replace(/Courtney Gayer/g, "Muhammad Emmad Khan")
  .replace(/Bruno Larry Vargas/g, "Muhammad Emmad Khan")
  .replace(/Sara Lenartowicz/g, "Muhammad Emmad Khan")
  .replace(/Awards/g, "Capabilities")
  .replace(
    /<span class="category">[^<]+<\/span>/g,
    () => `<span class="category">${capabilityCategories[capabilityCategoryIndex++] ?? "Launch Support"}</span>`
  )
  .replace(/We make brand big and bolder/g, "Custom websites, SaaS platforms, dashboards, mobile apps, APIs and automations")
  .replace(/3x creative <br> agency of the day/g, "SEO-friendly <br> website development")
  .replace(/1x agency of <br> the year/g, "Full-stack <br> web applications")
  .replace(/5x honorable <br> mentioned/g, "SaaS platform <br> development")
  .replace(/2x Featured <br> design of the week/g, "Mobile app <br> development")
  .replace(/8x Best design <br> of the day/g, "Admin dashboard <br> development")
  .replace(/Help to brands growing up and show their\s*success stories to the world/g, "Helping businesses plan and build custom software through written scopes and milestones")
  .replace(/We <span>learn<\/span> and[\s\S]*?together\./, "We <span>scope</span> and <span>build</span> <br> <span>custom</span> software")
));

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About Opplexify LLC",
  url: absoluteUrl("/about"),
  description: COMPANY_DESCRIPTION,
  isPartOf: { "@type": "WebSite", name: "Opplexify", url: siteUrl() },
  about: {
    "@type": "Organization",
    name: "Opplexify",
    legalName: LEGAL_NAME,
    url: siteUrl(),
    sameAs: [LINKEDIN_URL],
    address: BUSINESS_MAILING_ADDRESS
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
          <span class="year">${String(index + 1).padStart(2, "0")}</span>
        </div>`;
      })
      .join("")}
  </div>`;
}

function applyAboutCms(html: string, page: Page | null, team: TeamMember[]) {
  const intro = getSection(page, "intro");
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

  if (teamSection?.title) {
    rendered = rendered.replace(
      /<h2 class="section-title rr_title_anim">Founder-led software development[\s\S]*?<\/h2>/,
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

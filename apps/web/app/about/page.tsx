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

const capabilityCategories = ["Websites", "Web Apps", "SaaS", "SEO Planning", "UI/UX Design"];

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

function cleanAboutArtifacts(html: string) {
  return html
    .replace(/<!-- choose-us area start  -->[\s\S]*?<!-- choose-us area end  -->/g, "")
    .replace(/<span class="year">[^<]*<\/span>/g, "");
}

function keepFirstTeamCard(html: string) {
  const wrapperStart = html.indexOf('<div class="team-wrapper fade-anim">');
  const wrapperEnd = wrapperStart === -1 ? -1 : findDivEnd(html, wrapperStart);
  if (wrapperStart === -1 || wrapperEnd === -1) return html;

  const wrapper = html.slice(wrapperStart, wrapperEnd);
  const cardStart = wrapper.indexOf('<div class="team-box-1 fade-anim">');
  const cardEnd = cardStart === -1 ? -1 : findDivEnd(wrapper, cardStart);
  if (cardStart === -1 || cardEnd === -1) return html;

  return `${html.slice(0, wrapperStart)}<div class="team-wrapper fade-anim">
    ${wrapper.slice(cardStart, cardEnd)}
  </div>${html.slice(wrapperEnd)}`;
}

const aboutPageHtml = cleanAboutArtifacts(keepFounderAboutTeamMember(
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
  .replace(
    /<h2 class="section-title rr_title_anim">Mee the <span>squad<\/span> <br>[\s\S]*?<\/h2>/,
    `<h2 class="section-title rr_title_anim">Founder-led software development <br>
                                        for scoped client projects
                                    </h2>`
  )
  .replace(/CEO & Founder/g, "Founder and Owner")
  .replace(/Cristian Vargas/g, "Muhammad Emmad Khan")
  .replace(/Awards/g, "Capabilities")
  .replace(
    /<span class="category">[^<]+<\/span>/g,
    (() => {
      let index = 0;
      return () => `<span class="category">${capabilityCategories[index++] ?? "Launch Support"}</span>`;
    })()
  )
  .replace(/We make brand big and bolder/g, "Custom websites, SaaS platforms, dashboards, mobile apps, APIs and automations")
  .replace(/3x creative <br> agency of the day/g, "Custom website <br> development")
  .replace(/1x agency of <br> the year/g, "Full-stack <br> web applications")
  .replace(/5x honorable <br> mentioned/g, "SaaS platform <br> development")
  .replace(/2x Featured <br> design of the week/g, "SEO planning <br> and structure")
  .replace(/8x Best design <br> of the day/g, "UI/UX and <br> frontend design")
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

function renderTeam(_section: Section | undefined, team: TeamMember[]) {
  const founder =
    team.find((member) => /founder|owner/i.test(member.role)) ??
    team.find((member) => /emmad|muhammad/i.test(`${member.name} ${member.slug}`)) ??
    team[0];
  if (!founder) return null;
  const role = /founder|owner/i.test(founder.role) ? founder.role : "Founder and Owner";

  return `<div class="team-wrapper fade-anim">
    <div class="team-box-1 fade-anim">
      <div class="thumb"><a href="/team/${escapeHtml(founder.slug)}"><img src="${escapeHtml(assetUrl(founder.image))}" alt="${escapeHtml(founder.name)}"></a></div>
      <div class="content"><h3 class="name"><a href="/team/${escapeHtml(founder.slug)}">${escapeHtml(founder.name)}</a></h3><span class="post">${escapeHtml(role)}</span></div>
    </div>
  </div>`;
}

function renderCapabilities(section?: Section) {
  const items = asArray(section?.content?.items);
  if (!items.length) return null;

  return `<div class="award-wrapper fade-anim">
    ${items
      .map((item) => {
        const record = asRecord(item);
        return `<div class="award-box">
          <span class="category">${escapeHtml(record.category ?? "Capability")}</span>
          <p class="award">${escapeHtml(record.text ?? record.title ?? "")}</p>
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

  rendered = rendered.replace(
    /<h2 class="section-title rr_title_anim">Founder-led software development[\s\S]*?<\/h2>/,
    `<h2 class="section-title rr_title_anim">Founder-led software development</h2>`
  );
  const teamHtml = renderTeam(teamSection, team);
  if (teamHtml) rendered = replaceDivBlock(rendered, '<div class="team-wrapper fade-anim">', teamHtml);

  if (marquee?.title) {
    rendered = rendered.replace(/We build websites, SaaS products, mobile apps and dashboards/g, escapeHtml(marquee.title));
  }

  if (capabilities?.title) {
    rendered = rendered.replace(
      /<h2 class="section-title rr_title_anim">We <span>(?:plan|scope)<\/span>[\s\S]*?<\/h2>/,
      `<h2 class="section-title rr_title_anim">${escapeHtml(capabilities.title)}</h2>`
    );
  }
  const capabilityHtml = renderCapabilities(capabilities);
  if (capabilityHtml) rendered = replaceDivBlock(rendered, '<div class="award-wrapper fade-anim">', capabilityHtml);

  return cleanAboutArtifacts(keepFirstTeamCard(rendered));
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

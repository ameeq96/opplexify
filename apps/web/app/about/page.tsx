import type { Metadata } from "next";
import { StaticTemplatePage } from "../../components/site/StaticTemplatePage";
import { aboutHtml } from "../../components/site/templateHtml";
import { fetchApi, getSection, pageMetadata, type Page } from "../../lib/api";
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
  .replace(/src="\/template-assets\/dark\/assets\/imgs\/team\/team-s-1.webp"/g, `src="/team/ameeq-khan.png"`)
  .replace(/src="\/template-assets\/dark\/assets\/imgs\/team\/team-s-2.webp"/g, `src="/team/atiq-khan.png"`)
  .replace(/src="\/template-assets\/dark\/assets\/imgs\/team\/team-s-3.webp"/g, `src="/team/emmad-khan.png"`)
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

function applyAboutCms(html: string, page: Page | null) {
  const intro = getSection(page, "intro");
  const title = intro?.title ?? page?.title;
  const subtitle = intro?.subtitle ?? page?.summary;
  const body = typeof intro?.content?.body === "string" ? intro.content.body : undefined;

  return html
    .replace(/<h1 class="section-title-2 rr_title_anim">[\s\S]*?<\/h1>/, title ? `<h1 class="section-title-2 rr_title_anim">${escapeHtml(title)}</h1>` : "$&")
    .replace(/<p class="designation text-gray mb-40 fade-anim">[\s\S]*?<\/p>/, subtitle ? `<p class="designation text-gray mb-40 fade-anim">${escapeHtml(subtitle)}</p>` : "$&")
    .replace(/<p class="designation text-gray fade-anim">[\s\S]*?<\/p>/, body ? `<p class="designation text-gray fade-anim">${escapeHtml(body)}</p>` : "$&");
}

export default async function AboutPage() {
  const page = await fetchApi<Page | null>("/public/pages/about", null);
  const jsonLd = { ...aboutJsonLd, name: page?.title ?? aboutJsonLd.name, description: page?.seoDescription ?? page?.summary ?? aboutJsonLd.description };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <StaticTemplatePage html={applyAboutCms(aboutPageHtml, page)} bodyClassName="body-about-us" />
    </>
  );
}

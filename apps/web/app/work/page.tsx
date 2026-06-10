import type { Metadata } from "next";
import { PageHero, ProjectGrid } from "../../components/site/Blocks";
import { PublicShell } from "../../components/site/PublicShell";
import { fetchApi, getSection, pageMetadata, type Page, type Project } from "../../lib/api";
import { absoluteUrl, siteUrl } from "../../lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchApi<Page | null>("/public/pages/work", null);
  return pageMetadata(page, "Case Studies - Website, SaaS, Web App & Mobile App Projects", "/work");
}

export default async function WorkPage() {
  const [page, projects] = await Promise.all([
    fetchApi<Page | null>("/public/pages/work", null),
    fetchApi<Project[]>("/public/projects", [])
  ]);
  const intro = getSection(page, "intro") ?? getSection(page, "hero");
  const workJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Opplexify web development case studies",
    url: absoluteUrl("/work"),
    description:
      "Case studies for SEO-friendly websites, full-stack web applications, SaaS products, mobile apps, admin dashboards, and backend systems.",
    isPartOf: { "@type": "WebSite", name: "Opplexify", url: siteUrl() }
  };
  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(workJsonLd) }} />
      <PageHero title={intro?.title ?? page?.title ?? "Case studies for websites, SaaS products and apps"} subtitle={intro?.subtitle ?? page?.summary ?? "Explore project work across business websites, full-stack web apps, SaaS platforms, mobile apps, admin dashboards, and backend systems."} eyebrow="Case studies" />
      <section className="section">
        <div className="container rr-container-1650">
          <ProjectGrid projects={projects} />
        </div>
      </section>
    </PublicShell>
  );
}

import type { Metadata } from "next";
import { PageHero, ProjectGrid } from "../../components/site/Blocks";
import { PublicShell } from "../../components/site/PublicShell";
import { fetchApi, getSection, pageMetadata, type Page, type Project } from "../../lib/api";
import { absoluteUrl, breadcrumbList, siteUrl } from "../../lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchApi<Page | null>("/public/pages/work", null);
  return pageMetadata(page, "Private Project Work - Opplexify LLC", "/work");
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
    name: "Opplexify LLC private project work",
    url: absoluteUrl("/work"),
    description:
      "Private client work summaries for websites, SaaS platforms, mobile apps, dashboards, backend APIs, and automation projects. Details are available upon request.",
    isPartOf: { "@type": "WebSite", name: "Opplexify", url: siteUrl() }
  };
  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(workJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList([{ name: "Home", path: "/" }, { name: "Work", path: "/work" }])) }} />
      <PageHero title={intro?.title ?? page?.title ?? "Selected private client work"} subtitle={intro?.subtitle ?? page?.summary ?? "Selected private client work is available upon request. Opplexify LLC does not publish client names, results, or project details unless approved."} eyebrow="Work" />
      <section className="section">
        <div className="container rr-container-1650">
          <ProjectGrid projects={projects} />
        </div>
      </section>
    </PublicShell>
  );
}

import type { Metadata } from "next";
import { PageHero, ProjectGrid } from "../../components/site/Blocks";
import { PublicShell } from "../../components/site/PublicShell";
import { fetchApi, getSection, pageMetadata, type Page, type Project } from "../../lib/api";
import { absoluteUrl, breadcrumbList, siteUrl } from "../../lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const [page, projects] = await Promise.all([
    fetchApi<Page | null>("/public/pages/work", null),
    fetchApi<Project[]>("/public/projects", [])
  ]);
  const metadata = pageMetadata(page, "Selected Software Projects | Opplexify", "/work");

  return projects.length
    ? metadata
    : {
        ...metadata,
        robots: {
          index: false,
          follow: true,
          googleBot: { index: false, follow: true }
        }
      };
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
    name: "Selected Opplexify software projects",
    url: absoluteUrl("/work"),
    description:
      "Representative project summaries showing how Opplexify approaches websites, SaaS products, mobile apps, admin dashboards, backend APIs, and workflow automation.",
    isPartOf: { "@type": "WebSite", name: "Opplexify", url: siteUrl() }
  };
  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(workJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList([{ name: "Home", path: "/" }, { name: "Work", path: "/work" }])) }} />
      <PageHero title={intro?.title ?? page?.title ?? "Selected software projects"} subtitle={intro?.subtitle ?? page?.summary ?? "A practical look at the websites, SaaS products, apps, dashboards, and backend systems we can deliver. Identifying details are omitted where work is confidential."} eyebrow="Work" />
      <section className="section">
        <div className="container rr-container-1650">
          <ProjectGrid projects={projects} />
        </div>
      </section>
    </PublicShell>
  );
}

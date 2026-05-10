import { notFound } from "next/navigation";
import { PageHero, ProjectGrid, SectionRenderer } from "../../components/site/Blocks";
import { PublicShell } from "../../components/site/PublicShell";
import { fetchApi, pageMetadata, type Page, type Project } from "../../lib/api";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const page = await fetchApi<Page | null>(`/public/pages/${slug}`, null);
  return pageMetadata(page, "Opplexify", `/${slug}`);
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params;
  const page = await fetchApi<Page | null>(`/public/pages/${slug}`, null);
  if (!page) notFound();
  const projects = await fetchApi<Project[]>("/public/projects?featured=true", []);

  return (
    <PublicShell>
      <PageHero title={page.title} subtitle={page.summary} eyebrow={page.pageType ?? undefined} />
      <SectionRenderer sections={page.sections} />
      {page.pageType === "portfolio" || slug.includes("portfolio") ? (
        <section className="section">
          <div className="container">
            <ProjectGrid projects={projects} />
          </div>
        </section>
      ) : null}
    </PublicShell>
  );
}

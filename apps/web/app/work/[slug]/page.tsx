import { notFound } from "next/navigation";
import { PageHero } from "../../../components/site/Blocks";
import { PublicShell } from "../../../components/site/PublicShell";
import { assetUrl, fetchApi, pageMetadata, type Project } from "../../../lib/api";
import { absoluteUrl, siteUrl } from "../../../lib/seo";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const project = await fetchApi<Project | null>(`/public/projects/${slug}`, null);
  return pageMetadata(
    project
      ? {
          title: project.seoTitle ?? `${project.title} Case Study`,
          summary:
            project.seoDescription ??
            `${project.shortDescription ?? ""} Opplexify case study covering website, web app, SaaS, mobile app, dashboard, and backend development decisions.`,
          ogImage: project.ogImage ?? project.mainImage,
          canonicalUrl: project.canonicalUrl
        }
      : null,
    "Web Development Case Study",
    `/work/${slug}`
  );
}

export default async function WorkDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await fetchApi<Project | null>(`/public/projects/${slug}`, null);
  if (!project) notFound();
  const projectJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.shortDescription ?? project.description,
    image: absoluteUrl(assetUrl(project.mainImage)),
    url: absoluteUrl(`/work/${project.slug}`),
    creator: {
      "@type": "Organization",
      name: "Opplexify",
      url: siteUrl()
    },
    keywords: ["website development", "SaaS development", "web app development", "mobile app development", "admin dashboard"]
  };

  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd) }} />
      <PageHero title={project.title} subtitle={project.shortDescription} eyebrow={project.category?.name ?? "Project"} />
      <section className="section">
        <div className="container detail-layout">
          <div>
            <img src={assetUrl(project.mainImage)} alt={project.title} loading="lazy" decoding="async" sizes="(max-width: 900px) 100vw, 58vw" />
            <p className="detail-copy">{project.description}</p>
          </div>
          <aside className="meta-panel">
            <div className="meta-row">
              <span>Client</span>
              <strong>{project.client ?? "Opplexify"}</strong>
            </div>
            <div className="meta-row">
              <span>Tools</span>
              <strong>{project.tools ?? "Design"}</strong>
            </div>
            <div className="meta-row">
              <span>Duration</span>
              <strong>{project.duration ?? "Flexible"}</strong>
            </div>
            <div className="meta-row">
              <span>Location</span>
              <strong>{project.location ?? "Remote"}</strong>
            </div>
          </aside>
        </div>
      </section>
    </PublicShell>
  );
}

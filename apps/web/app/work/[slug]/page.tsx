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
            `${project.shortDescription ?? ""} Opplexify LLC private work summary for website, SaaS, mobile app, dashboard, backend API, or automation development.`,
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
  const gallery = Array.isArray(project.gallery) ? project.gallery.filter(Boolean) : [];
  const contentBlocks = Array.isArray(project.contentBlocks) ? project.contentBlocks : [];
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
            {project.videoUrl ? (
              <video className="detail-video" controls preload="metadata">
                <source src={assetUrl(project.videoUrl)} type="video/mp4" />
              </video>
            ) : null}
          </div>
          <aside className="meta-panel">
            <div className="meta-row">
              <span>Client</span>
              <strong>{project.client ?? "Private client work available upon request"}</strong>
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
            {project.date ? (
              <div className="meta-row">
                <span>Date</span>
                <strong>{new Date(project.date).getFullYear()}</strong>
              </div>
            ) : null}
          </aside>
        </div>
      </section>
      {contentBlocks.length ? (
        <section className="section">
          <div className="container content-block-grid">
            {contentBlocks.map((block, index) => (
              <article className="card content-block-card" key={`${block.title ?? "block"}-${index}`}>
                {block.image ? (
                  <div className="card-media">
                    <img src={assetUrl(block.image)} alt={block.title ?? project.title} loading="lazy" decoding="async" sizes="(max-width: 760px) 100vw, 45vw" />
                  </div>
                ) : null}
                <h2>{block.title ?? `Project section ${index + 1}`}</h2>
                {block.body ? <p>{block.body}</p> : null}
                {block.href && block.ctaLabel ? (
                  <a className="btn secondary" href={block.href}>
                    {block.ctaLabel}
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}
      {gallery.length ? (
        <section className="section">
          <div className="container detail-gallery">
            {gallery.map((image, index) => (
              <img src={assetUrl(image)} alt={`${project.title} gallery ${index + 1}`} key={`${image}-${index}`} loading="lazy" decoding="async" sizes="(max-width: 760px) 100vw, 33vw" />
            ))}
          </div>
        </section>
      ) : null}
    </PublicShell>
  );
}

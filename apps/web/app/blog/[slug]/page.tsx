import { notFound } from "next/navigation";
import { PageHero, Prose } from "../../../components/site/Blocks";
import { PublicShell } from "../../../components/site/PublicShell";
import { assetUrl, fetchApi, pageMetadata, type BlogPost } from "../../../lib/api";
import { absoluteUrl, breadcrumbList, siteUrl } from "../../../lib/seo";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await fetchApi<BlogPost | null>(`/public/blog/${slug}`, null);
  return pageMetadata(
    post
      ? {
          title: post.seoTitle ?? post.title,
          summary:
            post.seoDescription ??
            `${post.excerpt ?? ""} Opplexify insights for SEO-friendly websites, SaaS development, web apps, mobile apps, dashboards, and backend systems.`,
          ogImage: post.ogImage ?? post.featuredImage,
          canonicalUrl: post.canonicalUrl
        }
      : null,
    "Web Development Blog",
    `/blog/${slug}`
  );
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await fetchApi<BlogPost | null>(`/public/blog/${slug}`, null);
  if (!post) notFound();
  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: absoluteUrl(assetUrl(post.featuredImage)),
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    inLanguage: "en",
    author: {
      "@type": "Person",
      name: post.author?.name ?? "Opplexify LLC",
      url: siteUrl()
    },
    publisher: {
      "@type": "Organization",
      name: "Opplexify",
      url: siteUrl(),
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/template-assets/dark/assets/imgs/logo/opplexify-logo-full.png")
      }
    },
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`)
  };
  const breadcrumbJsonLd = breadcrumbList([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` }
  ]);

  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <PageHero title={post.title} subtitle={post.excerpt} eyebrow={post.category?.name ?? "Journal"} />
      <section className="section">
        <div className="container rr-container-1650 detail-layout">
          <div>
            <img src={assetUrl(post.featuredImage)} alt={post.title} loading="lazy" decoding="async" sizes="(max-width: 900px) 100vw, 58vw" />
            <Prose text={post.content} />
            <p className="detail-copy">
              Explore Opplexify&rsquo;s <a href="/services">development services</a>, review{" "}
              <a href="/pricing">project pricing</a>, browse <a href="/blog">more articles</a>, or{" "}
              <a href="/contact">request a quote</a>.
            </p>
          </div>
          <aside className="meta-panel">
            <div className="meta-row">
              <span>Author</span>
              <strong>{post.author?.name ?? "Opplexify LLC"}</strong>
            </div>
            <div className="meta-row">
              <span>Published</span>
              <strong>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "Draft"}</strong>
            </div>
          </aside>
        </div>
      </section>
    </PublicShell>
  );
}

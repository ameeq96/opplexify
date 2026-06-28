import type { Metadata } from "next";
import { BlogGrid, PageHero } from "../../components/site/Blocks";
import { PublicShell } from "../../components/site/PublicShell";
import { fetchApi, getSection, pageMetadata, type BlogPost, type Page } from "../../lib/api";
import { absoluteUrl, breadcrumbList, siteUrl } from "../../lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchApi<Page | null>("/public/pages/blog", null);
  return pageMetadata(page, "Web Development Blog - SaaS, Apps, SEO & Product Launch Tips", "/blog");
}

export default async function BlogPage() {
  const [page, posts] = await Promise.all([
    fetchApi<Page | null>("/public/pages/blog", null),
    fetchApi<BlogPost[]>("/public/blog", [])
  ]);
  const intro = getSection(page, "intro") ?? getSection(page, "hero");
  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Opplexify Web Development Blog",
    url: absoluteUrl("/blog"),
    description:
      "Articles about SEO-friendly websites, SaaS development, web applications, mobile apps, admin dashboards, backend APIs, and product launches.",
    isPartOf: { "@type": "WebSite", name: "Opplexify", url: siteUrl() }
  };
  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }])) }} />
      <PageHero title={intro?.title ?? page?.title ?? "Web development, SaaS and SEO insights"} subtitle={intro?.subtitle ?? page?.summary ?? "Practical articles about SEO-friendly websites, Next.js web apps, SaaS products, mobile apps, dashboards, backend systems, and product launch strategy."} eyebrow="Blog" />
      <section className="section">
        <div className="container rr-container-1650">
          <BlogGrid posts={posts} />
        </div>
      </section>
    </PublicShell>
  );
}

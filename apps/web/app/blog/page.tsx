import type { Metadata } from "next";
import { BlogGrid, PageHero } from "../../components/site/Blocks";
import { PublicShell } from "../../components/site/PublicShell";
import { fetchApi, getSection, pageMetadata, type BlogPost, type Page } from "../../lib/api";
import { absoluteUrl, breadcrumbList, siteUrl } from "../../lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const [page, posts] = await Promise.all([
    fetchApi<Page | null>("/public/pages/blog", null),
    fetchApi<BlogPost[]>("/public/blog", [])
  ]);
  const metadata = pageMetadata(page, "Software Development Blog | SaaS, Web Apps & SEO", "/blog");

  return posts.length
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
      "Practical articles about planning and building SEO-friendly websites, SaaS products, custom web applications, mobile apps, admin dashboards, and backend APIs.",
    isPartOf: { "@type": "WebSite", name: "Opplexify", url: siteUrl() }
  };
  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }])) }} />
      <PageHero title={intro?.title ?? page?.title ?? "Practical ideas for building better digital products"} subtitle={intro?.subtitle ?? page?.summary ?? "Useful guidance on website strategy, SaaS development, web and mobile apps, admin dashboards, backend APIs, SEO, and product launches."} eyebrow="Blog" />
      <section className="section">
        <div className="container rr-container-1650">
          <BlogGrid posts={posts} />
        </div>
      </section>
    </PublicShell>
  );
}

import type { Metadata } from "next";
import { PageHero, TeamGrid } from "../../components/site/Blocks";
import { PublicShell } from "../../components/site/PublicShell";
import { fetchApi, getSection, pageMetadata, type Page, type TeamMember } from "../../lib/api";
import { absoluteUrl, siteUrl } from "../../lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchApi<Page | null>("/public/pages/team", null);
  return pageMetadata(page, "Development Team - Next.js, SaaS, Mobile Apps & Backend APIs", "/team");
}

export default async function TeamPage() {
  const [page, team] = await Promise.all([
    fetchApi<Page | null>("/public/pages/team", null),
    fetchApi<TeamMember[]>("/public/team", [])
  ]);
  const intro = getSection(page, "intro") ?? getSection(page, "hero");
  const teamJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Opplexify development team",
    url: absoluteUrl("/team"),
    description:
      "Full-stack development team for websites, SaaS products, mobile apps, admin dashboards, backend APIs, UI/UX, SEO planning, and launches.",
    isPartOf: { "@type": "WebSite", name: "Opplexify", url: siteUrl() }
  };
  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(teamJsonLd) }} />
      <PageHero title={intro?.title ?? page?.title ?? "Full-stack development team for product launches"} subtitle={intro?.subtitle ?? page?.summary ?? "Designers, frontend developers, backend engineers, and launch-focused builders for websites, SaaS platforms, mobile apps, and dashboards."} eyebrow="Team" />
      <section className="section">
        <div className="container rr-container-1650">
          <TeamGrid team={team} />
        </div>
      </section>
    </PublicShell>
  );
}

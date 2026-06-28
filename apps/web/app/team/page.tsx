import type { Metadata } from "next";
import { PageHero, TeamGrid } from "../../components/site/Blocks";
import { PublicShell } from "../../components/site/PublicShell";
import { fetchApi, getSection, pageMetadata, type Page, type TeamMember } from "../../lib/api";
import { absoluteUrl, breadcrumbList, siteUrl } from "../../lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchApi<Page | null>("/public/pages/team", null);
  return pageMetadata(page, "Founder - Opplexify LLC", "/team");
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
    name: "Opplexify LLC founder",
    url: absoluteUrl("/team"),
    description:
      "Founder and ownership information for Opplexify LLC, a Wyoming-formed software development company.",
    isPartOf: { "@type": "WebSite", name: "Opplexify", url: siteUrl() }
  };
  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(teamJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList([{ name: "Home", path: "/" }, { name: "Team", path: "/team" }])) }} />
      <PageHero title={intro?.title ?? page?.title ?? "Founder-led software development"} subtitle={intro?.subtitle ?? page?.summary ?? "Opplexify LLC is led by Muhammad Emmad Khan and provides remote software development services for scoped client projects."} eyebrow="Team" />
      <section className="section">
        <div className="container rr-container-1650">
          <TeamGrid team={team} />
        </div>
      </section>
    </PublicShell>
  );
}

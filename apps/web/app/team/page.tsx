import type { Metadata } from "next";
import { PageHero, TeamGrid } from "../../components/site/Blocks";
import { PublicShell } from "../../components/site/PublicShell";
import { fetchApi, getSection, pageMetadata, type Page, type TeamMember } from "../../lib/api";
import { absoluteUrl, breadcrumbList, siteUrl } from "../../lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const [page, team] = await Promise.all([
    fetchApi<Page | null>("/public/pages/team", null),
    fetchApi<TeamMember[]>("/public/team", [])
  ]);
  const metadata = pageMetadata(page, "Meet the Opplexify Team | Software & Product Development", "/team");

  return team.length
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

export default async function TeamPage() {
  const [page, team] = await Promise.all([
    fetchApi<Page | null>("/public/pages/team", null),
    fetchApi<TeamMember[]>("/public/team", [])
  ]);
  const intro = getSection(page, "intro") ?? getSection(page, "hero");
  const teamJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Opplexify software development team",
    url: absoluteUrl("/team"),
    description:
      "Meet the people behind Opplexify and the product strategy, UI/UX design, full-stack development, and project coordination that shape each build.",
    isPartOf: { "@type": "WebSite", name: "Opplexify", url: siteUrl() }
  };
  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(teamJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList([{ name: "Home", path: "/" }, { name: "Team", path: "/team" }])) }} />
      <PageHero title={intro?.title ?? page?.title ?? "A focused team for thoughtful software development"} subtitle={intro?.subtitle ?? page?.summary ?? "Opplexify brings product thinking, design, engineering, and clear project coordination together to build useful digital products."} eyebrow="Team" />
      <section className="section">
        <div className="container rr-container-1650">
          <TeamGrid team={team} />
        </div>
      </section>
    </PublicShell>
  );
}

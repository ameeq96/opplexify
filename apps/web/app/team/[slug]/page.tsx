import { notFound } from "next/navigation";
import { PageHero, Prose } from "../../../components/site/Blocks";
import { PublicShell } from "../../../components/site/PublicShell";
import { assetUrl, fetchApi, pageMetadata, type TeamMember } from "../../../lib/api";
import { LEGAL_NAME, absoluteUrl, breadcrumbList, siteUrl } from "../../../lib/seo";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

const fallbackTeamMembers: Record<string, TeamMember> = {
  "muhammad-emmad-khan": {
    id: "fallback-muhammad-emmad-khan",
    name: "Muhammad Emmad Khan",
    slug: "muhammad-emmad-khan",
    role: "Founder and Owner",
    bio: "Muhammad Emmad Khan is the Founder and Owner of Opplexify.",
    image: "/team/emmad-khan.webp",
    skills: [],
    socialLinks: {},
    seoTitle: "Muhammad Emmad Khan | Founder of Opplexify",
    seoDescription: "Muhammad Emmad Khan is the Founder and Owner of Opplexify."
  },
  "ameeq-khan": {
    id: "fallback-ameeq-khan",
    name: "Ameeq Khan",
    slug: "ameeq-khan",
    role: "Full-Stack Developer",
    bio: "Ameeq Khan is a Full-Stack Developer at Opplexify.",
    image: "/team/ameeq-khan.webp",
    skills: [],
    socialLinks: {},
    seoTitle: "Ameeq Khan - Full-Stack Developer at Opplexify",
    seoDescription: "Ameeq Khan is a Full-Stack Developer at Opplexify."
  },
  "atiq-khan": {
    id: "fallback-atiq-khan",
    name: "Atiq Khan",
    slug: "atiq-khan",
    role: "Project Coordinator",
    bio: "Atiq Khan is a Project Coordinator at Opplexify.",
    image: "/team/atiq-khan.webp",
    skills: [],
    socialLinks: {},
    seoTitle: "Atiq Khan - Project Coordinator at Opplexify",
    seoDescription: "Atiq Khan is a Project Coordinator at Opplexify."
  }
};

function getTeamMember(slug: string) {
  return fetchApi<TeamMember | null>(`/public/team/${slug}`, fallbackTeamMembers[slug] ?? null);
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const member = await getTeamMember(slug);
  return pageMetadata(
    member
      ? {
          title: member.seoTitle ?? `${member.name} - ${member.role}`,
          summary:
            member.seoDescription ??
            `${member.bio ?? member.role} Meet the people behind Opplexify's custom software, web application, SaaS, mobile app, and API development work.`,
          ogImage: member.ogImage ?? member.image
        }
      : null,
    "Development Team",
    `/team/${slug}`
  );
}

export default async function TeamDetailPage({ params }: Props) {
  const { slug } = await params;
  const member = await getTeamMember(slug);
  if (!member) notFound();
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: member.name,
    jobTitle: member.role,
    description: member.bio,
    image: absoluteUrl(assetUrl(member.image)),
    worksFor: {
      "@type": "Organization",
      name: "Opplexify",
      legalName: LEGAL_NAME,
      url: siteUrl()
    },
    url: absoluteUrl(`/team/${member.slug}`)
  };
  const breadcrumbJsonLd = breadcrumbList([
    { name: "Home", path: "/" },
    { name: "Team", path: "/team" },
    { name: member.name, path: `/team/${member.slug}` }
  ]);

  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <PageHero title={member.name} subtitle={member.role} eyebrow="Team" />
      <section className="section">
        <div className="container detail-layout">
          <div>
            <div className="team-detail-portrait">
              <img src={assetUrl(member.image)} alt={member.name} loading="lazy" decoding="async" sizes="(max-width: 900px) 100vw, 58vw" />
            </div>
            <Prose text={member.bio} />
          </div>
          <aside className="meta-panel">
            {(member.skills ?? []).map((skill) => (
              <div className="meta-row" key={skill}>
                <span>Skill</span>
                <strong>{skill}</strong>
              </div>
            ))}
            {member.socialLinks
              ? Object.entries(member.socialLinks).map(([name, href]) =>
                  href ? (
                    <div className="meta-row" key={name}>
                      <span>{name}</span>
                      <strong>
                        <a href={href}>{href}</a>
                      </strong>
                    </div>
                  ) : null
                )
              : null}
          </aside>
        </div>
      </section>
    </PublicShell>
  );
}

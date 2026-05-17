import { notFound } from "next/navigation";
import { PageHero } from "../../../components/site/Blocks";
import { PublicShell } from "../../../components/site/PublicShell";
import { assetUrl, fetchApi, pageMetadata, type TeamMember } from "../../../lib/api";
import { absoluteUrl, siteUrl } from "../../../lib/seo";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const member = await fetchApi<TeamMember | null>(`/public/team/${slug}`, null);
  return pageMetadata(
    member
      ? {
          title: member.seoTitle ?? `${member.name} - ${member.role}`,
          summary:
            member.seoDescription ??
            `${member.bio ?? member.role} Opplexify team member contributing to websites, SaaS platforms, mobile apps, dashboards, backend APIs, and digital product launches.`,
          ogImage: member.ogImage ?? member.image
        }
      : null,
    "Development Team",
    `/team/${slug}`
  );
}

export default async function TeamDetailPage({ params }: Props) {
  const { slug } = await params;
  const member = await fetchApi<TeamMember | null>(`/public/team/${slug}`, null);
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
      url: siteUrl()
    },
    url: absoluteUrl(`/team/${member.slug}`)
  };

  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      <PageHero title={member.name} subtitle={member.role} eyebrow="Team" />
      <section className="section">
        <div className="container detail-layout">
          <div>
            <img src={assetUrl(member.image)} alt={member.name} loading="lazy" decoding="async" sizes="(max-width: 900px) 100vw, 58vw" />
            <p className="detail-copy">{member.bio}</p>
          </div>
          <aside className="meta-panel">
            {(member.skills ?? []).map((skill) => (
              <div className="meta-row" key={skill}>
                <span>Skill</span>
                <strong>{skill}</strong>
              </div>
            ))}
          </aside>
        </div>
      </section>
    </PublicShell>
  );
}

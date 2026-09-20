import { notFound } from "next/navigation";
import { PageHero, Prose } from "../../../components/site/Blocks";
import { PublicShell } from "../../../components/site/PublicShell";
import { assetUrl, fetchApi, pageMetadata, type TeamMember } from "../../../lib/api";
import { FOUNDER_NAME, LEGAL_NAME, SAFEPAY_MERCHANT_NAME, absoluteUrl, breadcrumbList, siteUrl } from "../../../lib/seo";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

const fallbackTeamMembers: Record<string, TeamMember> = {
  "muhammad-emmad-khan": {
    id: "fallback-muhammad-emmad-khan",
    name: FOUNDER_NAME,
    slug: "muhammad-emmad-khan",
    role: "Founder and Owner",
    bio: `${FOUNDER_NAME} is the Founder and Owner of ${LEGAL_NAME}.`,
    image: "/team/emmad-khan.webp",
    skills: [],
    socialLinks: {},
    seoTitle: `${FOUNDER_NAME} | Founder of Opplexify`,
    seoDescription: `${FOUNDER_NAME} is the Founder and Owner of ${LEGAL_NAME}.`
  },
  "ameeq-khan": {
    id: "fallback-ameeq-khan",
    name: SAFEPAY_MERCHANT_NAME,
    slug: "ameeq-khan",
    role: "Independent Freelancer",
    bio: `${SAFEPAY_MERCHANT_NAME} is a Pakistan-based independent freelancer and Safepay merchant. He is a separate contracting provider from ${LEGAL_NAME}.`,
    image: "/team/ameeq-khan.webp",
    skills: [],
    socialLinks: {},
    seoTitle: `${SAFEPAY_MERCHANT_NAME} | Independent Freelancer`,
    seoDescription: `${SAFEPAY_MERCHANT_NAME} is a Pakistan-based independent freelancer and Safepay merchant.`
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

async function getTeamMember(slug: string) {
  const member = await fetchApi<TeamMember | null>(`/public/team/${slug}`, fallbackTeamMembers[slug] ?? null);
  if (!member) return member;

  if (slug === "muhammad-emmad-khan") {
    return {
      ...member,
      name: FOUNDER_NAME,
      role: "Founder and Owner",
      bio: `${FOUNDER_NAME} is the Founder and Owner of ${LEGAL_NAME}.`,
      seoTitle: `${FOUNDER_NAME} | Founder of Opplexify`,
      seoDescription: `${FOUNDER_NAME} is the Founder and Owner of ${LEGAL_NAME}.`
    };
  }

  if (slug !== "ameeq-khan") return member;

  return {
    ...member,
    name: SAFEPAY_MERCHANT_NAME,
    role: "Independent Freelancer",
    bio: `${SAFEPAY_MERCHANT_NAME} is a Pakistan-based independent freelancer and Safepay merchant. He is a separate contracting provider from ${LEGAL_NAME}.`,
    seoTitle: `${SAFEPAY_MERCHANT_NAME} | Independent Freelancer`,
    seoDescription: `${SAFEPAY_MERCHANT_NAME} is a Pakistan-based independent freelancer and Safepay merchant.`
  };
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
  const isIndependentFreelancer = member.slug === "ameeq-khan";
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: member.name,
    jobTitle: member.role,
    description: member.bio,
    image: absoluteUrl(assetUrl(member.image)),
    ...(isIndependentFreelancer
      ? {}
      : {
          worksFor: {
            "@type": "Organization",
            name: "Opplexify",
            legalName: LEGAL_NAME,
            url: siteUrl()
          }
        }),
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

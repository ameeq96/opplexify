import type { Metadata } from "next";
import { opplexifyCompany } from "@adon/shared";
import { PageHero, SectionHead } from "../../components/site/Blocks";
import { PublicShell } from "../../components/site/PublicShell";
import { seoMetadata } from "../../lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "About Opplexify LLC - Remote Software Development Company",
  description:
    "Opplexify LLC is a Wyoming-formed software development company providing project-based websites, SaaS platforms, dashboards, mobile apps, backend systems, APIs, and automations.",
  path: "/about"
});

const trustPoints = [
  "Transparent project scope",
  "Milestone-based delivery",
  "Clear communication",
  "Written proposals and invoices",
  "Custom development based on client requirements"
];

export default async function AboutPage() {
  const aboutJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `About ${opplexifyCompany.legalName}`,
    url: `${opplexifyCompany.website}/about`,
    description:
      "Opplexify LLC is a Wyoming-formed software development company providing remote project-based software development services.",
    isPartOf: { "@type": "WebSite", name: opplexifyCompany.legalName, url: opplexifyCompany.website },
    about: {
      "@type": "Organization",
      name: opplexifyCompany.legalName,
      url: opplexifyCompany.website
    }
  };

  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }} />
      <PageHero
        eyebrow="About"
        title="A Small, Project-Based Software Development Company"
        subtitle={`${opplexifyCompany.legalName} is a ${opplexifyCompany.legalDescription} providing remote software development services for websites, SaaS platforms, dashboards, mobile apps, backend systems, APIs, and automations.`}
      />

      <section className="section">
        <div className="container rich-block">
          <SectionHead title="Company Overview" />
          <p>
            Opplexify LLC works with businesses that need custom software planned and built around specific project
            requirements. The company provides project-based development services, including business websites, SaaS
            foundations, admin dashboards, backend APIs, mobile app workflows, and integrations.
          </p>
          <p>
            The company started on {opplexifyCompany.startedOn}. Muhammad Emmad Khan is the founder and owner. Public
            pages do not list staff, client counts, testimonials, or results that have not been provided and verified.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container rr-container-1650">
          <SectionHead title="How Projects Are Handled" />
          <div className="grid">
            {trustPoints.map((point) => (
              <article className="card" key={point}>
                <p className="eyebrow">Trust Point</p>
                <h3>{point}</h3>
                <p>Used to keep project expectations clear before development begins and during milestone reviews.</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container rr-container-1650">
          <SectionHead title="Business Identity" subtitle={opplexifyCompany.complianceNote} />
          <div className="grid">
            <article className="card">
              <p className="eyebrow">Legal name</p>
              <h3>{opplexifyCompany.legalName}</h3>
              <p>{opplexifyCompany.legalDescription}</p>
            </article>
            <article className="card">
              <p className="eyebrow">{opplexifyCompany.mailingAddressLabel}</p>
              <h3>{opplexifyCompany.mailingAddress}</h3>
              <p>The Cheyenne address is shown only as a business mailing address.</p>
            </article>
            <article className="card">
              <p className="eyebrow">Business contact</p>
              <h3>
                <a href={`mailto:${opplexifyCompany.email}`}>{opplexifyCompany.email}</a>
              </h3>
              <p>
                <a href={`tel:${opplexifyCompany.phoneHref}`}>{opplexifyCompany.phone}</a>
              </p>
            </article>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

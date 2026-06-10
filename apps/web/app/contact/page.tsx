import type { Metadata } from "next";
import { opplexifyCompany } from "@adon/shared";
import { ContactForm } from "../../components/site/ContactForm";
import { PageHero, SectionHead } from "../../components/site/Blocks";
import { PublicShell } from "../../components/site/PublicShell";
import { seoMetadata } from "../../lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Contact Opplexify LLC - Request a Software Development Quote",
  description:
    "Contact Opplexify LLC for website, SaaS, dashboard, mobile app, backend/API, and automation development projects.",
  path: "/contact"
});

export default async function ContactPage() {
  const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `Contact ${opplexifyCompany.legalName}`,
    url: `${opplexifyCompany.website}/contact`,
    description: "Contact Opplexify LLC for software development project inquiries and business verification.",
    isPartOf: { "@type": "WebSite", name: opplexifyCompany.legalName, url: opplexifyCompany.website },
    mainEntity: {
      "@type": "Organization",
      name: opplexifyCompany.legalName,
      url: opplexifyCompany.website,
      email: opplexifyCompany.email,
      telephone: opplexifyCompany.phone,
      sameAs: [opplexifyCompany.linkedin]
    }
  };

  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }} />
      <PageHero
        eyebrow="Contact"
        title="Request a Quote or Business Verification Contact"
        subtitle="Share your project requirements, timeline, and the type of software you need built."
      />

      <section className="section">
        <div className="container detail-layout">
          <div>
            <SectionHead title="Project Contact Form" />
            <ContactForm />
          </div>
          <aside className="meta-panel">
            <div className="meta-row">
              <span>Business email</span>
              <strong>
                <a href={`mailto:${opplexifyCompany.email}`}>{opplexifyCompany.email}</a>
              </strong>
            </div>
            <div className="meta-row">
              <span>Business phone</span>
              <strong>
                <a href={`tel:${opplexifyCompany.phoneHref}`}>{opplexifyCompany.phone}</a>
              </strong>
            </div>
            <div className="meta-row">
              <span>{opplexifyCompany.mailingAddressLabel}</span>
              <strong>{opplexifyCompany.mailingAddress}</strong>
            </div>
            <div className="meta-row">
              <span>Business hours</span>
              <strong>{opplexifyCompany.businessHours}</strong>
            </div>
            <div className="meta-row">
              <span>LinkedIn</span>
              <strong>
                <a href={opplexifyCompany.linkedin}>{opplexifyCompany.linkedin}</a>
              </strong>
            </div>
            <div className="meta-row">
              <span>Compliance</span>
              <strong>{opplexifyCompany.complianceNote}</strong>
            </div>
          </aside>
        </div>
      </section>
    </PublicShell>
  );
}

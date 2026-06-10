import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { opplexifyCompany, opplexifyFaqs, opplexifyServices } from "@adon/shared";
import { PageHero, SectionHead } from "../components/site/Blocks";
import { PublicShell } from "../components/site/PublicShell";
import { seoMetadata } from "../lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Custom Websites, SaaS Platforms & Business Software Development | Opplexify LLC",
  description: opplexifyCompany.description,
  path: "/"
});

const trustPoints = [
  "Transparent project scope",
  "Milestone-based delivery",
  "Clear communication",
  "Written proposals and invoices",
  "Custom development based on client requirements"
];

export default async function HomePage() {
  return (
    <PublicShell>
      <PageHero
        eyebrow="Software development services"
        title="Custom Websites, SaaS Platforms & Business Software Development"
        subtitle={opplexifyCompany.description}
      />

      <section className="section">
        <div className="container rr-container-1650">
          <div className="inline-actions">
            <Link className="btn accent" href="/contact">
              Request a Quote <ArrowRight size={18} />
            </Link>
            <Link className="btn secondary" href="/contact">
              Book a Consultation
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container rr-container-1650">
          <SectionHead
            title="What Opplexify LLC Builds"
            subtitle="Project-based development for businesses that need practical software, clear handover, and reliable communication."
            href="/services"
          />
          <div className="grid">
            {opplexifyServices.slice(0, 6).map((service) => (
              <Link className="card" href={`/services/${service.slug}`} key={service.slug}>
                <div className="card-media">
                  <img src={service.image} alt={service.title} loading="lazy" decoding="async" />
                </div>
                <p className="eyebrow">Service</p>
                <h3>{service.title}</h3>
                <p>{service.shortDescription}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container rr-container-1650">
          <SectionHead
            title="A Small Software Development Company"
            subtitle={`${opplexifyCompany.legalName} is a ${opplexifyCompany.legalDescription} providing remote software development services.`}
          />
          <div className="grid">
            {trustPoints.map((point) => (
              <article className="card" key={point}>
                <p className="eyebrow">Working Standard</p>
                <h3>{point}</h3>
                <p>Applied through written scope, milestone reviews, and direct project communication.</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container rr-container-1650">
          <SectionHead
            title="Portfolio"
            subtitle="Selected private client work is available upon request. Public examples are shown with privacy-safe labels only."
            href="/portfolio"
          />
          <div className="inline-actions">
            <Link className="btn secondary" href="/portfolio">
              View Portfolio
            </Link>
            <Link className="btn accent" href="/contact">
              Request Relevant Examples
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container rr-container-1650">
          <SectionHead title="Business Verification" subtitle={opplexifyCompany.complianceNote} />
          <div className="grid">
            <article className="card">
              <p className="eyebrow">Legal name</p>
              <h3>{opplexifyCompany.legalName}</h3>
              <p>{opplexifyCompany.legalDescription}</p>
            </article>
            <article className="card">
              <p className="eyebrow">Contact</p>
              <h3>
                <a href={`mailto:${opplexifyCompany.email}`}>{opplexifyCompany.email}</a>
              </h3>
              <p>
                <a href={`tel:${opplexifyCompany.phoneHref}`}>{opplexifyCompany.phone}</a>
              </p>
            </article>
            <article className="card">
              <p className="eyebrow">{opplexifyCompany.mailingAddressLabel}</p>
              <h3>{opplexifyCompany.mailingAddress}</h3>
              <p>This is listed as a business mailing address, not as a walk-in office.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container rr-container-1650">
          <SectionHead title="Common Questions" href="/faq" />
          <div className="faq-list">
            {opplexifyFaqs.slice(0, 4).map((faq) => (
              <article className="faq-item" key={faq.question}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

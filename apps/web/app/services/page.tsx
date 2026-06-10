import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { opplexifyCompany, opplexifyServices } from "@adon/shared";
import { PageHero, SectionHead } from "../../components/site/Blocks";
import { PublicShell } from "../../components/site/PublicShell";
import { seoMetadata } from "../../lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Software Development Services - Opplexify LLC",
  description:
    "Custom website development, SaaS platform development, dashboards, mobile apps, backend/API development, and automation services from Opplexify LLC.",
  path: "/services"
});

export default async function ServicesPage() {
  const servicesJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Opplexify LLC software development services",
    url: `${opplexifyCompany.website}/services`,
    itemListElement: opplexifyServices.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: service.title,
        description: service.shortDescription,
        provider: { "@type": "Organization", name: opplexifyCompany.legalName, url: opplexifyCompany.website },
        url: `${opplexifyCompany.website}/services/${service.slug}`
      }
    }))
  };

  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesJsonLd) }} />
      <PageHero
        eyebrow="Services"
        title="Software Development Services"
        subtitle="Project-based website, SaaS, dashboard, mobile app, backend/API, and automation development for businesses with specific requirements."
      />

      <section className="section">
        <div className="container rr-container-1650">
          <SectionHead title="Service Areas" subtitle="Final deliverables, timeline, and pricing are confirmed in a written proposal after scope review." />
          <div className="grid">
            {opplexifyServices.map((service) => (
              <Link className="card" href={`/services/${service.slug}`} key={service.slug}>
                <div className="card-media">
                  <img src={service.image} alt={service.title} loading="lazy" decoding="async" />
                </div>
                <p className="eyebrow">Service</p>
                <h3>{service.title}</h3>
                <p>{service.shortDescription}</p>
                <span>
                  Request details <ArrowRight size={15} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

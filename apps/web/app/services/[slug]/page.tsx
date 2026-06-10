import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { opplexifyCompany, opplexifyServices } from "@adon/shared";
import { PageHero, SectionHead } from "../../../components/site/Blocks";
import { PublicShell } from "../../../components/site/PublicShell";
import { seoMetadata } from "../../../lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return opplexifyServices.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const service = opplexifyServices.find((item) => item.slug === slug);
  if (!service) {
    return seoMetadata({
      title: "Software Development Service - Opplexify LLC",
      description: opplexifyCompany.description,
      path: `/services/${slug}`
    });
  }

  return seoMetadata({
    title: `${service.title} - Opplexify LLC`,
    description: service.shortDescription,
    path: `/services/${service.slug}`,
    image: service.image
  });
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = opplexifyServices.find((item) => item.slug === slug);
  if (!service) notFound();

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.shortDescription,
    url: `${opplexifyCompany.website}/services/${service.slug}`,
    provider: {
      "@type": "Organization",
      name: opplexifyCompany.legalName,
      url: opplexifyCompany.website
    },
    serviceType: service.title,
    areaServed: "Worldwide"
  };

  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      <PageHero title={service.title} subtitle={service.shortDescription} eyebrow="Service" />
      <section className="section">
        <div className="container detail-layout">
          <div>
            <img src={service.image} alt={service.title} loading="lazy" decoding="async" />
            <p className="detail-copy">{service.whoFor}</p>
            <div className="inline-actions">
              <Link className="btn accent" href="/contact">
                Request a Quote <ArrowRight size={18} />
              </Link>
              <Link className="btn secondary" href="/pricing">
                View Pricing Notes
              </Link>
            </div>
          </div>
          <aside className="meta-panel">
            <div className="meta-row">
              <span>Timeline</span>
              <strong>{service.timeline}</strong>
            </div>
            <div className="meta-list-panel">
              <span>Deliverables may include</span>
              <ul>
                {service.deliverables.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="meta-list-panel">
              <span>Typical process</span>
              <ul>
                {service.process.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
      <section className="section">
        <div className="container rr-container-1650">
          <SectionHead title="How to Start" subtitle="Share your goals, required features, timeline, and any existing systems that need to connect." />
          <Link className="btn accent" href="/contact">
            Contact Opplexify LLC
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}

import { notFound } from "next/navigation";
import { PageHero } from "../../../components/site/Blocks";
import { PublicShell } from "../../../components/site/PublicShell";
import { assetUrl, fetchApi, pageMetadata, type Service } from "../../../lib/api";
import { absoluteUrl, siteUrl } from "../../../lib/seo";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const service = await fetchApi<Service | null>(`/public/services/${slug}`, null);
  return pageMetadata(
    service
      ? {
          title: service.seoTitle ?? `${service.title} Service`,
          summary:
            service.seoDescription ??
            `${service.shortDescription ?? service.description ?? "Opplexify service"} Hire Opplexify for SEO-friendly planning, design, development, backend architecture, and launch support.`,
          ogImage: service.ogImage ?? service.image,
          canonicalUrl: service.canonicalUrl
        }
      : null,
    "Web Development Service",
    `/services/${slug}`
  );
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = await fetchApi<Service | null>(`/public/services/${slug}`, null);
  if (!service) notFound();
  const features = Array.isArray(service.gallery) ? service.gallery.filter(Boolean) : [];
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.shortDescription ?? service.description,
    url: absoluteUrl(`/services/${service.slug}`),
    provider: {
      "@type": "Organization",
      name: "Opplexify",
      url: siteUrl()
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
            <img src={assetUrl(service.image)} alt={service.title} loading="lazy" decoding="async" sizes="(max-width: 900px) 100vw, 58vw" />
            <p className="detail-copy">{service.description}</p>
          </div>
          <aside className="meta-panel">
            <div className="meta-row">
              <span>Process</span>
              <strong>Scope, proposal, milestones, delivery</strong>
            </div>
            <div className="meta-row">
              <span>Typical timeline</span>
              <strong>Confirmed after discovery</strong>
            </div>
            {features.length ? (
              <div className="meta-list-panel">
                <span>Possible deliverables</span>
                <ul>
                  {features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="meta-row">
              <span>Next step</span>
              <strong>
                <a href="/contact">Request a quote</a>
              </strong>
            </div>
          </aside>
        </div>
      </section>
    </PublicShell>
  );
}

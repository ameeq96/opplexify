import { notFound } from "next/navigation";
import { PageHero, Prose } from "../../../components/site/Blocks";
import { PublicShell } from "../../../components/site/PublicShell";
import { assetUrl, fetchApi, pageMetadata, type Service } from "../../../lib/api";
import { absoluteUrl, breadcrumbList, siteUrl } from "../../../lib/seo";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

const fallbackServices: Record<string, Service> = {
  "custom-website-development": {
    id: "fallback-custom-website-development",
    title: "Custom Website Development",
    slug: "custom-website-development",
    shortDescription:
      "Custom business websites with responsive design, clear service pages, dependable contact forms, and strong on-page SEO foundations.",
    description:
      "Your website should help the right customer understand what you do and take the next step with confidence. Opplexify provides custom website development for businesses that need a polished, responsive site with clear service pages, intuitive navigation, and dependable contact routing.\n\nA typical project can include discovery, content structure, UI design, frontend development, on-page SEO foundations, performance checks, testing, and launch handover. We shape the scope around the pages and functionality you actually need, so the finished site is easier to manage and ready to evolve with the business.\n\nTypical timeline: 1-3 weeks, depending on scope, content readiness, and integrations.",
    image: "/services/business-websites.webp",
    gallery: ["Discovery and scope", "Responsive pages", "Contact form routing", "SEO foundations", "Launch handover"],
    seoTitle: "Custom Website Development Services | Opplexify",
    seoDescription:
      "Custom website development for responsive business websites, clear service pages, contact forms, on-page SEO foundations, testing, and launch support."
  },
  "saas-platform-development": {
    id: "fallback-saas-platform-development",
    title: "SaaS Platform Development",
    slug: "saas-platform-development",
    shortDescription:
      "SaaS product development with user accounts, core workflows, admin controls, database design, and reliable backend APIs.",
    description:
      "A useful SaaS product starts with a focused problem and a workflow people can understand without a manual. Opplexify offers SaaS development services for founders and businesses building account-based products, customer portals, subscription-ready tools, and internal platforms.\n\nWe can take a SaaS MVP from requirements and product screens through authentication, role-based access, database design, backend APIs, user dashboards, admin controls, testing, and launch handover. The first release stays focused on the product's core value while the technical foundation leaves room for sensible growth.\n\nTypical timeline: 6-12 weeks, depending on product complexity, integrations, and launch requirements.",
    image: "/services/saas-platforms.webp",
    gallery: ["Requirements planning", "Authentication", "Database models", "Admin workflows", "Milestone delivery"],
    seoTitle: "SaaS Platform Development Services | Opplexify",
    seoDescription:
      "SaaS platform and MVP development with authentication, account workflows, admin dashboards, database design, backend APIs, testing, and launch handover."
  },
  "dashboard-admin-panel-development": {
    id: "fallback-dashboard-admin-panel-development",
    title: "Dashboard & Admin Panel Development",
    slug: "dashboard-admin-panel-development",
    shortDescription:
      "Custom dashboards, admin panels, and internal tools for managing users, content, requests, reports, and daily operations.",
    description:
      "A good admin panel removes busywork and gives the right people a clear view of what needs attention. Opplexify provides custom dashboard development for teams managing users, content, requests, orders, reports, approvals, or other operational workflows.\n\nDepending on the job, the build can include role-based access, searchable tables, forms, filters, charts, permissions, audit-friendly activity, and third-party API integrations. We organize the interface around real tasks rather than filling the screen with metrics that nobody uses.\n\nTypical timeline: 3-8 weeks, depending on data sources, user roles, and workflow complexity.",
    image: "/services/admin-dashboards.webp",
    gallery: ["Role-based access", "Data tables", "Forms and filters", "Reports", "API integration"],
    seoTitle: "Dashboard & Admin Panel Development | Opplexify",
    seoDescription:
      "Custom dashboard and admin panel development for user management, reports, internal workflows, role-based access, data tools, and API integrations."
  },
  "mobile-app-development": {
    id: "fallback-mobile-app-development",
    title: "Mobile App Development",
    slug: "mobile-app-development",
    shortDescription:
      "Mobile app development with thoughtful user flows, secure backend APIs, authentication, and practical admin tools.",
    description:
      "Successful mobile apps need more than a set of attractive screens. Opplexify designs and builds mobile experiences around the complete user journey, including the backend services and operational tools required to run the product after launch.\n\nA project can cover screen planning, UI implementation, authentication, backend API integration, account data, media handling, admin workflows, testing, and handover. We prioritize the features that make the first release useful and keep future additions in mind without overbuilding the MVP.\n\nTypical timeline: 5-10 weeks, depending on the number of workflows, integrations, and release requirements.",
    image: "/services/mobile-apps.webp",
    gallery: ["Mobile screens", "API connection", "Admin workflow", "Testing support", "Store-ready handoff"],
    seoTitle: "Mobile App Development Services | Opplexify",
    seoDescription:
      "Mobile app development with user-focused screens, authentication, backend API integration, admin workflows, testing, and a practical launch handover."
  },
  "backend-api-development": {
    id: "fallback-backend-api-development",
    title: "Backend/API Development",
    slug: "backend-api-development",
    shortDescription:
      "Backend API development with structured databases, authentication, validation, documentation, and maintainable server-side logic.",
    description:
      "Reliable digital products depend on a backend that handles data and permissions consistently. Opplexify builds backend systems and APIs for web apps, SaaS platforms, mobile products, dashboards, and third-party integrations.\n\nWork can include API design, database schema, authentication, authorization, input validation, file handling, error management, documentation, automated checks, and deployment support. The goal is a clear service structure that another developer can understand and your product can build on.\n\nTypical timeline: 3-8 weeks, depending on data complexity, security requirements, and external services.",
    image: "/services/backend-systems.webp",
    gallery: ["API design", "Database schema", "Authentication", "Validation", "Documentation"],
    seoTitle: "Backend API Development Services | Opplexify",
    seoDescription:
      "Backend API development for web and mobile products, including database design, authentication, authorization, validation, documentation, and testing."
  }
};

function getService(slug: string) {
  return fetchApi<Service | null>(`/public/services/${slug}`, fallbackServices[slug] ?? null);
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const service = await getService(slug);
  return pageMetadata(
    service
      ? {
          title: service.seoTitle ?? `${service.title} Service`,
          summary:
            service.seoDescription ??
            `${service.shortDescription ?? service.description ?? "Opplexify service"} Explore a practical approach to product planning, UI/UX design, development, integration, testing, and launch.`,
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
  const service = await getService(slug);
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
  const breadcrumbJsonLd = breadcrumbList([
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: service.title, path: `/services/${service.slug}` }
  ]);

  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <PageHero title={service.title} subtitle={service.shortDescription} eyebrow="Service" />
      <section className="section">
        <div className="container detail-layout">
          <div>
            <img src={assetUrl(service.image)} alt={service.title} loading="lazy" decoding="async" sizes="(max-width: 900px) 100vw, 58vw" />
            <Prose text={service.description} />
          </div>
          <aside className="meta-panel">
            <div className="meta-row">
              <span>How we work</span>
              <strong>Discovery, scope, build, review, launch</strong>
            </div>
            <div className="meta-row">
              <span>Typical timeline</span>
              <strong>Confirmed after discovery</strong>
            </div>
            {features.length ? (
              <div className="meta-list-panel">
                <span>Potential deliverables</span>
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
                <a href="/contact">Discuss your project</a>
              </strong>
            </div>
          </aside>
        </div>
      </section>
    </PublicShell>
  );
}

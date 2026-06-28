import type { Metadata } from "next";
import { StaticTemplatePage } from "../../components/site/StaticTemplatePage";
import { serviceHtml } from "../../components/site/templateHtml";
import { assetUrl, fetchApi, getSection, pageMetadata, type Page, type Service } from "../../lib/api";
import { absoluteUrl, breadcrumbList, siteUrl } from "../../lib/seo";

export const revalidate = 300;

type ServiceListItem = {
  item: {
    name: string;
  };
};

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchApi<Page | null>("/public/pages/services", null);
  return pageMetadata(page, "Web Development Services - Websites, SaaS, Apps & Dashboards", "/services");
}

const servicesAreaHtml = String.raw`
                <!-- service area start  -->
                <section class="page-title-area">
                    <div class="container rr-container-1650">
                        <div class="page-title-area-inner section-spacing-top">
                            <div class="page-title-wrapper">
                                <h1 class="page-title fade-anim">Software development <br>
                                    services for <span>businesses</span></h1>
                            </div>
                        </div>
                    </div>
                </section>
                <section class="service-2">
                    <div class="container rr-container-1650">
                        <div class="service-2-inner">
                            <div class="section-header fade-anim">
                                <div class="section-title-wrapper">
                                    <div class="subtitle-wrapper">
                                        <span class="section-subtitle">Services</span>
                                    </div>
                                    <div class="title-wrapper">
                                        <img src="/services/services-overview.webp" alt="Opplexify web development services overview">
                                        <p class="designation">Custom development services for business websites, SaaS platforms, dashboards, mobile apps, APIs, and workflow automation. <span>Each project starts with scope, timeline, deliverables, proposal, and milestone terms.</span></p>
                                    </div>
                                </div>
                            </div>
                            <div class="service-2-wrapper section-spacing-150">
                                <div class="service-2-box fade-anim">
                                    <div class="thumb">
                                        <a href="/contact"><img src="/services/business-websites.webp" alt="Custom website development"></a>
                                    </div>
                                    <div class="content">
                                        <h2 class="title"><a href="/contact">Custom Website Development</a></h2>
                                        <p class="designation">Responsive business websites for companies that need clear service pages, contact paths, basic SEO setup, and a professional web presence. Typical timeline: 1-3 weeks.</p>
                                        <ul class="service-2-list">
                                            <li><a href="/contact">Discovery and scope</a></li>
                                            <li><a href="/contact">Responsive pages</a></li>
                                            <li><a href="/contact">Contact form routing</a></li>
                                            <li><a href="/contact">SEO foundations</a></li>
                                            <li><a href="/contact">Launch handover</a></li>
                                        </ul>
                                        <a href="/contact" class="rr-btn">
                                            <span class="btn-wrap">
                                                <span class="text-one">Request a Quote</span>
                                                <span class="text-two">Request a Quote</span>
                                            </span>
                                        </a>
                                    </div>
                                </div>
                                <div class="service-2-box fade-anim">
                                    <div class="thumb">
                                        <a href="/contact"><img src="/services/saas-platforms.webp" alt="SaaS platform development"></a>
                                    </div>
                                    <div class="content">
                                        <h2 class="title"><a href="/contact">SaaS Platform Development</a></h2>
                                        <p class="designation">SaaS products for founders and businesses that need user accounts, product workflows, admin tools, data models, and backend APIs. Typical timeline: 6-12 weeks.</p>
                                        <ul class="service-2-list">
                                            <li><a href="/contact">Requirements planning</a></li>
                                            <li><a href="/contact">Authentication</a></li>
                                            <li><a href="/contact">Database models</a></li>
                                            <li><a href="/contact">Admin workflows</a></li>
                                            <li><a href="/contact">Milestone delivery</a></li>
                                        </ul>
                                        <a href="/contact" class="rr-btn">
                                            <span class="btn-wrap">
                                                <span class="text-one">Request a Quote</span>
                                                <span class="text-two">Request a Quote</span>
                                            </span>
                                        </a>
                                    </div>
                                </div>
                                <div class="service-2-box fade-anim">
                                    <div class="thumb">
                                        <a href="/contact"><img src="/services/admin-dashboards.webp" alt="Dashboard and admin panel development"></a>
                                    </div>
                                    <div class="content">
                                        <h2 class="title"><a href="/contact">Dashboard & Admin Panel Development</a></h2>
                                        <p class="designation">Operational dashboards for teams that need to manage users, content, requests, reports, orders, or internal workflows. Typical timeline: 3-8 weeks.</p>
                                        <ul class="service-2-list">
                                            <li><a href="/contact">Role-based access</a></li>
                                            <li><a href="/contact">Data tables</a></li>
                                            <li><a href="/contact">Forms and filters</a></li>
                                            <li><a href="/contact">Reports</a></li>
                                            <li><a href="/contact">API integration</a></li>
                                        </ul>
                                        <a href="/contact" class="rr-btn">
                                            <span class="btn-wrap">
                                                <span class="text-one">Request a Quote</span>
                                                <span class="text-two">Request a Quote</span>
                                            </span>
                                        </a>
                                    </div>
                                </div>
                                <div class="service-2-box fade-anim">
                                    <div class="thumb">
                                        <a href="/contact"><img src="/services/mobile-apps.webp" alt="Mobile app development"></a>
                                    </div>
                                    <div class="content">
                                        <h2 class="title"><a href="/contact">Mobile App Development</a></h2>
                                        <p class="designation">Mobile app interfaces for customer or internal workflows, connected to secure APIs and admin tools when required. Typical timeline: 5-10 weeks.</p>
                                        <ul class="service-2-list">
                                            <li><a href="/contact">Mobile screens</a></li>
                                            <li><a href="/contact">API connection</a></li>
                                            <li><a href="/contact">Admin workflow</a></li>
                                            <li><a href="/contact">Testing support</a></li>
                                            <li><a href="/contact">Store-ready handoff</a></li>
                                        </ul>
                                        <a href="/contact" class="rr-btn">
                                            <span class="btn-wrap">
                                                <span class="text-one">Request a Quote</span>
                                                <span class="text-two">Request a Quote</span>
                                            </span>
                                        </a>
                                    </div>
                                </div>
                                <div class="service-2-box fade-anim">
                                    <div class="thumb">
                                        <a href="/contact"><img src="/services/backend-systems.webp" alt="Backend and API development"></a>
                                    </div>
                                    <div class="content">
                                        <h2 class="title"><a href="/contact">Backend/API Development</a></h2>
                                        <p class="designation">Backend systems for applications that need secure APIs, databases, authentication, validation, and maintainable server-side logic. Typical timeline: 3-8 weeks.</p>
                                        <ul class="service-2-list">
                                            <li><a href="/contact">API design</a></li>
                                            <li><a href="/contact">Database schema</a></li>
                                            <li><a href="/contact">Authentication</a></li>
                                            <li><a href="/contact">Validation</a></li>
                                            <li><a href="/contact">Documentation</a></li>
                                        </ul>
                                        <a href="/contact" class="rr-btn">
                                            <span class="btn-wrap">
                                                <span class="text-one">Request a Quote</span>
                                                <span class="text-two">Request a Quote</span>
                                            </span>
                                        </a>
                                    </div>
                                </div>
                                <div class="service-2-box fade-anim">
                                    <div class="thumb">
                                        <a href="/contact"><img src="/services/web-applications.webp" alt="Automation and integrations"></a>
                                    </div>
                                    <div class="content">
                                        <h2 class="title"><a href="/contact">Automation & Integrations</a></h2>
                                        <p class="designation">Workflow automations and integrations for businesses that need tools, forms, dashboards, APIs, or services to share data reliably. Typical timeline: 2-6 weeks.</p>
                                        <ul class="service-2-list">
                                            <li><a href="/contact">Workflow mapping</a></li>
                                            <li><a href="/contact">API integrations</a></li>
                                            <li><a href="/contact">Admin tools</a></li>
                                            <li><a href="/contact">Data sync</a></li>
                                            <li><a href="/contact">Testing and handoff</a></li>
                                        </ul>
                                        <a href="/contact" class="rr-btn">
                                            <span class="btn-wrap">
                                                <span class="text-one">Request a Quote</span>
                                                <span class="text-two">Request a Quote</span>
                                            </span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <!-- service area end  -->
`;

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderServicesArea(services: Service[], page: Page | null) {
  if (!services.length) return servicesAreaHtml;
  const intro = getSection(page, "intro") ?? getSection(page, "hero");
  const title = intro?.title ?? page?.title ?? "Web development services for growth";
  const subtitle =
    intro?.subtitle ??
    page?.summary ??
    "Full-stack services for professional digital product delivery. Each service is planned around business objectives, maintainable architecture, and user experience.";
  const overviewImage = assetUrl((intro?.content?.image as string | undefined) ?? "/services/services-overview.webp");
  const cards = services
    .map((service) => {
      const image = assetUrl(service.image);
      const href = `/services/${service.slug}`;
      const galleryItems = Array.isArray(service.gallery) && service.gallery.length ? service.gallery.slice(0, 5) : [];
      const listItems = (galleryItems.length ? galleryItems : ["Planning", "UI/UX", "Development", "Admin", "Launch"])
        .map((item) => `<li><a href="${href}">${escapeHtml(item)}</a></li>`)
        .join("");

      return `<div class="service-2-box fade-anim">
        <div class="thumb">
          <a href="${href}"><img src="${escapeHtml(image)}" alt="${escapeHtml(service.title)}"></a>
        </div>
        <div class="content">
          <h2 class="title"><a href="${href}">${escapeHtml(service.title)}</a></h2>
          <p class="designation">${escapeHtml(service.shortDescription ?? service.description ?? "")}</p>
          <ul class="service-2-list">${listItems}</ul>
          <a href="/contact" class="rr-btn">
            <span class="btn-wrap">
              <span class="text-one">Request a Quote</span>
              <span class="text-two">Request a Quote</span>
            </span>
          </a>
        </div>
      </div>`;
    })
    .join("");

  return String.raw`
                <!-- service area start  -->
                <section class="page-title-area">
                    <div class="container rr-container-1650">
                        <div class="page-title-area-inner section-spacing-top">
                            <div class="page-title-wrapper">
                                <h1 class="page-title fade-anim">${escapeHtml(title)}</h1>
                            </div>
                        </div>
                    </div>
                </section>
                <section class="service-2">
                    <div class="container rr-container-1650">
                        <div class="service-2-inner">
                            <div class="section-header fade-anim">
                                <div class="section-title-wrapper">
                                    <div class="subtitle-wrapper">
                                        <span class="section-subtitle">Services</span>
                                    </div>
                                    <div class="title-wrapper">
                                        <img src="${escapeHtml(overviewImage)}" alt="Opplexify web development services overview">
                                        <p class="designation">${escapeHtml(subtitle)}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="service-2-wrapper section-spacing-150">
                              ${cards}
                            </div>
                        </div>
                    </div>
                </section>
                <!-- service area end  -->
`;
}

function renderServicePageHtml(services: Service[], page: Page | null) {
  return serviceHtml
    .replace(/<!-- page title area start  -->[\s\S]*?<!-- page title area end  -->\s*/, "")
    .replace(/<!-- service area start  -->[\s\S]*?<!-- service area end  -->/, renderServicesArea(services, page));
}

const servicesJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Opplexify LLC software development services",
  url: `${siteUrl()}/services`,
  itemListElement: [
    "Custom website development",
    "SaaS platform development",
    "Dashboard and admin panel development",
    "Mobile app development",
    "Backend/API development",
    "Automation and integrations"
  ].map((name, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "Service",
      name,
      provider: { "@type": "Organization", name: "Opplexify", url: siteUrl() },
      url: absoluteUrl("/services")
    }
  }))
};

export default async function ServicesPage() {
  const [page, services] = await Promise.all([
    fetchApi<Page | null>("/public/pages/services", null),
    fetchApi<Service[]>("/public/services", [])
  ]);
  const renderedJsonLd = {
    ...servicesJsonLd,
    itemListElement: (services.length ? services.map((service) => service.title) : (servicesJsonLd.itemListElement as ServiceListItem[]).map((item) => item.item.name)).map((name, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name,
        provider: { "@type": "Organization", name: "Opplexify", url: siteUrl() },
        url: absoluteUrl("/services")
      }
    }))
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(renderedJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }])) }} />
      <StaticTemplatePage html={renderServicePageHtml(services, page)} bodyClassName="body-about-us" />
    </>
  );
}

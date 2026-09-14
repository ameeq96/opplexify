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
                                <h1 class="page-title fade-anim">Custom software development <br>
                                    built around <span>real business needs</span></h1>
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
                                        <p class="designation">From a focused business website to a complete SaaS or mobile product, Opplexify brings strategy, UI/UX, engineering, and launch support into one practical process. <span>We define the scope first, communicate clearly, and build for the people who will actually use it.</span></p>
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
                                        <p class="designation">Fast, focused websites that explain your offer clearly, work beautifully on every screen, and give search engines a solid technical and content foundation. Typical timeline: 1-3 weeks.</p>
                                        <ul class="service-2-list">
                                            <li><a href="/contact">Content and conversion planning</a></li>
                                            <li><a href="/contact">Responsive website design</a></li>
                                            <li><a href="/contact">Clear contact journeys</a></li>
                                            <li><a href="/contact">On-page SEO foundations</a></li>
                                            <li><a href="/contact">Performance and launch</a></li>
                                        </ul>
                                        <a href="/contact" class="rr-btn">
                                            <span class="btn-wrap">
                                                <span class="text-one">Discuss Your Project</span>
                                                <span class="text-two">Discuss Your Project</span>
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
                                        <p class="designation">SaaS application development for founders and teams ready to turn a product idea into a usable first release, with customer workflows and operations planned together. Typical timeline: 6-12 weeks.</p>
                                        <ul class="service-2-list">
                                            <li><a href="/contact">MVP scope and user journeys</a></li>
                                            <li><a href="/contact">Accounts and permissions</a></li>
                                            <li><a href="/contact">Product data and backend APIs</a></li>
                                            <li><a href="/contact">Admin and billing workflows</a></li>
                                            <li><a href="/contact">Testing and staged delivery</a></li>
                                        </ul>
                                        <a href="/contact" class="rr-btn">
                                            <span class="btn-wrap">
                                                <span class="text-one">Discuss Your Project</span>
                                                <span class="text-two">Discuss Your Project</span>
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
                                        <p class="designation">Custom dashboards and internal admin tools that make complex daily work easier to understand, manage, and act on. Typical timeline: 3-8 weeks.</p>
                                        <ul class="service-2-list">
                                            <li><a href="/contact">Role-based access</a></li>
                                            <li><a href="/contact">Searchable data views</a></li>
                                            <li><a href="/contact">Forms, filters, and approvals</a></li>
                                            <li><a href="/contact">Reporting and exports</a></li>
                                            <li><a href="/contact">API and system integration</a></li>
                                        </ul>
                                        <a href="/contact" class="rr-btn">
                                            <span class="btn-wrap">
                                                <span class="text-one">Discuss Your Project</span>
                                                <span class="text-two">Discuss Your Project</span>
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
                                        <p class="designation">Mobile app development for customer experiences or internal workflows, connected to a secure backend and a manageable operational system. Typical timeline: 5-10 weeks.</p>
                                        <ul class="service-2-list">
                                            <li><a href="/contact">User journeys and mobile UI</a></li>
                                            <li><a href="/contact">Secure API integration</a></li>
                                            <li><a href="/contact">Admin and content workflows</a></li>
                                            <li><a href="/contact">Device testing support</a></li>
                                            <li><a href="/contact">Launch-ready handoff</a></li>
                                        </ul>
                                        <a href="/contact" class="rr-btn">
                                            <span class="btn-wrap">
                                                <span class="text-one">Discuss Your Project</span>
                                                <span class="text-two">Discuss Your Project</span>
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
                                        <p class="designation">Backend and API development for products that need dependable data, secure access, third-party integrations, and server-side logic that is easier to maintain. Typical timeline: 3-8 weeks.</p>
                                        <ul class="service-2-list">
                                            <li><a href="/contact">REST API design</a></li>
                                            <li><a href="/contact">Database architecture</a></li>
                                            <li><a href="/contact">Authentication and permissions</a></li>
                                            <li><a href="/contact">Validation and error handling</a></li>
                                            <li><a href="/contact">Integration documentation</a></li>
                                        </ul>
                                        <a href="/contact" class="rr-btn">
                                            <span class="btn-wrap">
                                                <span class="text-one">Discuss Your Project</span>
                                                <span class="text-two">Discuss Your Project</span>
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
                                        <p class="designation">Workflow automation and API integration services that reduce repetitive work and help the tools your team already uses share data more reliably. Typical timeline: 2-6 weeks.</p>
                                        <ul class="service-2-list">
                                            <li><a href="/contact">Workflow and failure mapping</a></li>
                                            <li><a href="/contact">Third-party API integrations</a></li>
                                            <li><a href="/contact">Practical admin controls</a></li>
                                            <li><a href="/contact">Reliable data synchronization</a></li>
                                            <li><a href="/contact">Testing and team handoff</a></li>
                                        </ul>
                                        <a href="/contact" class="rr-btn">
                                            <span class="btn-wrap">
                                                <span class="text-one">Discuss Your Project</span>
                                                <span class="text-two">Discuss Your Project</span>
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
  const title = intro?.title ?? page?.title ?? "Custom software development services for growing businesses";
  const subtitle =
    intro?.subtitle ??
    page?.summary ??
    "Choose the support your product actually needs—from website design and SaaS development to mobile apps, backend APIs, admin dashboards, and workflow automation.";
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
              <span class="text-one">Discuss Your Project</span>
              <span class="text-two">Discuss Your Project</span>
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
  name: "Opplexify custom software development services",
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

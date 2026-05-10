import type { Metadata } from "next";
import { StaticTemplatePage } from "../../components/site/StaticTemplatePage";
import { serviceHtml } from "../../components/site/templateHtml";
import { assetUrl, fetchApi, getSection, pageMetadata, type Page, type Service } from "../../lib/api";
import { absoluteUrl, siteUrl } from "../../lib/seo";

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
                    <div class="container large">
                        <div class="page-title-area-inner section-spacing-top">
                            <div class="page-title-wrapper">
                                <h1 class="page-title fade-anim">Web development <br>
                                    services for <span>growth</span></h1>
                            </div>
                        </div>
                    </div>
                </section>
                <section class="service-2">
                    <div class="container large">
                        <div class="service-2-inner">
                            <div class="section-header fade-anim">
                                <div class="section-title-wrapper">
                                    <div class="subtitle-wrapper">
                                        <span class="section-subtitle">Services</span>
                                    </div>
                                    <div class="title-wrapper">
                                        <img src="/services/services-overview.png" alt="Opplexify web development services overview">
                                        <p class="designation">Full-stack services for professional digital product delivery. <span>Each service is planned around business objectives, maintainable architecture, and a user experience that supports real operational needs.</span></p>
                                    </div>
                                </div>
                            </div>
                            <div class="service-2-wrapper section-spacing-150">
                                <div class="service-2-box fade-anim">
                                    <div class="thumb">
                                        <a href="/contact"><img src="/services/web-applications.png" alt="Web applications"></a>
                                    </div>
                                    <div class="content">
                                        <h2 class="title"><a href="/contact">Web Applications</a></h2>
                                        <p class="designation">Custom portals, dashboards, booking systems, internal tools, and business workflow applications built around real operations.</p>
                                        <ul class="service-2-list">
                                            <li><a href="/contact">Custom portals</a></li>
                                            <li><a href="/contact">Dashboards</a></li>
                                            <li><a href="/contact">Booking systems</a></li>
                                            <li><a href="/contact">Internal tools</a></li>
                                            <li><a href="/contact">Business workflows</a></li>
                                        </ul>
                                        <a href="/contact" class="rr-btn">
                                            <span class="btn-wrap">
                                                <span class="text-one">Explore the service</span>
                                                <span class="text-two">Explore the service</span>
                                            </span>
                                        </a>
                                    </div>
                                </div>
                                <div class="service-2-box fade-anim">
                                    <div class="thumb">
                                        <a href="/contact"><img src="/services/business-websites.png" alt="Business websites"></a>
                                    </div>
                                    <div class="content">
                                        <h2 class="title"><a href="/contact">Business Websites</a></h2>
                                        <p class="designation">Responsive brand websites built to communicate trust, services, and conversion paths clearly across every device.</p>
                                        <ul class="service-2-list">
                                            <li><a href="/contact">Responsive pages</a></li>
                                            <li><a href="/contact">Service presentation</a></li>
                                            <li><a href="/contact">Lead capture</a></li>
                                            <li><a href="/contact">SEO structure</a></li>
                                            <li><a href="/contact">Conversion paths</a></li>
                                        </ul>
                                        <a href="/contact" class="rr-btn">
                                            <span class="btn-wrap">
                                                <span class="text-one">Explore the service</span>
                                                <span class="text-two">Explore the service</span>
                                            </span>
                                        </a>
                                    </div>
                                </div>
                                <div class="service-2-box fade-anim">
                                    <div class="thumb">
                                        <a href="/contact"><img src="/services/saas-platforms.png" alt="SaaS platforms"></a>
                                    </div>
                                    <div class="content">
                                        <h2 class="title"><a href="/contact">SaaS Platforms</a></h2>
                                        <p class="designation">Product foundations with authentication, database models, admin views, and scalable API architecture.</p>
                                        <ul class="service-2-list">
                                            <li><a href="/contact">Authentication</a></li>
                                            <li><a href="/contact">Database models</a></li>
                                            <li><a href="/contact">Admin views</a></li>
                                            <li><a href="/contact">Scalable APIs</a></li>
                                            <li><a href="/contact">Subscription-ready flows</a></li>
                                        </ul>
                                        <a href="/contact" class="rr-btn">
                                            <span class="btn-wrap">
                                                <span class="text-one">Explore the service</span>
                                                <span class="text-two">Explore the service</span>
                                            </span>
                                        </a>
                                    </div>
                                </div>
                                <div class="service-2-box fade-anim">
                                    <div class="thumb">
                                        <a href="/contact"><img src="/services/mobile-apps.png" alt="Mobile apps"></a>
                                    </div>
                                    <div class="content">
                                        <h2 class="title"><a href="/contact">Mobile Apps</a></h2>
                                        <p class="designation">Mobile experiences connected to secure APIs, admin workflows, and notification-ready foundations.</p>
                                        <ul class="service-2-list">
                                            <li><a href="/contact">Mobile UI</a></li>
                                            <li><a href="/contact">Secure API connection</a></li>
                                            <li><a href="/contact">Admin workflows</a></li>
                                            <li><a href="/contact">Push notification-ready</a></li>
                                            <li><a href="/contact">Product launch support</a></li>
                                        </ul>
                                        <a href="/contact" class="rr-btn">
                                            <span class="btn-wrap">
                                                <span class="text-one">Explore the service</span>
                                                <span class="text-two">Explore the service</span>
                                            </span>
                                        </a>
                                    </div>
                                </div>
                                <div class="service-2-box fade-anim">
                                    <div class="thumb">
                                        <a href="/contact"><img src="/services/admin-dashboards.png" alt="Admin dashboards"></a>
                                    </div>
                                    <div class="content">
                                        <h2 class="title"><a href="/contact">Admin Dashboards</a></h2>
                                        <p class="designation">Operational dashboards for managing content, users, requests, orders, and business reporting.</p>
                                        <ul class="service-2-list">
                                            <li><a href="/contact">Content management</a></li>
                                            <li><a href="/contact">User management</a></li>
                                            <li><a href="/contact">Requests and orders</a></li>
                                            <li><a href="/contact">Business reporting</a></li>
                                            <li><a href="/contact">Role-based access</a></li>
                                        </ul>
                                        <a href="/contact" class="rr-btn">
                                            <span class="btn-wrap">
                                                <span class="text-one">Explore the service</span>
                                                <span class="text-two">Explore the service</span>
                                            </span>
                                        </a>
                                    </div>
                                </div>
                                <div class="service-2-box fade-anim">
                                    <div class="thumb">
                                        <a href="/contact"><img src="/services/backend-systems.png" alt="Backend systems"></a>
                                    </div>
                                    <div class="content">
                                        <h2 class="title"><a href="/contact">Backend Systems</a></h2>
                                        <p class="designation">NestJS APIs, Prisma schemas, relational databases, JWT authentication, and maintainable backend structure.</p>
                                        <ul class="service-2-list">
                                            <li><a href="/contact">NestJS APIs</a></li>
                                            <li><a href="/contact">Prisma schemas</a></li>
                                            <li><a href="/contact">Relational databases</a></li>
                                            <li><a href="/contact">JWT authentication</a></li>
                                            <li><a href="/contact">Maintainable structure</a></li>
                                        </ul>
                                        <a href="/contact" class="rr-btn">
                                            <span class="btn-wrap">
                                                <span class="text-one">Explore the service</span>
                                                <span class="text-two">Explore the service</span>
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
  const overviewImage = assetUrl((intro?.content?.image as string | undefined) ?? "/services/services-overview.png");
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
          <a href="${href}" class="rr-btn">
            <span class="btn-wrap">
              <span class="text-one">Explore the service</span>
              <span class="text-two">Explore the service</span>
            </span>
          </a>
        </div>
      </div>`;
    })
    .join("");

  return String.raw`
                <!-- service area start  -->
                <section class="page-title-area">
                    <div class="container large">
                        <div class="page-title-area-inner section-spacing-top">
                            <div class="page-title-wrapper">
                                <h1 class="page-title fade-anim">${escapeHtml(title)}</h1>
                            </div>
                        </div>
                    </div>
                </section>
                <section class="service-2">
                    <div class="container large">
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
  name: "Opplexify web development services",
  url: `${siteUrl()}/services`,
  itemListElement: [
    "SEO-friendly website development",
    "Full-stack web application development",
    "SaaS platform development",
    "Mobile app development",
    "Admin dashboard development",
    "NestJS backend systems"
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
      <StaticTemplatePage html={renderServicePageHtml(services, page)} bodyClassName="body-about-us" />
    </>
  );
}

import type { Metadata } from "next";
import { PublicShell } from "../../components/site/PublicShell";
import { fetchApi, pageMetadata, type Page } from "../../lib/api";
import { absoluteUrl, siteUrl } from "../../lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchApi<Page | null>("/public/pages/portfolio", null);
  return pageMetadata(page, "Portfolio - Private Client Work Available Upon Request", "/portfolio");
}

const serviceCategories = [
  {
    title: "Custom Websites",
    description: "Responsive business websites, service pages, landing pages, content structure, and foundational SEO."
  },
  {
    title: "SaaS Platforms",
    description: "Subscription-ready product flows, account areas, dashboards, database models, and backend APIs."
  },
  {
    title: "Admin Dashboards",
    description: "Internal tools for managing users, content, operations, approvals, reporting, and project workflows."
  },
  {
    title: "Mobile Apps",
    description: "Mobile app interfaces connected to secure backend APIs, admin controls, and launch-ready workflows."
  },
  {
    title: "Backend/API Development",
    description: "API design, authentication, database planning, validation, integrations, and deployment support."
  },
  {
    title: "Workflow Automation",
    description: "Automation for business processes, forms, notifications, data handling, and internal operations."
  }
];

export default function PortfolioPage() {
  const portfolioJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Opplexify private client work",
    url: absoluteUrl("/portfolio"),
    description:
      "Opplexify LLC private client work is available upon request. Public portfolio details are limited to service categories unless client approval is granted.",
    isPartOf: { "@type": "WebSite", name: "Opplexify", url: siteUrl() }
  };

  return (
    <PublicShell smooth={false} showLoader={false}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(portfolioJsonLd) }} />
      <main>
        <section className="opplexify-portfolio-hero mb-4">
          <div className="container rr-container-1650">
            <div className="opplexify-portfolio-simple">
              <span className="section-subtitle">Portfolio</span>
              <h1>Private client work available upon request.</h1>
              <p>
                Opplexify LLC does not publish client names, private dashboards, source code, business data, or project
                results unless a client gives approval. Relevant private examples can be discussed during project
                scoping.
              </p>
            </div>
          </div>
        </section>

        <section className="portfolio-category-area">
          <div className="container rr-container-1650">
            <div className="portfolio-category-head">
              <span className="section-subtitle">Service Categories</span>
              <h2>Types of work Opplexify can build</h2>
              <p>Use these categories to understand the kind of private client work available for review upon request.</p>
            </div>
            <div className="portfolio-category-grid">
              {serviceCategories.map((category) => (
                <article className="portfolio-category-card" key={category.title}>
                  <h3>{category.title}</h3>
                  <p>{category.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}

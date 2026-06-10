import type { Metadata } from "next";
import { FaqList, PageHero } from "../../components/site/Blocks";
import { PublicShell } from "../../components/site/PublicShell";
import { fetchApi, getSection, pageMetadata, type Faq, type Page } from "../../lib/api";
import { absoluteUrl } from "../../lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchApi<Page | null>("/public/pages/faq", null);
  return pageMetadata(page, "Web Development FAQ - Pricing, Process, SaaS, Apps & SEO", "/faq");
}

export default async function FaqPage() {
  const [page, faqs] = await Promise.all([
    fetchApi<Page | null>("/public/pages/faq", null),
    fetchApi<Faq[]>("/public/faqs", [])
  ]);
  const intro = getSection(page, "faq-intro");
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    })),
    url: absoluteUrl("/faq")
  };
  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <PageHero title={intro?.title ?? page?.title ?? "Web development questions about pricing, timelines and SEO"} subtitle={intro?.subtitle ?? page?.summary ?? "Answers about websites, full-stack web applications, SaaS development, mobile apps, admin dashboards, backend APIs, and launch workflows."} eyebrow="FAQ" />
      <section className="section">
        <div className="container rr-container-1650">
          <FaqList faqs={faqs} />
        </div>
      </section>
    </PublicShell>
  );
}

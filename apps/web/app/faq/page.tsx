import type { Metadata } from "next";
import { opplexifyCompany, opplexifyFaqs } from "@adon/shared";
import { FaqList, PageHero } from "../../components/site/Blocks";
import { PublicShell } from "../../components/site/PublicShell";
import { seoMetadata } from "../../lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "FAQ - Opplexify LLC Software Development Services",
  description:
    "Answers about Opplexify LLC services, registration, remote work, project start, invoices, milestone billing, revisions, refunds, and compliance contact.",
  path: "/faq"
});

export default async function FaqPage() {
  const faqs = opplexifyFaqs.map((faq, index) => ({ ...faq, id: String(index + 1) }));
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: opplexifyFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    })),
    url: `${opplexifyCompany.website}/faq`
  };

  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <PageHero
        eyebrow="FAQ"
        title="Frequently Asked Questions"
        subtitle="Clear answers about Opplexify LLC, project process, billing, revisions, refunds, and compliance contact."
      />
      <section className="section">
        <div className="container rr-container-1650">
          <FaqList faqs={faqs} />
        </div>
      </section>
    </PublicShell>
  );
}

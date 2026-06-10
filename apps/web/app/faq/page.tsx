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

const fallbackFaqs: Faq[] = [
  {
    id: "services",
    question: "What services does Opplexify LLC provide?",
    answer:
      "Opplexify LLC provides custom website development, SaaS platform development, dashboard and admin panel development, mobile app development, backend/API development, and automation and integration services."
  },
  {
    id: "registered",
    question: "Is Opplexify LLC a registered US company?",
    answer:
      "Opplexify LLC is a Wyoming-formed limited liability company. For business verification or compliance inquiries, contact admin@opplexify.com."
  },
  {
    id: "remote",
    question: "Do you work with remote or international clients?",
    answer:
      "Yes. Opplexify LLC provides remote software development services and can work with businesses in different locations, subject to project fit, payment terms, and applicable requirements."
  },
  {
    id: "start",
    question: "How does a project start?",
    answer:
      "A project usually starts with a short discovery discussion, written scope, estimated timeline, and proposal. Work begins after the scope, deposit, and billing terms are confirmed."
  },
  {
    id: "invoices",
    question: "Do you provide invoices and contracts?",
    answer:
      "Yes. Opplexify LLC can provide written proposals, invoices, and contracts or statements of work for scoped client projects."
  },
  {
    id: "milestones",
    question: "How does milestone-based billing work?",
    answer:
      "Larger projects are split into milestones. Each milestone covers a defined stage of work, and payment terms are listed in the quote, proposal, or contract."
  },
  {
    id: "revisions",
    question: "How do revisions work?",
    answer:
      "Revision rounds are defined in the project scope. Included revisions refine agreed deliverables. New features, major direction changes, or extra scope may require a change order."
  },
  {
    id: "refunds",
    question: "How do refunds and cancellations work?",
    answer:
      "Deposits, completed milestones, work in progress, and third-party costs may be non-refundable. The Refund Policy explains deposits, milestones, revisions, cancellations, completed work, and delivery terms."
  },
  {
    id: "compliance",
    question: "How can business verification or compliance teams contact Opplexify LLC?",
    answer:
      "Business verification, KYC, payment processor, or compliance teams can contact admin@opplexify.com. The business phone is +1 (307) 443-5144."
  }
];

export default async function FaqPage() {
  const [page, faqs] = await Promise.all([
    fetchApi<Page | null>("/public/pages/faq", null),
    fetchApi<Faq[]>("/public/faqs", [])
  ]);
  const visibleFaqs = faqs.length ? faqs : fallbackFaqs;
  const intro = getSection(page, "faq-intro");
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: visibleFaqs.map((faq) => ({
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
      <FaqList faqs={visibleFaqs} />
        </div>
      </section>
    </PublicShell>
  );
}

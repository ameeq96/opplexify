import type { Metadata } from "next";
import { FaqList, PageHero } from "../../components/site/Blocks";
import { PublicShell } from "../../components/site/PublicShell";
import { fetchApi, getSection, pageMetadata, type Faq, type Page } from "../../lib/api";
import { absoluteUrl, breadcrumbList } from "../../lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchApi<Page | null>("/public/pages/faq", null);
  return pageMetadata(page, "Software Development FAQ | Process, Pricing & Support", "/faq");
}

const fallbackFaqs: Faq[] = [
  {
    id: "services",
    question: "What can Opplexify design and build?",
    answer:
      "Opplexify designs and builds business websites, custom web applications, SaaS products, admin dashboards, mobile apps, backend APIs, and workflow automations. We can handle the full path from product planning and UI/UX design through development, testing, and launch."
  },
  {
    id: "fit",
    question: "What kinds of projects are a good fit?",
    answer:
      "We are a good fit for founders and growing teams with a clear business problem, a committed decision-maker, and realistic priorities. If the idea is still taking shape, discovery can help turn it into a focused first release before development begins."
  },
  {
    id: "existing-products",
    question: "Can you improve an existing product, or do you only build from scratch?",
    answer:
      "Both. We can add features, redesign key screens, connect new APIs, improve admin workflows, or stabilize an existing codebase when the technology and current condition are a sensible fit. We review the product first so the scope reflects what is actually there."
  },
  {
    id: "process",
    question: "What does your development process look like?",
    answer:
      "We start with a discovery conversation, clarify requirements, and prepare a written scope with deliverables, timing, and commercial terms. Once approved, the work moves through agreed milestones with regular updates, review points, testing, and a structured handoff."
  },
  {
    id: "timelines",
    question: "How long does a typical project take?",
    answer:
      "A focused business website may take a few weeks, while a SaaS product, mobile app, or multi-part platform usually takes longer. Complexity, integrations, feedback speed, and content readiness all affect delivery, so the working timeline is confirmed after discovery."
  },
  {
    id: "pricing-payment",
    question: "How are pricing and payments handled?",
    answer:
      "Pricing is based on the agreed scope rather than a generic hourly estimate. You receive a written proposal that explains the deliverables, assumptions, payment schedule, and any third-party costs. Larger builds are usually divided into milestones so payment follows clear stages of work."
  },
  {
    id: "revisions",
    question: "How do revisions work?",
    answer:
      "The scope states how review and revision rounds will work. Included revisions are for refining the agreed deliverables; a new feature, major change in direction, or request outside the original scope is discussed and priced separately before extra work begins."
  },
  {
    id: "ownership",
    question: "Who owns the finished product and source code?",
    answer:
      "Ownership, licensing, source-code access, and handoff terms are set out in the proposal or contract for your project. Once the agreed payment and delivery conditions are met, the final files and access are provided according to those written terms."
  },
  {
    id: "post-launch",
    question: "Do you provide support after launch?",
    answer:
      "Yes. Launch support, bug-fix coverage, monitoring, maintenance, and future feature work can be included or arranged separately depending on the project. We define the post-launch window before delivery so responsibilities are clear on both sides."
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList([{ name: "Home", path: "/" }, { name: "FAQ", path: "/faq" }])) }} />
      <PageHero title={intro?.title ?? page?.title ?? "Questions about working with Opplexify"} subtitle={intro?.subtitle ?? page?.summary ?? "Straightforward answers about project fit, our software development process, timelines, pricing, revisions, ownership, and support after launch."} eyebrow="FAQ" />
      <section className="section">
        <div className="container rr-container-1650">
      <FaqList faqs={visibleFaqs} />
        </div>
      </section>
    </PublicShell>
  );
}

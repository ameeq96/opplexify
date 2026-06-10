import type { Metadata } from "next";
import { PageHero } from "../../components/site/Blocks";
import { PublicShell } from "../../components/site/PublicShell";
import { LegalDoc, type LegalSection } from "../../components/site/LegalDoc";
import { BUSINESS_MAILING_ADDRESS, COMPLIANCE_NOTE, LEGAL_NAME, seoMetadata } from "../../lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Terms of Service - Opplexify",
  description:
    "The terms governing use of Opplexify LLC's website and custom software development services.",
  path: "/terms"
});

const sections: LegalSection[] = [
  {
    heading: "1. Acceptance of these terms",
    blocks: [
      {
        type: "p",
        text: `These Terms of Service (the "Terms") govern your use of the Opplexify website and the web, mobile, SaaS, dashboard, backend API, and automation services provided by ${LEGAL_NAME}, a Wyoming-formed limited liability company (the "Services"). By accessing our website, requesting a quote, or engaging us for a project, you agree to these Terms. ${BUSINESS_MAILING_ADDRESS}.`
      }
    ]
  },
  {
    heading: "2. Our services",
    blocks: [
      {
        type: "p",
        text: "Opplexify LLC provides custom website development, SaaS platform development, dashboard and admin panel development, mobile app development, backend/API development, and automation and integration services. Services are delivered as custom project work, scoped individually for each client. Starting prices shown on the Pricing page are estimates; the final scope, deliverables, timeline, revision terms, and price are confirmed in a written quote or proposal before work begins."
      }
    ]
  },
  {
    heading: "3. Quotes, proposals, and project scope",
    blocks: [
      {
        type: "p",
        text: "Each engagement is defined by a written quote or proposal that sets out the agreed scope, deliverables, milestones, timeline, and fees. Work outside that agreed scope (\"change requests\") may require an additional quote and may affect the timeline. We will not begin chargeable work until the scope and deposit are confirmed."
      }
    ]
  },
  {
    heading: "4. Fees, payments, and deposits",
    blocks: [
      {
        type: "p",
        text: "Prices are quoted and payable in US dollars (USD) unless otherwise agreed in writing. Projects typically require an upfront deposit to reserve the start date and cover discovery and setup, with the remaining balance invoiced against agreed milestones."
      },
      {
        type: "list",
        items: [
          "The deposit is required before work begins and may be non-refundable as described in the Refund Policy.",
          "Milestone payments are due as set out in your quote or proposal.",
          "Final deliverables, source code, and handover are provided after the final invoice is paid in full.",
          "Late or missed payments may pause work and affect agreed timelines."
        ]
      },
      {
        type: "p",
        text: "Refund eligibility is governed by our Refund Policy, available at /refund-policy."
      }
    ]
  },
  {
    heading: "5. Client responsibilities",
    blocks: [
      {
        type: "p",
        text: "Timely delivery depends on your cooperation. You agree to provide accurate information and to supply content, assets, credentials, approvals, and feedback within reasonable timeframes."
      },
      {
        type: "list",
        items: [
          "Provide complete and accurate project requirements and content.",
          "Respond to requests for feedback and approvals promptly.",
          "Ensure you own or are licensed to use any materials you supply to us.",
          "Maintain the security of any accounts and credentials you control."
        ]
      }
    ]
  },
  {
    heading: "6. Intellectual property and handover",
    blocks: [
      {
        type: "p",
        text: "Upon full payment for a project, ownership of the final, paid-for deliverables created specifically for you transfers to you, subject to any third-party licenses. Until full payment is received, all work product remains the property of Opplexify LLC."
      },
      {
        type: "p",
        text: "We retain the right to reuse general knowledge, techniques, and non-client-specific components, and to display non-confidential work in our portfolio unless you ask us in writing not to. Third-party components, open-source libraries, and licensed assets remain subject to their own licenses."
      }
    ]
  },
  {
    heading: "7. Third-party services",
    blocks: [
      {
        type: "p",
        text: "Our Services may rely on third-party platforms such as hosting providers, payment processors, analytics tools, and software libraries. We are not responsible for the availability, performance, or policies of third-party services, and your use of them may be subject to their own terms."
      }
    ]
  },
  {
    heading: "8. Warranties and disclaimer",
    blocks: [
      {
        type: "p",
        text: "We perform our Services with reasonable skill and care. Except as expressly stated in your quote or proposal, the Services and website are provided \"as is\" and \"as available\" without warranties of any kind, whether express or implied, including any implied warranties of merchantability, fitness for a particular purpose, or non-infringement."
      }
    ]
  },
  {
    heading: "9. Limitation of liability",
    blocks: [
      {
        type: "p",
        text: "To the maximum extent permitted by law, Opplexify LLC will not be liable for any indirect, incidental, special, consequential, or punitive damages, or for any loss of profits, revenue, data, or goodwill. Our total aggregate liability arising out of or relating to a project will not exceed the total fees actually paid to us for that project."
      }
    ]
  },
  {
    heading: "10. Termination",
    blocks: [
      {
        type: "p",
        text: "Either party may terminate an engagement in writing. If you terminate, you remain responsible for fees for work completed up to the termination date, and the deposit remains non-refundable. We may suspend or terminate work for non-payment or material breach of these Terms."
      }
    ]
  },
  {
    heading: "11. Changes to these terms",
    blocks: [
      {
        type: "p",
        text: "We may update these Terms from time to time. The current version is always available on this page, and the \"Last updated\" date reflects the most recent change. Continued use of our website or Services after changes take effect constitutes acceptance of the revised Terms."
      }
    ]
  },
  {
    heading: "12. Governing law and disputes",
    blocks: [
      {
        type: "p",
        text: "These Terms are governed by the laws of the State of Wyoming, United States, without regard to conflict-of-law principles, unless mandatory law requires otherwise. We aim to resolve disputes informally and in good faith before either party starts a formal proceeding."
      }
    ]
  },
  {
    heading: "13. Contact us",
    blocks: [
      {
        type: "p",
        text: `If you have any questions about these Terms, contact us at admin@opplexify.com. ${COMPLIANCE_NOTE}`
      }
    ]
  }
];

export default async function TermsPage() {
  return (
    <PublicShell>
      <PageHero
        eyebrow="Legal"
        title="Terms of Service"
        subtitle="The agreement between you and Opplexify LLC when you use our website or engage our development services."
      />
      <LegalDoc lastUpdated="June 10, 2026" sections={sections} />
    </PublicShell>
  );
}

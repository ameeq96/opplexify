import type { Metadata } from "next";
import { PageHero } from "../../components/site/Blocks";
import { PublicShell } from "../../components/site/PublicShell";
import { LegalDoc, type LegalSection } from "../../components/site/LegalDoc";
import {
  APPLICABLE_PROVIDER_REFERENCE,
  BUSINESS_EMAIL,
  BUSINESS_MAILING_ADDRESS,
  FREELANCER_PAYMENT_DISCLOSURE,
  LEGAL_NAME,
  LLC_PAYMENT_DISCLOSURE,
  PAKISTAN_ADDRESS_LABEL,
  PAKISTAN_CONTACT_ADDRESS,
  PAKISTAN_SUPPORT_PHONE,
  PAYMENT_SEPARATION_DISCLOSURE,
  PROVIDER_SELECTION_DISCLOSURE,
  SAFEPAY_MERCHANT_NAME,
  SEPARATE_PERSONS_DISCLOSURE,
  seoMetadata
} from "../../lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Terms and Conditions - Opplexify",
  description:
    "The terms and conditions governing use of the Opplexify website and custom software development services.",
  path: "/terms"
});

const sections: LegalSection[] = [
  {
    heading: "1. Acceptance of these terms and business identity",
    blocks: [
      {
        type: "p",
        text: `These Terms and Conditions (the "Terms") govern use of the Opplexify website and custom website, web application, SaaS, mobile application, dashboard, backend API, and automation services offered under the Opplexify brand (the "Services"). ${LEGAL_NAME} is the US-registered owner of the Opplexify brand. ${SAFEPAY_MERCHANT_NAME} is a Pakistan-based independent freelancer and Safepay merchant. ${SEPARATE_PERSONS_DISCLOSURE} ${APPLICABLE_PROVIDER_REFERENCE} ${PROVIDER_SELECTION_DISCLOSURE} By accessing the website, requesting a quote, or engaging either provider for a project, you agree to the provisions of these Terms that apply to that interaction or engagement. ${BUSINESS_MAILING_ADDRESS}.`
      }
    ]
  },
  {
    heading: "2. Provider responsibility table",
    blocks: [
      {
        type: "table",
        caption: "Contracting, invoicing, payment, and refund responsibility",
        headers: ["Provider", "Who supplies the service", "Who issues the invoice", "Who receives payment", "Terms and refund obligations"],
        rows: [
          [
            LEGAL_NAME,
            `The custom services described in a quotation or invoice naming ${LEGAL_NAME}.`,
            LEGAL_NAME,
            `${LEGAL_NAME}, through the company payment channel stated securely on its invoice.`,
            `${LEGAL_NAME} is responsible under these Terms, the written project agreement, and the Refund Policy, and handles its own eligible refunds.`
          ],
          [
            SAFEPAY_MERCHANT_NAME,
            `The independent freelance services described in a quotation or invoice naming ${SAFEPAY_MERCHANT_NAME}.`,
            SAFEPAY_MERCHANT_NAME,
            `${SAFEPAY_MERCHANT_NAME}; Safepay is available only when he is named as service provider and merchant.`,
            `${SAFEPAY_MERCHANT_NAME} is responsible under these Terms, the written project agreement, and the Refund Policy, and handles his own eligible refunds.`
          ]
        ]
      },
      { type: "p", text: PAYMENT_SEPARATION_DISCLOSURE }
    ]
  },
  {
    heading: "3. Our services",
    blocks: [
      {
        type: "p",
        text: "Opplexify provides custom website development, SaaS platform development, dashboard and admin panel development, mobile app development, backend/API development, and automation and integration services. Services are delivered as custom project work, scoped individually for each client. Starting prices shown on the Pricing page are estimates in US dollars (USD); the final scope, deliverables, timeline, revision terms, price, currency, and contracting provider are confirmed in a written quote or proposal before work begins."
      }
    ]
  },
  {
    heading: "4. Quotes, proposals, and project scope",
    blocks: [
      {
        type: "p",
        text: "Each engagement is defined by a written quote, proposal, contract, or invoice that identifies exactly one contracting provider and sets out the agreed scope, deliverables, milestones, timeline, fees, invoice issuer, payment recipient, and available payment method. Work outside that agreed scope (\"change requests\") may require an additional quote and may affect the timeline. Chargeable work does not begin until the scope, provider, and any required deposit are confirmed."
      }
    ]
  },
  {
    heading: "5. Fees, payments, and deposits",
    blocks: [
      {
        type: "p",
        text: "Prices are quoted and payable in US dollars (USD) unless otherwise agreed in writing. Projects typically require an upfront deposit to reserve the start date and cover discovery and setup, with the remaining balance invoiced against agreed milestones."
      },
      {
        type: "list",
        items: [
          "The deposit is required before work begins. Cancellation charges and deposit refund eligibility are governed by our Cancellation, Return and Refund Policy.",
          "Milestone payments are due as set out in your quote or proposal.",
          "Final deliverables, source code, and handover are provided after the final invoice is paid in full.",
          "Late or missed payments may pause work and affect agreed timelines."
        ]
      },
      {
        type: "p",
        text: `${LLC_PAYMENT_DISCLOSURE} ${FREELANCER_PAYMENT_DISCLOSURE} ${PAYMENT_SEPARATION_DISCLOSURE} Payment-card credentials are handled by the applicable payment provider and are not stored in complete form on this website. Refund eligibility is governed by the Cancellation, Return and Refund Policy.`
      }
    ]
  },
  {
    heading: "6. Client responsibilities",
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
    heading: "7. Intellectual property and handover",
    blocks: [
      {
        type: "p",
        text: "Upon full payment for a project, ownership of the final, paid-for deliverables created specifically for you transfers to you, subject to any third-party licenses. Until full payment is received, all work product remains the property of the contracting service provider identified in your written quote, proposal, or invoice."
      },
      {
        type: "p",
        text: "We retain the right to reuse general knowledge, techniques, and non-client-specific components, and to display non-confidential work in our portfolio unless you ask us in writing not to. Third-party components, open-source libraries, and licensed assets remain subject to their own licenses."
      }
    ]
  },
  {
    heading: "8. Third-party services",
    blocks: [
      {
        type: "p",
        text: "Our Services may rely on third-party platforms such as hosting providers, payment processors, analytics tools, and software libraries. We are not responsible for the availability, performance, or policies of third-party services, and your use of them may be subject to their own terms."
      }
    ]
  },
  {
    heading: "9. Warranties and disclaimer",
    blocks: [
      {
        type: "p",
        text: "We perform our Services with reasonable skill and care. Except as expressly stated in your quote or proposal, the Services and website are provided \"as is\" and \"as available\" without warranties of any kind, whether express or implied, including any implied warranties of merchantability, fitness for a particular purpose, or non-infringement."
      }
    ]
  },
  {
    heading: "10. Limitation of liability",
    blocks: [
      {
        type: "p",
        text: "To the maximum extent permitted by law, the contracting service provider identified in the applicable written quote, proposal, or invoice will not be liable for any indirect, incidental, special, consequential, or punitive damages, or for any loss of profits, revenue, data, or goodwill. Our total aggregate liability arising out of or relating to a project will not exceed the total fees actually paid to us for that project."
      }
    ]
  },
  {
    heading: "11. Termination",
    blocks: [
      {
        type: "p",
        text: "Either party may terminate an engagement in writing. If you terminate, you remain responsible for fees for completed and in-progress work and for any non-recoverable third-party costs up to the termination date. Cancellation charges and any deposit refund are determined under our Cancellation, Return and Refund Policy. We may suspend or terminate work for non-payment or material breach of these Terms."
      }
    ]
  },
  {
    heading: "12. Changes to these terms",
    blocks: [
      {
        type: "p",
        text: "We may update these Terms from time to time. The current version is always available on this page, and the \"Last updated\" date reflects the most recent change. Continued use of our website or Services after changes take effect constitutes acceptance of the revised Terms."
      }
    ]
  },
  {
    heading: "13. Governing law and disputes",
    blocks: [
      {
        type: "p",
        text: "The written quotation, proposal, or contract may identify the governing law and dispute forum for the engagement. Any mandatory law or non-waivable consumer right that applies to the customer or the contracting provider remains unaffected. The customer and contracting provider should first try to resolve a dispute informally and in good faith."
      }
    ]
  },
  {
    heading: "14. Contact us",
    blocks: [
      {
        type: "p",
        text: `For general website questions, contact ${BUSINESS_EMAIL}. Questions about a specific engagement should be sent to the contracting provider identified on the quotation or invoice. ${SAFEPAY_MERCHANT_NAME} can also be contacted at ${PAKISTAN_SUPPORT_PHONE}; ${PAKISTAN_ADDRESS_LABEL}: ${PAKISTAN_CONTACT_ADDRESS}.`
      }
    ]
  }
];

export default async function TermsPage() {
  return (
    <PublicShell>
      <PageHero
        eyebrow="Legal"
        title="Terms and Conditions"
        subtitle="The agreement that applies when you use our website or engage our custom software development services."
      />
      <LegalDoc lastUpdated="September 20, 2026" sections={sections} />
    </PublicShell>
  );
}

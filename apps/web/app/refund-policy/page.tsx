import type { Metadata } from "next";
import { PageHero } from "../../components/site/Blocks";
import { PublicShell } from "../../components/site/PublicShell";
import { LegalDoc, type LegalSection } from "../../components/site/LegalDoc";
import {
  APPLICABLE_PROVIDER_REFERENCE,
  BUSINESS_EMAIL,
  LEGAL_NAME,
  PAKISTAN_ADDRESS_LABEL,
  PAKISTAN_CONTACT_ADDRESS,
  PAKISTAN_SUPPORT_PHONE,
  PAYMENT_SEPARATION_DISCLOSURE,
  PROVIDER_SELECTION_DISCLOSURE,
  SAFEPAY_MERCHANT_NAME,
  seoMetadata
} from "../../lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Cancellation, Return and Refund Policy - Opplexify",
  description:
    "Cancellation, return, exchange, complaint, digital delivery, and refund terms for Opplexify custom software development services.",
  path: "/refund-policy"
});

const sections: LegalSection[] = [
  {
    heading: "1. Overview",
    blocks: [
      {
        type: "p",
        text: `This policy covers custom, project-based software development engagements contracted with either ${LEGAL_NAME} or ${SAFEPAY_MERCHANT_NAME}. ${APPLICABLE_PROVIDER_REFERENCE} ${PROVIDER_SELECTION_DISCLOSURE} Because each project is scoped for a specific client, this policy explains digital delivery, cancellations, returns, exchanges, complaints, and refunds. It should be read together with the Terms and Conditions and the applicable written quotation, proposal, contract, or invoice.`
      }
    ]
  },
  {
    heading: "2. Which provider handles a refund",
    blocks: [
      {
        type: "table",
        caption: "Refund responsibility by contracting provider",
        headers: ["Contracting provider", "Payment recipient", "Refund responsibility"],
        rows: [
          [
            LEGAL_NAME,
            `${LEGAL_NAME}, through the company payment channel stated on its invoice.`,
            `${LEGAL_NAME} reviews and issues any eligible refund for its own engagement, through the original payment method where possible.`
          ],
          [
            SAFEPAY_MERCHANT_NAME,
            `${SAFEPAY_MERCHANT_NAME}, using Safepay only when he is named as service provider and merchant.`,
            `${SAFEPAY_MERCHANT_NAME} reviews and issues any eligible refund for his own engagement, through the original payment method where possible.`
          ]
        ]
      },
      { type: "p", text: PAYMENT_SEPARATION_DISCLOSURE }
    ]
  },
  {
    heading: "3. Digital delivery and shipping",
    blocks: [
      {
        type: "p",
        text: "Opplexify provides custom digital services and electronically delivered software only. We do not ship physical goods, so physical shipping does not apply. Deliverables may be provided through a secure repository, file-transfer service, staging environment, production deployment, app distribution platform, or another electronic method agreed in writing."
      },
      {
        type: "list",
        items: [
          "The expected schedule, milestones, and delivery method are confirmed in the written quote or proposal before work begins.",
          "Typical package estimates currently range from 1 to 16 weeks, depending on the selected package, project scope, integrations, revisions, and delivery requirements.",
          "Client delays in supplying content, access, credentials, feedback, or approvals may extend delivery dates.",
          "A milestone is treated as delivered when it is made available through the agreed electronic delivery method or deployed to the agreed environment."
        ]
      }
    ]
  },
  {
    heading: "4. Cancellations and deposits",
    blocks: [
      {
        type: "p",
        text: "You may request cancellation at any time using the contact details on your quotation or invoice. To avoid charges for the next project milestone, the request must be received before that milestone begins. Most projects begin with an upfront deposit that reserves the start date and covers discovery, planning, setup, scheduling, and administration."
      },
      {
        type: "list",
        items: [
          "If a cancellation request is received before chargeable work has started, the unused payment amount is refundable after deducting documented discovery, planning, administrative, and non-recoverable third-party costs.",
          "After work starts, completed and in-progress work and non-recoverable third-party costs remain payable.",
          "Unstarted milestones that have not been invoiced are not charged if cancellation is received before they begin.",
          "If a milestone is partly complete at cancellation, we may retain or invoice the reasonable value of work performed up to the cancellation date.",
          "Any remaining eligible amount will be handled under the refund process described below."
        ]
      }
    ]
  },
  {
    heading: "5. Milestone-based payments",
    blocks: [
      {
        type: "p",
        text: "Larger projects are invoiced in milestones, as set out in the written quote, proposal, or contract. Each milestone payment covers a defined stage of work."
      },
      {
        type: "list",
        items: [
          "Payments for completed, approved, accepted, or delivered milestones are non-refundable except where the delivered work materially differs from the approved written scope and cannot reasonably be corrected.",
          "Work that is in progress at the time of cancellation is chargeable for the effort already performed.",
          "Requests outside the agreed scope may require a new estimate or change order.",
          "Final files, production deployment, source code, or handover materials may be withheld until the final invoice is paid."
        ]
      }
    ]
  },
  {
    heading: "6. Returns, exchanges, and service dissatisfaction",
    blocks: [
      {
        type: "p",
        text: "Because the deliverables are digital and custom-made, physical returns and exchanges do not apply. A client who believes a delivered milestone materially differs from the approved written scope should notify the contracting provider promptly, within any notice period stated in the project agreement or required by applicable law."
      },
      {
        type: "list",
        items: [
          "We will assess the reported issue and, where the work materially differs from the approved scope, correct or re-perform the affected work within the agreed scope at no additional charge.",
          "The client must provide reasonable information, access, and cooperation needed to reproduce and assess the issue.",
          "If a confirmed material issue cannot reasonably be corrected or re-performed, we will approve an appropriate refund for the eligible undelivered or unusable portion of the affected milestone.",
          "Preference changes, new requirements, or requests outside the approved scope are handled as revisions or change requests and are not treated as defects."
        ]
      }
    ]
  },
  {
    heading: "7. What is not refundable",
    blocks: [
      {
        type: "list",
        items: [
          "Work that has already been completed, approved, accepted, or delivered in accordance with the approved written scope.",
          "Completed or in-progress work at the time of cancellation.",
          "Third-party costs we have paid on your behalf (for example domains, licenses, hosting, or paid plugins).",
          "Change requests or additional scope that has already been delivered.",
          "Delays or additional work caused by missing client content, credentials, access, feedback, or approvals.",
          "Change-of-mind requests where the delivered work matches the approved written scope."
        ]
      }
    ]
  },
  {
    heading: "8. Complaints, cancellations, and refund requests",
    blocks: [
      {
        type: "p",
        text: "Contact the provider named on your quotation or invoice with your full name, project or invoice reference, a clear description of the issue, relevant supporting material, and the resolution you are requesting. That provider will acknowledge and assess the request within a reasonable period. If additional information or a payment-provider investigation is required, the responsible provider will explain the delay and provide an updated timeframe."
      }
    ]
  },
  {
    heading: "9. Refund processing",
    blocks: [
      {
        type: "p",
        text: `Where a refund is approved, the original contracting provider will submit it through the original payment method where possible and provide confirmation. For an engagement with ${SAFEPAY_MERCHANT_NAME}, Safepay and its processing partners may require additional processing time before the amount appears in the customer's account. For an engagement with ${LEGAL_NAME}, the company payment channel and receiving financial institution may also require processing time. Any mandatory refund deadline under applicable law remains unaffected.`
      }
    ]
  },
  {
    heading: "10. Disputes, chargebacks, and consumer rights",
    blocks: [
      {
        type: "p",
        text: "If you are unhappy with any part of your project, contact the contracting provider first so that provider can assess and try to resolve the concern. Filing a payment dispute or chargeback before contacting the responsible provider can delay resolution. Nothing in this policy limits any non-waivable statutory consumer rights or rights available under applicable payment-network rules."
      }
    ]
  },
  {
    heading: "11. Changes to this policy",
    blocks: [
      {
        type: "p",
        text: "We may update this Cancellation, Return and Refund Policy from time to time. The current version is always available on this page, and the \"Last updated\" date reflects the most recent change. The policy in effect at the time you engage us applies to your project."
      }
    ]
  },
  {
    heading: "12. Contact us",
    blocks: [
      {
        type: "p",
        text: `For a project-specific request, use the contact details supplied by the provider named on the quotation or invoice. General website enquiries may be sent to ${BUSINESS_EMAIL}. ${SAFEPAY_MERCHANT_NAME} can also be contacted at ${PAKISTAN_SUPPORT_PHONE}; ${PAKISTAN_ADDRESS_LABEL}: ${PAKISTAN_CONTACT_ADDRESS}.`
      }
    ]
  }
];

export default async function RefundPolicyPage() {
  return (
    <PublicShell>
      <PageHero
        eyebrow="Legal"
        title="Cancellation, Return and Refund Policy"
        subtitle="How digital delivery, complaints, cancellations, returns, exchanges, and refunds work for our custom services."
      />
      <LegalDoc lastUpdated="September 20, 2026" sections={sections} />
    </PublicShell>
  );
}

import type { Metadata } from "next";
import { PageHero } from "../../components/site/Blocks";
import { PublicShell } from "../../components/site/PublicShell";
import { LegalDoc, type LegalSection } from "../../components/site/LegalDoc";
import {
  PAKISTAN_BUSINESS_OPERATING_ADDRESS,
  PAKISTAN_SUPPORT_PHONE,
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
        text: `${SAFEPAY_MERCHANT_NAME}, an independent freelancer operating under the Opplexify name, provides custom, project-based software development services and is the merchant for payments processed through Safepay. Pakistan business operating address: ${PAKISTAN_BUSINESS_OPERATING_ADDRESS}. Because each project is scoped and performed for a specific client, this policy explains our digital delivery, cancellation, return, exchange, complaint, and refund terms. It should be read together with our Terms and Conditions.`
      }
    ]
  },
  {
    heading: "2. Digital delivery and shipping",
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
    heading: "3. Cancellations and deposits",
    blocks: [
      {
        type: "p",
        text: `You may request cancellation at any time by emailing admin@opplexify.com or contacting ${PAKISTAN_SUPPORT_PHONE}. To avoid charges for the next project milestone, the request must be received before that milestone begins. Most projects begin with an upfront deposit that reserves the start date and covers discovery, planning, setup, scheduling, and administration.`
      },
      {
        type: "list",
        items: [
          "If a cancellation request is received before chargeable work has started, the unused payment amount is refundable after deducting documented discovery, planning, administrative, and non-recoverable third-party costs.",
          "After work starts, completed and in-progress work and non-recoverable third-party costs remain payable.",
          "Unstarted milestones that have not been invoiced are not charged if cancellation is received before they begin.",
          "If a milestone is partly complete at cancellation, we may retain or invoice the reasonable value of work performed up to the cancellation date.",
          "Any remaining eligible amount will be handled under the refund-processing timeframe below."
        ]
      }
    ]
  },
  {
    heading: "4. Milestone-based payments",
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
    heading: "5. Returns, exchanges, and service dissatisfaction",
    blocks: [
      {
        type: "p",
        text: "Because our deliverables are digital and custom-made, physical returns and exchanges do not apply. A client who believes a delivered milestone materially differs from the approved written scope must notify us within 7 calendar days of delivery."
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
    heading: "6. What is not refundable",
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
    heading: "7. Complaints, cancellations, and refund requests",
    blocks: [
      {
        type: "p",
        text: `Email admin@opplexify.com or contact ${PAKISTAN_SUPPORT_PHONE} with your full name, project or invoice reference, a clear description of the issue, relevant supporting material, and the resolution you are requesting. We will acknowledge the complaint or request within 2 business days and provide a resolution or proposed solution within 10 business days. If additional information or a third-party investigation is required, we will explain the reason for any delay and provide an updated timeframe.`
      }
    ]
  },
  {
    heading: "8. Refund processing",
    blocks: [
      {
        type: "p",
        text: "Where a refund is approved, we will submit it to the original payment method within 10 business days after approval. Safepay, the card network, and the receiving bank may require additional processing time before the amount appears in the customer's account. We will provide confirmation when the refund has been submitted."
      }
    ]
  },
  {
    heading: "9. Disputes, chargebacks, and consumer rights",
    blocks: [
      {
        type: "p",
        text: "If you are unhappy with any part of your project, please contact us first so we can assess and try to resolve the concern. Filing a payment dispute or chargeback before contacting us can delay resolution. Nothing in this policy limits any non-waivable statutory consumer rights or any rights available under applicable payment-network rules."
      }
    ]
  },
  {
    heading: "10. Changes to this policy",
    blocks: [
      {
        type: "p",
        text: "We may update this Cancellation, Return and Refund Policy from time to time. The current version is always available on this page, and the \"Last updated\" date reflects the most recent change. The policy in effect at the time you engage us applies to your project."
      }
    ]
  },
  {
    heading: "11. Contact us",
    blocks: [
      {
        type: "p",
        text: `For questions, complaints, cancellations, or refund requests, contact admin@opplexify.com or ${PAKISTAN_SUPPORT_PHONE}. Pakistan business operating address: ${PAKISTAN_BUSINESS_OPERATING_ADDRESS}.`
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
      <LegalDoc lastUpdated="September 16, 2026" sections={sections} />
    </PublicShell>
  );
}

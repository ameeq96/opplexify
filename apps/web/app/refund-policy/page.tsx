import type { Metadata } from "next";
import { PageHero } from "../../components/site/Blocks";
import { PublicShell } from "../../components/site/PublicShell";
import { LegalDoc, type LegalSection } from "../../components/site/LegalDoc";
import { BUSINESS_MAILING_ADDRESS, COMPLIANCE_NOTE, LEGAL_NAME, seoMetadata } from "../../lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Refund Policy - Opplexify",
  description:
    "Opplexify LLC's refund policy for custom website, SaaS, mobile app, dashboard, backend API, and automation projects.",
  path: "/refund-policy"
});

const sections: LegalSection[] = [
  {
    heading: "1. Overview",
    blocks: [
      {
        type: "p",
        text: `${LEGAL_NAME} provides custom, project-based software development services. Because each project is scoped and performed for a specific client, this Refund Policy explains when payments are and are not refundable. By engaging our services and paying a deposit or invoice, you agree to this policy. It should be read together with our Terms of Service. ${BUSINESS_MAILING_ADDRESS}.`
      }
    ]
  },
  {
    heading: "2. Deposits are non-refundable",
    blocks: [
      {
        type: "p",
        text: "Most projects begin with an upfront deposit. The deposit reserves your start date and covers initial discovery, planning, setup, scheduling, and administrative work."
      },
      {
        type: "list",
        items: [
          "The deposit may be non-refundable once work has been scheduled, discovery has started, or project setup has begun.",
          "If you cancel before any work has begun, we may, at our discretion, refund part of the deposit after deducting time already spent on discovery and planning.",
          "The deposit is applied toward the total project fee."
        ]
      }
    ]
  },
  {
    heading: "3. Milestone-based payments",
    blocks: [
      {
        type: "p",
        text: "Larger projects are invoiced in milestones, as set out in your quote, proposal, or contract. Each milestone payment covers a defined stage of work."
      },
      {
        type: "list",
        items: [
          "Payments for completed, approved, or delivered milestones are non-refundable.",
          "Work that is in progress at the time of cancellation is chargeable for the effort already performed.",
          "Any unstarted milestones that have not yet been invoiced are not charged if you cancel before they begin.",
          "If a milestone is partly complete at cancellation, we may invoice for the reasonable value of work performed up to that date."
        ]
      }
    ]
  },
  {
    heading: "4. Revisions and delivery terms",
    blocks: [
      {
        type: "p",
        text: "Revision terms are defined in the written proposal or scope. Included revision rounds are intended to refine agreed deliverables, not to add new features or change the approved scope."
      },
      {
        type: "list",
        items: [
          "Requests outside the agreed scope may require a new estimate or change order.",
          "Final files, production deployment, source code, or handover materials may be withheld until the final invoice is paid.",
          "Delays caused by missing client content, approvals, credentials, or feedback may affect delivery dates."
        ]
      }
    ]
  },
  {
    heading: "5. What is not refundable",
    blocks: [
      {
        type: "list",
        items: [
          "Work that has already been completed, delivered, or is in progress.",
          "Deposits, once a project is scheduled or started.",
          "Third-party costs we have paid on your behalf (for example domains, licenses, hosting, or paid plugins).",
          "Change requests or additional scope that has already been delivered."
        ]
      }
    ]
  },
  {
    heading: "6. How to request a refund or cancellation",
    blocks: [
      {
        type: "p",
        text: "If you wish to cancel a project or request consideration of a refund, email admin@opplexify.com with your project details and the reason for your request. We will review each request individually and in good faith, assess the work completed to date, and respond within a reasonable time."
      }
    ]
  },
  {
    heading: "7. Disputes and chargebacks",
    blocks: [
      {
        type: "p",
        text: "If you are unhappy with any part of your project, please contact us first. We are committed to resolving concerns fairly and will work with you to find a reasonable solution. Filing a payment dispute or chargeback before contacting us can delay resolution; we ask that you raise any issue with us directly so we have the opportunity to address it."
      }
    ]
  },
  {
    heading: "8. Refund processing",
    blocks: [
      {
        type: "p",
        text: "Where a refund is approved, it will be issued using the original payment method where possible. Once processed, refunds are typically completed within a reasonable period, subject to the timelines of our payment processor and your bank."
      }
    ]
  },
  {
    heading: "9. Changes to this policy",
    blocks: [
      {
        type: "p",
        text: "We may update this Refund Policy from time to time. The current version is always available on this page, and the \"Last updated\" date reflects the most recent change. The policy in effect at the time you engage us applies to your project."
      }
    ]
  },
  {
    heading: "10. Contact us",
    blocks: [
      {
        type: "p",
        text: `If you have any questions about this Refund Policy, contact us at admin@opplexify.com. ${COMPLIANCE_NOTE}`
      }
    ]
  }
];

export default async function RefundPolicyPage() {
  return (
    <PublicShell>
      <PageHero
        eyebrow="Legal"
        title="Refund Policy"
        subtitle="How refunds, deposits, and cancellations work for our custom, project-based development services."
      />
      <LegalDoc lastUpdated="June 10, 2026" sections={sections} />
    </PublicShell>
  );
}

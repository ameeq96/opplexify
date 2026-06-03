import type { Metadata } from "next";
import { PageHero } from "../../components/site/Blocks";
import { PublicShell } from "../../components/site/PublicShell";
import { LegalDoc, type LegalSection } from "../../components/site/LegalDoc";
import { seoMetadata } from "../../lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Refund Policy - Opplexify",
  description:
    "Opplexify's refund policy for custom, project-based web, app, and SaaS development work, including deposits and milestone payments.",
  path: "/refund-policy"
});

const sections: LegalSection[] = [
  {
    heading: "1. Overview",
    blocks: [
      {
        type: "p",
        text: "Opplexify provides custom, project-based development services. Because each project is bespoke work performed specifically for a client, this Refund Policy explains when payments are and are not refundable. By engaging our services and paying a deposit or invoice, you agree to this policy. It should be read together with our Terms of Service."
      }
    ]
  },
  {
    heading: "2. Deposits are non-refundable",
    blocks: [
      {
        type: "p",
        text: "Most projects begin with an upfront deposit. The deposit reserves your start date in our schedule and covers the initial discovery, planning, and setup work we carry out before development begins."
      },
      {
        type: "list",
        items: [
          "The deposit is non-refundable once work has been scheduled or started.",
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
        text: "Larger projects are invoiced in milestones, as set out in your quote or proposal. Each milestone payment covers a defined stage of completed work."
      },
      {
        type: "list",
        items: [
          "Payments for completed and delivered milestones are non-refundable.",
          "Work that is in progress at the time of cancellation is chargeable for the effort already performed.",
          "Any unstarted milestones that have not yet been invoiced are not charged if you cancel before they begin."
        ]
      }
    ]
  },
  {
    heading: "4. What is not refundable",
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
    heading: "5. How to request a refund or cancellation",
    blocks: [
      {
        type: "p",
        text: "If you wish to cancel a project or request consideration of a refund, email us at hello@opplexify.com with your project details and the reason for your request. We will review each request individually and in good faith, assess the work completed to date, and respond promptly."
      }
    ]
  },
  {
    heading: "6. Disputes and chargebacks",
    blocks: [
      {
        type: "p",
        text: "If you are unhappy with any part of your project, please contact us first. We are committed to resolving concerns fairly and will work with you to find a reasonable solution. Filing a payment dispute or chargeback before contacting us can delay resolution; we ask that you raise any issue with us directly so we have the opportunity to address it."
      }
    ]
  },
  {
    heading: "7. Refund processing",
    blocks: [
      {
        type: "p",
        text: "Where a refund is approved, it will be issued using the original payment method where possible. Once processed, refunds are typically completed within a reasonable period, subject to the timelines of our payment processor and your bank."
      }
    ]
  },
  {
    heading: "8. Changes to this policy",
    blocks: [
      {
        type: "p",
        text: "We may update this Refund Policy from time to time. The current version is always available on this page, and the \"Last updated\" date reflects the most recent change. The policy in effect at the time you engage us applies to your project."
      }
    ]
  },
  {
    heading: "9. Contact us",
    blocks: [
      {
        type: "p",
        text: "If you have any questions about this Refund Policy, contact us at hello@opplexify.com."
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
      <LegalDoc lastUpdated="June 3, 2026" sections={sections} />
    </PublicShell>
  );
}

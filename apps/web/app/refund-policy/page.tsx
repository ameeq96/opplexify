import type { Metadata } from "next";
import { opplexifyCompany } from "@adon/shared";
import { PageHero } from "../../components/site/Blocks";
import { PublicShell } from "../../components/site/PublicShell";
import { LegalDoc, type LegalSection } from "../../components/site/LegalDoc";
import { seoMetadata } from "../../lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Refund Policy - Opplexify LLC",
  description:
    "Refund, deposit, milestone, revision, cancellation, completed work, and delivery terms for Opplexify LLC custom software services.",
  path: "/refund-policy"
});

const sections: LegalSection[] = [
  {
    heading: "1. Overview",
    blocks: [
      {
        type: "p",
        text: "Opplexify LLC provides custom, project-based software development services. Because custom work is planned and built for a specific client, refunds depend on the stage of the project, the work completed, and the written proposal or contract."
      },
      {
        type: "p",
        text: `${opplexifyCompany.legalName} is a ${opplexifyCompany.legalDescription}. ${opplexifyCompany.mailingAddressLabel}: ${opplexifyCompany.mailingAddress}.`
      }
    ]
  },
  {
    heading: "2. Deposits",
    blocks: [
      {
        type: "p",
        text: "A deposit may be required before work begins. Deposits reserve project time and may cover discovery, planning, setup, scheduling, and initial work."
      },
      {
        type: "list",
        items: [
          "Deposits are generally non-refundable once work has been scheduled or started.",
          "If cancellation occurs before any work begins, Opplexify LLC may review the request in good faith.",
          "Any approved refund may deduct time already spent, administrative costs, and third-party costs."
        ]
      }
    ]
  },
  {
    heading: "3. Milestone payments",
    blocks: [
      {
        type: "p",
        text: "Larger projects may be billed by milestone. Each milestone covers an agreed stage of work, such as planning, design, development, testing, deployment, or handover."
      },
      {
        type: "list",
        items: [
          "Completed milestones are non-refundable.",
          "Approved delivered work is non-refundable.",
          "Work in progress at the time of cancellation may be billed based on work performed.",
          "Unstarted milestones are not charged unless the written proposal says otherwise."
        ]
      }
    ]
  },
  {
    heading: "4. Revisions",
    blocks: [
      {
        type: "p",
        text: "Revision terms are defined in the written proposal. Revisions apply to agreed deliverables within scope. New features, major changes after approval, or changes outside the approved scope may require a separate quote."
      }
    ]
  },
  {
    heading: "5. Cancellations",
    blocks: [
      {
        type: "p",
        text: `To cancel a project or request review of a payment, email ${opplexifyCompany.email} with your name, project details, invoice reference if available, and the reason for the request. Opplexify LLC will review the request based on completed work, scheduled work, third-party costs, and the written project terms.`
      }
    ]
  },
  {
    heading: "6. Completed work and delivery",
    blocks: [
      {
        type: "p",
        text: "Final delivery may include deployment support, source files, documentation, handover notes, or access transfer depending on the written scope. Final delivery may be delayed until all agreed invoices are paid."
      },
      {
        type: "p",
        text: "Completed work, delivered files, approved milestones, and third-party costs are not refundable unless the written agreement states otherwise."
      }
    ]
  },
  {
    heading: "7. Third-party costs",
    blocks: [
      {
        type: "p",
        text: "Third-party costs such as hosting, domains, paid APIs, app store fees, licensed assets, plugins, tools, or external services are non-refundable once purchased or committed."
      }
    ]
  },
  {
    heading: "8. Contact",
    blocks: [
      {
        type: "p",
        text: `Refund or cancellation questions can be sent to ${opplexifyCompany.email}. ${opplexifyCompany.complianceNote}`
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
        subtitle="How deposits, milestones, revisions, cancellations, completed work, and delivery terms are handled for custom software services."
      />
      <LegalDoc lastUpdated="June 10, 2026" sections={sections} />
    </PublicShell>
  );
}

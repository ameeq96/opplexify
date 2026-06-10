import type { Metadata } from "next";
import { opplexifyCompany } from "@adon/shared";
import { PageHero } from "../../components/site/Blocks";
import { PublicShell } from "../../components/site/PublicShell";
import { LegalDoc, type LegalSection } from "../../components/site/LegalDoc";
import { seoMetadata } from "../../lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Terms of Service - Opplexify LLC",
  description: "Terms governing Opplexify LLC custom software development services and website use.",
  path: "/terms"
});

const sections: LegalSection[] = [
  {
    heading: "1. Company identity",
    blocks: [
      {
        type: "p",
        text: `${opplexifyCompany.legalName} is a ${opplexifyCompany.legalDescription}. Business email: ${opplexifyCompany.email}. Business phone: ${opplexifyCompany.phone}. ${opplexifyCompany.mailingAddressLabel}: ${opplexifyCompany.mailingAddress}.`
      }
    ]
  },
  {
    heading: "2. Acceptance of these terms",
    blocks: [
      {
        type: "p",
        text: "These Terms of Service govern your use of the Opplexify LLC website and any custom software development services you request or purchase from Opplexify LLC. By using the website, requesting a quote, approving a proposal, or paying an invoice, you agree to these terms."
      }
    ]
  },
  {
    heading: "3. Services",
    blocks: [
      {
        type: "p",
        text: "Opplexify LLC provides project-based software development services, including custom website development, SaaS platform development, dashboard and admin panel development, mobile app development, backend/API development, and automation/integration work."
      },
      {
        type: "p",
        text: "Each project is scoped individually. The final deliverables, timeline, fees, payment schedule, revision terms, and delivery terms are confirmed in a written proposal, contract, statement of work, or invoice before paid work begins."
      }
    ]
  },
  {
    heading: "4. Quotes, scope, and change requests",
    blocks: [
      {
        type: "p",
        text: "Quotes are based on the information available at the time of scoping. If project requirements change, Opplexify LLC may provide a revised quote, adjust the timeline, or treat the request as additional scope."
      },
      {
        type: "list",
        items: [
          "The client is responsible for providing accurate requirements, content, assets, credentials, and feedback.",
          "Work outside the approved scope may require written approval and additional payment.",
          "Delays in client feedback, content, access, or approvals may affect delivery dates."
        ]
      }
    ]
  },
  {
    heading: "5. Payments and milestones",
    blocks: [
      {
        type: "p",
        text: "Projects may require a deposit, milestone payments, or full payment depending on the scope. Payment terms are stated in the written proposal or invoice."
      },
      {
        type: "list",
        items: [
          "Deposits reserve project time and may cover discovery, planning, and setup work.",
          "Milestone invoices are due according to the agreed payment schedule.",
          "Opplexify LLC may pause work if an invoice is overdue.",
          "Final source files, production handover, or deployment support may depend on full payment of agreed invoices."
        ]
      }
    ]
  },
  {
    heading: "6. Revisions and approvals",
    blocks: [
      {
        type: "p",
        text: "Revision terms are defined in the project proposal. Revisions apply to agreed deliverables within the approved scope. New features, major design changes, or changes after approval may require a separate estimate."
      }
    ]
  },
  {
    heading: "7. Third-party services and costs",
    blocks: [
      {
        type: "p",
        text: "Projects may use third-party services such as hosting providers, domains, app stores, APIs, payment processors, analytics tools, software libraries, or licensed assets. Third-party costs and terms are separate unless the written proposal says otherwise."
      }
    ]
  },
  {
    heading: "8. Intellectual property",
    blocks: [
      {
        type: "p",
        text: "After full payment, the client receives rights to the final custom deliverables created specifically for that client, subject to any third-party licenses, open-source licenses, and any written exceptions in the proposal."
      },
      {
        type: "p",
        text: "Opplexify LLC may reuse general know-how, workflows, non-client-specific code patterns, and internal tools. Confidential client information will not be published without permission."
      }
    ]
  },
  {
    heading: "9. Cancellations and refunds",
    blocks: [
      {
        type: "p",
        text: "Cancellations and refunds are handled according to the Refund Policy. Deposits, completed milestones, approved delivered work, in-progress work, and third-party costs may be non-refundable."
      }
    ]
  },
  {
    heading: "10. Warranty disclaimer and limitation of liability",
    blocks: [
      {
        type: "p",
        text: "Opplexify LLC aims to provide services with reasonable care and skill. Unless a written proposal states otherwise, the website and services are provided without guarantees of specific business results, revenue, search rankings, funding, payment approval, or regulatory approval."
      },
      {
        type: "p",
        text: "To the maximum extent allowed by law, Opplexify LLC is not liable for indirect, incidental, special, consequential, or punitive damages. Total liability for a project is limited to the fees paid to Opplexify LLC for that project."
      }
    ]
  },
  {
    heading: "11. Contact",
    blocks: [
      {
        type: "p",
        text: `Questions about these terms can be sent to ${opplexifyCompany.email}. ${opplexifyCompany.complianceNote}`
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
        subtitle="The terms that apply when you use the Opplexify LLC website or engage Opplexify LLC for custom software development services."
      />
      <LegalDoc lastUpdated="June 10, 2026" sections={sections} />
    </PublicShell>
  );
}

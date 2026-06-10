import type { Metadata } from "next";
import { opplexifyCompany } from "@adon/shared";
import { PageHero } from "../../components/site/Blocks";
import { PublicShell } from "../../components/site/PublicShell";
import { LegalDoc, type LegalSection } from "../../components/site/LegalDoc";
import { seoMetadata } from "../../lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Privacy Policy - Opplexify LLC",
  description: "How Opplexify LLC collects, uses, stores, and protects information submitted through its website and services.",
  path: "/privacy"
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
    heading: "2. Information we collect",
    blocks: [
      {
        type: "p",
        text: "When you contact Opplexify LLC, request a quote, or work with us on a project, we may collect your name, email address, phone number, company name, project details, billing details, and the contents of your messages."
      },
      {
        type: "p",
        text: "The website may also collect basic technical information such as IP address, browser type, device information, pages viewed, referring website, and timestamps through server logs or analytics tools."
      }
    ]
  },
  {
    heading: "3. How we use information",
    blocks: [
      {
        type: "list",
        items: [
          "To respond to inquiries and provide quotes or proposals.",
          "To deliver project-based software development services.",
          "To prepare invoices, contracts, and project records.",
          "To operate, secure, and improve the website and services.",
          "To comply with legal, accounting, tax, or compliance requirements."
        ]
      }
    ]
  },
  {
    heading: "4. Sharing information",
    blocks: [
      {
        type: "p",
        text: "Opplexify LLC does not sell personal information. Information may be shared with service providers only as needed to operate the website, communicate with clients, process payments, host software, provide analytics, or meet legal obligations."
      }
    ]
  },
  {
    heading: "5. Cookies and analytics",
    blocks: [
      {
        type: "p",
        text: "The website may use cookies or similar technologies for basic site functionality, security, analytics, or performance measurement. You can control cookies through your browser settings."
      }
    ]
  },
  {
    heading: "6. Data retention",
    blocks: [
      {
        type: "p",
        text: "Opplexify LLC keeps information only as long as reasonably needed for business, project, accounting, legal, security, or compliance purposes. When information is no longer needed, it may be deleted or anonymized."
      }
    ]
  },
  {
    heading: "7. Security",
    blocks: [
      {
        type: "p",
        text: "Opplexify LLC uses reasonable safeguards to protect information. No online system can be guaranteed completely secure, so clients should avoid sending sensitive credentials or confidential information unless an appropriate secure method has been agreed."
      }
    ]
  },
  {
    heading: "8. Your rights",
    blocks: [
      {
        type: "p",
        text: `Depending on your location, you may have rights to access, correct, update, or delete personal information. To make a request, contact ${opplexifyCompany.email}.`
      }
    ]
  },
  {
    heading: "9. Contact",
    blocks: [
      {
        type: "p",
        text: `For privacy questions, contact ${opplexifyCompany.email}. ${opplexifyCompany.complianceNote}`
      }
    ]
  }
];

export default async function PrivacyPage() {
  return (
    <PublicShell>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle="How Opplexify LLC handles information submitted through the website and during software development projects."
      />
      <LegalDoc lastUpdated="June 10, 2026" sections={sections} />
    </PublicShell>
  );
}

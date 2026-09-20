import type { Metadata } from "next";
import { PageHero } from "../../components/site/Blocks";
import { LegalDoc, type LegalSection } from "../../components/site/LegalDoc";
import { PublicShell } from "../../components/site/PublicShell";
import {
  BUSINESS_EMAIL,
  BUSINESS_MAILING_ADDRESS,
  FOUNDER_NAME,
  LEGAL_NAME,
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
  title: "Ownership Statement - Opplexify",
  description:
    "Opplexify brand ownership, separate contracting-provider roles, merchant responsibility, and contact information.",
  path: "/ownership-statement"
});

const sections: LegalSection[] = [
  {
    heading: "1. Brand ownership",
    blocks: [
      {
        type: "p",
        text: `The Opplexify brand is owned by ${LEGAL_NAME}, a US-registered limited liability company. ${FOUNDER_NAME} is the Founder and Owner of ${LEGAL_NAME}. The website at https://opplexify.com publishes information about services offered under the Opplexify brand. ${BUSINESS_MAILING_ADDRESS}.`
      }
    ]
  },
  {
    heading: "2. Separate authorized Safepay merchant role",
    blocks: [
      {
        type: "p",
        text: `${SAFEPAY_MERCHANT_NAME} is a Pakistan-based independent freelancer and Safepay merchant who is separately authorized to use the Opplexify brand for his own identified freelance engagements. He is the contracting service provider, invoice issuer, merchant, and payment recipient only when the applicable quotation or invoice names him in those roles. ${PAKISTAN_ADDRESS_LABEL}: ${PAKISTAN_CONTACT_ADDRESS}. He is responsible for service delivery, support, complaints, cancellations, and eligible refunds for those engagements.`
      }
    ]
  },
  {
    heading: "3. Separate contracts and payments",
    blocks: [
      {
        type: "p",
        text: `${LEGAL_NAME} contracts, invoices, and receives payment for its own engagements when it is named as the provider. ${SAFEPAY_MERCHANT_NAME} contracts, invoices, and receives payment for his own independent freelance engagements when he is named as the provider and merchant. ${SEPARATE_PERSONS_DISCLOSURE} ${PROVIDER_SELECTION_DISCLOSURE} ${PAYMENT_SEPARATION_DISCLOSURE}`
      }
    ]
  },
  {
    heading: "4. Website and intellectual property",
    blocks: [
      {
        type: "p",
        text: `The Opplexify name and brand assets are owned by ${LEGAL_NAME}. Website materials may also include content licensed to ${LEGAL_NAME} or material supplied for an identified independent engagement. Client deliverables and third-party materials remain subject to the applicable written contract, open-source licenses, and third-party license terms.`
      }
    ]
  },
  {
    heading: "5. Contact information",
    blocks: [
      {
        type: "list",
        items: [
          `Website business entity: ${LEGAL_NAME}.`,
          `Founder and Owner of ${LEGAL_NAME}: ${FOUNDER_NAME}.`,
          `Safepay merchant: ${SAFEPAY_MERCHANT_NAME}, independent freelancer.`,
          `${PAKISTAN_ADDRESS_LABEL}: ${PAKISTAN_CONTACT_ADDRESS}.`,
          `Freelancer and Safepay merchant support phone: ${PAKISTAN_SUPPORT_PHONE}.`,
          `Website contact email: ${BUSINESS_EMAIL}.`
        ]
      }
    ]
  }
];

export default async function OwnershipStatementPage() {
  return (
    <PublicShell>
      <PageHero
        eyebrow="Legal"
        title="Ownership Statement"
        subtitle="Who owns the Opplexify brand and how the separate contracting and Safepay merchant roles work."
      />
      <LegalDoc lastUpdated="September 20, 2026" sections={sections} />
    </PublicShell>
  );
}

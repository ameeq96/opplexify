import type { Metadata } from "next";
import { PageHero } from "../../components/site/Blocks";
import { LegalDoc, type LegalSection } from "../../components/site/LegalDoc";
import { PublicShell } from "../../components/site/PublicShell";
import {
  BUSINESS_MAILING_ADDRESS,
  LEGAL_NAME,
  PAKISTAN_BUSINESS_OPERATING_ADDRESS,
  PAKISTAN_SUPPORT_PHONE,
  SAFEPAY_MERCHANT_NAME,
  seoMetadata
} from "../../lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Ownership Statement - Opplexify",
  description:
    "Ownership, operation, merchant responsibility, and contact information for the Opplexify website and services.",
  path: "/ownership-statement"
});

const sections: LegalSection[] = [
  {
    heading: "1. Website and brand ownership",
    blocks: [
      {
        type: "p",
        text: `The Opplexify brand and website at https://opplexify.com are owned and operated by ${LEGAL_NAME}, a Wyoming-formed limited liability company. Muhammad Emmad Khan is the Founder and Owner of ${LEGAL_NAME}. ${BUSINESS_MAILING_ADDRESS}.`
      }
    ]
  },
  {
    heading: "2. Safepay merchant responsibility",
    blocks: [
      {
        type: "p",
        text: `${SAFEPAY_MERCHANT_NAME} is the authorized Pakistan-based operator, independent freelancer, merchant, and contracting service provider for payments processed through Safepay in Pakistan. ${LEGAL_NAME} authorizes ${SAFEPAY_MERCHANT_NAME} to use the Opplexify name and website for these Pakistan-based freelance services and to accept the corresponding payments through Safepay. Pakistan business operating address: ${PAKISTAN_BUSINESS_OPERATING_ADDRESS}. ${SAFEPAY_MERCHANT_NAME} is responsible for the services sold through those transactions, customer support, digital delivery, complaints, cancellations, and eligible refunds in accordance with the published website policies and the applicable written quote, proposal, or invoice.`
      }
    ]
  },
  {
    heading: "3. Opplexify LLC",
    blocks: [
      {
        type: "p",
        text: `${LEGAL_NAME} is the contracting provider for an engagement only where it is expressly named in the applicable written quote, proposal, or invoice. Safepay transactions described on this website are contracted with ${SAFEPAY_MERCHANT_NAME}. The applicable provider is identified before the customer makes a payment.`
      }
    ]
  },
  {
    heading: "4. Website and intellectual property",
    blocks: [
      {
        type: "p",
        text: "Unless otherwise identified, the Opplexify name, website copy, original graphics, and original website materials are owned by or licensed to the applicable Opplexify business operator. Client deliverables and third-party materials remain subject to their respective written contracts, open-source licenses, and third-party license terms."
      }
    ]
  },
  {
    heading: "5. Contact and verification",
    blocks: [
      {
        type: "list",
        items: [
          `Website business entity: ${LEGAL_NAME}.`,
          `Founder and Owner of ${LEGAL_NAME}: Muhammad Emmad Khan.`,
          `Safepay merchant: ${SAFEPAY_MERCHANT_NAME}, independent freelancer.`,
          `Pakistan business operating address: ${PAKISTAN_BUSINESS_OPERATING_ADDRESS}.`,
          `Customer-support phone: ${PAKISTAN_SUPPORT_PHONE}.`,
          "Customer-support email: admin@opplexify.com."
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
        subtitle="Who owns the Opplexify website and who is responsible for Safepay transactions in Pakistan."
      />
      <LegalDoc lastUpdated="September 16, 2026" sections={sections} />
    </PublicShell>
  );
}

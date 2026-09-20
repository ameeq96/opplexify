import type { Metadata } from "next";
import { PageHero } from "../../components/site/Blocks";
import { LegalDoc, type LegalSection } from "../../components/site/LegalDoc";
import { PublicShell } from "../../components/site/PublicShell";
import {
  FREELANCER_PAYMENT_DISCLOSURE,
  LEGAL_NAME,
  LLC_PAYMENT_DISCLOSURE,
  PAYMENT_SEPARATION_DISCLOSURE,
  PROVIDER_SELECTION_DISCLOSURE,
  SAFEPAY_MERCHANT_NAME,
  seoMetadata
} from "../../lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Provider and Payment Information - Opplexify",
  description:
    `How ${LEGAL_NAME} and ${SAFEPAY_MERCHANT_NAME} identify the contracting provider, invoice issuer, payment recipient, and available payment method for an engagement.`,
  path: "/payment-information"
});

const sections: LegalSection[] = [
  {
    heading: "1. Your contracting provider",
    blocks: [
      { type: "p", text: PROVIDER_SELECTION_DISCLOSURE },
      {
        type: "p",
        text: "Check that the provider named on the quotation or invoice matches the payment recipient before you pay. If anything is unclear or inconsistent, do not pay until corrected instructions are issued."
      }
    ]
  },
  {
    heading: `2. ${LEGAL_NAME} engagements`,
    blocks: [
      { type: "p", text: LLC_PAYMENT_DISCLOSURE },
      {
        type: "list",
        items: [
          `${LEGAL_NAME} is named as the contracting service provider and invoice issuer.`,
          `Payment is made only to ${LEGAL_NAME} through the company payment instructions on that invoice.`,
          "Company banking details are not published on this website and are supplied only through appropriate invoice or payment instructions.",
          `${LEGAL_NAME} handles its own support, cancellations, and eligible refunds, using the original payment method where possible.`
        ]
      }
    ]
  },
  {
    heading: `3. ${SAFEPAY_MERCHANT_NAME} engagements`,
    blocks: [
      { type: "p", text: FREELANCER_PAYMENT_DISCLOSURE },
      {
        type: "list",
        items: [
          `${SAFEPAY_MERCHANT_NAME} is named as the contracting service provider, invoice issuer, merchant, and payment recipient.`,
          "Safepay may be offered for that engagement only after those details are shown on the quotation or invoice.",
          `Safepay must not be used to pay an invoice issued by ${LEGAL_NAME}.`,
          `${SAFEPAY_MERCHANT_NAME} handles his own support, cancellations, and eligible refunds, using the original payment method where possible.`
        ]
      }
    ]
  },
  {
    heading: "4. No payment aggregation or cross-provider collection",
    blocks: [
      { type: "p", text: PAYMENT_SEPARATION_DISCLOSURE },
      {
        type: "p",
        text: "Neither provider uses this website to collect money on behalf of the other. This website does not publish account numbers, card details, personal identification documents, or other sensitive payment credentials."
      }
    ]
  },
  {
    heading: "5. Before you pay",
    blocks: [
      {
        type: "list",
        items: [
          "Confirm the full legal name of the contracting provider.",
          "Confirm that the same provider issued the quotation or invoice.",
          "Use only the payment method stated on that document.",
          "Ask for corrected instructions before paying if the provider and payment recipient do not match."
        ]
      }
    ]
  }
];

export default function PaymentInformationPage() {
  return (
    <PublicShell>
      <PageHero
        eyebrow="Payment information"
        title="One provider and one payment path per engagement"
        subtitle="Your quotation or invoice identifies who supplies the service, who receives payment, and which payment method is available."
      />
      <LegalDoc lastUpdated="September 20, 2026" sections={sections} />
    </PublicShell>
  );
}

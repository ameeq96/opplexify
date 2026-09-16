import type { Metadata } from "next";
import { PageHero } from "../../components/site/Blocks";
import { PublicShell } from "../../components/site/PublicShell";
import { LegalDoc, type LegalSection } from "../../components/site/LegalDoc";
import {
  BUSINESS_MAILING_ADDRESS,
  LEGAL_NAME,
  PAKISTAN_BUSINESS_OPERATING_ADDRESS,
  PAKISTAN_SUPPORT_PHONE,
  SAFEPAY_MERCHANT_NAME,
  seoMetadata
} from "../../lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Privacy Policy - Opplexify",
  description:
    "How Opplexify collects, uses, shares, and protects information when you use our website or custom software development services.",
  path: "/privacy"
});

const sections: LegalSection[] = [
  {
    heading: "1. Introduction",
    blocks: [
      {
        type: "p",
        text: `This Privacy Policy explains how information is collected, used, shared, and protected when you visit the Opplexify website, request a quote, contact us, or engage our services. For general website operation and initial enquiries, the responsible business is ${LEGAL_NAME}, a Wyoming-formed limited liability company. ${BUSINESS_MAILING_ADDRESS}. For Pakistan-based freelance services and Safepay transactions, the responsible merchant and service provider is ${SAFEPAY_MERCHANT_NAME}, an independent freelancer operating from ${PAKISTAN_BUSINESS_OPERATING_ADDRESS}. References to "we", "us", or "our" mean the business responsible for the relevant website interaction or engagement.`
      }
    ]
  },
  {
    heading: "2. Information we collect",
    blocks: [
      { type: "subheading", text: "Information you provide" },
      {
        type: "p",
        text: "When you contact us, request a quote, pay for, or work with us on a project, we collect the information you choose to share, such as your name, email address, phone number, company name, billing details, and the details of your message or project. We may also receive transaction information such as the invoice or project reference, amount, currency, payment status, and processor transaction reference."
      },
      { type: "subheading", text: "Information collected automatically" },
      {
        type: "list",
        items: [
          "Basic analytics data such as pages viewed, referring site, and approximate location.",
          "Device and browser information such as browser type, operating system, and screen size.",
          "Server logs, including IP address and timestamps, used for security and diagnostics.",
          "Cookies and similar technologies (see the Cookies section below)."
        ]
      }
    ]
  },
  {
    heading: "3. How we use your information",
    blocks: [
      {
        type: "list",
        items: [
          "To respond to your enquiries and provide quotes and proposals.",
          "To deliver, manage, and support the software development services you engage us for.",
          "To process payments and maintain records of transactions and invoices.",
          "To operate, secure, and improve our website and services.",
          "To send service-related communications about your project.",
          "To comply with legal, accounting, and regulatory obligations."
        ]
      }
    ]
  },
  {
    heading: "4. Legal basis for processing",
    blocks: [
      {
        type: "p",
        text: "We process personal information where it is necessary to respond to your requests and perform a contract with you, where we have a legitimate interest in operating and improving our business, where you have given consent, and where we are required to comply with a legal obligation."
      }
    ]
  },
  {
    heading: "5. Sharing your information",
    blocks: [
      {
        type: "p",
        text: "We do not sell your personal information. We share it only with trusted third parties that help us operate our business, and only as needed to provide our services. These may include:"
      },
      {
        type: "list",
        items: [
          "Hosting and infrastructure providers that store and serve our website and applications.",
          "Payment processors that handle billing and process transactions securely.",
          "Analytics providers that help us understand how our website is used.",
          `Where an enquiry concerns Pakistan-based freelance services or a Safepay transaction, ${LEGAL_NAME} and ${SAFEPAY_MERCHANT_NAME} may share with each other the contact, project, quote, invoice, transaction-reference, and support information reasonably necessary to respond to the enquiry, provide the service, support the client, and meet payment or legal obligations.`,
          "Professional advisers and authorities where required by law."
        ]
      },
      {
        type: "p",
        text: "When you choose to pay through Safepay, Safepay and its processing partners process the payment and related transaction information under their own privacy terms. We may receive transaction status and reference information needed for invoicing, reconciliation, customer support, refunds, fraud prevention, and legal compliance. We do not store complete payment-card credentials on our servers."
      }
    ]
  },
  {
    heading: "6. Cookies and similar technologies",
    blocks: [
      {
        type: "p",
        text: "Our website may use cookies and similar technologies to remember your preferences, keep the site secure, and measure usage. You can control or disable cookies through your browser settings; doing so may affect how some parts of the site function."
      }
    ]
  },
  {
    heading: "7. Data retention",
    blocks: [
      {
        type: "p",
        text: "We retain personal information only for as long as necessary for the purposes set out in this policy, including to provide our services, maintain business and accounting records, resolve disputes, and comply with legal obligations. When information is no longer needed, we delete or anonymise it."
      }
    ]
  },
  {
    heading: "8. Data security",
    blocks: [
      {
        type: "p",
        text: "We use reasonable technical and organisational measures designed to protect your information against unauthorised access, loss, or misuse. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security."
      }
    ]
  },
  {
    heading: "9. International transfers",
    blocks: [
      {
        type: "p",
        text: "Opplexify provides remote software development services and may work with clients in different locations. The third parties we rely on may process information in different countries. Where information is transferred across borders, we take steps to ensure it remains protected in line with this policy and applicable law."
      }
    ]
  },
  {
    heading: "10. Your rights",
    blocks: [
      {
        type: "p",
        text: "Depending on your location, you may have the right to access, correct, update, or delete the personal information we hold about you, to object to or restrict certain processing, and to withdraw consent where processing is based on consent. To exercise any of these rights, contact us at admin@opplexify.com and we will respond within a reasonable time."
      }
    ]
  },
  {
    heading: "11. Children's privacy",
    blocks: [
      {
        type: "p",
        text: "Our website and services are intended for businesses and adults. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us so we can delete it."
      }
    ]
  },
  {
    heading: "12. Changes to this policy",
    blocks: [
      {
        type: "p",
        text: "We may update this Privacy Policy from time to time. The current version is always available on this page, and the \"Last updated\" date reflects the most recent change."
      }
    ]
  },
  {
    heading: "13. Contact us",
    blocks: [
      {
        type: "p",
        text: `If you have any questions or requests regarding this Privacy Policy or your personal information, contact us at admin@opplexify.com or ${PAKISTAN_SUPPORT_PHONE}. Pakistan business operating address: ${PAKISTAN_BUSINESS_OPERATING_ADDRESS}.`
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
        subtitle="How Opplexify collects, uses, shares, and protects information when you use our website and services."
      />
      <LegalDoc lastUpdated="September 16, 2026" sections={sections} />
    </PublicShell>
  );
}

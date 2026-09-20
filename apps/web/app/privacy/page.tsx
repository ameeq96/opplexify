import type { Metadata } from "next";
import { PageHero } from "../../components/site/Blocks";
import { PublicShell } from "../../components/site/PublicShell";
import { LegalDoc, type LegalSection } from "../../components/site/LegalDoc";
import {
  APPLICABLE_PROVIDER_REFERENCE,
  BUSINESS_EMAIL,
  BUSINESS_MAILING_ADDRESS,
  LEGAL_NAME,
  PAKISTAN_ADDRESS_LABEL,
  PAKISTAN_CONTACT_ADDRESS,
  PAKISTAN_SUPPORT_PHONE,
  PROVIDER_SELECTION_DISCLOSURE,
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
        text: `This Privacy Policy explains how personal information is collected, used, shared, and protected when you visit the Opplexify website, request a quote, contact the website, or engage a service provider. ${LEGAL_NAME}, the US-registered owner of the Opplexify brand, is the data controller for general website operation and initial website enquiries. ${BUSINESS_MAILING_ADDRESS}. Once an engagement is assigned, the contracting provider named on the quotation or invoice is the controller for project, contract, invoice, support, and refund information relating to that engagement. ${APPLICABLE_PROVIDER_REFERENCE} ${PROVIDER_SELECTION_DISCLOSURE}`
      }
    ]
  },
  {
    heading: "2. Who controls your information",
    blocks: [
      {
        type: "table",
        caption: "Data controller by interaction or engagement",
        headers: ["Interaction or engagement", "Data controller", "Typical responsibility"],
        rows: [
          [
            "General website use or initial website enquiry",
            LEGAL_NAME,
            "Website operation, security, analytics, and responding to the initial enquiry."
          ],
          [
            `Engagement naming ${LEGAL_NAME}`,
            LEGAL_NAME,
            "Quoting, contracting, invoicing, service delivery, support, records, and refunds for that engagement."
          ],
          [
            `Engagement naming ${SAFEPAY_MERCHANT_NAME}`,
            SAFEPAY_MERCHANT_NAME,
            "Quoting, contracting, invoicing, independent freelance service delivery, Safepay transaction support, records, and refunds for that engagement."
          ]
        ]
      },
      {
        type: "p",
        text: `${SAFEPAY_MERCHANT_NAME} is a separate Pakistan-based independent freelancer and Safepay merchant. ${PAKISTAN_ADDRESS_LABEL}: ${PAKISTAN_CONTACT_ADDRESS}. The two controllers are not interchangeable.`
      }
    ]
  },
  {
    heading: "3. Information we collect",
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
    heading: "4. How we use your information",
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
    heading: "5. Legal basis for processing",
    blocks: [
      {
        type: "p",
        text: "We process personal information where it is necessary to respond to your requests and perform a contract with you, where we have a legitimate interest in operating and improving our business, where you have given consent, and where we are required to comply with a legal obligation."
      }
    ]
  },
  {
    heading: "6. Sharing your information",
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
          "A prospective or contracting provider, but only where a project enquiry must be referred or assigned and the customer is informed of that handoff.",
          "Professional advisers and authorities where required by law."
        ]
      },
      {
        type: "p",
        text: `When Safepay is offered for an engagement naming ${SAFEPAY_MERCHANT_NAME} as service provider and merchant, Safepay and its processing partners process the payment and related transaction information under their own privacy terms. ${SAFEPAY_MERCHANT_NAME} may receive the transaction status and reference information needed for invoicing, reconciliation, support, refunds, fraud prevention, and legal compliance. Complete payment-card credentials are not stored on this website.`
      }
    ]
  },
  {
    heading: "7. Cookies and similar technologies",
    blocks: [
      {
        type: "p",
        text: "Our website may use cookies and similar technologies to remember your preferences, keep the site secure, and measure usage. You can control or disable cookies through your browser settings; doing so may affect how some parts of the site function."
      }
    ]
  },
  {
    heading: "8. Data retention",
    blocks: [
      {
        type: "p",
        text: "We retain personal information only for as long as necessary for the purposes set out in this policy, including to provide our services, maintain business and accounting records, resolve disputes, and comply with legal obligations. When information is no longer needed, we delete or anonymise it."
      }
    ]
  },
  {
    heading: "9. Data security",
    blocks: [
      {
        type: "p",
        text: "We use reasonable technical and organisational measures designed to protect your information against unauthorised access, loss, or misuse. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security."
      }
    ]
  },
  {
    heading: "10. International transfers",
    blocks: [
      {
        type: "p",
        text: "The providers offer remote software development services and may work with clients in different locations. A relevant controller's service providers may process information in different countries. Where information is transferred across borders, the responsible controller takes steps intended to protect it in line with this policy and applicable law."
      }
    ]
  },
  {
    heading: "11. Your rights",
    blocks: [
      {
        type: "p",
        text: `Depending on your location, you may have the right to access, correct, update, or delete personal information, to object to or restrict certain processing, and to withdraw consent where processing is based on consent. For engagement data, contact the provider named on your quotation or invoice. For general website data or if you are unsure which controller applies, email ${BUSINESS_EMAIL}.`
      }
    ]
  },
  {
    heading: "12. Children's privacy",
    blocks: [
      {
        type: "p",
        text: "Our website and services are intended for businesses and adults. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us so we can delete it."
      }
    ]
  },
  {
    heading: "13. Changes to this policy",
    blocks: [
      {
        type: "p",
        text: "We may update this Privacy Policy from time to time. The current version is always available on this page, and the \"Last updated\" date reflects the most recent change."
      }
    ]
  },
  {
    heading: "14. Contact us",
    blocks: [
      {
        type: "p",
        text: `For general website privacy questions, contact ${LEGAL_NAME} at ${BUSINESS_EMAIL}. For an engagement, use the contact details supplied by the provider named on your quotation or invoice. ${SAFEPAY_MERCHANT_NAME} can also be contacted at ${PAKISTAN_SUPPORT_PHONE}; ${PAKISTAN_ADDRESS_LABEL}: ${PAKISTAN_CONTACT_ADDRESS}.`
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
      <LegalDoc lastUpdated="September 20, 2026" sections={sections} />
    </PublicShell>
  );
}

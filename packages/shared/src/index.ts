export const roles = ["SUPER_ADMIN", "ADMIN", "EDITOR"] as const;
export const publishStatuses = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

export type Role = (typeof roles)[number];
export type PublishStatus = (typeof publishStatuses)[number];

export type SeoFields = {
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
};

export const BUSINESS_IDENTITY = {
  brand: {
    name: "Opplexify",
    websiteUrl: "https://opplexify.com",
    linkedinUrl: "https://www.linkedin.com/company/opplexify-llc/",
    description:
      "Opplexify builds custom software for startups and growing businesses: websites, web apps, SaaS products, dashboards, mobile apps, backend APIs, and automation."
  },
  llc: {
    legalName: "Opplexify LLC",
    founderName: "Muhammad Emmad Khan",
    descriptor: "US-registered business and owner of the Opplexify brand",
    contact: {
      email: "admin@opplexify.com",
      phone: "+1 (307) 443-5144",
      phoneTel: "+13074435144",
      addressLabel: "US mailing/registered address",
      address: "525 Randall Ave Ste 100 PMB 1203, Cheyenne, WY 82001, United States",
      postalAddress: {
        streetAddress: "525 Randall Ave Ste 100 PMB 1203",
        addressLocality: "Cheyenne",
        addressRegion: "WY",
        postalCode: "82001",
        addressCountry: "US"
      }
    }
  },
  freelancer: {
    legalName: "Muhammad Ameeq Khan",
    descriptor: "Pakistan-based independent freelancer and Safepay merchant",
    contact: {
      phone: "+923008092395",
      phoneTel: "+923008092395",
      addressLabel: "Pakistan contact address",
      address: "A Area, House no. A-67, Mohalla Malir Colony, Kala Board, Karachi East, Pakistan",
      postalAddress: {
        streetAddress: "A Area, House no. A-67, Mohalla Malir Colony, Kala Board",
        addressLocality: "Karachi East",
        addressCountry: "PK"
      }
    }
  },
  disclosures: {
    providerSelection:
      "Every engagement identifies exactly one contracting service provider in the applicable quotation or invoice before payment. That document also states the payment method available for the engagement.",
    llcPayment:
      "For Opplexify LLC engagements, Opplexify LLC issues the invoice and receives payment through the company payment channel stated securely on that invoice.",
    freelancerPayment:
      "Safepay is available only when Muhammad Ameeq Khan is named as the service provider and merchant on the applicable quotation or invoice.",
    paymentSeparation:
      "Payments are not collected or aggregated on behalf of the other provider. An Opplexify LLC invoice must not be paid to Muhammad Ameeq Khan's Safepay account, and Muhammad Ameeq Khan's invoice must not be paid to an Opplexify LLC bank account.",
    separatePersons:
      "Opplexify LLC and Muhammad Ameeq Khan are separate contracting persons and are not interchangeable.",
    applicableProviderReference:
      "In these policies, references to ‘we’, ‘us’, or ‘our’ mean only the provider responsible for the relevant website interaction or engagement and do not refer to both providers jointly."
  }
} as const;

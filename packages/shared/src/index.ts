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

export const opplexifyCompany = {
  brandName: "Opplexify",
  legalName: "Opplexify LLC",
  legalDescription: "Wyoming-formed limited liability company",
  formationState: "Wyoming",
  founderOwner: "Muhammad Emmad Khan",
  startedOn: "May 28, 2026",
  email: "admin@opplexify.com",
  phone: "+1 (307) 443-5144",
  phoneHref: "+13074435144",
  website: "https://opplexify.com",
  linkedin: "https://www.linkedin.com/company/opplexify-llc/",
  businessHours: "By appointment",
  mailingAddressLabel: "Business mailing address",
  mailingAddress: "525 Randall Ave Ste 100 PMB 1203, Cheyenne, WY 82001, United States",
  streetAddress: "525 Randall Ave Ste 100 PMB 1203",
  addressLocality: "Cheyenne",
  addressRegion: "WY",
  postalCode: "82001",
  addressCountry: "US",
  complianceNote: "For business verification or compliance inquiries, contact admin@opplexify.com.",
  description:
    "Opplexify LLC helps businesses plan, design, and build websites, SaaS platforms, dashboards, backend systems, APIs, mobile apps, and workflow automations."
} as const;

export const opplexifyServices = [
  {
    title: "Custom Website Development",
    slug: "custom-website-development",
    shortDescription:
      "Business websites, service pages, landing pages, and content-managed sites built around clear information and reliable contact paths.",
    whoFor: "Businesses that need a professional website, a stronger service presentation, or a focused launch site.",
    deliverables: ["Responsive page design", "Frontend development", "Contact form setup", "Basic technical SEO", "Launch support"],
    process: ["Scope the pages and goals", "Prepare wireframes or page structure", "Build and review the site", "Test forms, links, and mobile layout", "Deploy the approved version"],
    timeline: "1-4 weeks depending on page count, content readiness, and integrations",
    image: "/services/business-websites.webp",
    icon: "/template-assets/dark/assets/imgs/icon/icon-s-1.webp"
  },
  {
    title: "SaaS Platform Development",
    slug: "saas-platform-development",
    shortDescription:
      "Custom SaaS foundations with user accounts, product workflows, admin areas, database models, and API-connected interfaces.",
    whoFor: "Founders and businesses planning a subscription product, client portal, or internal software platform.",
    deliverables: ["Product workflow planning", "Authentication", "Role-aware screens", "Database-backed features", "Admin controls"],
    process: ["Define the MVP scope", "Map user roles and data", "Build core workflows", "Review milestones", "Prepare for launch and handover"],
    timeline: "4-12+ weeks depending on feature depth and third-party services",
    image: "/services/saas-platforms.webp",
    icon: "/template-assets/dark/assets/imgs/icon/icon-s-3.webp"
  },
  {
    title: "Dashboard & Admin Panel Development",
    slug: "dashboard-admin-panel-development",
    shortDescription:
      "Operational dashboards and admin panels for managing users, content, records, requests, reports, and internal workflows.",
    whoFor: "Teams that need a private control room for business data, content, or day-to-day operations.",
    deliverables: ["Admin interface", "Tables and filters", "Forms and validation", "Role-based access", "Reporting views"],
    process: ["Review the workflow", "Define data and permissions", "Build screens", "Connect APIs", "Test access and key actions"],
    timeline: "2-8 weeks depending on data complexity and permissions",
    image: "/services/admin-dashboards.webp",
    icon: "/template-assets/dark/assets/imgs/icon/icon-s-5.webp"
  },
  {
    title: "Mobile App Development",
    slug: "mobile-app-development",
    shortDescription:
      "Mobile app experiences connected to backend APIs, account systems, admin workflows, and launch-ready product operations.",
    whoFor: "Businesses that need a customer-facing or internal mobile app backed by real data and admin controls.",
    deliverables: ["Mobile app screens", "API integration", "Authentication flows", "Admin connection", "Release support planning"],
    process: ["Define app flows", "Design core screens", "Build app and API connections", "Test on devices", "Prepare store or private distribution steps"],
    timeline: "6-16+ weeks depending on platforms, features, and review requirements",
    image: "/services/mobile-apps.webp",
    icon: "/template-assets/dark/assets/imgs/icon/icon-s-4.webp"
  },
  {
    title: "Backend/API Development",
    slug: "backend-api-development",
    shortDescription:
      "Backend systems, REST APIs, authentication, database design, integrations, and server-side logic for websites and apps.",
    whoFor: "Projects that need reliable server-side features, structured data, secure access, or integrations.",
    deliverables: ["API routes", "Database models", "Authentication", "Validation", "Deployment-ready backend setup"],
    process: ["Define data and endpoints", "Design the database", "Build API services", "Test request and error handling", "Document handover details"],
    timeline: "2-10+ weeks depending on endpoints, data, and integration requirements",
    image: "/services/backend-systems.webp",
    icon: "/template-assets/dark/assets/imgs/icon/icon-s-2.webp"
  },
  {
    title: "Automation & Integrations",
    slug: "automation-integrations",
    shortDescription:
      "Workflow automations and integrations that connect forms, CRMs, dashboards, APIs, notifications, and business tools.",
    whoFor: "Businesses that want to reduce manual work or connect existing tools into a clearer workflow.",
    deliverables: ["Integration planning", "Automation flows", "API connections", "Notifications", "Testing and documentation"],
    process: ["Map the manual workflow", "Confirm systems and access", "Build the automation", "Test edge cases", "Document how to operate it"],
    timeline: "1-6 weeks depending on systems, access, and workflow complexity",
    image: "/services/web-applications.webp",
    icon: "/template-assets/dark/assets/imgs/icon/icon-s-2.webp"
  }
] as const;

export const opplexifyFaqs = [
  {
    question: "What services does Opplexify LLC provide?",
    answer:
      "Opplexify LLC provides custom website development, SaaS platform development, dashboard and admin panel development, mobile app development, backend/API development, and automation/integration services."
  },
  {
    question: "Is Opplexify LLC a registered US company?",
    answer:
      "Opplexify LLC is a Wyoming-formed limited liability company. The business mailing address is 525 Randall Ave Ste 100 PMB 1203, Cheyenne, WY 82001, United States."
  },
  {
    question: "Do you work with remote or international clients?",
    answer:
      "Yes. Opplexify LLC provides remote, project-based software development services for clients in different locations."
  },
  {
    question: "How does a project start?",
    answer:
      "A project usually starts with a short discovery discussion, a written scope, and a proposal that explains deliverables, milestones, pricing, and payment terms."
  },
  {
    question: "Do you provide invoices and contracts?",
    answer:
      "Yes. Opplexify LLC can provide written proposals, invoices, contracts, and milestone-based billing for custom software work."
  },
  {
    question: "How does milestone-based billing work?",
    answer:
      "For larger projects, work can be split into agreed milestones. Each milestone has defined deliverables and payment timing confirmed in the proposal or contract."
  },
  {
    question: "How do revisions work?",
    answer:
      "Revision terms are defined in the proposal. Revisions usually apply to agreed deliverables within the approved scope. New features or major scope changes may require a separate estimate."
  },
  {
    question: "How do refunds and cancellations work?",
    answer:
      "Refunds and cancellations are handled according to the Refund Policy. Deposits, completed milestones, third-party costs, and approved delivered work may be non-refundable."
  },
  {
    question: "How can business verification or compliance teams contact Opplexify LLC?",
    answer: "For business verification or compliance inquiries, contact admin@opplexify.com."
  }
] as const;

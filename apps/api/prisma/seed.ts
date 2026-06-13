import { existsSync, readdirSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { config } from "dotenv";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import * as bcrypt from "bcryptjs";
import { Prisma, PrismaClient } from "../src/generated/prisma/client";
import { databasePoolConfig } from "../src/database-url";
import { productionSeedValue } from "../src/env";

loadEnvFiles();

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(databasePoolConfig())
});

const asset = (path: string) => `/template-assets/dark/assets/imgs/${path}`;
const json = (value: unknown) => value as Prisma.InputJsonValue;
const imageExtensions = new Set([".avif", ".jpg", ".jpeg", ".png", ".webp"]);
const videoExtensions = new Set([".mp4", ".webm", ".mov"]);
const portfolioTags = ["Website", "SaaS UI", "Dashboard", "Mobile App", "Backend/API", "Automation"];
const legalName = "Opplexify LLC";
const businessEmail = "admin@opplexify.com";
const businessPhone = "+1 (307) 443-5144";
const businessMailingAddress = "Business mailing address: 525 Randall Ave Ste 100 PMB 1203, Cheyenne, WY 82001, United States";
const linkedinUrl = "https://www.linkedin.com/company/opplexify-llc/";
const companyDescription =
  "Opplexify LLC helps businesses plan, design, and build websites, SaaS platforms, dashboards, backend systems, APIs, mobile apps, and workflow automations.";

type PublicSeedAsset = {
  name: string;
  url: string;
  absolutePath: string;
  size: number;
  mimeType: string;
};

let cachedPortfolioImages: PublicSeedAsset[] | undefined;
let cachedPortfolioVideos: PublicSeedAsset[] | undefined;

function publicRoot() {
  const localPublic = join(process.cwd(), "public");
  if (existsSync(localPublic)) return localPublic;

  return join(process.cwd(), "apps", "web", "public");
}

function readPublicAssets(folder: string, extensions: Set<string>): PublicSeedAsset[] {
  const root = publicRoot();
  const absoluteFolder = join(root, folder);
  if (!existsSync(absoluteFolder)) return [];
  const encodedFolder = folder.split("/").map(encodeURIComponent).join("/");

  return readdirSync(absoluteFolder, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => extensions.has(extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((name) => {
      const absolutePath = join(absoluteFolder, name);
      return {
        name,
        absolutePath,
        size: statSync(absolutePath).size,
        mimeType: mimeTypeFor(name),
        url: `/${encodedFolder}/${encodeURIComponent(name)}`
      };
    });
}

function portfolioImages() {
  if (!cachedPortfolioImages) {
    const thumbnails = readPublicAssets("portfolio/thumbs", imageExtensions);
    cachedPortfolioImages = thumbnails.length ? thumbnails : readPublicAssets("portfolio/images", imageExtensions);
  }

  return cachedPortfolioImages;
}

function portfolioVideos() {
  cachedPortfolioVideos ??= readPublicAssets("portfolio/videos", videoExtensions);
  return cachedPortfolioVideos;
}

function portfolioImage(index: number) {
  return portfolioImages()[index]?.url ?? "/portfolio/thumbs/portfolio-001.webp";
}

function mimeTypeFor(name: string) {
  const extension = extname(name).toLowerCase();
  if (extension === ".svg") return "image/svg+xml";
  if (extension === ".png") return "image/png";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".webp") return "image/webp";
  if (extension === ".avif") return "image/avif";
  if (extension === ".webm") return "video/webm";
  if (extension === ".mov") return "video/quicktime";
  if (extension === ".mp4") return "video/mp4";
  return "application/octet-stream";
}

async function main() {
  const adminEmail = productionSeedValue("ADMIN_EMAIL", "admin@opplexify.local");
  const adminPassword = productionSeedValue("ADMIN_PASSWORD", "Admin123!");
  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: adminPasswordHash,
      role: "SUPER_ADMIN",
      deletedAt: null
    },
    create: {
      email: adminEmail,
      password: adminPasswordHash,
      name: "Opplexify Admin",
      role: "SUPER_ADMIN"
    }
  });

  await seedSettings();
  await seedMenus();

  const pages = await seedPages();
  const serviceMap = await seedServices();
  const categoryMap = await seedProjectCategories();
  await seedProjects(categoryMap);
  await seedPortfolioItems(admin.id);
  const blogCategoryMap = await seedBlogCategories();
  const tagMap = await seedTags();
  await seedPosts(blogCategoryMap, tagMap, admin.id);
  await seedTeam();
  await seedFaqs();
  await seedTestimonials();
  await seedMedia(admin.id);

  console.log(`Seed complete with ${pages.length} pages and ${serviceMap.size} services.`);
}

async function seedSettings() {
  const settings = [
    {
      key: "site",
      value: {
        title: "Opplexify",
        legalName,
        description: companyDescription,
        email: businessEmail,
        phone: businessPhone,
        address: businessMailingAddress,
        logoDark: asset("logo/opplexify-logo-dark.svg"),
        logoLight: asset("logo/opplexify-logo-light.svg"),
        favicon: asset("logo/favicon.svg")
      }
    },
    {
      key: "social",
      value: {
        linkedin: linkedinUrl
      }
    },
    {
      key: "seo",
      value: {
        defaultTitle: "Opplexify LLC - Custom Websites, SaaS Platforms & Business Software",
        defaultDescription: companyDescription,
        ogImage: portfolioImage(0),
        keywords: [
          "software development company",
          "website development services",
          "Next.js development",
          "SaaS development company",
          "mobile app development",
          "admin dashboard development",
          "NestJS backend development",
          "SEO-friendly websites"
        ]
      }
    },
    {
      key: "theme",
      value: {
        mode: "dark",
        accent: "#b6ff4a",
        secondaryAccent: "#ff6b4a",
        loaderText: "Opplexify"
      }
    },
    {
      key: "footer",
      value: {
        headline: "Custom software,",
        headlineLine2: "SaaS platform or app",
        headlineLine3: "with a clear scope",
        ctaLabel: "Request a Quote",
        text: companyDescription,
        copyright: `Copyright 2026 ${legalName}.`,
        serviceLinks: [
          { label: "Custom Websites", href: "/services" },
          { label: "SaaS Platforms", href: "/services" },
          { label: "Mobile Apps", href: "/services" },
          { label: "Backend/API Development", href: "/services" }
        ]
      }
    }
  ];

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting
    });
  }
}

async function seedMenus() {
  const header = await prisma.menu.upsert({
    where: { location: "header" },
    update: { name: "Header Navigation" },
    create: { name: "Header Navigation", location: "header" }
  });

  const footer = await prisma.menu.upsert({
    where: { location: "footer" },
    update: { name: "Footer Navigation" },
    create: { name: "Footer Navigation", location: "footer" }
  });

  await prisma.menuItem.deleteMany({ where: { menuId: { in: [header.id, footer.id] } } });

  await prisma.menuItem.createMany({
    data: [
      { menuId: header.id, label: "Home", url: "/", sortOrder: 1 },
      { menuId: header.id, label: "About", url: "/about", sortOrder: 2 },
      { menuId: header.id, label: "Portfolio", url: "/portfolio", sortOrder: 3 },
      { menuId: header.id, label: "Services", url: "/services", sortOrder: 4 },
      { menuId: header.id, label: "Contact Us", url: "/contact", sortOrder: 5 },
      { menuId: footer.id, label: "Home", url: "/", sortOrder: 1 },
      { menuId: footer.id, label: "About", url: "/about", sortOrder: 2 },
      { menuId: footer.id, label: "Portfolio", url: "/portfolio", sortOrder: 3 },
      { menuId: footer.id, label: "Services", url: "/services", sortOrder: 4 },
      { menuId: footer.id, label: "Contact Us", url: "/contact", sortOrder: 5 }
    ]
  });
}

async function seedPages() {
  const pageSeeds = [
    pageSeed("Home", "home", "home", [
      {
        key: "hero",
        type: "hero",
        title: "Custom Websites, SaaS Platforms & Business Software Development",
        subtitle: companyDescription,
        content: {
          eyebrow: "Wyoming-formed software development company",
          primaryCta: { label: "Request a Quote", href: "/contact" },
          secondaryCta: { label: "Book a Consultation", href: "/contact" },
          image: portfolioImage(0),
          headline: "Custom Websites,\nSaaS Platforms &\nBusiness Software Development",
          metaItems: [
            "Founded 2026\nWyoming limited liability company\nremote software development",
            "Business verification\ncontact\nadmin@opplexify.com"
          ]
        }
      },
      {
        key: "about-preview",
        type: "text-media",
        title: "We build practical software for businesses with clear requirements.",
        subtitle: "Who we are",
        content: {
          image: asset("gallery/gallery-s-1.webp"),
          paragraphs: [
            "Opplexify LLC is a Wyoming-formed software development company providing remote software development services for websites, SaaS platforms, dashboards, mobile apps, backend systems, APIs, and automations.",
            "Projects start with a written scope, proposal, and invoice. Delivery is planned around agreed milestones, direct communication, and client requirements."
          ],
          cta: { label: "Learn more about Opplexify", href: "/about" }
        }
      },
      {
        key: "work-showcase",
        type: "work-showcase",
        title: "recent work",
        content: {
          eyebrow: "Portfolio videos",
          cta: { label: "Browse all work", href: "/portfolio" },
          limit: 4,
          fallbackItems: [
            {
              title: "Private Website UI Sample",
              tag: "Website Design, Motion",
              date: "2026",
              href: "/portfolio",
              mediaUrl: "/portfolio/videos/portfolio-video-1.mp4"
            },
            {
              title: "Private SaaS UI Sample",
              tag: "SaaS, Product UI",
              date: "2026",
              href: "/portfolio",
              mediaUrl: "/portfolio/videos/portfolio-video-2.mp4"
            },
            {
              title: "Private Dashboard Sample",
              tag: "Dashboard, UI/UX",
              date: "2026",
              href: "/portfolio",
              mediaUrl: "/portfolio/videos/portfolio-video-3.mp4"
            },
            {
              title: "Private App Interface Sample",
              tag: "Mobile App, Web App",
              date: "2026",
              href: "/portfolio",
              mediaUrl: "/portfolio/videos/portfolio-video-4.mp4"
            }
          ]
        }
      },
      {
        key: "pricing",
        type: "pricing",
        title: "Website, SaaS, mobile app and software development pricing.",
        subtitle:
          "Starting ranges for custom software work. Final quotes depend on scope, integrations, content, revisions, and delivery requirements.",
        content: {
          eyebrow: "Pricing",
          items: [
            {
              label: "5 Page Presence",
              title: "Custom Website",
              description:
                "A focused business website with responsive pages, contact routing, basic SEO setup, and service content structure.",
              price: "$150",
              suffix: "starting",
              timeline: "1-3 weeks",
              features: ["Written scope", "Responsive pages", "Contact form", "Foundational SEO", "One revision round"],
              ctaLabel: "Request a Quote",
              href: "/contact"
            },
            {
              label: "Full-Stack App",
              title: "Complete Web Application",
              description:
                "A custom web app with database-backed workflows, authentication, dashboards, and backend API development.",
              price: "$500",
              suffix: "starting",
              timeline: "3-8 weeks",
              features: ["Project proposal", "Authentication", "User dashboard", "Backend API", "Milestone billing"],
              ctaLabel: "Request a Quote",
              href: "/contact"
            },
            {
              label: "Subscription-Ready",
              title: "Complete SaaS Solution",
              description:
                "A SaaS platform foundation with product workflows, account roles, admin controls, data models, and API architecture.",
              price: "$1,000",
              suffix: "starting",
              timeline: "6-12 weeks",
              features: ["SaaS workflows", "Admin dashboard", "Database and API", "Launch handover", "Milestone invoices"],
              ctaLabel: "Request a Quote",
              href: "/contact",
              featured: true
            },
            {
              label: "App Plus Control Room",
              title: "Mobile App with Admin Dashboard",
              description:
                "A mobile app experience connected to a backend API and admin dashboard for managing real project workflows.",
              price: "$1,500",
              suffix: "starting",
              timeline: "5-10 weeks",
              features: ["Mobile screens", "Admin dashboard", "Backend API", "Testing pass", "Revision terms"],
              ctaLabel: "Request a Quote",
              href: "/contact"
            },
            {
              label: "Complete Product Suite",
              title: "Complete Mobile App + Web App",
              description:
                "A larger scoped build with web app, mobile app, backend API, database, admin dashboard, and handover support.",
              price: "$2,000",
              suffix: "starting",
              timeline: "8-16 weeks",
              features: ["Written proposal", "Contract and invoices", "Milestone delivery", "Defined revisions", "Final handover"],
              ctaLabel: "Request a Quote",
              href: "/contact"
            }
          ]
        }
      },
      {
        key: "service-showcase",
        type: "service-showcase",
        title: "Software development services for scoped business projects",
        content: {
          mockupLabel: "Development",
          mockupCta: { label: "Explore", href: "/services" }
        }
      },
      {
        key: "team-showcase",
        type: "team-showcase",
        title: "Founder-led software development for scoped client projects",
        content: { limit: 3 }
      },
      {
        key: "stats",
        type: "stats",
        title: "Project approach",
        content: {
          items: [
            { value: "2026", label: "Wyoming LLC formation year" },
            { value: "Scope", label: "Written proposals and deliverables" },
            { value: "Milestones", label: "Project billing and delivery terms" }
          ]
        }
      },
      {
        key: "marquee",
        type: "marquee",
        title: "Custom websites / SaaS platforms / Mobile apps / Admin dashboards / Backend APIs / Automations"
      },
      {
        key: "logo-strip",
        type: "logo-strip",
        title: "Selected private client work is available upon request.",
        content: {
          logos: [
            { image: asset("brand/brand-1.webp"), lightImage: asset("brand/brand-1-light.webp"), alt: "Private software project category" },
            { image: asset("brand/brand-2.webp"), lightImage: asset("brand/brand-2-light.webp"), alt: "Private website project category" },
            { image: asset("brand/brand-3.webp"), lightImage: asset("brand/brand-3-light.webp"), alt: "Private dashboard project category" }
          ]
        }
      },
      {
        key: "capability-list",
        type: "capability-list",
        title: "Transparent scope, clear communication and maintainable systems guide each project",
        content: {
          items: [
            { category: "Frontend", text: "Next.js interfaces built for speed", year: "01" },
            { category: "Backend", text: "NestJS APIs with database structure", year: "02" },
            { category: "SEO", text: "Clean metadata, headings and internal links", year: "03" },
            { category: "Product", text: "SaaS, mobile and admin workflows", year: "04" },
            { category: "Launch", text: "Responsive, tested and production-ready builds", year: "05" }
          ]
        }
      }
    ]),
    pageSeed("About", "about", "about", [
      {
        key: "intro",
        type: "rich-text",
        title: "A Wyoming-formed software development company for scoped client projects",
        subtitle: "Opplexify LLC provides remote software development services with written scopes, milestone delivery, proposals, and invoices.",
        content: {
          body: "Opplexify LLC helps businesses plan, design, and build custom websites, SaaS platforms, dashboards, mobile apps, backend systems, APIs, and workflow automations based on client requirements.",
          image: portfolioImage(3)
        }
      }
    ]),
    pageSeed("Contact", "contact", "contact", [
      {
        key: "contact-hero",
        type: "contact",
        title: "Contact Opplexify LLC",
        subtitle:
          "Share your website, SaaS platform, mobile app, dashboard, backend API, or automation requirements. For business verification or compliance inquiries, contact admin@opplexify.com."
      },
      {
        key: "contact-info",
        type: "contact-info",
        title: "Business contact details",
        subtitle: "Use these details for project inquiries and compliance review.",
        content: {
          email: businessEmail,
          phone: businessPhone,
          address: businessMailingAddress
        }
      }
    ]),
    pageSeed("FAQ", "faq", "faq", [
      {
        key: "faq-intro",
        type: "faq",
        title: "Opplexify LLC FAQ for services, process and compliance",
        subtitle:
          "Clear answers about services, company registration, remote work, proposals, invoices, milestones, revisions, refunds, cancellations, and business verification."
      }
    ]),
    pageSeed("Services", "services", "services", [
      {
        key: "intro",
        type: "services",
        title: "Software development services for businesses",
        subtitle:
          "Custom websites, SaaS platforms, dashboards, mobile apps, backend APIs, and automation services planned around client requirements, written scopes, timelines, and milestones.",
        content: { image: "/services/services-overview.webp" }
      }
    ]),
    pageSeed("Private Project Work", "work", "work", [
      {
        key: "intro",
        type: "projects",
        title: "Selected private client work",
        subtitle:
          "Selected private client work is available upon request. Opplexify LLC does not publish client names, results, or project details unless approved."
      }
    ]),
    pageSeed("Blog", "blog", "blog", [
      {
        key: "intro",
        type: "blog",
        title: "Software development notes and project planning",
        subtitle:
          "Practical articles about websites, SaaS platforms, dashboards, mobile apps, backend APIs, automations, project scope, and delivery planning."
      }
    ]),
    pageSeed("Team", "team", "team", [
      {
        key: "intro",
        type: "team",
        title: "Founder-led software development",
        subtitle:
          "Opplexify LLC is led by Muhammad Emmad Khan and provides remote software development services for scoped client projects."
      }
    ]),
    pageSeed("Creative Agency", "creative-agency", "landing", [
      {
        key: "hero",
        type: "hero",
        title: "Creative websites with full-stack development behind them",
        subtitle: "Brand-aware website design, conversion pages, web apps, and launch systems for ambitious teams.",
        content: { image: asset("project/image-s-3.webp"), primaryCta: { label: "Explore services", href: "/services" } }
      }
    ]),
    pageSeed("Digital Agency", "digital-agency", "landing", [
      {
        key: "hero",
        type: "hero",
        title: "Digital products that grow with your business",
        subtitle: "SEO-friendly websites, SaaS products, web applications, mobile apps, and admin dashboards with measurable outcomes.",
        content: { image: asset("project/image-s-2.webp"), primaryCta: { label: "See portfolio", href: "/portfolio" } }
      }
    ]),
    pageSeed("AI Agency", "ai-agency", "landing", [
      {
        key: "hero",
        type: "hero",
        title: "AI-ready web apps and automation dashboards",
        subtitle: "Interfaces, workflows, APIs, and admin systems for teams adopting intelligent digital products.",
        content: { image: asset("project/image-s-7.webp"), primaryCta: { label: "Plan with us", href: "/contact" } }
      }
    ]),
    pageSeed("Marketing Agency", "marketing-agency", "landing", [
      {
        key: "hero",
        type: "hero",
        title: "SEO-friendly websites for leads and growth",
        subtitle: "Performance-minded landing pages, service pages, conversion flows, and website structures for search visibility.",
        content: { image: asset("project/image-s-5.webp") }
      }
    ]),
    pageSeed("Branding Agency", "branding-agency", "landing", [
      {
        key: "hero",
        type: "hero",
        title: "Brand websites with clean UX and scalable code",
        subtitle: "Visual identity, website design, UI systems, and production-ready frontend development for better conversions.",
        content: { image: asset("project/image-s-8.webp") }
      }
    ]),
    pageSeed("Design Studio", "design-studio", "landing", [
      {
        key: "hero",
        type: "hero",
        title: "UI/UX design for websites, apps and SaaS products",
        subtitle: "Interfaces, systems, dashboards, and content designed for clarity, speed, and product adoption.",
        content: { image: asset("project/image-s-6.webp") }
      }
    ]),
    pageSeed("Startup Agency", "startup-agency", "landing", [
      {
        key: "hero",
        type: "hero",
        title: "Launch startup websites, MVPs and SaaS products faster",
        subtitle: "Website, web app, admin dashboard, backend API, database, and launch support for early teams moving quickly.",
        content: { image: asset("gallery/gallery-s-1.webp") }
      }
    ]),
    pageSeed("Portfolio", "portfolio", "portfolio", [
      {
        key: "intro",
        type: "portfolio",
        title: "Private client work available upon request",
        subtitle:
          "Opplexify LLC keeps private client names, dashboards, source code, business data, and project results confidential unless a client approves public sharing. Service categories show the types of work available for review during project scoping."
      }
    ]),
    pageSeed("Agency Portfolio", "agency-portfolio", "portfolio", [
      {
        key: "intro",
        type: "portfolio",
        title: "Development case studies",
        subtitle: "Featured websites, SaaS platforms, mobile apps, dashboards, and backend systems curated from the CMS."
      }
    ]),
    pageSeed("Portfolio Minimal", "portfolio-minimal", "portfolio", [
      {
        key: "intro",
        type: "portfolio",
        title: "Minimal web development portfolio",
        subtitle: "A focused work index for website design, product UI, SaaS interfaces, mobile apps, and admin dashboards."
      }
    ]),
    ...templateVariantPages([
      "interactive-link",
      "portfolio-massonary",
      "service-2",
      "service-3",
      "service-4",
      "work-2",
      "work-3",
      "work-4",
      "work-5",
      "work-6",
      "work-7",
      "work-8",
      "full-screen-clam-slider",
      "full-screen-menu-slider",
      "modern-agency",
      "modern-agency-2",
      "agency-portfolio-2",
      "video-production"
    ])
  ];

  const archivedTemplateSlugs = [
    "creative-agency",
    "digital-agency",
    "ai-agency",
    "marketing-agency",
    "branding-agency",
    "design-studio",
    "startup-agency",
    "agency-portfolio",
    "portfolio-minimal",
    "interactive-link",
    "portfolio-massonary",
    "service-2",
    "service-3",
    "service-4",
    "work-2",
    "work-3",
    "work-4",
    "work-5",
    "work-6",
    "work-7",
    "work-8",
    "full-screen-clam-slider",
    "full-screen-menu-slider",
    "modern-agency",
    "modern-agency-2",
    "agency-portfolio-2",
    "video-production"
  ];

  await prisma.page.updateMany({
    where: {
      slug: {
        in: archivedTemplateSlugs
      }
    },
    data: { status: "ARCHIVED", deletedAt: new Date() }
  });

  const pages = [];
  for (const seed of pageSeeds.filter((seed) => !archivedTemplateSlugs.includes(seed.slug))) {
    const page = await prisma.page.upsert({
      where: { slug: seed.slug },
      update: {
        title: seed.title,
        pageType: seed.pageType,
        summary: seed.summary,
        seoTitle: seed.seoTitle,
        seoDescription: seed.seoDescription,
        ogImage: seed.ogImage,
        status: "PUBLISHED"
      },
      create: {
        title: seed.title,
        slug: seed.slug,
        pageType: seed.pageType,
        summary: seed.summary,
        seoTitle: seed.seoTitle,
        seoDescription: seed.seoDescription,
        ogImage: seed.ogImage,
        status: "PUBLISHED"
      }
    });

    await prisma.pageSection.deleteMany({ where: { pageId: page.id } });
    await prisma.pageSection.createMany({
      data: seed.sections.map((section, index) => ({
        pageId: page.id,
        key: section.key,
        type: section.type,
        title: section.title,
        subtitle: section.subtitle,
        content: json(section.content ?? {}),
        sortOrder: index + 1,
        enabled: true
      }))
    });

    pages.push(page);
  }

  return pages;
}

function pageSeed(
  title: string,
  slug: string,
  pageType: string,
  sections: Array<{
    key: string;
    type: string;
    title?: string;
    subtitle?: string;
    content?: Record<string, unknown>;
  }>
) {
  return {
    title,
    slug,
    pageType,
    summary: sections[0]?.subtitle,
    seoTitle: `${title} - Opplexify LLC`,
    seoDescription:
      sections[0]?.subtitle ??
      companyDescription,
    ogImage: portfolioImage(0),
    sections
  };
}

function templateVariantPages(slugs: string[]) {
  return slugs.map((slug, index) =>
    pageSeed(toTitle(slug), slug, "template-page", [
      {
        key: "hero",
        type: "hero",
        title: toTitle(slug),
        subtitle:
          "A CMS-managed Opplexify web development page for websites, SaaS products, mobile apps, dashboards, backend systems, and launch workflows.",
        content: {
          image: asset(`project/image-s-${(index % 7) + 2}.webp`),
          primaryCta: { label: "Edit this page", href: "/admin" }
        }
      }
    ])
  );
}

function toTitle(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function seedServices() {
  const services = [
    {
      title: "Custom Website Development",
      slug: "custom-website-development",
      shortDescription: "Responsive business websites for clear service presentation, contact routing, basic SEO setup, and launch readiness.",
      description:
        "Opplexify LLC builds custom websites for businesses that need a professional web presence, clear service pages, contact forms, basic SEO foundations, responsive layouts, and a manageable content structure. Typical deliverables can include discovery, written scope, page design, frontend development, contact form routing, metadata, testing, and launch handover. Typical timeline: 1-3 weeks depending on scope.",
      icon: asset("icon/icon-s-1.webp"),
      image: "/services/business-websites.webp",
      gallery: ["Discovery and scope", "Responsive pages", "Contact form routing", "SEO foundations", "Launch handover"],
      featured: true,
      sortOrder: 1,
      seoTitle: "Custom Website Development Service - Opplexify LLC",
      seoDescription:
        "Custom website development by Opplexify LLC for responsive business websites, service pages, contact forms, basic SEO setup, testing, and launch handover."
    },
    {
      title: "SaaS Platform Development",
      slug: "saas-platform-development",
      shortDescription: "SaaS platforms with user accounts, product workflows, admin controls, database models, and backend APIs.",
      icon: asset("icon/icon-s-2.webp"),
      image: "/services/saas-platforms.webp",
      gallery: ["Requirements planning", "Authentication", "Database models", "Admin workflows", "Milestone delivery"],
      featured: true,
      sortOrder: 2,
      description:
        "Opplexify LLC develops SaaS platforms for founders and businesses that need account-based workflows, authentication, role handling, dashboards, data models, backend APIs, and product screens. Possible deliverables include requirements planning, UI screens, database schema, API endpoints, admin panel, testing, and launch handover. Typical timeline: 6-12 weeks depending on complexity.",
      seoTitle: "SaaS Platform Development Service - Opplexify LLC",
      seoDescription:
        "SaaS platform development by Opplexify LLC for account workflows, authentication, dashboards, database models, backend APIs, and milestone-based delivery."
    },
    {
      title: "Dashboard & Admin Panel Development",
      slug: "dashboard-admin-panel-development",
      shortDescription: "Operational dashboards and admin panels for managing users, content, requests, reports, and workflows.",
      description:
        "Opplexify LLC builds dashboards and admin panels for businesses that need to manage users, content, requests, reports, orders, or internal workflows. Possible deliverables include role-based access, tables, forms, filters, charts, API integrations, permissions, and documentation. Typical timeline: 3-8 weeks depending on data and workflow complexity.",
      icon: asset("icon/icon-s-3.webp"),
      image: "/services/admin-dashboards.webp",
      gallery: ["Role-based access", "Data tables", "Forms and filters", "Reports", "API integration"],
      featured: true,
      sortOrder: 3,
      seoTitle: "Dashboard and Admin Panel Development Service - Opplexify LLC",
      seoDescription:
        "Dashboard and admin panel development by Opplexify LLC for users, content, requests, reports, orders, workflows, permissions, and API integrations."
    },
    {
      title: "Mobile App Development",
      slug: "mobile-app-development",
      shortDescription: "Mobile app interfaces connected to secure APIs, admin workflows, and backend systems when required.",
      description:
        "Opplexify LLC designs and builds mobile app experiences for customer or internal workflows, with backend API connections, admin workflows, authentication, and testing support when required. Possible deliverables include screen planning, UI implementation, API integration, admin connection, testing, and handoff. Typical timeline: 5-10 weeks depending on scope.",
      icon: asset("icon/icon-s-4.webp"),
      image: "/services/mobile-apps.webp",
      gallery: ["Mobile screens", "API connection", "Admin workflow", "Testing support", "Store-ready handoff"],
      featured: true,
      sortOrder: 4,
      seoTitle: "Mobile App Development Service - Opplexify LLC",
      seoDescription:
        "Mobile app development by Opplexify LLC for app screens, backend API connections, admin workflows, testing support, and project handoff."
    },
    {
      title: "Backend/API Development",
      slug: "backend-api-development",
      shortDescription: "Backend systems and APIs with databases, authentication, validation, documentation, and maintainable service structure.",
      description:
        "Opplexify LLC builds backend systems for applications that need secure APIs, databases, authentication, validation, file handling, documentation, and maintainable server-side logic. Possible deliverables include API design, database schema, authentication, authorization, validation, testing, and deployment support. Typical timeline: 3-8 weeks depending on requirements.",
      icon: asset("icon/icon-s-5.webp"),
      image: "/services/backend-systems.webp",
      gallery: ["API design", "Database schema", "Authentication", "Validation", "Documentation"],
      featured: true,
      sortOrder: 5,
      seoTitle: "Backend API Development Service - Opplexify LLC",
      seoDescription:
        "Backend and API development by Opplexify LLC for databases, authentication, validation, documentation, testing, and maintainable server-side systems."
    },
    {
      title: "Automation & Integrations",
      slug: "automation-integrations",
      shortDescription: "Workflow automations and integrations that connect business tools, forms, dashboards, APIs, and data processes.",
      description:
        "Opplexify LLC builds automations and integrations for businesses that need tools, forms, dashboards, APIs, or services to share data reliably. Possible deliverables include workflow mapping, API integration, data sync, admin tools, scheduled jobs, testing, and handoff notes. Typical timeline: 2-6 weeks depending on connected systems.",
      icon: asset("icon/icon-s-5.webp"),
      image: "/services/web-applications.webp",
      gallery: ["Workflow mapping", "API integrations", "Admin tools", "Data sync", "Testing and handoff"],
      featured: true,
      sortOrder: 6,
      seoTitle: "Automation and Integrations Service - Opplexify LLC",
      seoDescription:
        "Automation and integration services by Opplexify LLC for API integrations, workflow mapping, data sync, admin tools, testing, and handoff."
    }
  ];

  await prisma.service.updateMany({
    where: {
      slug: {
        in: ["web-design", "web-application-development", "product-design", "motion-content", "brand-strategy"]
      }
    },
    data: { status: "ARCHIVED", deletedAt: new Date() }
  });

  const map = new Map<string, string>();
  for (const service of services) {
    const created = await prisma.service.upsert({
      where: { slug: service.slug },
      update: { ...service, status: "PUBLISHED", ogImage: service.image },
      create: { ...service, status: "PUBLISHED", ogImage: service.image }
    });
    map.set(service.slug, created.id);
  }
  return map;
}

async function seedProjectCategories() {
  const categories = [
    { name: "Private Website Work", slug: "branding" },
    { name: "Private SaaS and Dashboard Work", slug: "web-experience" },
    { name: "Private Mobile and API Work", slug: "product" }
  ];

  const map = new Map<string, string>();
  for (const category of categories) {
    const created = await prisma.projectCategory.upsert({
      where: { slug: category.slug },
      update: category,
      create: category
    });
    map.set(category.slug, created.id);
  }
  return map;
}

async function seedProjects(categoryMap: Map<string, string>) {
  const projects = [
    {
      title: "Private Website Development Work",
      slug: "nova-identity-system",
      client: null,
      categoryId: categoryMap.get("branding"),
      location: "Remote",
      tools: "Website planning, responsive UI, contact forms, SEO foundations",
      duration: "Scoped by project",
      shortDescription:
        "Selected private client website work is available upon request.",
      description:
        "Opplexify LLC does not publish this client's name, results, or detailed project information without approval. Private website development examples can be discussed during a consultation when appropriate.",
      mainImage: portfolioImage(0),
      gallery: [portfolioImage(0), portfolioImage(3)],
      featured: true,
      sortOrder: 1,
      seoTitle: "Private Website Development Work - Opplexify LLC",
      seoDescription:
        "Private website development work by Opplexify LLC. Selected private client work is available upon request."
    },
    {
      title: "Private SaaS and Dashboard Work",
      slug: "orbit-studio-website",
      client: null,
      categoryId: categoryMap.get("web-experience"),
      location: "Remote",
      tools: "SaaS workflows, dashboard planning, backend APIs, data models",
      duration: "Scoped by project",
      shortDescription:
        "Selected private SaaS and dashboard work is available upon request.",
      description:
        "Opplexify LLC does not publish this client's name, results, or detailed project information without approval. Private SaaS and dashboard examples can be discussed during a consultation when appropriate.",
      mainImage: portfolioImage(12),
      gallery: [portfolioImage(12), portfolioImage(18)],
      featured: true,
      sortOrder: 2,
      seoTitle: "Private SaaS and Dashboard Work - Opplexify LLC",
      seoDescription:
        "Private SaaS and dashboard development work by Opplexify LLC. Selected private client work is available upon request."
    },
    {
      title: "Private Mobile App and API Work",
      slug: "pulse-product-platform",
      client: null,
      categoryId: categoryMap.get("product"),
      location: "Remote",
      tools: "Mobile screens, backend APIs, admin workflows, integrations",
      duration: "Scoped by project",
      shortDescription:
        "Selected private mobile app and API work is available upon request.",
      description:
        "Opplexify LLC does not publish this client's name, results, or detailed project information without approval. Private mobile app and API examples can be discussed during a consultation when appropriate.",
      mainImage: portfolioImage(24),
      gallery: [portfolioImage(24), portfolioImage(30)],
      featured: true,
      sortOrder: 3,
      seoTitle: "Private Mobile App and API Work - Opplexify LLC",
      seoDescription:
        "Private mobile app and API development work by Opplexify LLC. Selected private client work is available upon request."
    }
  ];

  for (const project of projects) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: { ...project, status: "PUBLISHED", date: new Date("2026-06-05"), ogImage: project.mainImage },
      create: { ...project, status: "PUBLISHED", date: new Date("2026-06-05"), ogImage: project.mainImage }
    });
  }
}

async function seedPortfolioItems(userId: string) {
  const images = portfolioImages();
  const videos = portfolioVideos();

  for (const [index, item] of images.entries()) {
    const tag = portfolioTags[index % portfolioTags.length];
    const title = `Private ${tag} category reference`;

    await prisma.portfolioItem.upsert({
      where: { mediaUrl: item.url },
      update: {
        title,
        tag,
        mediaType: "image",
        alt: title,
        featured: index < 9,
        sortOrder: index + 1,
        status: "PUBLISHED",
        deletedAt: null
      },
      create: {
        title,
        tag,
        mediaUrl: item.url,
        mediaType: "image",
        alt: title,
        featured: index < 9,
        sortOrder: index + 1,
        status: "PUBLISHED"
      }
    });

    await upsertMediaAsset(item, title, "portfolio", userId);
  }

  for (const [index, item] of videos.entries()) {
    const title = "Private interface motion reference";

    await prisma.portfolioItem.upsert({
      where: { mediaUrl: item.url },
      update: {
        title,
        tag: "Motion",
        mediaType: "video",
        alt: title,
        featured: true,
        sortOrder: images.length + index + 1,
        status: "PUBLISHED",
        deletedAt: null
      },
      create: {
        title,
        tag: "Motion",
        mediaUrl: item.url,
        mediaType: "video",
        alt: title,
        featured: true,
        sortOrder: images.length + index + 1,
        status: "PUBLISHED"
      }
    });

    await upsertMediaAsset(item, title, "portfolio", userId);
  }
}

async function seedBlogCategories() {
  const categories = [
    { name: "Web Development", slug: "insights" },
    { name: "SEO and Product Launch", slug: "process" }
  ];

  const map = new Map<string, string>();
  for (const category of categories) {
    const created = await prisma.blogCategory.upsert({
      where: { slug: category.slug },
      update: category,
      create: category
    });
    map.set(category.slug, created.id);
  }
  return map;
}

async function seedTags() {
  const tags = [
    { name: "Next.js", slug: "brand" },
    { name: "SaaS", slug: "design" },
    { name: "SEO", slug: "growth" },
    { name: "Mobile Apps", slug: "mobile-apps" },
    { name: "Admin Dashboards", slug: "admin-dashboards" },
    { name: "Backend APIs", slug: "backend-apis" }
  ];

  const map = new Map<string, string>();
  for (const tag of tags) {
    const created = await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: tag,
      create: tag
    });
    map.set(tag.slug, created.id);
  }
  return map;
}

async function seedPosts(categoryMap: Map<string, string>, tagMap: Map<string, string>, authorId: string) {
  const posts = [
    {
      title: "How to Build an SEO-Friendly Business Website That Converts",
      slug: "seo-friendly-business-website-guide",
      excerpt:
        "A practical guide to service pages, headings, metadata, internal links, page speed, and lead capture for a business website.",
      content:
        "An SEO-friendly business website starts with clear service keywords, useful page titles, descriptive headings, fast responsive layouts, internal links, optimized images, and a contact path that is easy to find. Opplexify builds website pages around search intent and conversion goals so visitors can understand the offer, compare services, and request a quote without friction.",
      featuredImage: portfolioImage(0),
      categoryId: categoryMap.get("insights"),
      tags: ["brand", "growth"],
      featured: true,
      seoTitle: "SEO-Friendly Business Website Guide - Opplexify",
      seoDescription:
        "Learn how to build an SEO-friendly business website with service keywords, page titles, headings, metadata, internal links, image optimization, speed, and lead capture."
    },
    {
      title: "What a SaaS MVP Needs Before Launch",
      slug: "saas-mvp-launch-checklist",
      excerpt:
        "The core SaaS launch checklist: authentication, database models, admin dashboards, APIs, onboarding, analytics, and SEO pages.",
      content:
        "A SaaS MVP needs more than screens. Before launch, the product should have secure authentication, role-based access, database structure, API validation, admin dashboards, billing-ready architecture, onboarding flows, marketing pages, SEO metadata, and a deployment process that supports future releases. Opplexify plans SaaS products so founders can launch quickly without creating technical debt on day one.",
      featuredImage: portfolioImage(12),
      categoryId: categoryMap.get("process"),
      tags: ["design", "admin-dashboards", "backend-apis"],
      featured: true,
      seoTitle: "SaaS MVP Launch Checklist - Web App, Admin Dashboard and Backend",
      seoDescription:
        "SaaS MVP launch checklist covering authentication, dashboards, database models, APIs, onboarding, SEO pages, billing-ready structure, and deployment planning."
    },
    {
      title: "Mobile App Development with a Backend and Admin Dashboard",
      slug: "mobile-app-development-backend-admin-dashboard",
      excerpt:
        "Why most mobile app projects need secure APIs, admin controls, notification-ready workflows, and a maintainable backend.",
      content:
        "A professional mobile app usually needs a backend API, authentication, user records, media handling, push notification readiness, admin dashboard controls, reporting, and role-based operations. Opplexify connects mobile app interfaces with backend systems so the product can be managed after launch instead of becoming a static prototype.",
      featuredImage: portfolioImage(24),
      categoryId: categoryMap.get("insights"),
      tags: ["mobile-apps", "admin-dashboards", "backend-apis"],
      featured: false,
      seoTitle: "Mobile App Development with Backend API and Admin Dashboard",
      seoDescription:
        "Learn why mobile app development needs backend APIs, admin dashboards, authentication, media handling, push notification-ready workflows, and maintainable architecture."
    }
  ];

  await prisma.blogPost.updateMany({
    where: { slug: { in: ["make-a-launch-feel-premium", "design-systems-for-small-agency-teams"] } },
    data: { status: "ARCHIVED", deletedAt: new Date() }
  });

  for (const post of posts) {
    const tagIds = post.tags.map((slug) => tagMap.get(slug)).filter(Boolean) as string[];
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        featuredImage: post.featuredImage,
        categoryId: post.categoryId,
        authorId,
        featured: post.featured,
        seoTitle: post.seoTitle,
        seoDescription: post.seoDescription,
        ogImage: post.featuredImage,
        status: "PUBLISHED",
        deletedAt: null,
        publishedAt: new Date("2026-06-01"),
        tags: { set: tagIds.map((id) => ({ id })) }
      },
      create: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        featuredImage: post.featuredImage,
        categoryId: post.categoryId,
        authorId,
        featured: post.featured,
        seoTitle: post.seoTitle,
        seoDescription: post.seoDescription,
        ogImage: post.featuredImage,
        status: "PUBLISHED",
        publishedAt: new Date("2026-06-01"),
        tags: { connect: tagIds.map((id) => ({ id })) }
      }
    });
  }
}

async function seedTeam() {
  const legacyTeamSlugs = ["maya-reeves", "leo-carter", "nora-singh", "ameeq-khan-backend", "ameeq-khan", "atiq-khan", "emmad-khan"];
  const team = [
    {
      name: "Muhammad Emmad Khan",
      slug: "muhammad-emmad-khan",
      role: "Founder and Owner",
      bio:
        "Muhammad Emmad Khan is the founder and owner of Opplexify LLC. He leads client communication, project scoping, software planning, and delivery coordination for custom websites, SaaS platforms, dashboards, mobile apps, backend APIs, and automations.",
      image: "/team/emmad-khan.webp",
      socialLinks: { linkedin: linkedinUrl },
      skills: ["Project scoping", "Software planning", "Client communication", "Milestone delivery", "Custom development"],
      sortOrder: 1,
      seoTitle: "Muhammad Emmad Khan - Founder and Owner of Opplexify LLC",
      seoDescription:
        "Muhammad Emmad Khan is the founder and owner of Opplexify LLC, a Wyoming-formed software development company."
    },
    {
      name: "Ameeq Khan",
      slug: "ameeq-khan",
      role: "Full-Stack Developer",
      bio:
        "Ameeq Khan works on frontend, backend, integrations, and implementation support for Opplexify software development projects.",
      image: "/team/ameeq-khan.webp",
      socialLinks: { linkedin: linkedinUrl },
      skills: ["Frontend development", "Backend development", "API integration", "Dashboards", "Responsive UI"],
      sortOrder: 2,
      seoTitle: "Ameeq Khan - Full-Stack Developer at Opplexify",
      seoDescription:
        "Ameeq Khan supports Opplexify software development projects across frontend, backend, dashboards, and integrations."
    },
    {
      name: "Atiq Khan",
      slug: "atiq-khan",
      role: "Project Coordinator",
      bio:
        "Atiq Khan supports project coordination, requirement tracking, QA follow-up, and delivery organization for Opplexify client work.",
      image: "/team/atiq-khan.webp",
      socialLinks: { linkedin: linkedinUrl },
      skills: ["Project coordination", "Requirements tracking", "QA follow-up", "Client support", "Delivery organization"],
      sortOrder: 3,
      seoTitle: "Atiq Khan - Project Coordinator at Opplexify",
      seoDescription:
        "Atiq Khan supports Opplexify client projects with coordination, requirement tracking, QA follow-up, and delivery organization."
    }
  ];

  await prisma.teamMember.updateMany({
    where: { slug: { in: legacyTeamSlugs } },
    data: { status: "ARCHIVED", deletedAt: new Date() }
  });

  for (const member of team) {
    await prisma.teamMember.upsert({
      where: { slug: member.slug },
      update: { ...member, status: "PUBLISHED", deletedAt: null },
      create: { ...member, status: "PUBLISHED" }
    });
  }
}

async function seedFaqs() {
  await prisma.faq.updateMany({
    where: {
      question: {
        in: [
          "Can every homepage section be edited from admin?",
          "Do services, work, blog, and team pages use API data?",
          "Can uploaded media be reused across content?"
        ]
      }
    },
    data: { isActive: false }
  });

  const faqs = [
    {
      question: "What services does Opplexify LLC provide?",
      answer:
        "Opplexify LLC provides custom website development, SaaS platform development, dashboard and admin panel development, mobile app development, backend/API development, and automation and integration services.",
      category: "Services",
      sortOrder: 1
    },
    {
      question: "Is Opplexify LLC a registered US company?",
      answer:
        "Opplexify LLC is a Wyoming-formed limited liability company. For business verification or compliance inquiries, contact admin@opplexify.com.",
      category: "Company",
      sortOrder: 2
    },
    {
      question: "Do you work with remote or international clients?",
      answer:
        "Yes. Opplexify LLC provides remote software development services and can work with businesses in different locations, subject to project fit, payment terms, and applicable requirements.",
      category: "Process",
      sortOrder: 3
    },
    {
      question: "How does a project start?",
      answer:
        "A project usually starts with a short discovery discussion, written scope, estimated timeline, and proposal. Work begins after the scope, deposit, and billing terms are confirmed.",
      category: "Process",
      sortOrder: 4
    },
    {
      question: "Do you provide invoices and contracts?",
      answer:
        "Yes. Opplexify LLC can provide written proposals, invoices, and contracts or statements of work for scoped client projects.",
      category: "Billing",
      sortOrder: 5
    },
    {
      question: "How does milestone-based billing work?",
      answer:
        "Larger projects are split into milestones. Each milestone covers a defined stage of work, and payment terms are listed in the quote, proposal, or contract.",
      category: "Billing",
      sortOrder: 6
    },
    {
      question: "How do revisions work?",
      answer:
        "Revision rounds are defined in the project scope. Included revisions refine agreed deliverables. New features, major direction changes, or extra scope may require a change order.",
      category: "Process",
      sortOrder: 7
    },
    {
      question: "How do refunds and cancellations work?",
      answer:
        "Deposits, completed milestones, work in progress, and third-party costs may be non-refundable. The Refund Policy explains deposits, milestones, revisions, cancellations, completed work, and delivery terms.",
      category: "Billing",
      sortOrder: 8
    },
    {
      question: "How can business verification or compliance teams contact Opplexify LLC?",
      answer:
        "Business verification, KYC, payment processor, or compliance teams can contact admin@opplexify.com. The business phone is +1 (307) 443-5144.",
      category: "Compliance",
      sortOrder: 9
    }
  ];

  for (const faq of faqs) {
    const existing = await prisma.faq.findFirst({ where: { question: faq.question } });
    if (existing) await prisma.faq.update({ where: { id: existing.id }, data: faq });
    else await prisma.faq.create({ data: faq });
  }
}

async function seedTestimonials() {
  await prisma.testimonial.updateMany({
    data: { isActive: false, deletedAt: new Date() }
  });
}

async function upsertMediaAsset(item: PublicSeedAsset, alt: string, folder: string, userId: string) {
  const data = {
    url: item.url,
    filename: item.name,
    originalName: item.name,
    mimeType: item.mimeType,
    size: item.size,
    alt,
    folder,
    createdById: userId
  };
  const existing = await prisma.media.findFirst({ where: { url: item.url } });
  if (existing) await prisma.media.update({ where: { id: existing.id }, data });
  else await prisma.media.create({ data });
}

async function seedMedia(userId: string) {
  const media = [
    {
      url: asset("logo/opplexify-logo-light.svg"),
      filename: "opplexify-logo-light.svg",
      originalName: "opplexify-logo-light.svg",
      mimeType: "image/svg+xml",
      size: 10603,
      alt: "Opplexify light logo",
      folder: "template",
      createdById: userId
    },
    {
      url: portfolioImage(0),
      filename: portfolioImages()[0]?.name ?? "portfolio-preview.webp",
      originalName: portfolioImages()[0]?.name ?? "portfolio-preview.webp",
      mimeType: portfolioImages()[0]?.mimeType ?? "image/png",
      size: portfolioImages()[0]?.size ?? 0,
      alt: "SEO-friendly website development portfolio image",
      folder: "portfolio",
      createdById: userId
    }
  ];

  for (const item of media) {
    const existing = await prisma.media.findFirst({ where: { url: item.url } });
    if (existing) await prisma.media.update({ where: { id: existing.id }, data: item });
    else await prisma.media.create({ data: item });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

function loadEnvFiles() {
  const candidates = [
    resolve(process.cwd(), "apps/api/.env"),
    resolve(process.cwd(), ".env"),
    resolve(process.cwd(), "../.env"),
    resolve(process.cwd(), "../../.env")
  ];

  for (const path of Array.from(new Set(candidates))) {
    if (existsSync(path)) config({ path, quiet: true });
  }
}

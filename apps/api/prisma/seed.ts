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
  "Opplexify is a custom software development company that designs and builds business websites, SaaS platforms, web and mobile apps, admin dashboards, backend APIs, and workflow automations.";

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
      name: "Opplexify Editorial Team",
      role: "SUPER_ADMIN",
      deletedAt: null
    },
    create: {
      email: adminEmail,
      password: adminPasswordHash,
      name: "Opplexify Editorial Team",
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
        logoDark: asset("logo/opplexify-logo-full.png"),
        logoLight: asset("logo/opplexify-logo-full.png"),
        favicon: asset("logo/opplexify-mark-64.webp")
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
        defaultTitle: "Custom Software Development Company | Opplexify",
        defaultDescription: companyDescription,
        ogImage: portfolioImage(0),
        keywords: [
          "custom software development company",
          "custom software development services",
          "custom web application development",
          "SaaS development services",
          "business website development",
          "mobile app development services",
          "admin dashboard development",
          "backend API development",
          "workflow automation services",
          "API integration services"
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
        headline: "Build the software",
        headlineLine2: "your business",
        headlineLine3: "actually needs",
        ctaLabel: "Discuss Your Project",
        text: "From a focused business website to a full SaaS product, Opplexify turns clear goals into reliable, maintainable software.",
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
        title: "Custom Software Built Around Your Business",
        subtitle: companyDescription,
        content: {
          eyebrow: "Custom software development for growing businesses",
          primaryCta: { label: "Discuss Your Project", href: "/contact" },
          secondaryCta: { label: "Explore Our Services", href: "/services" },
          image: portfolioImage(0),
          headline: "Custom Software\nBuilt Around\nYour Business",
          metaItems: [
            "Websites & web apps\nSaaS platforms\nmobile products",
            "Dashboards & APIs\nWorkflow automation\nproduct delivery"
          ]
        }
      },
      {
        key: "about-preview",
        type: "text-media",
        title: "A focused development team for meaningful product work.",
        subtitle: "How we work",
        content: {
          image: asset("gallery/gallery-s-1.webp"),
          paragraphs: [
            "Opplexify partners with founders and growing teams to turn business goals into useful digital products. We build custom websites, SaaS platforms, dashboards, mobile apps, backend APIs, and connected workflows without burying the work in unnecessary complexity.",
            "Every engagement begins with the problem, the people using the product, and the outcome you need. From there, we define a practical scope, agree on milestones, and keep communication direct through design, development, testing, and launch."
          ],
          cta: { label: "Learn more about Opplexify", href: "/about" }
        }
      },
      {
        key: "work-showcase",
        type: "work-showcase",
        title: "selected work",
        content: {
          eyebrow: "Product and interface work",
          cta: { label: "View the portfolio", href: "/portfolio" },
          limit: 4,
          fallbackItems: [
            {
              title: "Business Website Experience",
              tag: "Website Design, Development",
              date: "2026",
              href: "/portfolio",
              mediaUrl: "/portfolio/videos/portfolio-video-1.mp4"
            },
            {
              title: "SaaS Product Interface",
              tag: "SaaS, Product Design",
              date: "2026",
              href: "/portfolio",
              mediaUrl: "/portfolio/videos/portfolio-video-2.mp4"
            },
            {
              title: "Operations Dashboard",
              tag: "Dashboard, Internal Tools",
              date: "2026",
              href: "/portfolio",
              mediaUrl: "/portfolio/videos/portfolio-video-3.mp4"
            },
            {
              title: "Mobile Product Experience",
              tag: "Mobile App, Product UI",
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
        title: "Clear starting points for custom software development.",
        subtitle:
          "Use these ranges to plan an initial budget. Your final quote will reflect the features, integrations, content, revision needs, and delivery schedule we agree on together.",
        content: {
          eyebrow: "Pricing",
          items: [
            {
              label: "Focused Online Presence",
              title: "Custom Website",
              description:
                "A polished business website that explains your services clearly, works across devices, and gives visitors an easy path to contact you.",
              price: "$150",
              suffix: "starting",
              timeline: "1-3 weeks",
              features: ["Clear project scope", "Responsive pages", "Contact form", "On-page SEO foundations", "One revision round"],
              ctaLabel: "Discuss Your Project",
              href: "/contact"
            },
            {
              label: "Custom Business Workflow",
              title: "Complete Web Application",
              description:
                "A purpose-built web application with secure accounts, database-backed workflows, a user dashboard, and the APIs needed to keep everything connected.",
              price: "$500",
              suffix: "starting",
              timeline: "3-8 weeks",
              features: ["Defined requirements", "Authentication", "User dashboard", "Backend API", "Milestone delivery"],
              ctaLabel: "Discuss Your Project",
              href: "/contact"
            },
            {
              label: "SaaS Product Foundation",
              title: "Complete SaaS Solution",
              description:
                "A SaaS foundation shaped around your core user journey, account roles, admin controls, data model, and backend architecture.",
              price: "$1,000",
              suffix: "starting",
              timeline: "6-12 weeks",
              features: ["Core product workflows", "Admin dashboard", "Database and API", "Testing and handover", "Milestone delivery"],
              ctaLabel: "Discuss Your Project",
              href: "/contact",
              featured: true
            },
            {
              label: "Mobile Operations",
              title: "Mobile App with Admin Dashboard",
              description:
                "A connected mobile experience with the backend services and admin tools your team needs to manage users, content, and day-to-day activity.",
              price: "$1,500",
              suffix: "starting",
              timeline: "5-10 weeks",
              features: ["Mobile app screens", "Admin dashboard", "Backend API", "Testing pass", "Defined revisions"],
              ctaLabel: "Discuss Your Project",
              href: "/contact"
            },
            {
              label: "Connected Product Suite",
              title: "Complete Mobile App + Web App",
              description:
                "A coordinated product build that brings the web app, mobile experience, backend API, database, and admin dashboard into one maintainable system.",
              price: "$2,000",
              suffix: "starting",
              timeline: "8-16 weeks",
              features: ["Detailed proposal", "Connected applications", "Milestone delivery", "Defined revisions", "Final handover"],
              ctaLabel: "Discuss Your Project",
              href: "/contact"
            }
          ]
        }
      },
      {
        key: "service-showcase",
        type: "service-showcase",
        title: "Custom software development services that solve real business problems",
        content: {
          mockupLabel: "What we build",
          mockupCta: { label: "Explore Services", href: "/services" }
        }
      },
      {
        key: "team-showcase",
        type: "team-showcase",
        title: "A hands-on team from first conversation to final handover",
        content: { limit: 3 }
      },
      {
        key: "stats",
        type: "stats",
        title: "Project approach",
        content: {
          items: [
            { value: "01", label: "Discovery and a clear project scope" },
            { value: "02", label: "Focused milestones and regular feedback" },
            { value: "03", label: "Testing, launch, and a clean handover" }
          ]
        }
      },
      {
        key: "marquee",
        type: "marquee",
        title: "Custom websites / SaaS products / Web applications / Mobile apps / Admin dashboards / Backend APIs / Workflow automation"
      },
      {
        key: "logo-strip",
        type: "logo-strip",
        title: "Relevant project examples are available during a consultation.",
        content: {
          logos: [
            { image: asset("brand/brand-1.webp"), lightImage: asset("brand/brand-1-light.webp"), alt: "Custom software project showcase" },
            { image: asset("brand/brand-2.webp"), lightImage: asset("brand/brand-2-light.webp"), alt: "Business website project showcase" },
            { image: asset("brand/brand-3.webp"), lightImage: asset("brand/brand-3-light.webp"), alt: "Dashboard development project showcase" }
          ]
        }
      },
      {
        key: "capability-list",
        type: "capability-list",
        title: "Thoughtful product decisions, clear communication, and maintainable code at every stage",
        content: {
          items: [
            { category: "Frontend", text: "Fast, responsive interfaces built with Next.js", year: "01" },
            { category: "Backend", text: "Structured APIs, databases, and server-side workflows", year: "02" },
            { category: "SEO", text: "Useful page structure, metadata, headings, and internal links", year: "03" },
            { category: "Product", text: "Connected SaaS, mobile, dashboard, and admin experiences", year: "04" },
            { category: "Launch", text: "Careful testing, deployment support, and practical handover", year: "05" }
          ]
        }
      }
    ]),
    pageSeed("About", "about", "about", [
      {
        key: "intro",
        type: "rich-text",
        title: "Custom software development with a practical, collaborative process",
        subtitle: "Opplexify helps founders and growing teams plan, design, and build digital products that fit the way their business actually works.",
        content: {
          body: "Good software starts with a shared understanding of the problem. Opplexify works with founders and business teams to turn ideas, manual processes, and product requirements into custom websites, SaaS platforms, web applications, mobile apps, admin dashboards, and backend APIs.\n\nOur process stays deliberately straightforward. We clarify the audience and core workflow, define what belongs in the first release, and create a written scope with realistic milestones. During development, you see progress, share feedback, and know what is coming next.\n\nWe care about the work behind the interface as much as the interface itself: maintainable code, sensible data structures, reliable integrations, responsive layouts, and a handover your team can use after launch.",
          image: portfolioImage(3)
        }
      }
    ]),
    pageSeed("Contact", "contact", "contact", [
      {
        key: "contact-hero",
        type: "contact",
        title: "Tell us what you are building",
        subtitle:
          "Planning a business website, SaaS product, custom web application, mobile app, admin dashboard, backend API, or automation? Share the goal, must-have features, and timeline, and we will help you define a sensible next step."
      },
      {
        key: "contact-info",
        type: "contact-info",
        title: "Talk to the Opplexify team",
        subtitle: "Use the details below for project questions, estimates, and partnership inquiries.",
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
        title: "Frequently asked questions about working with Opplexify",
        subtitle:
          "Straightforward answers about our software development services, project fit, proposals, pricing, milestones, revisions, remote collaboration, and delivery process."
      }
    ]),
    pageSeed("Services", "services", "services", [
      {
        key: "intro",
        type: "services",
        title: "Custom software development services built for real workflows",
        subtitle:
          "From business websites and SaaS platforms to mobile apps, admin dashboards, backend APIs, and workflow automation, Opplexify builds software around clear goals and practical requirements.",
        content: { image: "/services/services-overview.webp" }
      }
    ]),
    pageSeed("Work", "work", "work", [
      {
        key: "intro",
        type: "projects",
        title: "Representative software concepts",
        subtitle:
          "Explore clearly labelled concepts showing how Opplexify approaches business websites, SaaS products, dashboards, mobile experiences, and backend systems. These examples are not presented as named client case studies."
      }
    ]),
    pageSeed("Blog", "blog", "blog", [
      {
        key: "intro",
        type: "blog",
        title: "Practical guides for planning and building better software",
        subtitle:
          "Clear, useful articles on website strategy, SaaS product planning, mobile app development, admin dashboards, backend APIs, workflow automation, and smoother project delivery."
      }
    ]),
    pageSeed("Team", "team", "team", [
      {
        key: "intro",
        type: "team",
        title: "Meet the team behind Opplexify",
        subtitle:
          "A focused team bringing product planning, full-stack development, quality assurance, and delivery coordination together for every client project."
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
        title: "A visual portfolio of websites, SaaS products, and app interfaces",
        subtitle:
          "Browse interface and product work across websites, SaaS platforms, dashboards, mobile apps, backend systems, and automation. We protect client-sensitive information while sharing enough context to show the range of work Opplexify can deliver."
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
    seoTitle: `${title} | Opplexify`,
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
      shortDescription: "Custom business websites with responsive design, clear service pages, dependable contact forms, and strong on-page SEO foundations.",
      description:
        "Your website should help the right customer understand what you do and take the next step with confidence. Opplexify provides custom website development for businesses that need a polished, responsive site with clear service pages, intuitive navigation, and dependable contact routing.\n\nA typical project can include discovery, content structure, UI design, frontend development, on-page SEO foundations, performance checks, testing, and launch handover. We shape the scope around the pages and functionality you actually need, so the finished site is easier to manage and ready to evolve with the business.\n\nTypical timeline: 1-3 weeks, depending on scope, content readiness, and integrations.",
      icon: asset("icon/icon-s-1.webp"),
      image: "/services/business-websites.webp",
      gallery: ["Discovery and scope", "Responsive pages", "Contact form routing", "SEO foundations", "Launch handover"],
      featured: true,
      sortOrder: 1,
      seoTitle: "Custom Website Development Services | Opplexify",
      seoDescription:
        "Custom website development for responsive business websites, clear service pages, contact forms, on-page SEO foundations, testing, and launch support."
    },
    {
      title: "SaaS Platform Development",
      slug: "saas-platform-development",
      shortDescription: "SaaS product development with user accounts, core workflows, admin controls, database design, and reliable backend APIs.",
      icon: asset("icon/icon-s-2.webp"),
      image: "/services/saas-platforms.webp",
      gallery: ["Requirements planning", "Authentication", "Database models", "Admin workflows", "Milestone delivery"],
      featured: true,
      sortOrder: 2,
      description:
        "A useful SaaS product starts with a focused problem and a workflow people can understand without a manual. Opplexify offers SaaS development services for founders and businesses building account-based products, customer portals, subscription-ready tools, and internal platforms.\n\nWe can take a SaaS MVP from requirements and product screens through authentication, role-based access, database design, backend APIs, user dashboards, admin controls, testing, and launch handover. The first release stays focused on the product's core value while the technical foundation leaves room for sensible growth.\n\nTypical timeline: 6-12 weeks, depending on product complexity, integrations, and launch requirements.",
      seoTitle: "SaaS Platform Development Services | Opplexify",
      seoDescription:
        "SaaS platform and MVP development with authentication, account workflows, admin dashboards, database design, backend APIs, testing, and launch handover."
    },
    {
      title: "Dashboard & Admin Panel Development",
      slug: "dashboard-admin-panel-development",
      shortDescription: "Custom dashboards, admin panels, and internal tools for managing users, content, requests, reports, and daily operations.",
      description:
        "A good admin panel removes busywork and gives the right people a clear view of what needs attention. Opplexify provides custom dashboard development for teams managing users, content, requests, orders, reports, approvals, or other operational workflows.\n\nDepending on the job, the build can include role-based access, searchable tables, forms, filters, charts, permissions, audit-friendly activity, and third-party API integrations. We organize the interface around real tasks rather than filling the screen with metrics that nobody uses.\n\nTypical timeline: 3-8 weeks, depending on data sources, user roles, and workflow complexity.",
      icon: asset("icon/icon-s-3.webp"),
      image: "/services/admin-dashboards.webp",
      gallery: ["Role-based access", "Data tables", "Forms and filters", "Reports", "API integration"],
      featured: true,
      sortOrder: 3,
      seoTitle: "Dashboard & Admin Panel Development | Opplexify",
      seoDescription:
        "Custom dashboard and admin panel development for user management, reports, internal workflows, role-based access, data tools, and API integrations."
    },
    {
      title: "Mobile App Development",
      slug: "mobile-app-development",
      shortDescription: "Mobile app development with thoughtful user flows, secure backend APIs, authentication, and practical admin tools.",
      description:
        "Successful mobile apps need more than a set of attractive screens. Opplexify designs and builds mobile experiences around the complete user journey, including the backend services and operational tools required to run the product after launch.\n\nA project can cover screen planning, UI implementation, authentication, backend API integration, account data, media handling, admin workflows, testing, and handover. We prioritize the features that make the first release useful and keep future additions in mind without overbuilding the MVP.\n\nTypical timeline: 5-10 weeks, depending on the number of workflows, integrations, and release requirements.",
      icon: asset("icon/icon-s-4.webp"),
      image: "/services/mobile-apps.webp",
      gallery: ["Mobile screens", "API connection", "Admin workflow", "Testing support", "Store-ready handoff"],
      featured: true,
      sortOrder: 4,
      seoTitle: "Mobile App Development Services | Opplexify",
      seoDescription:
        "Mobile app development with user-focused screens, authentication, backend API integration, admin workflows, testing, and a practical launch handover."
    },
    {
      title: "Backend/API Development",
      slug: "backend-api-development",
      shortDescription: "Backend API development with structured databases, authentication, validation, documentation, and maintainable server-side logic.",
      description:
        "Reliable digital products depend on a backend that handles data and permissions consistently. Opplexify builds backend systems and APIs for web apps, SaaS platforms, mobile products, dashboards, and third-party integrations.\n\nWork can include API design, database schema, authentication, authorization, input validation, file handling, error management, documentation, automated checks, and deployment support. The goal is a clear service structure that another developer can understand and your product can build on.\n\nTypical timeline: 3-8 weeks, depending on data complexity, security requirements, and external services.",
      icon: asset("icon/icon-s-5.webp"),
      image: "/services/backend-systems.webp",
      gallery: ["API design", "Database schema", "Authentication", "Validation", "Documentation"],
      featured: true,
      sortOrder: 5,
      seoTitle: "Backend API Development Services | Opplexify",
      seoDescription:
        "Backend API development for web and mobile products, including database design, authentication, authorization, validation, documentation, and testing."
    },
    {
      title: "Automation & Integrations",
      slug: "automation-integrations",
      shortDescription: "Business workflow automation and API integrations that connect tools, move data, and reduce repetitive manual work.",
      description:
        "Manual handoffs slow teams down and create avoidable errors. Opplexify builds workflow automations and API integrations that help forms, business tools, dashboards, databases, and external services exchange information more reliably.\n\nWe begin by mapping the current process and identifying where automation will make a meaningful difference. A project can include third-party API integration, data synchronization, scheduled jobs, notifications, lightweight admin tools, failure handling, testing, and clear handover notes.\n\nTypical timeline: 2-6 weeks, depending on the number of connected systems and the quality of their APIs.",
      icon: asset("icon/icon-s-5.webp"),
      image: "/services/web-applications.webp",
      gallery: ["Workflow mapping", "API integrations", "Admin tools", "Data sync", "Testing and handoff"],
      featured: true,
      sortOrder: 6,
      seoTitle: "Workflow Automation & API Integration | Opplexify",
      seoDescription:
        "Workflow automation and API integration services for connecting business tools, syncing data, scheduling jobs, reducing manual work, and improving reliability."
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
    { name: "Business Websites", slug: "branding" },
    { name: "SaaS & Dashboards", slug: "web-experience" },
    { name: "Mobile Apps & APIs", slug: "product" }
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
      title: "Business Website Design Concept",
      slug: "business-website-design-concept",
      client: null,
      categoryId: categoryMap.get("branding"),
      location: "Remote",
      tools: "Website planning, responsive UI, contact forms, SEO foundations",
      duration: "Scoped by project",
      shortDescription:
        "A representative website concept exploring responsive design, service-page structure, contact journeys, and SEO foundations.",
      description:
        "A business website has to do two jobs well: explain the offer quickly and guide the visitor toward a useful next step. This representative concept shows Opplexify's approach to custom website development, with responsive layouts, clear service-page structure, focused calls to action, dependable contact routing, and on-page SEO foundations.\n\nThis is not presented as a client case study, and no client identity or performance results are claimed. During a consultation, we can discuss the design and technical decisions that may apply to your goals.",
      mainImage: portfolioImage(0),
      gallery: [portfolioImage(0), portfolioImage(3)],
      featured: true,
      sortOrder: 1,
      seoTitle: "Business Website Design Concept | Opplexify",
      seoDescription:
        "Explore a representative Opplexify website concept covering responsive design, service-page structure, contact journeys, and on-page SEO foundations."
    },
    {
      title: "SaaS Product & Operations Dashboard Concept",
      slug: "saas-product-operations-dashboard-concept",
      client: null,
      categoryId: categoryMap.get("web-experience"),
      location: "Remote",
      tools: "SaaS workflows, dashboard planning, backend APIs, data models",
      duration: "Scoped by project",
      shortDescription:
        "A representative SaaS concept connecting account workflows, operational dashboards, structured data, and backend APIs.",
      description:
        "SaaS products work best when the customer experience and the internal operation are designed together. This representative concept shows our approach to user accounts, role-based workflows, product dashboards, admin controls, database structure, and backend API development.\n\nThis is not presented as a client case study, and it does not claim proprietary workflows or performance results. If you are planning a SaaS MVP or improving an existing platform, we can walk through comparable product decisions during the scoping conversation.",
      mainImage: portfolioImage(12),
      gallery: [portfolioImage(12), portfolioImage(18)],
      featured: true,
      sortOrder: 2,
      seoTitle: "SaaS Product & Dashboard Concept | Opplexify",
      seoDescription:
        "Explore a representative Opplexify SaaS concept covering user accounts, admin dashboards, data workflows, database design, and backend APIs."
    },
    {
      title: "Mobile Product & API Foundation Concept",
      slug: "mobile-product-api-foundation-concept",
      client: null,
      categoryId: categoryMap.get("product"),
      location: "Remote",
      tools: "Mobile screens, backend APIs, admin workflows, integrations",
      duration: "Scoped by project",
      shortDescription:
        "A representative mobile product concept supported by account flows, backend APIs, admin tools, and external integrations.",
      description:
        "A maintainable mobile product connects the user-facing app with the systems that support it. This representative concept highlights the relationship between mobile screens, authentication, backend APIs, data handling, admin workflows, and external integrations.\n\nThis is not presented as a client case study, and it does not claim a named customer or released product. We can discuss how these product decisions relate to your users, operational needs, and launch scope.",
      mainImage: portfolioImage(24),
      gallery: [portfolioImage(24), portfolioImage(30)],
      featured: true,
      sortOrder: 3,
      seoTitle: "Mobile Product & Backend API Concept | Opplexify",
      seoDescription:
        "Explore a representative Opplexify mobile product concept covering authentication, backend APIs, data handling, admin workflows, and third-party integrations."
    }
  ];

  await prisma.project.updateMany({
    where: { slug: { in: ["nova-identity-system", "orbit-studio-website", "pulse-product-platform"] } },
    data: { status: "ARCHIVED", deletedAt: new Date() }
  });

  for (const project of projects) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: { ...project, status: "PUBLISHED", date: null, ogImage: project.mainImage, deletedAt: null },
      create: { ...project, status: "PUBLISHED", date: null, ogImage: project.mainImage }
    });
  }
}

async function seedPortfolioItems(userId: string) {
  const images = portfolioImages();
  const videos = portfolioVideos();

  for (const [index, item] of images.entries()) {
    const tag = portfolioTags[index % portfolioTags.length];
    const title = `${tag} portfolio sample ${String(index + 1).padStart(2, "0")}`;

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
    const title = `Interface motion sample ${String(index + 1).padStart(2, "0")}`;

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
        "A practical guide to planning service pages, on-page SEO, internal links, website performance, and a clearer path from search visit to enquiry.",
      content:
        "An SEO-friendly business website has to work for two audiences at once: the person looking for help and the search engine trying to understand the page. The best starting point is not a list of keywords. It is a clear answer to three questions: who is this service for, what problem does it solve, and what should the visitor do next?\n\nGive each important service its own useful page. Choose one primary topic for that page, then use related phrases naturally where they add clarity. A custom website development page, for example, can explain responsive design, content structure, contact forms, on-page SEO, testing, and launch support without repeating the same phrase in every paragraph. The page title, main heading, introduction, and metadata should describe the offer in plain language.\n\nSite structure matters too. Link related services to one another, connect helpful articles to the pages they support, and make sure every important page can be reached through straightforward navigation. Descriptive link text gives visitors context and helps search engines understand how the content fits together.\n\nTechnical quality supports the content. Use responsive layouts, compressed images, sensible heading levels, descriptive image text, canonical URLs, and pages that load without unnecessary scripts. Structured data can add useful context, but it cannot rescue thin or confusing copy.\n\nFinally, make the conversion path easy to follow. Use a specific call to action, keep contact forms focused, and tell people what information will help you prepare a useful response. Before launch, read every page as a potential customer: if the offer, proof, process, and next step are not clear, refine the page before adding more keywords.",
      featuredImage: portfolioImage(0),
      categoryId: categoryMap.get("insights"),
      tags: ["brand", "growth"],
      featured: true,
      seoTitle: "SEO-Friendly Business Website Guide - Opplexify",
      seoDescription:
        "Learn how to plan an SEO-friendly business website with useful service pages, natural keywords, clear headings, internal links, better performance, and stronger enquiries."
    },
    {
      title: "What a SaaS MVP Needs Before Launch",
      slug: "saas-mvp-launch-checklist",
      excerpt:
        "A practical SaaS MVP checklist covering the core workflow, authentication, data, admin tools, onboarding, analytics, and launch readiness.",
      content:
        "A SaaS MVP is not simply a smaller version of the final product. It is the smallest dependable release that lets a specific customer complete a valuable job and gives the team useful evidence about what to build next. Before development begins, write down that core job and remove features that do not support it.\n\nMap the complete user journey from sign-up to the first meaningful result. Decide how accounts are created, which roles exist, what each role can see, and what happens when something goes wrong. Authentication, password recovery, permissions, validation, and understandable empty states are part of the product experience, not tasks to leave until launch week.\n\nThe data model and backend API should reflect the real workflow instead of the first set of screens. Define the key records, their relationships, and who can create or change them. An admin dashboard is equally important: someone on the business side will need to manage users, review activity, correct data, or respond to support issues.\n\nLaunch planning also includes the less visible pieces. Think through transactional email, billing readiness if subscriptions are part of the model, analytics events, error monitoring, backups, privacy and terms pages, and a repeatable deployment process. A short onboarding flow and useful product messages can prevent avoidable support requests.\n\nTreat the checklist as a prioritization tool, not permission to overbuild. Secure the core workflow, make the product operable, test it with realistic data, and document what is intentionally postponed. That creates a SaaS MVP you can learn from without pretending the first release has to solve every future problem.",
      featuredImage: portfolioImage(12),
      categoryId: categoryMap.get("process"),
      tags: ["design", "admin-dashboards", "backend-apis"],
      featured: true,
      seoTitle: "SaaS MVP Launch Checklist - Web App, Admin Dashboard and Backend",
      seoDescription:
        "Use this SaaS MVP launch checklist to plan the core workflow, authentication, database, backend API, admin dashboard, onboarding, analytics, and deployment."
    },
    {
      title: "Mobile App Development with a Backend and Admin Dashboard",
      slug: "mobile-app-development-backend-admin-dashboard",
      excerpt:
        "How backend APIs, authentication, data models, admin controls, and operational workflows turn a mobile interface into a manageable product.",
      content:
        "A mobile app may be what customers see, but the product usually depends on several systems behind it. User accounts, saved data, media, payments, notifications, and support workflows need a reliable place to live. Planning those pieces alongside the interface prevents the app from becoming a polished prototype that the business cannot operate.\n\nStart with the mobile workflows and identify what data each step reads or changes. The backend API should enforce the same business rules for every user, validate incoming information, and return useful errors when a request cannot be completed. Authentication and authorization need separate attention: signing in confirms who someone is, while permissions decide what that person is allowed to do.\n\nAn admin dashboard gives the internal team a safe way to manage the product. Depending on the app, that might include reviewing accounts, updating content, handling requests, changing statuses, viewing reports, or resolving support issues. Role-based access helps keep sensitive actions limited to the people who need them.\n\nNotifications and integrations should be designed around events that matter rather than added as an afterthought. Decide which actions trigger an email, push notification, payment update, or external data sync. Also plan for slow connections, duplicate requests, failed uploads, and other conditions that real users will eventually encounter.\n\nBefore handover, test the app, API, and admin workflow as one connected system. Document the deployment process, important integrations, environment settings, and routine operational tasks. Mobile app development is much easier to maintain when the customer experience and the business controls are treated as parts of the same product.",
      featuredImage: portfolioImage(24),
      categoryId: categoryMap.get("insights"),
      tags: ["mobile-apps", "admin-dashboards", "backend-apis"],
      featured: false,
      seoTitle: "Mobile App Development with Backend API and Admin Dashboard",
      seoDescription:
        "Learn how mobile app development connects user journeys with authentication, backend APIs, data models, notifications, admin dashboards, and operational tools."
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
        "Muhammad Emmad Khan is the Founder and Owner of Opplexify.",
      image: "/team/emmad-khan.webp",
      socialLinks: json({}),
      skills: json([]),
      sortOrder: 1,
      seoTitle: "Muhammad Emmad Khan | Founder of Opplexify",
      seoDescription:
        "Muhammad Emmad Khan is the Founder and Owner of Opplexify."
    },
    {
      name: "Ameeq Khan",
      slug: "ameeq-khan",
      role: "Full-Stack Developer",
      bio:
        "Ameeq Khan is a Full-Stack Developer at Opplexify.",
      image: "/team/ameeq-khan.webp",
      socialLinks: json({}),
      skills: json([]),
      sortOrder: 2,
      seoTitle: "Ameeq Khan - Full-Stack Developer at Opplexify",
      seoDescription:
        "Ameeq Khan is a Full-Stack Developer at Opplexify."
    },
    {
      name: "Atiq Khan",
      slug: "atiq-khan",
      role: "Project Coordinator",
      bio:
        "Atiq Khan is a Project Coordinator at Opplexify.",
      image: "/team/atiq-khan.webp",
      socialLinks: json({}),
      skills: json([]),
      sortOrder: 3,
      seoTitle: "Atiq Khan - Project Coordinator at Opplexify",
      seoDescription:
        "Atiq Khan is a Project Coordinator at Opplexify."
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
          "Can uploaded media be reused across content?",
          "What services does Opplexify LLC provide?",
          "Is Opplexify LLC a registered US company?",
          "How can business verification or compliance teams contact Opplexify LLC?"
        ]
      }
    },
    data: { isActive: false }
  });

  const faqs = [
    {
      question: "What can Opplexify build?",
      answer:
        "We design and develop custom websites, web applications, SaaS products, mobile apps, admin dashboards, backend APIs, and workflow automations. The right approach depends on the problem you are solving, your users, and what needs to be ready for the first release.",
      category: "Services",
      sortOrder: 1
    },
    {
      question: "Who is Opplexify a good fit for?",
      answer:
        "We work best with founders, startups, and growing businesses that have a real problem to solve and want direct involvement from the people designing and building the product. If the scope is still rough, discovery helps us turn it into a practical first plan.",
      category: "Working Together",
      sortOrder: 2
    },
    {
      question: "Can you improve an existing product, or only build from scratch?",
      answer:
        "Both. We can review an existing website or application, add focused features, improve a workflow, connect an API, or plan a larger rebuild. We start by understanding the current codebase and constraints so we can recommend the safest useful next step.",
      category: "Working Together",
      sortOrder: 3
    },
    {
      question: "How does a project start?",
      answer:
        "We begin with a short discovery conversation about your users, goals, must-have features, timeline, and budget. If the project is a good fit, you receive a written proposal covering the scope, deliverables, estimated schedule, price, and payment plan.",
      category: "Project Process",
      sortOrder: 4
    },
    {
      question: "How long does a software project take?",
      answer:
        "A focused business website may take a few weeks, while a SaaS platform, mobile app, or complex internal tool can take several months. Timing depends on feature depth, integrations, content readiness, and feedback. We confirm a realistic estimate after discovery.",
      category: "Project Process",
      sortOrder: 5
    },
    {
      question: "How do pricing and milestone payments work?",
      answer:
        "Pricing is based on the agreed scope, not a one-size-fits-all hourly estimate. Smaller projects may use a deposit and final payment. Larger builds can be divided into milestones, each with defined deliverables and payment timing in the proposal.",
      category: "Pricing & Billing",
      sortOrder: 6
    },
    {
      question: "How do revisions and change requests work?",
      answer:
        "The proposal explains the revision rounds included for the agreed deliverables. Those rounds are for refining the approved direction. New features or major changes are discussed separately so you can approve the added cost and timeline before work continues.",
      category: "Project Process",
      sortOrder: 7
    },
    {
      question: "Who owns the final design and source code?",
      answer:
        "After the final invoice is paid, ownership of the final deliverables created specifically for your project transfers to you, subject to any third-party licences. The proposal and Terms of Service explain the exact handover for your project.",
      category: "Ownership",
      sortOrder: 8
    },
    {
      question: "What happens after launch?",
      answer:
        "We complete a final testing and handover step so you understand the delivered product and any accounts or documentation included in scope. Ongoing maintenance, support, or a next development phase can be planned separately when needed.",
      category: "Support",
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
      url: asset("logo/opplexify-logo-full.png"),
      filename: "opplexify-logo-full.png",
      originalName: "opplexify-logo-full.png",
      mimeType: "image/png",
      size: 277999,
      alt: "Opplexify logo",
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

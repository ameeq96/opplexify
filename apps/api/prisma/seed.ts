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
const portfolioTags = ["Branding", "Web Design", "UI/UX", "Development", "Marketing", "Creative"];

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
        description:
          "Full-stack web development agency for SEO-friendly websites, Next.js web apps, SaaS platforms, mobile apps, admin dashboards, and backend systems.",
        email: "admin@opplexify.com",
        phone: "+1 555 014 928",
        address: "Remote web development team serving clients worldwide",
        logoDark: asset("logo/opplexify-logo-dark.svg"),
        logoLight: asset("logo/opplexify-logo-light.svg"),
        favicon: asset("logo/favicon.svg")
      }
    },
    {
      key: "social",
      value: {
        instagram: "https://instagram.com",
        facebook: "https://facebook.com",
        twitter: "https://x.com",
        linkedin: "https://linkedin.com"
      }
    },
    {
      key: "seo",
      value: {
        defaultTitle: "Opplexify - Web Development Agency for Websites, SaaS & Apps",
        defaultDescription:
          "Hire Opplexify for SEO-friendly website development, Next.js web apps, SaaS development, mobile app development, admin dashboards, and NestJS backend APIs.",
        ogImage: portfolioImage(0),
        keywords: [
          "web development agency",
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
        headline: "Build a website,",
        headlineLine2: "app or SaaS product",
        headlineLine3: "that converts",
        ctaLabel: "Get a development quote",
        text: "Opplexify builds SEO-friendly websites, SaaS platforms, mobile apps, admin dashboards, and backend systems for serious product launches.",
        copyright: "Copyright 2026 Opplexify. All rights reserved.",
        serviceLinks: [
          { label: "Website Development", href: "/services" },
          { label: "SaaS Development", href: "/services" },
          { label: "Mobile Apps", href: "/services" },
          { label: "Admin Dashboards", href: "/services" }
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
        title: "Websites, SaaS apps and dashboards built to grow",
        subtitle:
          "Opplexify builds SEO-friendly websites, Next.js web applications, SaaS platforms, mobile apps, admin dashboards, and backend systems.",
        content: {
          eyebrow: "Full-stack web development agency",
          primaryCta: { label: "View portfolio", href: "/portfolio" },
          secondaryCta: { label: "Get a development quote", href: "/contact" },
          image: portfolioImage(0),
          headline: "Websites,\nSaaS apps and\ndashboards",
          metaItems: [
            "Conversion-focused\nwebsite and app development\nsince 2017",
            "Opplexify\nRemote full-stack team for\nstartups and businesses"
          ]
        }
      },
      {
        key: "about-preview",
        type: "text-media",
        title: "We build high-converting digital products for businesses ready to grow.",
        subtitle: "Who we are",
        content: {
          image: asset("gallery/gallery-s-1.webp"),
          paragraphs: [
            "Opplexify plans, designs, and develops business websites, full-stack web applications, SaaS products, mobile apps, and admin dashboards with clean architecture, fast performance, and practical search engine optimization.",
            "Our work connects strategy, UI/UX design, Next.js frontend development, NestJS backend APIs, database structure, and launch support into one maintainable system."
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
              title: "Website UI Portfolio Video",
              tag: "Website Design, Motion",
              date: "2026",
              href: "/portfolio",
              mediaUrl: "/portfolio/videos/portfolio-video-1.mp4"
            },
            {
              title: "SaaS Product Showcase",
              tag: "SaaS, Product UI",
              date: "2026",
              href: "/portfolio",
              mediaUrl: "/portfolio/videos/portfolio-video-2.mp4"
            },
            {
              title: "Admin Dashboard Interface",
              tag: "Dashboard, UI/UX",
              date: "2026",
              href: "/portfolio",
              mediaUrl: "/portfolio/videos/portfolio-video-3.mp4"
            },
            {
              title: "Mobile App and Web App Demo",
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
        title: "Website, web app, SaaS and mobile app development pricing.",
        subtitle:
          "Transparent starting packages for SEO-friendly websites, full-stack web applications, SaaS platforms, admin dashboards, and complete product builds.",
        content: {
          eyebrow: "Pricing",
          items: [
            {
              label: "5 Page Presence",
              title: "Simple Website",
              description:
                "A concise, responsive, SEO-friendly business website designed for credibility, lead capture, and clear service presentation.",
              price: "$149",
              suffix: "starting",
              timeline: "4-7 days",
              features: ["5 responsive pages", "Contact form", "Foundational SEO", "Performance-focused structure"],
              ctaLabel: "Request Package",
              href: "/contact"
            },
            {
              label: "Full-Stack App",
              title: "Complete Web Application",
              description:
                "A full-stack web application with authentication, dashboards, APIs, database integration, and structured workflows.",
              price: "$499",
              suffix: "starting",
              timeline: "2-3 weeks",
              features: ["Authentication", "User dashboard", "Backend API", "Database integration"],
              ctaLabel: "Request Package",
              href: "/contact"
            },
            {
              label: "Subscription-Ready",
              title: "Complete SaaS Solution",
              description:
                "A scalable SaaS development foundation with product workflows, admin controls, database models, and subscription-ready architecture.",
              price: "$999",
              suffix: "starting",
              timeline: "3-5 weeks",
              features: ["SaaS platform", "Admin dashboard", "Subscription-ready structure", "Database and API"],
              ctaLabel: "Request Package",
              href: "/contact",
              featured: true
            },
            {
              label: "App Plus Control Room",
              title: "Mobile App with Admin Dashboard",
              description:
                "A mobile application connected to a secure backend API and an operational admin dashboard for real business workflows.",
              price: "$1200",
              suffix: "starting",
              timeline: "4-6 weeks",
              features: ["Mobile app", "Admin dashboard", "Backend API", "Push notification-ready"],
              ctaLabel: "Request Package",
              href: "/contact"
            },
            {
              label: "Complete Product Suite",
              title: "Complete Mobile App + Web App",
              description:
                "A coordinated mobile app, web app, API, database, and admin dashboard system for a complete digital product launch.",
              price: "$1699",
              suffix: "starting",
              timeline: "6-8 weeks",
              features: ["Mobile app", "Web app", "Admin dashboard", "Complete full-stack solution"],
              ctaLabel: "Request Package",
              href: "/contact"
            }
          ]
        }
      },
      {
        key: "service-showcase",
        type: "service-showcase",
        title: "Full-stack development services built for measurable growth",
        content: {
          mockupLabel: "Development",
          mockupCta: { label: "Explore", href: "/services" }
        }
      },
      {
        key: "team-showcase",
        type: "team-showcase",
        title: "A focused team for design, frontend, backend and launch",
        content: { limit: 3 }
      },
      {
        key: "stats",
        type: "stats",
        title: "Development results",
        content: {
          items: [
            { value: "7+", label: "Years building web products" },
            { value: "120+", label: "Websites, apps and dashboards shipped" },
            { value: "24/7", label: "Remote launch support" }
          ]
        }
      },
      {
        key: "marquee",
        type: "marquee",
        title: "Next.js websites / SaaS platforms / Mobile apps / Admin dashboards / NestJS APIs"
      },
      {
        key: "logo-strip",
        type: "logo-strip",
        title: "SEO-friendly digital products built to convert visitors into leads, users and paying customers",
        content: {
          logos: [
            { image: asset("brand/brand-1.webp"), lightImage: asset("brand/brand-1-light.webp"), alt: "Client logo 1" },
            { image: asset("brand/brand-2.webp"), lightImage: asset("brand/brand-2-light.webp"), alt: "Client logo 2" },
            { image: asset("brand/brand-3.webp"), lightImage: asset("brand/brand-3-light.webp"), alt: "Client logo 3" },
            { image: asset("brand/brand-4.webp"), lightImage: asset("brand/brand-4-light.webp"), alt: "Client logo 4" },
            { image: asset("brand/brand-5.webp"), lightImage: asset("brand/brand-5-light.webp"), alt: "Client logo 5" },
            { image: asset("brand/brand-6.webp"), lightImage: asset("brand/brand-6-light.webp"), alt: "Client logo 6" },
            { image: asset("brand/brand-7.webp"), lightImage: asset("brand/brand-7-light.webp"), alt: "Client logo 7" }
          ]
        }
      },
      {
        key: "capability-list",
        type: "capability-list",
        title: "Clean code, fast pages and maintainable systems are the foundation of every launch",
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
        title: "A full-stack development team for serious product launches",
        subtitle: "We combine product strategy, UI/UX, frontend, backend, database, admin, SEO, and launch support.",
        content: {
          body: "Opplexify is a web development agency for businesses that need more than a basic website. We plan, design, and build SEO-friendly business websites, Next.js web apps, SaaS products, mobile applications, admin dashboards, and backend APIs that are maintainable after launch.",
          image: portfolioImage(3)
        }
      }
    ]),
    pageSeed("Contact", "contact", "contact", [
      {
        key: "contact-hero",
        type: "contact",
        title: "Hire Opplexify for web, SaaS and app development",
        subtitle:
          "Share your website, web application, SaaS platform, mobile app, admin dashboard, or backend API requirements."
      }
    ]),
    pageSeed("FAQ", "faq", "faq", [
      {
        key: "faq-intro",
        type: "faq",
        title: "Web development FAQ for pricing, timelines and SEO",
        subtitle:
          "Clear answers about SEO-friendly websites, full-stack web applications, SaaS products, mobile apps, dashboards, backend APIs, and launch support."
      }
    ]),
    pageSeed("Services", "services", "services", [
      {
        key: "intro",
        type: "services",
        title: "Web development services for growth",
        subtitle:
          "Full-stack services for professional digital product delivery, planned around business objectives, maintainable architecture, and user experience.",
        content: { image: "/services/services-overview.png" }
      }
    ]),
    pageSeed("Case Studies", "work", "work", [
      {
        key: "intro",
        type: "projects",
        title: "Case studies for websites, SaaS products and apps",
        subtitle:
          "Explore project work across business websites, full-stack web apps, SaaS platforms, mobile apps, admin dashboards, and backend systems."
      }
    ]),
    pageSeed("Blog", "blog", "blog", [
      {
        key: "intro",
        type: "blog",
        title: "Web development, SaaS and SEO insights",
        subtitle:
          "Practical articles about SEO-friendly websites, Next.js web apps, SaaS products, mobile apps, dashboards, backend systems, and product launch strategy."
      }
    ]),
    pageSeed("Team", "team", "team", [
      {
        key: "intro",
        type: "team",
        title: "Full-stack development team for product launches",
        subtitle:
          "Designers, frontend developers, backend engineers, and launch-focused builders for websites, SaaS platforms, mobile apps, and dashboards."
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
        title: "Website, SaaS, app and dashboard portfolio",
        subtitle: "Selected Opplexify portfolio work for SEO-friendly websites, SaaS UI, web applications, mobile apps, and admin dashboards."
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

  const pages = [];
  for (const seed of pageSeeds) {
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
    seoTitle: `${title} - Opplexify Web Development Agency`,
    seoDescription:
      sections[0]?.subtitle ??
      "Opplexify builds SEO-friendly websites, Next.js web applications, SaaS platforms, mobile apps, admin dashboards, and backend APIs.",
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
      title: "Website Development",
      slug: "web-design",
      shortDescription: "SEO-friendly business websites built for credibility, lead generation, speed, and responsive performance.",
      description:
        "Opplexify builds responsive business websites, service pages, landing pages, and portfolio websites with clean page structure, strong calls to action, fast loading assets, technical SEO foundations, and an admin-friendly content model.",
      icon: asset("icon/icon-s-1.webp"),
      image: "/services/business-websites.png",
      gallery: ["Responsive pages", "Service presentation", "Lead capture", "SEO structure", "Conversion paths"],
      featured: true,
      sortOrder: 1,
      seoTitle: "Website Development Service - SEO-Friendly Business Websites",
      seoDescription:
        "Hire Opplexify for SEO-friendly website development, responsive business websites, service pages, landing pages, portfolio websites, and conversion-focused web design."
    },
    {
      title: "Web Application Development",
      slug: "web-application-development",
      shortDescription: "Custom full-stack web apps with authentication, dashboards, workflows, APIs, and database integration.",
      icon: asset("icon/icon-s-2.webp"),
      image: "/services/web-applications.png",
      gallery: ["Custom portals", "Dashboards", "Booking systems", "Internal tools", "Business workflows"],
      featured: true,
      sortOrder: 2,
      description:
        "We develop custom web applications for portals, booking systems, internal tools, dashboards, CRM workflows, user accounts, and data-backed business processes using production-ready frontend and backend architecture.",
      seoTitle: "Web Application Development Service - Full-Stack Web Apps",
      seoDescription:
        "Custom web application development by Opplexify for portals, dashboards, booking systems, user accounts, backend APIs, databases, and secure business workflows."
    },
    {
      title: "SaaS Platform Development",
      slug: "product-design",
      shortDescription: "Subscription-ready SaaS foundations with product workflows, admin controls, database models, and scalable APIs.",
      description:
        "Opplexify builds SaaS products with authentication, user roles, admin dashboards, product workflows, billing-ready structure, relational database models, API architecture, onboarding screens, and maintainable UI systems.",
      icon: asset("icon/icon-s-3.webp"),
      image: "/services/saas-platforms.png",
      gallery: ["Authentication", "Database models", "Admin views", "Scalable APIs", "Subscription-ready flows"],
      featured: true,
      sortOrder: 3,
      seoTitle: "SaaS Platform Development Service - Subscription-Ready Products",
      seoDescription:
        "Build a SaaS platform with Opplexify: authentication, dashboards, database models, scalable APIs, admin panels, subscription-ready architecture, and product launch support."
    },
    {
      title: "Mobile App Development",
      slug: "motion-content",
      shortDescription: "Mobile apps connected to secure APIs, admin dashboards, notifications, and scalable backend systems.",
      description:
        "We design and build mobile app experiences for customers, teams, and product workflows, connecting each app to secure backend APIs, admin dashboards, push notification-ready foundations, and business data.",
      icon: asset("icon/icon-s-4.webp"),
      image: "/services/mobile-apps.png",
      gallery: ["Mobile UI", "Secure API connection", "Admin workflows", "Push notification-ready", "Product launch support"],
      featured: true,
      sortOrder: 4,
      seoTitle: "Mobile App Development Service - Apps with Backend and Admin Dashboard",
      seoDescription:
        "Mobile app development services for secure API-connected apps, admin dashboards, push notification-ready workflows, and complete product launches."
    },
    {
      title: "Admin Dashboard Development",
      slug: "brand-strategy",
      shortDescription: "Operational dashboards for managing users, content, orders, requests, analytics, and business workflows.",
      description:
        "Opplexify builds admin dashboards and control rooms with role-based access, content management, reporting, filters, search, data tables, forms, notifications, and API-connected operational workflows.",
      icon: asset("icon/icon-s-5.webp"),
      image: "/services/admin-dashboards.png",
      gallery: ["Content management", "User management", "Requests and orders", "Business reporting", "Role-based access"],
      featured: true,
      sortOrder: 5,
      seoTitle: "Admin Dashboard Development Service - Business Control Panels",
      seoDescription:
        "Admin dashboard development for content management, users, reporting, requests, orders, analytics, role-based access, and operational business workflows."
    },
    {
      title: "Backend API Development",
      slug: "backend-api-development",
      shortDescription: "NestJS APIs, Prisma schemas, MySQL databases, JWT authentication, and maintainable backend architecture.",
      description:
        "We build backend systems with NestJS APIs, Prisma data models, MySQL databases, authentication, authorization, validation, file uploads, Swagger documentation, pagination, filtering, and clean service structure.",
      icon: asset("icon/icon-s-5.webp"),
      image: "/services/backend-systems.png",
      gallery: ["NestJS APIs", "Prisma schemas", "Relational databases", "JWT authentication", "Maintainable structure"],
      featured: true,
      sortOrder: 6,
      seoTitle: "Backend API Development Service - NestJS, Prisma and MySQL",
      seoDescription:
        "Backend API development using NestJS, Prisma, MySQL, JWT authentication, validation, Swagger docs, file uploads, pagination, search, filters, and secure architecture."
    }
  ];

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
    { name: "Website Development", slug: "branding" },
    { name: "SaaS and Web Apps", slug: "web-experience" },
    { name: "Mobile Apps and Dashboards", slug: "product" }
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
      title: "SEO-Friendly Business Website Redesign",
      slug: "nova-identity-system",
      client: "Service Business",
      categoryId: categoryMap.get("branding"),
      location: "Remote",
      tools: "Next.js, SEO, Responsive UI, Contact Forms",
      duration: "7 days",
      shortDescription:
        "A fast, responsive business website structured around service keywords, clear calls to action, and lead capture.",
      description:
        "Opplexify redesigned a business website with SEO-friendly page titles, service-focused headings, responsive layouts, optimized images, contact form routing, internal links, and a clean content structure that helps visitors understand the offer quickly.",
      mainImage: portfolioImage(0),
      gallery: [portfolioImage(0), portfolioImage(3)],
      featured: true,
      sortOrder: 1,
      seoTitle: "SEO-Friendly Business Website Redesign Case Study",
      seoDescription:
        "Opplexify website development case study for a responsive, SEO-friendly business website with service pages, contact forms, internal links, and conversion-focused design."
    },
    {
      title: "Complete SaaS Platform with Admin Dashboard",
      slug: "orbit-studio-website",
      client: "SaaS Startup",
      categoryId: categoryMap.get("web-experience"),
      location: "Remote",
      tools: "Next.js, NestJS, Prisma, MySQL, JWT",
      duration: "5 weeks",
      shortDescription:
        "A subscription-ready SaaS foundation with authentication, product workflows, database models, APIs, and admin controls.",
      description:
        "Opplexify planned and developed a SaaS platform with user authentication, role-based admin access, dashboard screens, relational database models, secure REST APIs, content workflows, and scalable frontend components ready for product launch.",
      mainImage: portfolioImage(12),
      gallery: [portfolioImage(12), portfolioImage(18)],
      featured: true,
      sortOrder: 2,
      seoTitle: "SaaS Platform Development Case Study with Admin Dashboard",
      seoDescription:
        "SaaS development case study covering authentication, admin dashboard, database schema, REST API, Next.js frontend, NestJS backend, and product launch architecture."
    },
    {
      title: "Mobile App and Backend API Launch",
      slug: "pulse-product-platform",
      client: "Mobile Product",
      categoryId: categoryMap.get("product"),
      location: "Worldwide",
      tools: "Mobile UI, NestJS API, Admin Dashboard, Notifications",
      duration: "6 weeks",
      shortDescription:
        "A mobile app experience connected to secure backend APIs, admin workflows, and launch-ready product operations.",
      description:
        "Opplexify designed and built a mobile app workflow with API-connected screens, a backend service layer, admin dashboard management, secure authentication, media handling, and a maintainable structure for future product releases.",
      mainImage: portfolioImage(24),
      gallery: [portfolioImage(24), portfolioImage(30)],
      featured: true,
      sortOrder: 3,
      seoTitle: "Mobile App Development Case Study with Backend API",
      seoDescription:
        "Mobile app development case study for API-connected mobile screens, secure backend systems, admin dashboard workflows, notifications, and product launch support."
    }
  ];

  for (const project of projects) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: { ...project, status: "PUBLISHED", date: new Date("2026-04-15"), ogImage: project.mainImage },
      create: { ...project, status: "PUBLISHED", date: new Date("2026-04-15"), ogImage: project.mainImage }
    });
  }
}

async function seedPortfolioItems(userId: string) {
  const images = portfolioImages();
  const videos = portfolioVideos();

  for (const [index, item] of images.entries()) {
    const title = `Portfolio Visual ${String(index + 1).padStart(2, "0")}`;
    const tag = portfolioTags[index % portfolioTags.length];

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
    const title = `Portfolio Video ${String(index + 1).padStart(2, "0")}`;

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
      slug: "make-a-launch-feel-premium",
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
      slug: "design-systems-for-small-agency-teams",
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
        publishedAt: new Date("2026-04-20"),
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
        publishedAt: new Date("2026-04-20"),
        tags: { connect: tagIds.map((id) => ({ id })) }
      }
    });
  }
}

async function seedTeam() {
  const legacyTeamSlugs = ["maya-reeves", "leo-carter", "nora-singh", "ameeq-khan-backend"];
  const team = [
    {
      name: "Ameeq Khan",
      slug: "ameeq-khan",
      role: "Full-Stack Product Lead",
      bio:
        "Leads Opplexify website development, SaaS planning, mobile app workflows, admin dashboard architecture, backend API structure, and launch strategy.",
      image: "/team/ameeq-khan.png",
      socialLinks: { linkedin: "https://linkedin.com" },
      skills: ["Next.js", "NestJS", "SaaS", "SEO", "Admin Dashboards"],
      sortOrder: 1,
      seoTitle: "Ameeq Khan - Full-Stack Web Development Lead",
      seoDescription:
        "Ameeq Khan leads Opplexify web development for SEO-friendly websites, SaaS platforms, mobile apps, admin dashboards, backend APIs, and product launches."
    },
    {
      name: "Atiq Khan",
      slug: "atiq-khan",
      role: "SEO Planning and Launch Support",
      bio:
        "Plans on-page SEO structure, launch checklists, content alignment, quality assurance, and deployment support for websites, SaaS products, mobile apps, and dashboards.",
      image: "/team/atiq-khan.png",
      socialLinks: { linkedin: "https://linkedin.com" },
      skills: ["On-page SEO", "Launch Planning", "QA", "Content Structure"],
      sortOrder: 2,
      seoTitle: "Atiq Khan - SEO Planning and Launch Support",
      seoDescription:
        "Atiq Khan supports Opplexify projects with on-page SEO planning, launch support, quality assurance, and content structure for websites and digital products."
    },
    {
      name: "Emmad Khan",
      slug: "emmad-khan",
      role: "UI/UX and Frontend Design",
      bio:
        "Designs responsive website interfaces, SaaS dashboards, mobile app screens, conversion paths, product components, and frontend experiences that are clear and fast.",
      image: "/team/emmad-khan.png",
      socialLinks: { linkedin: "https://linkedin.com" },
      skills: ["UI/UX", "Responsive Design", "Conversion Design", "Design Systems"],
      sortOrder: 3,
      seoTitle: "Emmad Khan - UI UX and Frontend Design",
      seoDescription:
        "Emmad Khan designs Opplexify websites, SaaS product interfaces, mobile app screens, admin dashboards, and conversion-focused digital products."
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
      question: "How much does an SEO-friendly business website cost?",
      answer:
        "Opplexify website development packages start at $149 for a focused 5-page responsive website with contact form setup, foundational SEO structure, performance-minded layout, and service-focused content.",
      category: "Website Development",
      sortOrder: 1
    },
    {
      question: "Can you build a full-stack web application with admin dashboard?",
      answer:
        "Yes. Opplexify builds full-stack web applications with Next.js frontends, NestJS APIs, Prisma schemas, MySQL databases, JWT authentication, admin dashboards, user roles, search, filters, and file uploads.",
      category: "Web Applications",
      sortOrder: 2
    },
    {
      question: "Do you develop SaaS platforms and subscription-ready products?",
      answer:
        "Yes. We plan and build SaaS products with authentication, database models, admin controls, product workflows, API architecture, onboarding screens, and subscription-ready structure.",
      category: "SaaS Development",
      sortOrder: 3
    },
    {
      question: "Can you build a mobile app with backend API and admin panel?",
      answer:
        "Yes. Opplexify creates mobile app experiences connected to secure backend APIs, admin dashboards, notification-ready workflows, media handling, and operational reporting.",
      category: "Mobile App Development",
      sortOrder: 4
    },
    {
      question: "What on-page SEO is included with website development?",
      answer:
        "We structure page titles, meta descriptions, headings, internal links, image alt text, canonical URLs, OpenGraph data, schema markup where relevant, responsive layouts, and clean content around the target services.",
      category: "SEO",
      sortOrder: 5
    },
    {
      question: "How fast can Opplexify launch a website, web app or SaaS MVP?",
      answer:
        "A focused business website can launch in 4-7 days. Web applications usually take 2-3 weeks, SaaS products 3-5 weeks, and mobile app plus web app builds 6-8 weeks depending on scope.",
      category: "Timeline",
      sortOrder: 6
    }
  ];

  for (const faq of faqs) {
    const existing = await prisma.faq.findFirst({ where: { question: faq.question } });
    if (existing) await prisma.faq.update({ where: { id: existing.id }, data: faq });
    else await prisma.faq.create({ data: faq });
  }
}

async function seedTestimonials() {
  const testimonials = [
    {
      clientName: "Website Client",
      position: "Founder",
      company: "Service Business",
      rating: 5,
      image: asset("team/team-s-4.webp"),
      reviewText:
        "Opplexify turned our service offer into a fast, SEO-friendly business website with clear pages, strong calls to action, and a contact flow that started bringing better leads.",
      sortOrder: 1
    },
    {
      clientName: "SaaS Founder",
      position: "Product Owner",
      company: "Startup Platform",
      rating: 5,
      image: asset("team/team-s-5.webp"),
      reviewText:
        "The team built our SaaS foundation with authentication, admin dashboard, backend APIs, and database structure. It gave us a launch-ready product instead of just a design mockup.",
      sortOrder: 2
    }
  ];

  for (const testimonial of testimonials) {
    const existing = await prisma.testimonial.findFirst({
      where: { clientName: testimonial.clientName, company: testimonial.company }
    });
    if (existing) await prisma.testimonial.update({ where: { id: existing.id }, data: testimonial });
    else await prisma.testimonial.create({ data: testimonial });
  }
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
      filename: portfolioImages()[0]?.name ?? "portfolio-preview.png",
      originalName: portfolioImages()[0]?.name ?? "portfolio-preview.png",
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

import { existsSync, readdirSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { config } from "dotenv";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { opplexifyCompany, opplexifyFaqs, opplexifyServices } from "@adon/shared";
import * as bcrypt from "bcryptjs";
import { Prisma, PrismaClient } from "../src/generated/prisma/client";
import { databasePoolConfig } from "../src/database-url";
import { productionSeedValue } from "../src/env";

loadEnvFiles();

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(databasePoolConfig())
});

const json = (value: unknown) => value as Prisma.InputJsonValue;
const imageExtensions = new Set([".avif", ".jpg", ".jpeg", ".png", ".webp"]);
const videoExtensions = new Set([".mp4", ".webm", ".mov"]);
const portfolioTags = ["Website", "SaaS", "Dashboard", "Mobile App", "Backend/API", "Automation"];

type PublicSeedAsset = {
  name: string;
  url: string;
  absolutePath: string;
  size: number;
  mimeType: string;
};

async function main() {
  const adminEmail = productionSeedValue("ADMIN_EMAIL", opplexifyCompany.email);
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
  await seedPages();
  await seedServices();
  await seedFaqs();
  await seedPortfolioItems(admin.id);
  await archiveUnverifiedPublicContent();

  console.log("Compliance-safe Opplexify seed complete.");
}

async function seedSettings() {
  const settings = [
    {
      key: "site",
      value: {
        title: opplexifyCompany.legalName,
        legalName: opplexifyCompany.legalName,
        legalDescription: opplexifyCompany.legalDescription,
        description: opplexifyCompany.description,
        email: opplexifyCompany.email,
        phone: opplexifyCompany.phone,
        addressLabel: opplexifyCompany.mailingAddressLabel,
        address: opplexifyCompany.mailingAddress,
        businessHours: opplexifyCompany.businessHours,
        founderOwner: opplexifyCompany.founderOwner,
        startedOn: opplexifyCompany.startedOn,
        logoDark: "/template-assets/dark/assets/imgs/logo/opplexify-logo-dark.svg",
        logoLight: "/template-assets/dark/assets/imgs/logo/opplexify-logo-light.svg",
        favicon: "/template-assets/dark/assets/imgs/logo/favicon.svg"
      }
    },
    {
      key: "social",
      value: {
        linkedin: opplexifyCompany.linkedin
      }
    },
    {
      key: "seo",
      value: {
        defaultTitle: "Opplexify LLC - Custom Websites, SaaS Platforms & Business Software",
        defaultDescription: opplexifyCompany.description,
        ogImage: portfolioImage(0),
        keywords: [
          "Opplexify LLC",
          "custom website development",
          "SaaS platform development",
          "dashboard development",
          "mobile app development",
          "backend API development",
          "automation services"
        ]
      }
    },
    {
      key: "theme",
      value: {
        mode: "dark",
        accent: "#dfff5c",
        secondaryAccent: "#b7ff3c",
        loaderText: "Opplexify"
      }
    },
    {
      key: "footer",
      value: {
        headline: "Plan, build,",
        headlineLine2: "and maintain",
        headlineLine3: "business software",
        ctaLabel: "Request a Quote",
        text: opplexifyCompany.description,
        copyright: `Copyright 2026 ${opplexifyCompany.legalName}. All rights reserved.`,
        serviceLinks: opplexifyServices.slice(0, 4).map((service) => ({
          label: service.title,
          href: `/services/${service.slug}`
        }))
      }
    }
  ];

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: json(setting.value) },
      create: { key: setting.key, value: json(setting.value) }
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

  const items = [
    { label: "Home", url: "/" },
    { label: "About", url: "/about" },
    { label: "Portfolio", url: "/portfolio" },
    { label: "Services", url: "/services" },
    { label: "Pricing", url: "/pricing" },
    { label: "FAQ", url: "/faq" },
    { label: "Contact", url: "/contact" }
  ];

  await prisma.menuItem.createMany({
    data: [
      ...items.map((item, index) => ({ menuId: header.id, ...item, sortOrder: index + 1 })),
      ...items.map((item, index) => ({ menuId: footer.id, ...item, sortOrder: index + 1 }))
    ]
  });
}

async function seedPages() {
  const pages = [
    {
      title: "Home",
      slug: "home",
      pageType: "home",
      summary: opplexifyCompany.description,
      seoTitle: "Custom Websites, SaaS Platforms & Business Software Development | Opplexify LLC",
      seoDescription: opplexifyCompany.description,
      sortOrder: 1,
      sections: [
        {
          key: "hero",
          type: "hero",
          title: "Custom Websites, SaaS Platforms & Business Software Development",
          subtitle: opplexifyCompany.description,
          content: { primaryCta: { label: "Request a Quote", href: "/contact" }, secondaryCta: { label: "Book a Consultation", href: "/contact" } }
        }
      ]
    },
    {
      title: "About",
      slug: "about",
      pageType: "about",
      summary: `${opplexifyCompany.legalName} is a ${opplexifyCompany.legalDescription} providing remote software development services.`,
      seoTitle: "About Opplexify LLC - Remote Software Development Company",
      seoDescription: "Opplexify LLC is a Wyoming-formed software development company providing project-based websites, SaaS platforms, dashboards, mobile apps, backend systems, APIs, and automations.",
      sortOrder: 2,
      sections: []
    },
    {
      title: "Portfolio",
      slug: "portfolio",
      pageType: "portfolio",
      summary: "Selected private client work is available upon request. Public examples use privacy-safe labels only.",
      seoTitle: "Portfolio - Private Client Software Work | Opplexify LLC",
      seoDescription: "Selected private client work from Opplexify LLC is available upon request.",
      sortOrder: 3,
      sections: []
    },
    {
      title: "Services",
      slug: "services",
      pageType: "services",
      summary: "Project-based website, SaaS, dashboard, mobile app, backend/API, and automation development services.",
      seoTitle: "Software Development Services - Opplexify LLC",
      seoDescription: "Custom software development services from Opplexify LLC.",
      sortOrder: 4,
      sections: []
    },
    {
      title: "FAQ",
      slug: "faq",
      pageType: "faq",
      summary: "Answers about Opplexify LLC services, billing, revisions, refunds, and compliance contact.",
      seoTitle: "FAQ - Opplexify LLC Software Development Services",
      seoDescription: "Answers about Opplexify LLC services and project process.",
      sortOrder: 5,
      sections: []
    }
  ];

  for (const page of pages) {
    const { sections, ...data } = page;
    const created = await prisma.page.upsert({
      where: { slug: data.slug },
      update: { ...data, status: "PUBLISHED", deletedAt: null },
      create: { ...data, status: "PUBLISHED" }
    });

    await prisma.pageSection.deleteMany({ where: { pageId: created.id } });
    if (sections.length) {
      await prisma.pageSection.createMany({
        data: sections.map((section, index) => ({
          pageId: created.id,
          key: section.key,
          type: section.type,
          title: section.title,
          subtitle: section.subtitle,
          content: json(section.content),
          sortOrder: index + 1,
          enabled: true
        }))
      });
    }
  }
}

async function seedServices() {
  for (const [index, service] of opplexifyServices.entries()) {
    const description = [
      service.shortDescription,
      `Who it is for: ${service.whoFor}`,
      `Typical timeline: ${service.timeline}`,
      "Deliverables and final scope are confirmed in a written proposal."
    ].join("\n\n");

    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {
        title: service.title,
        shortDescription: service.shortDescription,
        description,
        icon: service.icon,
        image: service.image,
        gallery: json([...service.deliverables, ...service.process]),
        featured: true,
        sortOrder: index + 1,
        seoTitle: `${service.title} - Opplexify LLC`,
        seoDescription: service.shortDescription,
        ogImage: service.image,
        canonicalUrl: `/services/${service.slug}`,
        status: "PUBLISHED",
        deletedAt: null
      },
      create: {
        title: service.title,
        slug: service.slug,
        shortDescription: service.shortDescription,
        description,
        icon: service.icon,
        image: service.image,
        gallery: json([...service.deliverables, ...service.process]),
        featured: true,
        sortOrder: index + 1,
        seoTitle: `${service.title} - Opplexify LLC`,
        seoDescription: service.shortDescription,
        ogImage: service.image,
        canonicalUrl: `/services/${service.slug}`,
        status: "PUBLISHED"
      }
    });
  }
}

async function seedFaqs() {
  await prisma.faq.updateMany({ data: { isActive: false, deletedAt: new Date() } });

  for (const [index, faq] of opplexifyFaqs.entries()) {
    const existing = await prisma.faq.findFirst({ where: { question: faq.question } });
    const data = {
      question: faq.question,
      answer: faq.answer,
      category: "Compliance",
      sortOrder: index + 1,
      isActive: true,
      deletedAt: null
    };
    if (existing) await prisma.faq.update({ where: { id: existing.id }, data });
    else await prisma.faq.create({ data });
  }
}

async function seedPortfolioItems(userId: string) {
  const images = portfolioImages();
  const videos = portfolioVideos();

  for (const [index, item] of images.entries()) {
    const title = `Private client work ${String(index + 1).padStart(2, "0")}`;
    const tag = portfolioTags[index % portfolioTags.length];

    await prisma.portfolioItem.upsert({
      where: { mediaUrl: item.url },
      update: {
        title,
        tag,
        mediaType: "image",
        alt: `${title} preview`,
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
        alt: `${title} preview`,
        featured: index < 9,
        sortOrder: index + 1,
        status: "PUBLISHED"
      }
    });

    await upsertMediaAsset(item, `${title} preview`, "portfolio", userId);
  }

  for (const [index, item] of videos.entries()) {
    const title = `Private client work video ${String(index + 1).padStart(2, "0")}`;
    await prisma.portfolioItem.upsert({
      where: { mediaUrl: item.url },
      update: {
        title,
        tag: "Video",
        mediaType: "video",
        alt: `${title} preview`,
        featured: true,
        sortOrder: images.length + index + 1,
        status: "PUBLISHED",
        deletedAt: null
      },
      create: {
        title,
        tag: "Video",
        mediaUrl: item.url,
        mediaType: "video",
        alt: `${title} preview`,
        featured: true,
        sortOrder: images.length + index + 1,
        status: "PUBLISHED"
      }
    });

    await upsertMediaAsset(item, `${title} preview`, "portfolio", userId);
  }
}

async function archiveUnverifiedPublicContent() {
  const now = new Date();

  await prisma.project.updateMany({
    where: { deletedAt: null },
    data: { status: "ARCHIVED", deletedAt: now }
  });
  await prisma.teamMember.updateMany({
    where: { deletedAt: null },
    data: { status: "ARCHIVED", deletedAt: now }
  });
  await prisma.testimonial.updateMany({
    where: { deletedAt: null },
    data: { isActive: false, deletedAt: now }
  });
}

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
  const thumbnails = readPublicAssets("portfolio/thumbs", imageExtensions);
  return thumbnails.length ? thumbnails : readPublicAssets("portfolio/images", imageExtensions);
}

function portfolioVideos() {
  return readPublicAssets("portfolio/videos", videoExtensions);
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

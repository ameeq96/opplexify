import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { CreateContactMessageDto } from "./dto/contact.dto";

type ResourceConfig = {
  model: string;
  search: string[];
  softDelete?: boolean;
  orderBy?: Record<string, "asc" | "desc">[];
};

const resources: Record<string, ResourceConfig> = {
  settings: { model: "siteSetting", search: ["key"], orderBy: [{ updatedAt: "desc" }] },
  menus: { model: "menu", search: ["name", "location"], orderBy: [{ updatedAt: "desc" }] },
  "menu-items": { model: "menuItem", search: ["label", "url"], orderBy: [{ sortOrder: "asc" }] },
  pages: { model: "page", search: ["title", "slug"], softDelete: true, orderBy: [{ sortOrder: "asc" }] },
  "page-sections": {
    model: "pageSection",
    search: ["key", "type", "title"],
    orderBy: [{ sortOrder: "asc" }]
  },
  services: {
    model: "service",
    search: ["title", "slug", "shortDescription"],
    softDelete: true,
    orderBy: [{ sortOrder: "asc" }]
  },
  "project-categories": {
    model: "projectCategory",
    search: ["name", "slug"],
    orderBy: [{ name: "asc" }]
  },
  projects: {
    model: "project",
    search: ["title", "slug", "client", "shortDescription"],
    softDelete: true,
    orderBy: [{ sortOrder: "asc" }]
  },
  "portfolio-items": {
    model: "portfolioItem",
    search: ["title", "tag", "mediaUrl", "alt"],
    softDelete: true,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
  },
  "blog-categories": { model: "blogCategory", search: ["name", "slug"], orderBy: [{ name: "asc" }] },
  tags: { model: "tag", search: ["name", "slug"], orderBy: [{ name: "asc" }] },
  "blog-posts": {
    model: "blogPost",
    search: ["title", "slug", "excerpt"],
    softDelete: true,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }]
  },
  team: { model: "teamMember", search: ["name", "role"], softDelete: true, orderBy: [{ sortOrder: "asc" }] },
  faqs: { model: "faq", search: ["question", "answer", "category"], softDelete: true, orderBy: [{ sortOrder: "asc" }] },
  testimonials: {
    model: "testimonial",
    search: ["clientName", "company", "reviewText"],
    softDelete: true,
    orderBy: [{ sortOrder: "asc" }]
  },
  "contact-messages": {
    model: "contactMessage",
    search: ["name", "email", "subject", "message"],
    softDelete: true,
    orderBy: [{ createdAt: "desc" }]
  },
  media: { model: "media", search: ["filename", "originalName", "alt"], softDelete: true, orderBy: [{ createdAt: "desc" }] },
  users: { model: "user", search: ["name", "email"], softDelete: true, orderBy: [{ createdAt: "desc" }] }
};

const sluggedResources = new Set(["pages", "services", "project-categories", "projects", "blog-categories", "tags", "blog-posts", "team"]);

@Injectable()
export class CmsService {
  constructor(private readonly prisma: PrismaService) {}

  async publicSite() {
    const [settings, menus] = await Promise.all([
      this.prisma.siteSetting.findMany(),
      this.prisma.menu.findMany({
        include: { items: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } }
      })
    ]);

    return {
      settings: Object.fromEntries(settings.map((item) => [item.key, item.value])),
      menus
    };
  }

  async publicPage(slug: string) {
    const page = await this.prisma.page.findFirst({
      where: { slug, status: "PUBLISHED", deletedAt: null },
      include: {
        sections: {
          where: { enabled: true },
          orderBy: { sortOrder: "asc" }
        }
      }
    });

    if (!page) throw new NotFoundException("Page not found");
    return page;
  }

  listPublicServices(featured?: boolean) {
    return this.prisma.service.findMany({
      where: { status: "PUBLISHED", deletedAt: null, ...(featured ? { featured: true } : {}) },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
    });
  }

  listPublicProjects(featured?: boolean) {
    return this.prisma.project.findMany({
      where: { status: "PUBLISHED", deletedAt: null, ...(featured ? { featured: true } : {}) },
      include: { category: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
    });
  }

  listPublicPortfolioItems(featured?: boolean) {
    return this.prisma.portfolioItem.findMany({
      where: { status: "PUBLISHED", deletedAt: null, ...(featured ? { featured: true } : {}) },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
    });
  }

  listPublicPosts(featured?: boolean) {
    return this.prisma.blogPost.findMany({
      where: { status: "PUBLISHED", deletedAt: null, ...(featured ? { featured: true } : {}) },
      include: { category: true, author: { select: { id: true, name: true } }, tags: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }]
    });
  }

  listPublicTeam() {
    return this.prisma.teamMember.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
    });
  }

  listPublicFaqs() {
    return this.prisma.faq.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
    });
  }

  listPublicTestimonials() {
    return this.prisma.testimonial.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
    });
  }

  async getPublicBySlug(resource: "service" | "project" | "blogPost" | "teamMember", slug: string) {
    const item = await (this.prisma as any)[resource].findFirst({
      where: { slug, status: "PUBLISHED", deletedAt: null },
      include:
        resource === "project"
          ? { category: true }
          : resource === "blogPost"
            ? { category: true, author: { select: { id: true, name: true } }, tags: true }
            : undefined
    });

    if (!item) throw new NotFoundException("Content not found");
    return item;
  }

  createContactMessage(dto: CreateContactMessageDto) {
    return this.prisma.contactMessage.create({ data: dto });
  }

  async dashboard() {
    const [
      services,
      projects,
      portfolioItems,
      posts,
      messages,
      pages,
      media,
      unreadMessages,
      draftPosts
    ] = await Promise.all([
      this.prisma.service.count({ where: { deletedAt: null } }),
      this.prisma.project.count({ where: { deletedAt: null } }),
      this.prisma.portfolioItem.count({ where: { deletedAt: null } }),
      this.prisma.blogPost.count({ where: { deletedAt: null } }),
      this.prisma.contactMessage.count({ where: { deletedAt: null } }),
      this.prisma.page.count({ where: { deletedAt: null } }),
      this.prisma.media.count({ where: { deletedAt: null } }),
      this.prisma.contactMessage.count({ where: { status: "unread", deletedAt: null } }),
      this.prisma.blogPost.count({ where: { status: "DRAFT", deletedAt: null } })
    ]);

    return { services, projects, portfolioItems, posts, messages, pages, media, unreadMessages, draftPosts };
  }

  async list(resourceName: string, query: Record<string, string | undefined>) {
    const config = this.resource(resourceName);
    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(query.limit ?? 25), 1), 100);
    const q = query.q?.trim();
    const where: Record<string, unknown> = {};

    if (config.softDelete) where.deletedAt = null;
    if (query.status) where.status = query.status;
    if (q && config.search.length) {
      where.OR = config.search.map((field) => ({
        [field]: { contains: q, mode: "insensitive" }
      }));
    }

    const model = this.delegate(config);
    const include = this.includeForResource(resourceName);

    const [items, total] = await this.prisma.$transaction([
      model.findMany({
        where,
        include,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: config.orderBy ?? [{ createdAt: "desc" }]
      }),
      model.count({ where })
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async find(resourceName: string, id: string) {
    const config = this.resource(resourceName);
    const item = await this.delegate(config).findUnique({
      where: { id },
      include: this.includeForResource(resourceName)
    });
    if (!item) throw new NotFoundException("Item not found");
    return item;
  }

  async create(resourceName: string, body: Record<string, unknown>, userId?: string) {
    const config = this.resource(resourceName);
    const data = await this.normalize(resourceName, body, userId);
    return this.delegate(config).create({ data, include: this.includeForResource(resourceName) });
  }

  async update(resourceName: string, id: string, body: Record<string, unknown>, userId?: string) {
    const config = this.resource(resourceName);
    const data = await this.normalize(resourceName, body, userId, true);
    return this.delegate(config).update({ where: { id }, data, include: this.includeForResource(resourceName) });
  }

  async remove(resourceName: string, id: string) {
    const config = this.resource(resourceName);
    if (config.softDelete) {
      return this.delegate(config).update({ where: { id }, data: { deletedAt: new Date() } });
    }
    return this.delegate(config).delete({ where: { id } });
  }

  async createMedia(file: Express.Multer.File, body: Record<string, string>, userId?: string) {
    if (!file) throw new BadRequestException("File is required");

    return this.prisma.media.create({
      data: {
        url: `/uploads/${file.filename}`,
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        alt: body.alt,
        folder: body.folder,
        createdById: userId
      }
    });
  }

  private resource(resourceName: string) {
    const config = resources[resourceName];
    if (!config) throw new NotFoundException(`Unknown resource: ${resourceName}`);
    return config;
  }

  private delegate(config: ResourceConfig) {
    return (this.prisma as any)[config.model];
  }

  private includeForResource(resourceName: string) {
    if (resourceName === "projects") return { category: true };
    if (resourceName === "blog-posts") return { category: true, author: { select: { id: true, name: true } }, tags: true };
    if (resourceName === "pages") return { sections: { orderBy: { sortOrder: "asc" } } };
    if (resourceName === "menus") return { items: { orderBy: { sortOrder: "asc" } } };
    return undefined;
  }

  private async normalize(
    resourceName: string,
    body: Record<string, unknown>,
    userId?: string,
    isUpdate = false
  ) {
    const data = { ...body };
    for (const key of ["id", "createdAt", "updatedAt", "deletedAt", "category", "author", "tags", "sections", "items"]) {
      delete data[key];
    }

    if (sluggedResources.has(resourceName)) {
      if (!data.slug && typeof data.title === "string") data.slug = slugify(data.title);
      if (!data.slug && typeof data.name === "string") data.slug = slugify(data.name);
    } else {
      delete data.slug;
    }

    if (!isUpdate && !data.key && resourceName === "page-sections") data.key = slugify(String(data.title ?? data.type ?? "section"));

    for (const key of ["sortOrder", "rating", "size"]) {
      if (data[key] !== undefined && data[key] !== null && data[key] !== "") data[key] = Number(data[key]);
    }

    for (const key of ["featured", "enabled", "isActive"]) {
      if (typeof data[key] === "string") data[key] = data[key] === "true";
    }

    for (const key of ["date", "publishedAt", "resetTokenExpiresAt"]) {
      if (data[key]) data[key] = new Date(String(data[key]));
    }

    for (const key of ["gallery", "contentBlocks", "socialLinks", "skills", "metadata", "content", "value"]) {
      if (typeof data[key] === "string") {
        const value = String(data[key]).trim();
        if ((value.startsWith("{") && value.endsWith("}")) || (value.startsWith("[") && value.endsWith("]"))) {
          data[key] = JSON.parse(value);
        }
      }
    }

    if (resourceName === "users" && typeof data.password === "string" && data.password) {
      data.password = await bcrypt.hash(data.password, 12);
    } else if (resourceName === "users" && isUpdate && !data.password) {
      delete data.password;
    }

    if (resourceName === "media" && userId && !isUpdate) data.createdById = userId;

    return data;
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

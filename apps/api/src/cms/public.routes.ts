import { NextFunction, Request, Response, Router } from "express";
import { asyncHandler } from "../http";
import { CmsService } from "./cms.service";
import { validateContactMessageDto } from "./dto/contact.dto";

export function createPublicRouter(cms = new CmsService()) {
  const router = Router();
  const contactRateLimit = createIpRateLimit(10 * 60 * 1000, 5);

  router.use((req, res, next) => {
    if (req.method === "GET") {
      res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    }
    next();
  });

  router.get(
    "/site",
    asyncHandler(async (_req, res) => {
      res.json(await cms.publicSite());
    })
  );

  router.get(
    "/pages/:slug",
    asyncHandler(async (req, res) => {
      res.json(await cms.publicPage(param(req.params.slug)));
    })
  );

  router.get(
    "/services",
    asyncHandler(async (req, res) => {
      res.json(await cms.listPublicServices(req.query.featured === "true"));
    })
  );

  router.get(
    "/services/:slug",
    asyncHandler(async (req, res) => {
      res.json(await cms.getPublicBySlug("service", param(req.params.slug)));
    })
  );

  router.get(
    "/projects",
    asyncHandler(async (req, res) => {
      res.json(await cms.listPublicProjects(req.query.featured === "true"));
    })
  );

  router.get(
    "/projects/:slug",
    asyncHandler(async (req, res) => {
      res.json(await cms.getPublicBySlug("project", param(req.params.slug)));
    })
  );

  router.get(
    "/portfolio-items",
    asyncHandler(async (req, res) => {
      res.json(await cms.listPublicPortfolioItems(req.query.featured === "true"));
    })
  );

  router.get(
    "/blog",
    asyncHandler(async (req, res) => {
      res.json(await cms.listPublicPosts(req.query.featured === "true"));
    })
  );

  router.get(
    "/blog/:slug",
    asyncHandler(async (req, res) => {
      res.json(await cms.getPublicBySlug("blogPost", param(req.params.slug)));
    })
  );

  router.get(
    "/team",
    asyncHandler(async (_req, res) => {
      res.json(await cms.listPublicTeam());
    })
  );

  router.get(
    "/team/:slug",
    asyncHandler(async (req, res) => {
      res.json(await cms.getPublicBySlug("teamMember", param(req.params.slug)));
    })
  );

  router.get(
    "/faqs",
    asyncHandler(async (_req, res) => {
      res.json(await cms.listPublicFaqs());
    })
  );

  router.get(
    "/testimonials",
    asyncHandler(async (_req, res) => {
      res.json(await cms.listPublicTestimonials());
    })
  );

  router.post(
    "/contact",
    contactRateLimit,
    asyncHandler(async (req, res) => {
      res.json(await cms.createContactMessage(validateContactMessageDto(req.body)));
    })
  );

  return router;
}

function param(value: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function createIpRateLimit(windowMs: number, maxRequests: number) {
  const clients = new Map<string, { count: number; resetAt: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || "unknown";
    let client = clients.get(key);

    if (!client || client.resetAt <= now) {
      if (clients.size >= 10_000) pruneRateLimitClients(clients, now);
      if (clients.size >= 10_000) clients.delete(clients.keys().next().value!);
      client = { count: 0, resetAt: now + windowMs };
      clients.set(key, client);
    }

    client.count += 1;
    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", Math.max(maxRequests - client.count, 0));
    res.setHeader("X-RateLimit-Reset", Math.ceil(client.resetAt / 1000));

    if (client.count > maxRequests) {
      res.setHeader("Retry-After", Math.max(Math.ceil((client.resetAt - now) / 1000), 1));
      res.status(429).json({ message: "Too many contact requests. Please try again later." });
      return;
    }

    next();
  };
}

function pruneRateLimitClients(clients: Map<string, { resetAt: number }>, now: number) {
  for (const [key, client] of clients) {
    if (client.resetAt <= now) clients.delete(key);
  }
}

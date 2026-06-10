import { Router } from "express";
import { asyncHandler } from "../http";
import { CmsService } from "./cms.service";
import { validateContactMessageDto } from "./dto/contact.dto";

export function createPublicRouter(cms = new CmsService()) {
  const router = Router();

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
      res.json([]);
    })
  );

  router.post(
    "/contact",
    asyncHandler(async (req, res) => {
      res.json(await cms.createContactMessage(validateContactMessageDto(req.body)));
    })
  );

  return router;
}

function param(value: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

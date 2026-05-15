import { mkdirSync } from "node:fs";
import { extname, join } from "node:path";
import { Router } from "express";
import multer, { diskStorage } from "multer";
import { authenticateJwt, requireRoles } from "../auth/auth.middleware";
import { asyncHandler, HttpError } from "../http";
import { CmsService } from "./cms.service";

const adminRoles = requireRoles("SUPER_ADMIN", "ADMIN", "EDITOR");

const upload = multer({
  storage: diskStorage({
    destination: (_req, _file, cb) => {
      const destination = join(process.cwd(), "uploads");
      mkdirSync(destination, { recursive: true });
      cb(null, destination);
    },
    filename: (_req, file, cb) => {
      const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${file.fieldname}-${suffix}${extname(file.originalname)}`);
    }
  })
});

export function createAdminRouter(cms = new CmsService()) {
  const router = Router();
  const protectedRoute = [authenticateJwt, adminRoles];

  router.use((req, _res, next) => {
    if (req.method === "GET" && (req.path === "/" || req.path === "/login")) {
      next("router");
      return;
    }
    next();
  });

  router.get(
    "/dashboard",
    ...protectedRoute,
    asyncHandler(async (_req, res) => {
      res.json(await cms.dashboard());
    })
  );

  router.post(
    "/media/upload",
    ...protectedRoute,
    upload.single("file"),
    asyncHandler(async (req, res) => {
      res.json(await cms.createMedia(req.file!, req.body, req.user!.id));
    })
  );

  router.get(
    "/:resource",
    ...protectedRoute,
    asyncHandler(async (req, res) => {
      const resource = param(req.params.resource);
      assertResourceAccess(resource, req.user!.role);
      res.json(await cms.list(resource, req.query as Record<string, string | undefined>));
    })
  );

  router.get(
    "/:resource/:id",
    ...protectedRoute,
    asyncHandler(async (req, res) => {
      const resource = param(req.params.resource);
      assertResourceAccess(resource, req.user!.role);
      res.json(await cms.find(resource, param(req.params.id)));
    })
  );

  router.post(
    "/:resource",
    ...protectedRoute,
    asyncHandler(async (req, res) => {
      const resource = param(req.params.resource);
      assertResourceAccess(resource, req.user!.role);
      res.json(await cms.create(resource, req.body, req.user!.id));
    })
  );

  router.patch(
    "/:resource/:id",
    ...protectedRoute,
    asyncHandler(async (req, res) => {
      const resource = param(req.params.resource);
      assertResourceAccess(resource, req.user!.role);
      res.json(await cms.update(resource, param(req.params.id), req.body, req.user!.id));
    })
  );

  router.delete(
    "/:resource/:id",
    ...protectedRoute,
    asyncHandler(async (req, res) => {
      const resource = param(req.params.resource);
      assertResourceAccess(resource, req.user!.role);
      res.json(await cms.remove(resource, param(req.params.id)));
    })
  );

  return router;
}

function assertResourceAccess(resource: string, role: string) {
  if (role === "SUPER_ADMIN") return;
  if (resource === "users") {
    throw new HttpError(403, "Only super admins can manage users.");
  }
  if (role === "EDITOR" && ["settings", "menus", "menu-items"].includes(resource)) {
    throw new HttpError(403, "Editors cannot manage global settings or menus.");
  }
}

function param(value: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

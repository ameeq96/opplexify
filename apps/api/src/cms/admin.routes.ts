import { mkdirSync } from "node:fs";
import { open, unlink } from "node:fs/promises";
import { join } from "node:path";
import { NextFunction, Request, Response, Router } from "express";
import multer, { diskStorage } from "multer";
import { authenticateJwt, requireRoles } from "../auth/auth.middleware";
import { asyncHandler, HttpError } from "../http";
import { CmsService } from "./cms.service";

const adminRoles = requireRoles("SUPER_ADMIN", "ADMIN", "EDITOR");
const maxUploadBytes = 25 * 1024 * 1024;
const mediaExtensions = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/gif", ".gif"],
  ["image/webp", ".webp"],
  ["image/avif", ".avif"],
  ["video/mp4", ".mp4"],
  ["video/webm", ".webm"],
  ["video/quicktime", ".mov"]
]);

const upload = multer({
  limits: { fileSize: maxUploadBytes, files: 1, fields: 10, fieldSize: 10 * 1024 },
  fileFilter: (_req, file, cb) => {
    const mimeType = file.mimetype.toLowerCase();
    if (!mediaExtensions.has(mimeType)) {
      cb(new HttpError(415, "Unsupported media type. Upload a JPEG, PNG, GIF, WebP, AVIF, MP4, WebM, or MOV file."));
      return;
    }
    file.mimetype = mimeType;
    cb(null, true);
  },
  storage: diskStorage({
    destination: (_req, _file, cb) => {
      const destination = join(process.cwd(), "uploads");
      mkdirSync(destination, { recursive: true });
      cb(null, destination);
    },
    filename: (_req, file, cb) => {
      const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `media-${suffix}${mediaExtensions.get(file.mimetype)!}`);
    }
  })
});
const uploadSingleMedia = (req: Request, res: Response, next: NextFunction) => {
  upload.single("file")(req, res, (error) => {
    if (!error) {
      next();
      return;
    }
    if (error instanceof HttpError) {
      next(error);
      return;
    }
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      next(new HttpError(413, "File must be 25 MB or smaller."));
      return;
    }
    next(new HttpError(400, "Invalid media upload."));
  });
};

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
    uploadSingleMedia,
    asyncHandler(async (req, res) => {
      if (!req.file) throw new HttpError(400, "File is required");
      if (!(await hasValidMediaSignature(req.file))) {
        await unlink(req.file.path).catch(() => undefined);
        throw new HttpError(415, "The file content does not match its media type.");
      }

      let media;
      try {
        media = await cms.createMedia(req.file, req.body, req.user!.id);
      } catch (error) {
        await unlink(req.file.path).catch(() => undefined);
        throw error;
      }
      res.json(media);
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

async function hasValidMediaSignature(file: Express.Multer.File) {
  const handle = await open(file.path, "r");
  try {
    const buffer = Buffer.alloc(64);
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
    const bytes = buffer.subarray(0, bytesRead);

    switch (file.mimetype) {
      case "image/jpeg":
        return startsWith(bytes, [0xff, 0xd8, 0xff]);
      case "image/png":
        return startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      case "image/gif":
        return bytes.subarray(0, 6).toString("ascii") === "GIF87a" || bytes.subarray(0, 6).toString("ascii") === "GIF89a";
      case "image/webp":
        return bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP";
      case "image/avif": {
        const header = bytes.toString("ascii");
        return bytes.subarray(4, 8).toString("ascii") === "ftyp" && (header.includes("avif") || header.includes("avis"));
      }
      case "video/mp4":
        return bytes.subarray(4, 8).toString("ascii") === "ftyp";
      case "video/quicktime":
        return bytes.subarray(4, 8).toString("ascii") === "ftyp" && bytes.subarray(8, 12).toString("ascii") === "qt  ";
      case "video/webm":
        return startsWith(bytes, [0x1a, 0x45, 0xdf, 0xa3]);
      default:
        return false;
    }
  } finally {
    await handle.close();
  }
}

function startsWith(buffer: Buffer, signature: number[]) {
  return signature.every((byte, index) => buffer[index] === byte);
}

import path from "node:path";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { createAuthRouter } from "./auth/auth.routes";
import { createAdminRouter } from "./cms/admin.routes";
import { createPublicRouter } from "./cms/public.routes";
import { docsAssets, docsHandler, openApiDocument } from "./docs";
import { assertProductionEnv, webOrigin } from "./env";
import { errorHandler } from "./http";
import { prisma } from "./prisma/prisma.service";

export function createApiApp() {
  assertProductionEnv();

  const app = express();
  const allowedOrigins = new Set([webOrigin, "http://localhost:3000", "http://127.0.0.1:3000"]);

  app.disable("x-powered-by");
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(
    cors({
      credentials: true,
      origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
          callback(null, true);
          return;
        }
        callback(null, false);
      }
    })
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(
    "/uploads",
    express.static(path.join(process.cwd(), "uploads"), {
      setHeaders(res) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
    })
  );

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "opplexify-api" });
  });
  app.get("/docs/openapi.json", (_req, res) => {
    res.json(openApiDocument);
  });
  app.get("/docs", docsHandler);
  app.use("/docs", docsAssets, docsHandler);
  app.use("/auth", createAuthRouter());
  app.use("/public", createPublicRouter());
  app.use("/admin", createAdminRouter());
  app.use(errorHandler);

  return app;
}

export async function startApi(port = Number(process.env.PORT ?? 4000)) {
  const app = createApiApp();
  await prisma.connect();
  return app.listen(port, () => {
    console.log(`Opplexify API listening on ${port}`);
  });
}

if (require.main === module) {
  startApi().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

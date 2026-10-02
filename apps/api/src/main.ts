import path from "node:path";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { createAuthRouter } from "./auth/auth.routes";
import { createAdminRouter } from "./cms/admin.routes";
import { createPublicRouter } from "./cms/public.routes";
import { docsAssets, docsHandler, openApiDocument } from "./docs";
import { assertProductionEnv, isProduction, trustProxyHops, webOrigin } from "./env";
import { requireTrustedOrigin } from "./auth/auth.middleware";
import { errorHandler } from "./http";
import { createSafepayRouter } from "./payments/safepay.routes";
import { createStreamingSafepayRouter, safepayWebhookHandler } from "./payments/streaming-safepay.routes";
import { prisma } from "./prisma/prisma.service";
import { createStreamingRouter } from "./streaming/streaming.routes";

export function createApiApp() {
  assertProductionEnv();

  const app = express();
  const allowedOrigins = new Set([
    webOrigin,
    ...(!isProduction ? ["http://localhost:3000", "http://127.0.0.1:3000"] : [])
  ]);

  app.disable("x-powered-by");
  app.set("trust proxy", trustProxyHops);
  // This Express app is mounted in front of Next.js (see root main.js), so any
  // header set here also lands on the HTML pages. Keep CSP resource directives
  // unrestricted for Next.js hydration, while enforcing the safe directives
  // that do not alter customer browsing or checkout behavior.
  app.use(helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: helmet.contentSecurityPolicy.dangerouslyDisableDefaultSrc,
        baseUri: ["'self'"],
        formAction: ["'self'", "https://sandbox.api.getsafepay.com", "https://api.getsafepay.com"],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"]
      }
    },
    crossOriginResourcePolicy: false
  }));
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
  app.post("/public/safepay/webhook", express.raw({ type: "*/*", limit: "1mb" }), safepayWebhookHandler);
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(
    "/uploads",
    express.static(path.join(process.cwd(), "uploads"), {
      setHeaders(res) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        res.setHeader("Content-Security-Policy", "default-src 'none'; sandbox");
        res.setHeader("X-Content-Type-Options", "nosniff");
      }
    })
  );

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "opplexify-api" });
  });
  if (!isProduction) {
    app.get("/docs/openapi.json", (_req, res) => {
      res.json(openApiDocument);
    });
    app.get("/docs", docsHandler);
    app.use("/docs", docsAssets, docsHandler);
  }
  app.use(["/auth", "/admin", "/public/safepay"], (_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });
  app.use("/auth", createAuthRouter());
  app.use("/public/safepay-demo", createSafepayRouter("/public/safepay-demo/return"));
  app.use("/public/safepay", createStreamingSafepayRouter());
  app.use("/public/streaming", createStreamingRouter());
  app.use("/public", createPublicRouter());
  app.use("/admin", requireTrustedOrigin, createAdminRouter());
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

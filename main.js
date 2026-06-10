#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const express = require("express");
const next = require("next");
const { createApiApp } = require("./apps/api/dist/main.js");

const port = Number(process.env.PORT || process.env.APP_PORT || process.env.NODE_PORT || 3000);
const host = process.env.HOST || "0.0.0.0";
const dev = process.env.NODE_ENV !== "production";
const webDir = path.join(__dirname, "apps/web");
const preferredHost = "opplexify.com";
const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);

process.env.INTERNAL_API_URL = process.env.INTERNAL_API_URL || `http://127.0.0.1:${port}`;

const nextApp = next({ dev, dir: webDir });
const handle = nextApp.getRequestHandler();

function log(message, extra) {
  const line = `[${new Date().toISOString()}] ${message}${extra ? ` ${JSON.stringify(extra)}` : ""}`;
  console.log(line);
  try {
    fs.appendFileSync(path.join(__dirname, "startup.log"), `${line}\n`);
  } catch {
    // Hostinger may make the app directory read-only after deploy; console logs still work.
  }
}

async function start() {
  log("Opplexify startup", {
    node: process.version,
    cwd: process.cwd(),
    dirname: __dirname,
    nodeEnv: process.env.NODE_ENV,
    port,
    host,
    hasJwtSecret: Boolean(process.env.JWT_SECRET),
    hasDbHost: Boolean(process.env.DB_HOST),
    hasDbDatabase: Boolean(process.env.DB_DATABASE),
    apiEntryExists: fs.existsSync(path.join(__dirname, "apps/api/dist/main.js")),
    webBuildExists: fs.existsSync(path.join(webDir, ".next"))
  });

  await nextApp.prepare();

  const server = express();
  server.disable("x-powered-by");
  server.set("trust proxy", true);
  server.use((req, res, nextMiddleware) => {
    const host = String(req.headers.host || "").split(":")[0].toLowerCase();
    if (!host || localHosts.has(host)) return nextMiddleware();

    const forwardedProto = String(req.headers["x-forwarded-proto"] || req.protocol || "")
      .split(",")[0]
      .trim()
      .toLowerCase();
    const shouldRedirectHost = host === `www.${preferredHost}`;
    const shouldRedirectProtocol = forwardedProto === "http";

    if (!shouldRedirectHost && !shouldRedirectProtocol) return nextMiddleware();

    return res.redirect(301, `https://${preferredHost}${req.originalUrl || req.url}`);
  });
  server.use(createApiApp());
  server.use((req, res) => {
    res.removeHeader("Content-Security-Policy");
    res.removeHeader("Content-Security-Policy-Report-Only");
    handle(req, res);
  });

  const listener = server.listen(port, host, () => {
    log(`Opplexify app listening on ${host}:${port}`);
  });

  listener.on("error", (error) => {
    log("Opplexify server listen error", { message: error.message, stack: error.stack });
    process.exit(1);
  });
}

start().catch((error) => {
  log("Opplexify startup failed", { message: error.message, stack: error.stack });
  process.exit(1);
});

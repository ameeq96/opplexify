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
const nextApp = next({ dev, dir: webDir });
const handle = nextApp.getRequestHandler();
const canonicalHost = (process.env.CANONICAL_HOST || "opplexify.com").toLowerCase();
const canonicalOrigin = `https://${canonicalHost}`;

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
  server.use((req, res, nextMiddleware) => {
    if (dev) {
      nextMiddleware();
      return;
    }

    const host = String(req.headers.host || "").toLowerCase();
    const forwardedProto = String(req.headers["x-forwarded-proto"] || "").split(",")[0].trim().toLowerCase();
    const forwardedSsl = String(req.headers["x-forwarded-ssl"] || "").toLowerCase();
    const forwardedPort = String(req.headers["x-forwarded-port"] || "");
    const isHttps = forwardedProto === "https" || forwardedSsl === "on" || forwardedPort === "443" || req.secure;

    if (host === canonicalHost && isHttps) {
      nextMiddleware();
      return;
    }

    res.redirect(301, `${canonicalOrigin}${req.originalUrl}`);
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

#!/usr/bin/env node
const path = require("node:path");
const express = require("express");
const next = require("next");
const { createApiApp } = require("./apps/api/dist/main.js");

const port = Number(process.env.PORT || 3000);
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev, dir: path.join(__dirname, "apps/web") });
const handle = nextApp.getRequestHandler();

async function start() {
  await nextApp.prepare();

  const server = express();
  server.disable("x-powered-by");
  server.use(createApiApp());
  server.use((req, res) => handle(req, res));

  server.listen(port, () => {
    console.log(`Opplexify app listening on ${port}`);
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});

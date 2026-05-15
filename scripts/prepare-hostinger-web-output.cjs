#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const workspaceOutput = path.join(projectRoot, "apps/web/.next");
const rootOutput = path.join(projectRoot, ".next");

if (!fs.existsSync(workspaceOutput)) {
  console.error('Web build output not found at "apps/web/.next".');
  process.exit(1);
}

if (fs.existsSync(rootOutput)) {
  fs.rmSync(rootOutput, { recursive: true, force: true });
}

fs.cpSync(workspaceOutput, rootOutput, { recursive: true });
console.log('Web build output prepared at ".next" and "apps/web/.next".');

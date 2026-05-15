#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "apps/api/dist");
const entryFile = path.join(distDir, "main.js");

if (!fs.existsSync(entryFile)) {
  console.error('API build output verification failed: expected "apps/api/dist/main.js" to exist.');
  console.error(`Checked absolute path: ${entryFile}`);
  process.exit(1);
}

const stats = fs.statSync(entryFile);
const files = fs
  .readdirSync(distDir, { withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)
  .sort();

console.log(`API build output verified: apps/api/dist/main.js (${stats.size} bytes)`);
console.log(`API dist files: ${files.join(", ")}`);

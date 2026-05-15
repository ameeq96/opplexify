#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const { config: loadEnv } = require("dotenv");

const projectRoot = path.resolve(__dirname, "..");
const enforceProduction = process.argv.includes("--production");

process.env.DOTENV_CONFIG_QUIET = "true";

for (const relativePath of ["apps/api/.env", ".env"]) {
  const envPath = path.join(projectRoot, relativePath);
  if (fs.existsSync(envPath)) {
    loadEnv({ path: envPath, quiet: true });
  }
}

const errors = [];
const entryPath = path.join(projectRoot, "apps/api/dist/main.js");

if (!fs.existsSync(entryPath)) {
  errors.push('Compiled API entry not found at "apps/api/dist/main.js". Run "npm run hostinger:build:api" before starting the API.');
}

const runtimeModules = [
  "@adon/shared",
  "@nestjs/common",
  "@nestjs/config",
  "@nestjs/core",
  "@nestjs/jwt",
  "@nestjs/passport",
  "@nestjs/platform-express",
  "@nestjs/swagger",
  "@prisma/adapter-mariadb",
  "@prisma/client",
  "bcryptjs",
  "class-transformer",
  "class-validator",
  "dotenv",
  "helmet",
  "multer",
  "passport",
  "passport-jwt",
  "reflect-metadata",
  "rxjs"
];

for (const moduleName of runtimeModules) {
  try {
    require.resolve(moduleName);
  } catch {
    errors.push(`Runtime dependency is not installed or cannot be resolved: ${moduleName}`);
  }
}

const shouldValidateProductionEnv = enforceProduction || process.env.NODE_ENV === "production";

if (enforceProduction && process.env.NODE_ENV !== "production") {
  errors.push('NODE_ENV must be set to "production" for Hostinger API startup.');
}

if (shouldValidateProductionEnv) {
  const missing = [];
  if (!hasDatabaseConfig()) {
    missing.push("DATABASE_URL or DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD");
  }
  if (!process.env.JWT_SECRET?.trim()) {
    missing.push("JWT_SECRET");
  }

  if (missing.length > 0) {
    errors.push(`Missing required production environment variable(s): ${missing.join(", ")}`);
  }
}

if (errors.length > 0) {
  console.error("Hostinger API preflight failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Hostinger API preflight passed.");

function hasDatabaseConfig() {
  return Boolean(process.env.DATABASE_URL?.trim()) || ["DB_HOST", "DB_DATABASE", "DB_USERNAME", "DB_PASSWORD"].every((name) => Boolean(process.env[name]?.trim()));
}

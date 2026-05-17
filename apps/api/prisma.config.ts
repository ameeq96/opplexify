import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";
import { defineConfig } from "prisma/config";
import { databaseUrl } from "./src/database-url";

process.env.DOTENV_CONFIG_QUIET = "true";

loadEnvFiles();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx apps/api/prisma/seed.ts"
  },
  datasource: {
    url: databaseUrl()
  }
});

function loadEnvFiles() {
  const candidates = [
    resolve(process.cwd(), "apps/api/.env"),
    resolve(process.cwd(), ".env"),
    resolve(process.cwd(), "../.env"),
    resolve(process.cwd(), "../../.env")
  ];

  for (const path of Array.from(new Set(candidates))) {
    if (existsSync(path)) config({ path, quiet: true });
  }
}

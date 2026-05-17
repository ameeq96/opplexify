import { config } from "dotenv";
import { defineConfig } from "prisma/config";
import { databaseUrl } from "./src/database-url";

process.env.DOTENV_CONFIG_QUIET = "true";

config({ path: "apps/api/.env", quiet: true });
config({ quiet: true });

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

import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

config({ path: "apps/api/.env" });
config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx apps/api/prisma/seed.ts"
  },
  datasource: {
    url: env("DATABASE_URL")
  }
});

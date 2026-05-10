import { config } from "dotenv";
import { defineConfig } from "prisma/config";
import { databaseUrl } from "./src/database-url";

config({ path: "apps/api/.env" });
config();

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

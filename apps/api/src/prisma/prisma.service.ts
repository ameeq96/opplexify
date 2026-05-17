import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";
import { databaseUrl } from "../database-url";

export class PrismaService extends PrismaClient {
  constructor() {
    super({
      adapter: new PrismaMariaDb(databaseUrl())
    });
  }

  async connect() {
    await this.$connect();
  }

  async disconnect() {
    await this.$disconnect();
  }
}

export const prisma = new PrismaService();

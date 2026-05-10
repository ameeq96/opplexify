import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      adapter: new PrismaMariaDb(databaseUrl())
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

function databaseUrl() {
  const connectionString = process.env.DATABASE_URL ?? "mysql://adon:adon@localhost:3306/adon";

  try {
    const url = new URL(connectionString);
    const allowPublicKeyRetrieval = process.env.DB_ALLOW_PUBLIC_KEY_RETRIEVAL ?? "true";

    if (!url.searchParams.has("allowPublicKeyRetrieval") && allowPublicKeyRetrieval !== "false") {
      url.searchParams.set("allowPublicKeyRetrieval", allowPublicKeyRetrieval);
    }

    return url.toString();
  } catch {
    return connectionString;
  }
}

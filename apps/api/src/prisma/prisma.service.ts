import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { applyDatabaseUrl } from "../config/database-url";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    const databaseUrl = applyDatabaseUrl();

    super(
      databaseUrl
        ? {
            datasources: {
              db: {
                url: databaseUrl
              }
            }
          }
        : undefined
    );
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

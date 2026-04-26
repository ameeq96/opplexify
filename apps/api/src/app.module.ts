import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AdminModule } from "./admin/admin.module";
import { AuthModule } from "./auth/auth.module";
import { ContactsModule } from "./contacts/contacts.module";
import { HealthController } from "./health.controller";
import { PricingModule } from "./pricing/pricing.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ProjectsModule } from "./projects/projects.module";
import { QuotesModule } from "./quotes/quotes.module";
import { TestimonialsModule } from "./testimonials/testimonials.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", "apps/api/.env"]
    }),
    PrismaModule,
    AuthModule,
    ProjectsModule,
    ContactsModule,
    QuotesModule,
    PricingModule,
    TestimonialsModule,
    AdminModule
  ],
  controllers: [HealthController]
})
export class AppModule {}

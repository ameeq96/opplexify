import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthController } from "./auth/auth.controller";
import { AuthService } from "./auth/auth.service";
import { JwtStrategy } from "./auth/jwt.strategy";
import { CmsController } from "./cms/cms.controller";
import { AdminController } from "./cms/admin.controller";
import { CmsService } from "./cms/cms.service";
import { jwtExpiresIn, jwtSecret } from "./env";
import { HealthController } from "./health.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ["apps/api/.env", ".env"]
    }),
    PassportModule,
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: jwtExpiresIn as never }
    }),
    PrismaModule
  ],
  controllers: [HealthController, AuthController, CmsController, AdminController],
  providers: [AuthService, JwtStrategy, CmsService]
})
export class AppModule {}

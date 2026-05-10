import "reflect-metadata";
import { join } from "node:path";
import helmet from "helmet";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { assertProductionEnv, webOrigin } from "./env";

async function bootstrap() {
  assertProductionEnv();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.enableCors({
    origin: [webOrigin, "http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false
    })
  );
  app.useStaticAssets(join(process.cwd(), "uploads"), {
    prefix: "/uploads",
    setHeaders: (res) => {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    }
  });

  const config = new DocumentBuilder()
    .setTitle("Opplexify CMS API")
    .setDescription("Dynamic API for the Opplexify Next.js frontend and admin dashboard.")
    .setVersion("1.0.0")
    .addBearerAuth()
    .build();

  SwaggerModule.setup("docs", app, SwaggerModule.createDocument(app, config));

  await app.listen(Number(process.env.PORT ?? 4000));
}

bootstrap();

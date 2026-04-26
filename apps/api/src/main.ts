import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const frontendUrl = config.get<string>("FRONTEND_URL") ?? "http://localhost:3000";
  const allowedOrigins = frontendUrl
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.setGlobalPrefix("api");
  app.enableCors({
    origin: allowedOrigins,
    credentials: true
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true
    })
  );

  const port = Number(config.get<string>("PORT") ?? 4000);
  await app.listen(port);
}

bootstrap();

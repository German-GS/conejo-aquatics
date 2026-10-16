import helmet from 'helmet';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  app.use(
    helmet({
      // Las imágenes de /uploads las consumen el admin (:5173) y el
      // sitio público (:3000), ambos en otro origin que la API — sin
      // esto, helmet las bloquea por CORP aunque CORS ya las permita.
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const origins = config
    .get<string>('CORS_ORIGINS', 'http://localhost:3000,http://localhost:5173')
    .split(',')
    .map((o) => o.trim());
  app.enableCors({ origin: origins, credentials: true });

  const port = config.get<number>('PORT', 3001);
  await app.listen(port);
  console.log(`Conejo Aquatics API escuchando en http://localhost:${port}`);
}
await bootstrap();

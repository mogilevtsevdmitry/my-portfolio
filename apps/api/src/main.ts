import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

/**
 * Build the list of allowed CORS origins from env. Supports either
 *   CORS_ORIGINS=https://a.com,https://b.com
 * or the historical WEB_URL / ADMIN_URL pair. Localhost dev ports are
 * always included so local dev doesn't require any env at all.
 */
function buildAllowedOrigins(): string[] {
  const fromList =
    process.env.CORS_ORIGINS?.split(',')
      .map((s) => s.trim().replace(/\/+$/, ''))
      .filter(Boolean) ?? [];

  const fromPair = [process.env.WEB_URL, process.env.ADMIN_URL]
    .filter((s): s is string => !!s)
    .map((s) => s.replace(/\/+$/, ''));

  const defaults = [
    'http://localhost:3000',
    'http://localhost:3002',
    'http://localhost:3004',
  ];

  return Array.from(new Set([...fromList, ...fromPair, ...defaults]));
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const allowedOrigins = buildAllowedOrigins();
  logger.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow non-browser requests (curl, server-to-server) where Origin is absent.
      if (!origin) return callback(null, true);
      const normalized = origin.replace(/\/+$/, '');
      if (allowedOrigins.includes(normalized)) {
        return callback(null, true);
      }
      logger.warn(`CORS rejected origin: ${origin}`);
      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  logger.log(`API running on http://localhost:${port}`);
}

bootstrap();

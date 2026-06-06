import { NestFactory } from '@nestjs/core';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationError } from 'class-validator';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/all-exceptions.filter';
import { buildAllowedOrigins, normalizeOrigin } from './common/allowed-origins';

async function bootstrap() {
  // SEC-012: disable Nest's implicit body parser so the explicitly size-limited
  // parsers registered below (express.json/urlencoded with a 64kb cap) are the
  // ones that actually parse the body. Without this, Nest's default parser runs
  // first (~100kb) and the custom limit is a no-op.
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });
  const logger = new Logger('Bootstrap');

  // SEC-001: trust the first reverse-proxy hop so rate limiting (and any other
  // IP-based logic) is keyed on the real client IP from X-Forwarded-For rather
  // than the proxy's address.
  app.set('trust proxy', 1);

  // SEC-004: baseline security headers. This is a JSON API, so helmet's
  // defaults are appropriate. helmet does NOT touch CORS, configured below.
  app.use(helmet());

  // SEC-012: cap request body size to mitigate memory-exhaustion DoS. 64kb is
  // ample for our JSON payloads (contacts, analytics, admin CRUD). This
  // replaces the implicit Nest body parser with an explicitly-limited one.
  app.use(express.json({ limit: '64kb' }));
  app.use(express.urlencoded({ extended: true, limit: '64kb' }));

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      // Attach a machine-readable `code` so the frontend can pick a localized
      // message instead of showing raw validator strings to the user.
      exceptionFactory: (errors: ValidationError[]) => {
        const flat = errors.flatMap((e) =>
          Object.values(e.constraints ?? {}),
        );
        const fields = Array.from(new Set(errors.map((e) => e.property)));
        return new BadRequestException({
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          fields,
          message: flat,
        });
      },
    }),
  );

  // SEC-024: sanitize uncaught 5xx errors in production (no stack/internal
  // details leaked). 4xx (incl. the ValidationPipe shape) passes through.
  app.useGlobalFilters(new AllExceptionsFilter());

  const allowedOrigins = buildAllowedOrigins();
  logger.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow non-browser requests (curl, server-to-server) where Origin is absent.
      if (!origin) return callback(null, true);
      const normalized = normalizeOrigin(origin);
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

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

/**
 * Global exception filter (SEC-024).
 *
 * Goals:
 *  - 4xx responses (including the custom ValidationPipe shape
 *    `{ statusCode, code, fields, message }` and the BadRequest/Forbidden
 *    payloads thrown by our services/guards) are passed through UNCHANGED so
 *    the frontend contract stays stable.
 *  - Uncaught 5xx errors (anything that is not an HttpException, or an
 *    HttpException with a 5xx status) are logged in full server-side but, in
 *    production, returned to the client as a generic message with no stack
 *    trace or internal details. In non-production we keep the original
 *    message to aid local debugging.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');
  private readonly isProduction = process.env.NODE_ENV === 'production';

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();

      // 4xx: trusted, deliberately-shaped client errors -> pass through as-is.
      if (status < HttpStatus.INTERNAL_SERVER_ERROR) {
        response.status(status).json(body);
        return;
      }

      // 5xx HttpException: log details, return generic payload.
      this.logger.error(
        `${request.method} ${request.url} -> ${status}`,
        exception.stack,
      );
      response.status(status).json(this.genericBody(status, body));
      return;
    }

    // Anything else is an unexpected/uncaught error -> 500, no details leaked.
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const err = exception instanceof Error ? exception : undefined;
    this.logger.error(
      `Unhandled exception on ${request.method} ${request.url}`,
      err?.stack ?? String(exception),
    );

    response.status(status).json({
      statusCode: status,
      code: 'INTERNAL_SERVER_ERROR',
      message: this.isProduction
        ? 'Internal server error'
        : (err?.message ?? 'Internal server error'),
    });
  }

  private genericBody(status: number, original: string | object) {
    if (this.isProduction) {
      return {
        statusCode: status,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
      };
    }
    // Non-production: keep the original payload for debugging.
    return original;
  }
}

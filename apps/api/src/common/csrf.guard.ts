import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import type { Request } from 'express';
import { buildAllowedOrigins, normalizeOrigin } from './allowed-origins';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Origin-based CSRF protection (SEC-005).
 *
 * The admin app authenticates with httpOnly cookies (`access_token` /
 * `refresh_token`) and `sameSite: 'lax'`. `sameSite=lax` already blocks
 * cross-site cookies on most cross-origin sub-requests, but it is not a
 * complete defense (e.g. top-level POST navigations, older browsers). This
 * guard adds a defense-in-depth Origin check for state-changing requests.
 *
 * Policy:
 *  - Only mutating methods (POST/PUT/PATCH/DELETE) are checked. Safe methods
 *    (GET/HEAD/OPTIONS) are never blocked.
 *  - The allowlist is the SAME list used by CORS (`buildAllowedOrigins`), so
 *    the two can never drift apart.
 *  - If an `Origin` (or, as a fallback, `Referer`) header IS present and is
 *    NOT in the allowlist -> 403. This covers the public, unauthenticated
 *    browser endpoints (`POST /contacts`, `POST /analytics/event`): real
 *    browsers always send Origin on cross-origin POSTs, so a forged
 *    cross-site request is rejected, while same-origin legitimate traffic
 *    passes.
 *  - For AUTHENTICATED admin mutations (detected by the presence of the
 *    `access_token` cookie) we additionally REQUIRE a browser origin: a
 *    cookie-bearing mutation with no Origin/Referer at all is rejected. This
 *    closes the gap where a CSRF vector strips the Origin header. Public
 *    endpoints (no auth cookie) are intentionally NOT required to carry an
 *    Origin so legitimate server-to-server / curl health traffic and the
 *    "Origin absent" CORS allowance (SEC-013) keep working.
 *
 * Note on server-to-server: revalidation traffic flows api -> web, never
 * web -> api, so no internal caller hits these mutation routes without a
 * browser context. Should that ever change, such callers are unauthenticated
 * (no access_token cookie) and may legitimately omit Origin.
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  private readonly logger = new Logger(CsrfGuard.name);
  private readonly allowedOrigins = buildAllowedOrigins();

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const method = (req.method || 'GET').toUpperCase();

    if (!MUTATING_METHODS.has(method)) {
      return true;
    }

    const browserOrigin = this.resolveOrigin(req);
    const hasAuthCookie = !!req.cookies?.access_token;

    // Authenticated admin mutation: require a recognised browser origin.
    if (hasAuthCookie && !browserOrigin) {
      this.logger.warn(
        `CSRF: blocked authenticated ${method} ${req.originalUrl} with no Origin/Referer`,
      );
      throw new ForbiddenException({
        statusCode: 403,
        code: 'CSRF_ORIGIN_MISSING',
        message: 'Missing Origin header on a state-changing request',
      });
    }

    // If an origin is present, it must be in the allowlist (admin + public).
    if (browserOrigin && !this.allowedOrigins.includes(browserOrigin)) {
      this.logger.warn(
        `CSRF: blocked ${method} ${req.originalUrl} from disallowed origin ${browserOrigin}`,
      );
      throw new ForbiddenException({
        statusCode: 403,
        code: 'CSRF_ORIGIN_FORBIDDEN',
        message: 'Origin not allowed for state-changing request',
      });
    }

    return true;
  }

  /** Prefer Origin; fall back to the origin component of Referer. */
  private resolveOrigin(req: Request): string | null {
    const origin = req.headers.origin;
    if (typeof origin === 'string' && origin.length > 0) {
      return normalizeOrigin(origin);
    }

    const referer = req.headers.referer;
    const refererValue = Array.isArray(referer) ? referer[0] : referer;
    if (typeof refererValue === 'string' && refererValue.length > 0) {
      try {
        return normalizeOrigin(new URL(refererValue).origin);
      } catch {
        return null;
      }
    }

    return null;
  }
}

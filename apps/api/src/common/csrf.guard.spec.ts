import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { CsrfGuard } from './csrf.guard';

/**
 * Build a fake ExecutionContext wrapping a minimal Express-like request.
 */
function ctx(req: {
  method: string;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
}): ExecutionContext {
  const request = {
    method: req.method,
    originalUrl: '/test',
    headers: req.headers ?? {},
    cookies: req.cookies ?? {},
  };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('CsrfGuard', () => {
  let guard: CsrfGuard;
  const allowed = 'http://localhost:3000';

  beforeEach(() => {
    // buildAllowedOrigins() always includes localhost:3000/3002/3004.
    guard = new CsrfGuard();
  });

  it('allows safe (GET) requests regardless of origin', () => {
    expect(
      guard.canActivate(ctx({ method: 'GET', headers: { origin: 'http://evil.com' } })),
    ).toBe(true);
  });

  it('allows a public POST (no auth cookie) with an allowed origin', () => {
    expect(
      guard.canActivate(ctx({ method: 'POST', headers: { origin: allowed } })),
    ).toBe(true);
  });

  it('allows a public POST (no auth cookie) with NO origin (server-to-server / curl)', () => {
    expect(guard.canActivate(ctx({ method: 'POST' }))).toBe(true);
  });

  it('blocks any mutating request from a disallowed origin', () => {
    expect(() =>
      guard.canActivate(
        ctx({ method: 'POST', headers: { origin: 'http://evil.com' } }),
      ),
    ).toThrow(ForbiddenException);
  });

  it('blocks an authenticated mutation with NO origin/referer', () => {
    expect(() =>
      guard.canActivate(
        ctx({ method: 'DELETE', cookies: { access_token: 'jwt' } }),
      ),
    ).toThrow(ForbiddenException);
  });

  it('allows an authenticated mutation from an allowed origin', () => {
    expect(
      guard.canActivate(
        ctx({
          method: 'PUT',
          headers: { origin: allowed },
          cookies: { access_token: 'jwt' },
        }),
      ),
    ).toBe(true);
  });

  it('falls back to Referer when Origin is absent', () => {
    expect(
      guard.canActivate(
        ctx({
          method: 'POST',
          headers: { referer: `${allowed}/admin/projects` },
        }),
      ),
    ).toBe(true);
  });

  it('blocks when Referer points to a disallowed origin', () => {
    expect(() =>
      guard.canActivate(
        ctx({
          method: 'POST',
          headers: { referer: 'http://evil.com/x' },
        }),
      ),
    ).toThrow(ForbiddenException);
  });
});

/**
 * Build the list of allowed origins from env. Supports either
 *   CORS_ORIGINS=https://a.com,https://b.com
 * or the historical WEB_URL / ADMIN_URL pair. Localhost dev ports are
 * always included so local dev doesn't require any env at all.
 *
 * This single source of truth is shared between the CORS configuration in
 * `main.ts` and the Origin-based CSRF guard (`csrf.guard.ts`) so the two can
 * never drift out of sync.
 */
export function buildAllowedOrigins(): string[] {
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

/** Normalize an Origin/Referer-derived origin for comparison (strip trailing slashes). */
export function normalizeOrigin(origin: string): string {
  return origin.replace(/\/+$/, '');
}

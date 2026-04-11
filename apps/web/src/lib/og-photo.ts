import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Loads the downsized OG portrait as a base64 data URL.
 *
 * Why the fallback list: Next.js runs with different CWDs in dev vs prod:
 *   - `next dev` from apps/web   → cwd = apps/web              → public/og-photo.jpg
 *   - standalone from /app       → cwd = /app                  → apps/web/public/og-photo.jpg
 *   - turbo from monorepo root   → cwd = /.../portfolio        → apps/web/public/og-photo.jpg
 *
 * Picking the first candidate that exists on disk keeps the OG image
 * working everywhere without introducing CWD-coupled bugs.
 */
export function loadOgPhotoDataUrl(): string {
  const candidates = [
    // cwd = apps/web (dev)
    join(process.cwd(), 'public', 'og-photo.jpg'),
    // cwd = / or /app or monorepo root
    join(process.cwd(), 'apps', 'web', 'public', 'og-photo.jpg'),
    // cwd = apps/api or similar sibling
    join(process.cwd(), '..', 'web', 'public', 'og-photo.jpg'),
    join(process.cwd(), '..', '..', 'apps', 'web', 'public', 'og-photo.jpg'),
  ];

  for (const path of candidates) {
    try {
      const buf = readFileSync(path);
      return `data:image/jpeg;base64,${buf.toString('base64')}`;
    } catch {
      /* try next */
    }
  }

  throw new Error(
    `og-photo.jpg not found. Looked in: ${candidates.join(', ')}`,
  );
}

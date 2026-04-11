import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export const config = {
  matcher: [
    // Skip Next internals, assets, and the root-level metadata routes
    // (opengraph-image / twitter-image / icon / robots / sitemap), so scrapers
    // that fetch them on the bare domain don't get redirected into /ru.
    '/((?!_next|_vercel|api|favicon.ico|icon.png|og-default.png|opengraph-image|twitter-image|icon|robots.txt|sitemap.xml|.*\\..*).*)',
  ],
};

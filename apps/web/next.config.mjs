import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/**
 * Content-Security-Policy для публичного сайта.
 *
 * Источники подобраны по реальному коду apps/web/src:
 *  - script-src 'self' 'unsafe-inline': Next 14 инлайнит bootstrap/hydration
 *    скрипты прямо в HTML; nonce-инфраструктуры нет, поэтому 'unsafe-inline'
 *    обязателен. Внешних <script> и Umami-скрипта в коде НЕТ — аналитика
 *    реализована как fetch POST на /analytics/event (см. src/lib/analytics.ts),
 *    поэтому она покрывается connect-src, а не script-src. 'unsafe-eval'
 *    не нужен: в production-сборке Next eval не использует.
 *  - style-src 'self' 'unsafe-inline': Tailwind, framer-motion (инлайн-стили)
 *    и next/font вставляют inline <style>.
 *  - img-src 'self' data: https:: next/image c S3 (s3.twcstorage.ru), data:-URI
 *    (SVG-шум в globals.css, og-photo base64), favicon/og.
 *  - connect-src 'self' + API (api.webmogilevtsev.ru) + S3 (*.twcstorage.ru):
 *    fetch к API (analytics/contacts/captcha) и потенциальные прямые запросы к S3.
 *  - font-src 'self' data:: next/font self-host'ит шрифты под /_next/.
 */
const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "connect-src 'self' https://api.webmogilevtsev.ru https://*.twcstorage.ru",
  "font-src 'self' data:",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const SECURITY_HEADERS = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Content-Security-Policy', value: CSP_DIRECTIVES },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@portfolio/shared', '@portfolio/i18n', '@portfolio/content'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: SECURITY_HEADERS,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
      },
      {
        // Timeweb Cloud S3 — bucket для превью проектов/блога (prod).
        protocol: 'https',
        hostname: 's3.twcstorage.ru',
        pathname: '/webmogilevtsev/**',
      },
    ],
  },
  experimental: {
    typedRoutes: false,
  },
};

export default withNextIntl(nextConfig);

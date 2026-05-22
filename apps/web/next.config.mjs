import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@portfolio/shared', '@portfolio/i18n', '@portfolio/content'],
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

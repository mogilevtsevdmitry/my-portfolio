import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@portfolio/shared', '@portfolio/i18n', '@portfolio/content'],
  images: {
    remotePatterns: [],
  },
  experimental: {
    typedRoutes: false,
  },
};

export default withNextIntl(nextConfig);

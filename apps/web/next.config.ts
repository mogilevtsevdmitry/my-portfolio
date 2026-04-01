import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {
  transpilePackages: ['@portfolio/shared', '@portfolio/i18n', '@portfolio/content'],
  images: {
    remotePatterns: [],
  },
  experimental: {
    typedRoutes: false,
  },
};

export default withNextIntl(nextConfig);

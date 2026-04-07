import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['ru', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'ru';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) ?? defaultLocale;
  if (!locales.includes(locale as Locale)) notFound();

  // Static imports per locale so webpack can analyze them at build time
  const messages =
    locale === 'en'
      ? (await import('@portfolio/i18n/locales/en')).default
      : (await import('@portfolio/i18n/locales/ru')).default;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { messages: messages as any };
});

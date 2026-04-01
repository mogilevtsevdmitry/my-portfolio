import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['ru', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'ru';

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as Locale)) notFound();

  const messages = {
    common: (await import(`@portfolio/i18n/locales/${locale}/common.json`)).default,
    hero: (await import(`@portfolio/i18n/locales/${locale}/hero.json`)).default,
    about: (await import(`@portfolio/i18n/locales/${locale}/about.json`)).default,
    values: (await import(`@portfolio/i18n/locales/${locale}/values.json`)).default,
    projects: (await import(`@portfolio/i18n/locales/${locale}/projects.json`)).default,
    tech: (await import(`@portfolio/i18n/locales/${locale}/tech.json`)).default,
    process: (await import(`@portfolio/i18n/locales/${locale}/process.json`)).default,
    contacts: (await import(`@portfolio/i18n/locales/${locale}/contacts.json`)).default,
  };

  return { messages };
});

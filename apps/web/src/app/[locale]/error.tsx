'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/ui/Section';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const t = useTranslations('common.error');

  return (
    <Section className="min-h-screen flex items-center justify-center text-center">
      <div>
        <h1 className="text-4xl font-bold text-red-400 mb-4">{t('title')}</h1>
        <p className="text-[var(--text-muted)] mb-8">{error.message}</p>
        <Button onClick={reset}>{t('retry')}</Button>
      </div>
    </Section>
  );
}

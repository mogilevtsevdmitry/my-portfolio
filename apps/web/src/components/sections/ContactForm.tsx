'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { GlowText } from '@/components/ui/GlowText';
import { submitContact } from '@/lib/api';
import { trackEvent } from '@/lib/analytics';

type Status = 'idle' | 'loading' | 'success' | 'error';

export function ContactForm() {
  const t = useTranslations('contacts');
  const [status, setStatus] = useState<Status>('idle');
  const [form, setForm] = useState({ name: '', contact: '', description: '' });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFocus = () => {
    if (status === 'idle') {
      trackEvent('contact_form_open');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      await submitContact(form);
      trackEvent('contact_submit');
      setStatus('success');
      setForm({ name: '', contact: '', description: '' });
    } catch {
      setStatus('error');
    }
  };

  const inputClass = [
    'w-full px-4 py-3 rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50',
    'bg-[var(--bg-card)] border border-[var(--border)]',
    'focus:outline-none focus:border-[var(--border-hover)] focus:shadow-[0_0_0_3px_var(--accent-glow)]',
    'transition-all duration-200',
  ].join(' ');

  return (
    <Section id="contacts">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <GlowText as="h2" className="text-3xl md:text-4xl font-bold mb-4">
            {t('title')}
          </GlowText>
          <p className="text-[var(--text-muted)]">{t('subtitle')}</p>
        </div>

        {status === 'success' ? (
          <div className="glass-card p-8 text-center">
            <div className="text-4xl mb-4">✅</div>
            <p className="text-accent font-medium">{t('form.success')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5">
            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-2">
                {t('form.name')}
              </label>
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                onFocus={handleFocus}
                placeholder={t('form.namePlaceholder')}
                required
                minLength={2}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-2">
                {t('form.contact')}
              </label>
              <input
                name="contact"
                type="text"
                value={form.contact}
                onChange={handleChange}
                placeholder={t('form.contactPlaceholder')}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-2">
                {t('form.description')}
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder={t('form.descriptionPlaceholder')}
                required
                minLength={10}
                rows={5}
                className={`${inputClass} resize-none`}
              />
            </div>

            {status === 'error' && (
              <p className="text-red-400 text-sm">{t('form.error')}</p>
            )}

            <Button
              type="submit"
              size="lg"
              loading={status === 'loading'}
              className="w-full"
            >
              {t('form.submit')}
            </Button>
          </form>
        )}

        {/* Direct contact links */}
        <div className="mt-6 text-center">
          <p className="text-[var(--text-muted)] text-sm mb-3">{t('or')}</p>
          <div className="flex justify-center gap-6">
            <a
              href="https://t.me/your_handle"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline font-medium"
            >
              {t('telegram')}
            </a>
            <a
              href="mailto:hello@dmitry.dev"
              className="text-accent hover:underline font-medium"
            >
              {t('email')}
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { submitContact } from '@/lib/api';
import { trackEvent } from '@/lib/analytics';

type Status = 'idle' | 'loading' | 'success' | 'error';

export function ContactForm() {
  const t = useTranslations('contacts');
  const [status, setStatus] = useState<Status>('idle');
  const [form, setForm] = useState({ name: '', contact: '', description: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFocus = () => { if (status === 'idle') trackEvent('contact_form_open'); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await submitContact(form);
      trackEvent('contact_submit');
      setStatus('success');
      setForm({ name: '', contact: '', description: '' });
    } catch { setStatus('error'); }
  };

  return (
    <Section id="contacts">
      <div className="max-w-2xl mx-auto">
        <div className="mb-12">
          <span className="section-eyebrow">06. Контакты</span>
          <hr className="gold-divider mt-3" style={{ width: '3rem' }} />
          <h2
            className="font-display font-light leading-tight mt-8 mb-4"
            style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', color: 'var(--text-primary)' }}
          >
            {t('title')}
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-dm-sans)' }}>
            {t('subtitle')}
          </p>
        </div>

        {status === 'success' ? (
          <div className="glass-card p-10 text-center">
            <div className="text-4xl mb-4" style={{ color: 'var(--accent)' }}>✦</div>
            <p style={{ color: 'var(--accent-light)', fontFamily: 'var(--font-syne)', fontWeight: 600 }}>{t('form.success')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
            {['name', 'contact'].map((field) => (
              <div key={field}>
                <label className="block text-xs mb-2.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-syne)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  {t(`form.${field}`)}
                </label>
                <input
                  name={field}
                  type="text"
                  value={form[field as keyof typeof form]}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  placeholder={t(`form.${field}Placeholder`)}
                  required
                  minLength={2}
                  className="field-input"
                />
              </div>
            ))}

            <div>
              <label className="block text-xs mb-2.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-syne)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
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
                className="field-input resize-none"
              />
            </div>

            {status === 'error' && (
              <p className="text-sm" style={{ color: '#f87171' }}>{t('form.error')}</p>
            )}

            <Button type="submit" size="lg" loading={status === 'loading'} className="w-full">
              {t('form.submit')}
            </Button>
          </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-syne)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{t('or')}</p>
          <div className="flex justify-center gap-8">
            {[
              { label: t('telegram'), href: 'https://t.me/your_handle' },
              { label: t('email'), href: 'mailto:hello@dmitry.dev' },
            ].map(({ label, href }) => (
              <a
                key={href}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="text-sm transition-colors duration-200"
                style={{ color: 'var(--accent)', fontFamily: 'var(--font-syne)', fontWeight: 600 }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

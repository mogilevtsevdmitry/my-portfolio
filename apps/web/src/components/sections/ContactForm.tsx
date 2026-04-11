'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { MathCaptcha } from '@/components/ui/MathCaptcha';
import { submitContact, ContactSubmitError } from '@/lib/api';
import { trackEvent } from '@/lib/analytics';

type Status = 'idle' | 'loading' | 'success' | 'error';

export function ContactForm() {
  const t = useTranslations('contacts');
  const [status, setStatus] = useState<Status>('idle');
  const [form, setForm] = useState({ name: '', contact: '', description: '' });
  // Honeypot — hidden from real users, catches dumb bots.
  const [website, setWebsite] = useState('');
  const [captcha, setCaptcha] = useState({ token: '', answer: '' });
  const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFocus = () => { if (status === 'idle') trackEvent('contact_form_open'); };

  const handleCaptchaChange = useCallback(
    (state: { token: string; answer: string }) => setCaptcha(state),
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorCode(null);
    try {
      await submitContact({
        ...form,
        website,
        captchaToken: captcha.token,
        captchaAnswer: Number(captcha.answer),
      });
      trackEvent('contact_submit');
      setStatus('success');
      setForm({ name: '', contact: '', description: '' });
      setWebsite('');
    } catch (err) {
      setStatus('error');
      if (err instanceof ContactSubmitError) {
        setErrorCode(err.code ?? 'UNKNOWN');
      } else {
        setErrorCode('UNKNOWN');
      }
      // Rotate the challenge so the user gets a fresh one after any failure.
      setCaptchaResetKey((k) => k + 1);
    }
  };

  // Pick a localized message for the server-side error code.
  const resolveErrorMessage = (code: string | null): string => {
    if (code === 'CAPTCHA_INVALID') return t('form.errorCaptcha');
    return t('form.error');
  };
  const isCaptchaError = errorCode === 'CAPTCHA_INVALID';

  return (
    <Section id="contacts">
      <div className="max-w-2xl mx-auto">
        <div className="mb-12">
          <span className="section-eyebrow">07. Контакты</span>
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

            {/* Honeypot: invisible to real users, caught by bots that auto-fill every field. */}
            <div aria-hidden style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
              <label>
                Website
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </label>
            </div>

            <MathCaptcha
              label={t('form.captcha')}
              placeholder={t('form.captchaPlaceholder')}
              onChange={handleCaptchaChange}
              resetKey={captchaResetKey}
              error={status === 'error' && isCaptchaError ? resolveErrorMessage(errorCode) : null}
            />

            {status === 'error' && !isCaptchaError && (
              <p className="text-sm" style={{ color: '#f87171' }}>
                {resolveErrorMessage(errorCode)}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              loading={status === 'loading'}
              disabled={!captcha.token || !captcha.answer}
              className="w-full"
            >
              {t('form.submit')}
            </Button>
          </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-syne)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{t('or')}</p>
          <div className="flex justify-center gap-8">
            {[
              { label: t('telegram'), href: 'https://t.me/mogilevtsevdmitry' },
              { label: t('email'), href: 'mailto:webmogilevtsev@ya.ru' },
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

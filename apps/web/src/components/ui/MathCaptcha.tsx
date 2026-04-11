'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchCaptcha, type CaptchaChallenge } from '@/lib/api';

interface MathCaptchaProps {
  /** Label above the challenge (e.g. "Проверка"). */
  label: string;
  /** Placeholder text inside the answer input. */
  placeholder: string;
  /** Called whenever the current state changes so ContactForm can read it. */
  onChange: (state: { token: string; answer: string }) => void;
  /** Optional error from the server (e.g. wrong answer), shown inline. */
  error?: string | null;
  /** Bumping this key forces a reload of the challenge (e.g. after server rejection). */
  resetKey?: number;
}

export function MathCaptcha({
  label,
  placeholder,
  onChange,
  error,
  resetKey = 0,
}: MathCaptchaProps) {
  const [challenge, setChallenge] = useState<CaptchaChallenge | null>(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const c = await fetchCaptcha();
      setChallenge(c);
      setAnswer('');
      onChange({ token: c.token, answer: '' });
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [onChange]);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/[^-\d]/g, '');
    setAnswer(v);
    if (challenge) onChange({ token: challenge.token, answer: v });
  };

  return (
    <div>
      <label
        className="block text-xs mb-2.5"
        style={{
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-syne)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </label>
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center h-[46px] min-w-[140px] rounded-md px-4 font-display select-none"
          style={{
            border: '1px solid var(--border)',
            background: 'rgba(201,168,76,0.05)',
            color: 'var(--accent-light)',
            fontSize: '1.2rem',
            letterSpacing: '0.12em',
          }}
          aria-live="polite"
        >
          {loading ? '…' : loadError ? '✕' : challenge ? `${challenge.question} = ?` : '—'}
        </div>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={answer}
          onChange={handleChange}
          placeholder={placeholder}
          required
          className="field-input flex-1"
          aria-label={label}
        />
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="h-[46px] w-[46px] flex items-center justify-center rounded-md transition-colors"
          style={{
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            background: 'transparent',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = 'var(--accent)';
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-hover)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
          }}
          aria-label="Обновить проверку"
          title="Обновить проверку"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
        </button>
      </div>
      {(error || loadError) && (
        <p
          className="text-xs mt-2"
          style={{ color: '#f87171', fontFamily: 'var(--font-dm-sans)' }}
        >
          {loadError
            ? 'Не удалось загрузить проверку. Попробуйте обновить.'
            : error}
        </p>
      )}
    </div>
  );
}

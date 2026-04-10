'use client';

import { useTranslations } from 'next-intl';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { SpotlightCard } from '@/components/effects/SpotlightCard';

interface ValueCard { key: string; title: string; problem: string; solution: string; result: string; }

const icons: Record<string, string> = {
  ai: '◈', saas: '◇', devops: '◉', consulting: '◎',
};

export function Values() {
  const t = useTranslations('values');
  const cards = t.raw('cards') as ValueCard[];
  const { ref, isVisible } = useScrollReveal();

  return (
    <section id="values" className="relative py-24 md:py-36 px-6 md:px-16 lg:px-24 overflow-hidden"
      style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <div className="max-w-[1400px] mx-auto">
        <div ref={ref} className={`reveal ${isVisible ? 'is-visible' : ''} mb-14`}>
          <span className="section-eyebrow">02. Чем я полезен</span>
          <hr className="gold-divider mt-3" style={{ width: '3rem' }} />
        </div>

        <div
          className={`reveal ${isVisible ? 'is-visible' : ''} mb-10`}
          style={{ maxWidth: '560px' }}
        >
          <h2
            className="font-display font-light leading-tight"
            style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', color: 'var(--text-primary)' }}
          >
            {t('title')}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {cards.map((card, i) => (
            <SpotlightCard
              key={card.key}
              className={`value-card reveal reveal-delay-${(i % 4) + 1} ${isVisible ? 'is-visible' : ''}`}
            >
              {/* Icon + number */}
              <div className="flex items-center justify-between mb-6">
                <span
                  style={{ color: 'var(--accent)', fontSize: '1.4rem', lineHeight: 1 }}
                  aria-hidden
                >
                  {icons[card.key] ?? '✦'}
                </span>
                <span
                  className="font-display font-light"
                  style={{ fontSize: '2.5rem', color: 'rgba(201,168,76,0.08)', lineHeight: 1 }}
                >
                  0{i + 1}
                </span>
              </div>

              <h3
                className="font-ui font-semibold mb-5"
                style={{ fontSize: '1rem', color: 'var(--text-primary)', letterSpacing: '0.02em' }}
              >
                {card.title}
              </h3>

              <div className="space-y-3.5 text-sm">
                <div className="flex gap-3 items-start">
                  <span style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }}>→</span>
                  <span style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{card.problem}</span>
                </div>
                <div className="flex gap-3 items-start">
                  <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }}>✓</span>
                  <span style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{card.solution}</span>
                </div>
                <div
                  className="flex gap-3 items-start pt-3 mt-3"
                  style={{ borderTop: '1px solid var(--border)' }}
                >
                  <span style={{ color: 'var(--accent)', flexShrink: 0, fontWeight: 700, marginTop: '2px' }}>⚡</span>
                  <span style={{ color: 'var(--accent-light)', fontWeight: 500, lineHeight: 1.6 }}>{card.result}</span>
                </div>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
}

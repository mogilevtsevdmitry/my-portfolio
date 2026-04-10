'use client';

import { useTranslations } from 'next-intl';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const stats = [
  { num: '5+',  label: 'лет в разработке' },
  { num: '20+', label: 'запущенных проектов' },
  { num: '10+', label: 'AI-агентов в проде' },
  { num: '60%', label: 'экономия операционных затрат' },
];

export function About() {
  const t = useTranslations('about');
  const theses = t.raw('theses') as string[];

  const { ref: titleRef, isVisible: titleVisible } = useScrollReveal();
  const { ref: contentRef, isVisible: contentVisible } = useScrollReveal({ rootMargin: '0px 0px -40px 0px' });
  const { ref: statsRef, isVisible: statsVisible } = useScrollReveal({ rootMargin: '0px 0px -40px 0px' });

  return (
    <section
      id="about"
      className="relative py-24 md:py-36 px-6 md:px-16 lg:px-24 overflow-hidden"
      style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}
    >
      {/* Subtle background accent */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(201,168,76,0.04) 0%, transparent 70%)' }}
        aria-hidden
      />

      <div className="max-w-[1400px] mx-auto">

        {/* Section eyebrow */}
        <div
          ref={titleRef}
          className={`reveal ${titleVisible ? 'is-visible' : ''} mb-14`}
        >
          <span className="section-eyebrow">01. О Себе</span>
          <hr className="gold-divider mt-3 mb-0" style={{ width: '3rem' }} />
        </div>

        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-start">

          {/* Left: Text */}
          <div
            ref={contentRef}
            className={`reveal-left ${contentVisible ? 'is-visible' : ''}`}
          >
            <h2
              className="font-display font-light mb-8 leading-tight"
              style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', color: 'var(--text-primary)' }}
            >
              {t('title')}
            </h2>

            {/* Entrepreneur narrative block */}
            <div
              className="mb-8 p-5 rounded-xl"
              style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span style={{ color: 'var(--accent)', fontSize: '0.7rem', fontFamily: 'var(--font-syne)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  Предприниматель
                </span>
                <span style={{ color: 'var(--border-hover)' }}>·</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontFamily: 'var(--font-syne)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  Разработчик
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-dm-sans)' }}>
                Смотрю на технологии через призму бизнеса. Каждое архитектурное решение — это инвестиция с ожидаемым ROI, а не самоцель.
              </p>
            </div>

            <ul className="space-y-5">
              {theses.map((thesis, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: 'var(--accent)', boxShadow: '0 0 6px var(--accent-glow)' }}
                  />
                  <span
                    className="leading-relaxed text-sm"
                    style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-dm-sans)' }}
                  >
                    {thesis}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Stats */}
          <div
            ref={statsRef}
            className={`reveal-right ${statsVisible ? 'is-visible' : ''} grid grid-cols-2 gap-3 sm:gap-4 min-w-0`}
          >
            {stats.map(({ num, label }, i) => (
              <div
                key={label}
                className={`stat-card reveal reveal-delay-${i + 1} ${statsVisible ? 'is-visible' : ''}`}
              >
                <div
                  className="font-display font-light"
                  style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)', lineHeight: 1, color: 'var(--accent)' }}
                >
                  {num}
                </div>
                <div
                  className="mt-2 text-xs leading-snug"
                  style={{
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-syne)',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    fontSize: 'clamp(0.5rem, 1.6vw, 0.6rem)',
                    overflowWrap: 'anywhere',
                    wordBreak: 'break-word',
                    hyphens: 'auto',
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

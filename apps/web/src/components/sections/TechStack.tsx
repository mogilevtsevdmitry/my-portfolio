'use client';

import { useTranslations } from 'next-intl';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { SpotlightCard } from '@/components/effects/SpotlightCard';

const techGroups = {
  frontend:      ['React', 'Next.js', 'TypeScript', 'Tailwind', 'Zustand', 'TanStack Query'],
  backend:       ['NestJS', 'Node.js', 'PostgreSQL', 'Prisma', 'Redis', 'GraphQL'],
  architecture:  ['DDD', 'Clean Architecture', 'Event-driven', 'Microservices', 'CQRS'],
  infrastructure:['Docker', 'Kubernetes', 'CI/CD', 'Nginx', 'Terraform', 'S3'],
  ai:            ['LLM', 'Multi-agent', 'Orchestration', 'RAG', 'Tool use'],
  tools:         ['Git', 'Figma', 'Jest', 'Playwright', 'Storybook'],
} as const;

const groupIcons: Record<string, string> = {
  frontend: '◆', backend: '◈', architecture: '◇', infrastructure: '◉', ai: '◎', tools: '◐',
};

// Marquee needs each "copy" to be wider than the viewport, otherwise -50% translate
// leaves a visible gap before the second copy wraps around. Repeating the phrase a
// few times per copy guarantees seamless scrolling on any screen width.
const MARQUEE_REPEATS_PER_COPY = 4;

export function TechStack() {
  const t = useTranslations('tech');
  const tCommon = useTranslations('common');
  const { ref, isVisible } = useScrollReveal();

  const marquee = t('marquee');
  const singleCopy = Array(MARQUEE_REPEATS_PER_COPY).fill(marquee).join(' · ') + ' · ';

  return (
    <section
      id="tech"
      className="relative py-24 md:py-32 px-6 md:px-16 lg:px-24 overflow-hidden"
      style={{ background: 'var(--bg-secondary)' }}
    >
      {/* Marquee ticker at top — two identical copies for a seamless -50% loop */}
      <div className="overflow-hidden mb-16 opacity-20 select-none" aria-hidden>
        <div className="ticker-track">
          {[0, 1].map((i) => (
            <span
              key={i}
              className="inline-block px-4"
              style={{
                fontFamily: 'var(--font-syne)',
                fontSize: '0.65rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--accent)',
              }}
            >
              {singleCopy}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto">
        <div ref={ref} className={`reveal ${isVisible ? 'is-visible' : ''} mb-14`}>
          <span className="section-eyebrow">{tCommon('sections.tech')}</span>
          <hr className="gold-divider mt-3" style={{ width: '3rem' }} />
        </div>

        <div className={`reveal ${isVisible ? 'is-visible' : ''} mb-12`} style={{ maxWidth: '560px' }}>
          <h2
            className="font-display font-light leading-tight"
            style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', color: 'var(--text-primary)' }}
          >
            {t('title')}
          </h2>
          <p className="mt-4 text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-dm-sans)' }}>
            {t('subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(Object.keys(techGroups) as Array<keyof typeof techGroups>).map((group, i) => (
            <SpotlightCard
              key={group}
              className={`reveal reveal-delay-${i + 1} ${isVisible ? 'is-visible' : ''} glass-card p-6`}
            >
              <div className="flex items-center gap-3 mb-5">
                <span style={{ color: 'var(--accent)', fontSize: '1.1rem' }} aria-hidden>{groupIcons[group]}</span>
                <h3
                  style={{ fontFamily: 'var(--font-syne)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--accent)' }}
                >
                  {t(`groups.${group}`)}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2 relative z-[1]">
                {techGroups[group].map((tech) => (
                  <span key={tech} className="tech-badge">{tech}</span>
                ))}
              </div>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
}

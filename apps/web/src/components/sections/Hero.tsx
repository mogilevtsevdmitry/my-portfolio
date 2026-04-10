'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useParallax } from '@/hooks/useParallax';
import { Aurora } from '@/components/effects/Aurora';
import { DotGrid } from '@/components/effects/DotGrid';
import { SplitText } from '@/components/effects/SplitText';
import { ShinyText } from '@/components/effects/ShinyText';
import { Magnet } from '@/components/effects/Magnet';
import { CountUp } from '@/components/effects/CountUp';
import { TiltedCard } from '@/components/effects/TiltedCard';

function dispatchTrack(event: string, cta_type: string): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('track', { detail: { event, payload: { cta_type } } }));
  }
}

export function Hero() {
  const t = useTranslations('hero');
  const photoRef = useParallax<HTMLDivElement>(0.18);

  return (
    <section
      id="hero"
      className="relative min-h-screen overflow-hidden flex items-center"
    >
      {/* Layered background — dot grid + aurora */}
      <DotGrid />
      <Aurora opacity={0.9} />

      {/* Grain overlay */}
      <div className="grain-overlay" aria-hidden />

      {/* Decorative vertical line — desktop only */}
      <div
        className="hidden md:block absolute left-16 top-0 bottom-0 w-px pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(201,168,76,0.25) 30%, rgba(201,168,76,0.25) 70%, transparent 100%)' }}
        aria-hidden
      />

      <div className="w-full max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24 relative z-10">
        <div className="grid md:grid-cols-[1.15fr_0.85fr] gap-0 md:gap-12 items-center min-h-screen py-28">

          {/* ── Left: Content ── */}
          <div className="relative z-10 flex flex-col justify-center">

            {/* Label */}
            <div className="hero-anim-0 mb-8 md:mb-10">
              <span className="label-badge">
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{ background: 'var(--accent)', boxShadow: '0 0 6px var(--accent)' }}
                />
                <ShinyText speed={5}>{t('label')}</ShinyText>
              </span>
            </div>

            {/* Name — huge Cormorant Garamond with split animation */}
            <h1 className="font-display font-light leading-none mb-0" style={{ letterSpacing: '-0.02em' }}>
              <SplitText
                as="span"
                text={t('firstName') || 'Дмитрий'}
                className="block"
                style={{ fontSize: 'clamp(3.2rem, 7.5vw, 7.2rem)', color: 'var(--text-primary)' }}
                delay={200}
                stagger={55}
                duration={900}
                animation="rise"
              />
              <SplitText
                as="span"
                text={t('lastName') || 'Могилевцев'}
                className="block pl-[4%] md:pl-[6%]"
                style={{ fontSize: 'clamp(3.2rem, 7.5vw, 7.2rem)' }}
                charStyle={{
                  backgroundImage:
                    'linear-gradient(110deg, #F5EFE2 0%, #e8c878 35%, #c9a84c 55%, #e8c878 75%, #F5EFE2 100%)',
                  backgroundSize: '200% 100%',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  WebkitTextFillColor: 'transparent',
                  animation: 'shiny-sweep 10s linear infinite',
                }}
                delay={600}
                stagger={50}
                duration={900}
                animation="rise"
              />
            </h1>

            {/* Gold line */}
            <div
              className="hero-anim-3 mt-8 mb-8"
              style={{
                height: '1px',
                width: '60%',
                background: 'linear-gradient(90deg, var(--accent) 0%, transparent 100%)',
              }}
              aria-hidden
            />

            {/* Subtitle */}
            <p
              className="hero-anim-4 text-base md:text-lg leading-relaxed max-w-md"
              style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-dm-sans)' }}
            >
              {t('subtitle')}
            </p>

            {/* CTAs */}
            <div className="hero-anim-5 flex flex-wrap gap-4 mt-10">
              <Magnet strength={10}>
                <button
                  type="button"
                  onClick={() => {
                    dispatchTrack('hero_cta_click', 'discuss');
                    window.location.hash = 'contacts';
                  }}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-ui font-600 text-sm tracking-wide transition-all duration-300 cursor-pointer"
                  style={{
                    background: 'var(--accent)',
                    color: '#09090A',
                    fontFamily: 'var(--font-syne)',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    boxShadow: '0 0 30px var(--accent-glow-strong)',
                    border: 'none',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 0 50px var(--accent-glow-strong), 0 8px 30px rgba(201,168,76,0.3)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px var(--accent-glow-strong)';
                  }}
                >
                  {t('cta.discuss')}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </Magnet>

              <Magnet strength={8}>
                <button
                  type="button"
                  onClick={() => {
                    dispatchTrack('hero_cta_click', 'cases');
                    window.location.hash = 'projects';
                  }}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm transition-all duration-300 cursor-pointer"
                  style={{
                    border: '1px solid var(--border-hover)',
                    color: 'var(--accent)',
                    fontFamily: 'var(--font-syne)',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    background: 'transparent',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--accent-glow)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  {t('cta.cases')}
                </button>
              </Magnet>
            </div>

            {/* Quick stats row with CountUp */}
            <div className="hero-anim-6 flex gap-8 mt-14 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
              {[
                { end: 5,  suffix: '+', label: t('stats.experience') },
                { end: 20, suffix: '+', label: t('stats.projects') },
                { end: 60, suffix: '%', label: t('stats.savings') },
              ].map(({ end, suffix, label }) => (
                <div key={label}>
                  <CountUp
                    end={end}
                    suffix={suffix}
                    duration={1600}
                    className="font-display font-light"
                    style={{ fontSize: '2rem', lineHeight: 1, color: 'var(--accent)', display: 'inline-block' }}
                  />
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-syne)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Photo with TiltedCard ── */}
          <div className="hidden md:flex items-center justify-center relative">
            <div ref={photoRef} className="hero-anim-photo relative w-full max-w-[420px]">
              <TiltedCard maxTilt={8} scale={1.03} glare>
                {/* Gold frame decoration — offset */}
                <div
                  className="absolute -inset-3 rounded-2xl pointer-events-none"
                  style={{ border: '1px solid var(--border-hover)', borderRadius: '1.5rem' }}
                  aria-hidden
                />
                <div
                  className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%)' }}
                  aria-hidden
                />

                {/* Photo container */}
                <div
                  className="relative overflow-hidden"
                  style={{ borderRadius: '1.25rem', aspectRatio: '3/4' }}
                >
                  <Image
                    src="/photo.png"
                    alt="Дмитрий Могилевцев"
                    fill
                    priority
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 0px, 420px"
                  />
                  {/* Bottom gold gradient overlay */}
                  <div
                    className="absolute inset-x-0 bottom-0 h-2/5 pointer-events-none"
                    style={{ background: 'linear-gradient(to top, rgba(9,9,10,0.7) 0%, transparent 100%)' }}
                    aria-hidden
                  />
                </div>

                {/* Floating badge — bottom-left */}
                <div
                  className="absolute -bottom-5 -left-6 px-4 py-2.5 float-anim"
                  style={{
                    background: 'rgba(15,14,11,0.9)',
                    border: '1px solid var(--border-hover)',
                    borderRadius: '0.75rem',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-syne)', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.55rem' }}>{t('specialization')}</div>
                  <div className="text-sm font-medium mt-0.5" style={{ color: 'var(--accent-light)', fontFamily: 'var(--font-syne)' }}>{t('specializationLine')}</div>
                </div>
              </TiltedCard>
            </div>
          </div>

        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
        <span className="section-eyebrow" style={{ fontSize: '0.55rem' }}>{t('scroll')}</span>
        <div className="scroll-bounce" style={{ color: 'var(--accent)' }}>
          <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
            <rect x="1" y="1" width="14" height="22" rx="7" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.2"/>
            <rect x="7" y="5" width="2" height="5" rx="1" fill="currentColor"/>
          </svg>
        </div>
      </div>
    </section>
  );
}

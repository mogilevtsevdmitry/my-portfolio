import { useTranslations } from 'next-intl';
import { GlowText } from '@/components/ui/GlowText';
import { Button } from '@/components/ui/Button';

function dispatchTrack(event: string, cta_type: string): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('track', {
        detail: { event, payload: { cta_type } },
      }),
    );
  }
}

export function Hero() {
  const t = useTranslations('hero');

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center px-4 md:px-8 grid-pattern overflow-hidden"
    >
      {/* Gradient orb */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(74,222,128,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Name */}
        <p className="text-accent text-sm font-medium tracking-widest uppercase mb-4">
          {t('name')}
        </p>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
          <GlowText>{t('title')}</GlowText>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
          {t('subtitle')}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#contacts"
            onClick={() => dispatchTrack('hero_cta_click', 'discuss')}
          >
            <Button size="lg">{t('cta.discuss')}</Button>
          </a>
          <a
            href="#projects"
            onClick={() => dispatchTrack('hero_cta_click', 'cases')}
          >
            <Button variant="outline" size="lg">
              {t('cta.cases')}
            </Button>
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="mt-20 flex justify-center">
          <div className="w-6 h-10 border-2 border-[var(--border)] rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-accent rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}

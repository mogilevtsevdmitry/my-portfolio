import { useTranslations } from 'next-intl';
import { Section } from '@/components/ui/Section';
import { GlowText } from '@/components/ui/GlowText';

export function WorkProcess() {
  const t = useTranslations('process');
  const steps = t.raw('steps') as Array<{
    number: string;
    title: string;
    description: string;
  }>;

  return (
    <Section id="process" alt>
      <div className="mb-14">
        <span className="section-eyebrow">06. Процесс</span>
        <hr className="gold-divider mt-3" style={{ width: '3rem' }} />
      </div>
      <GlowText as="h2" className="text-3xl md:text-4xl font-bold text-center mb-12">
        {t('title')}
      </GlowText>

      <div className="relative">
        {/* Vertical line (desktop) */}
        <div className="hidden md:block absolute left-[calc(50%-1px)] top-0 bottom-0 w-0.5 bg-[var(--border)]" />

        <div className="space-y-8">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className={`relative flex flex-col md:flex-row items-start md:items-center gap-6 ${
                i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              {/* Content */}
              <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                <div className="glass-card p-5 inline-block w-full md:max-w-sm">
                  <h3 className="font-semibold text-[var(--text-primary)] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)]">{step.description}</p>
                </div>
              </div>

              {/* Number bubble */}
              <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full bg-[var(--bg-secondary)] border-2 border-accent flex items-center justify-center font-bold text-accent text-sm">
                {step.number}
              </div>

              {/* Empty spacer on other side */}
              <div className="flex-1 hidden md:block" />
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

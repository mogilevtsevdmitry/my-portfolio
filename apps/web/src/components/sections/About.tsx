import { useTranslations } from 'next-intl';
import { Section } from '@/components/ui/Section';
import { GlowText } from '@/components/ui/GlowText';

const stats: Array<{ num: string; label: string }> = [
  { num: '5+', label: 'лет опыта' },
  { num: '20+', label: 'проектов' },
  { num: '10+', label: 'AI-агентов' },
  { num: '60%', label: 'экономия затрат' },
];

export function About() {
  const t = useTranslations('about');
  const theses = t.raw('theses') as string[];

  return (
    <Section id="about">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <GlowText as="h2" className="text-3xl md:text-4xl font-bold mb-6">
            {t('title')}
          </GlowText>
          <ul className="space-y-4">
            {theses.map((thesis, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                <span className="text-[var(--text-muted)] leading-relaxed">{thesis}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map(({ num, label }) => (
            <div key={label} className="glass-card p-6 text-center">
              <div className="text-3xl font-bold text-accent mb-1">{num}</div>
              <div className="text-sm text-[var(--text-muted)]">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

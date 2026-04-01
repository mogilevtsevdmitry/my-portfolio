import { useTranslations } from 'next-intl';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { GlowText } from '@/components/ui/GlowText';

interface ValueCard {
  key: string;
  title: string;
  problem: string;
  solution: string;
  result: string;
}

const icons: Record<string, string> = {
  ai: '🤖',
  saas: '🏗️',
  devops: '⚙️',
  consulting: '🔍',
};

export function Values() {
  const t = useTranslations('values');
  const cards = t.raw('cards') as ValueCard[];

  return (
    <Section id="values" alt>
      <GlowText as="h2" className="text-3xl md:text-4xl font-bold text-center mb-12">
        {t('title')}
      </GlowText>

      <div className="grid md:grid-cols-2 gap-6">
        {cards.map((card) => (
          <Card key={card.key}>
            <div className="text-3xl mb-4">{icons[card.key] ?? '✦'}</div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              {card.title}
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex gap-2">
                <span className="text-red-400 font-medium shrink-0">→</span>
                <span className="text-[var(--text-muted)]">{card.problem}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-accent font-medium shrink-0">✓</span>
                <span className="text-[var(--text-muted)]">{card.solution}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-accent font-bold shrink-0">⚡</span>
                <span className="text-accent font-medium">{card.result}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

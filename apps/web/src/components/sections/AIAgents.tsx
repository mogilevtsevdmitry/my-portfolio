import { useTranslations } from 'next-intl';
import { Section } from '@/components/ui/Section';
import { GlowText } from '@/components/ui/GlowText';
import { Card } from '@/components/ui/Card';

interface Capability {
  key: string;
  icon: string;
  title: string;
  desc: string;
}

export function AIAgents() {
  const t = useTranslations('ai');
  const tCommon = useTranslations('common');
  const capabilities = t.raw('capabilities') as Capability[];

  return (
    <Section id="ai">
      <div className="mb-14">
        <span className="section-eyebrow">{tCommon('sections.ai')}</span>
        <hr className="gold-divider mt-3" style={{ width: '3rem' }} />
      </div>
      <div className="text-center mb-12">
        <GlowText as="h2" className="text-3xl md:text-4xl font-bold mb-4">
          {t('title')}
        </GlowText>
        <p className="text-[var(--text-muted)] max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {capabilities.map(({ icon, key, title, desc }) => (
          <Card key={key}>
            <div className="text-2xl mb-3">{icon}</div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
            <p className="text-sm text-[var(--text-muted)]">{desc}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}

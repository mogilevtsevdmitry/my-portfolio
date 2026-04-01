import { useTranslations } from 'next-intl';
import { Section } from '@/components/ui/Section';
import { GlowText } from '@/components/ui/GlowText';
import { Badge } from '@/components/ui/Badge';

const techGroups = {
  backend: ['NestJS', 'PostgreSQL', 'Prisma', 'Redis', 'GraphQL'],
  architecture: ['DDD', 'Clean Architecture', 'Event-driven', 'Microservices', 'CQRS'],
  infrastructure: ['Docker', 'Kubernetes', 'CI/CD', 'Nginx', 'Terraform'],
  ai: ['LLM', 'Multi-agent systems', 'Orchestration', 'RAG', 'Tool use'],
} as const;

export function TechStack() {
  const t = useTranslations('tech');

  return (
    <Section id="tech" alt>
      <div className="text-center mb-12">
        <GlowText as="h2" className="text-3xl md:text-4xl font-bold mb-4">
          {t('title')}
        </GlowText>
        <p className="text-[var(--text-muted)]">{t('subtitle')}</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(Object.keys(techGroups) as Array<keyof typeof techGroups>).map((group) => (
          <div key={group} className="glass-card p-5">
            <h3 className="text-sm font-semibold text-accent uppercase tracking-wider mb-4">
              {t(`groups.${group}`)}
            </h3>
            <div className="flex flex-wrap gap-2">
              {techGroups[group].map((tech) => (
                <Badge key={tech}>{tech}</Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

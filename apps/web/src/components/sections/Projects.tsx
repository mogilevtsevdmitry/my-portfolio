import { useTranslations } from 'next-intl';
import { Section } from '@/components/ui/Section';
import { GlowText } from '@/components/ui/GlowText';
import { ProjectCard } from './ProjectCard';
import { allProjects } from '@/lib/projects';

export function Projects() {
  const t = useTranslations('projects');

  return (
    <Section id="projects">
      <div className="text-center mb-12">
        <GlowText as="h2" className="text-3xl md:text-4xl font-bold mb-4">
          {t('title')}
        </GlowText>
        <p className="text-[var(--text-muted)]">{t('subtitle')}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {allProjects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </Section>
  );
}

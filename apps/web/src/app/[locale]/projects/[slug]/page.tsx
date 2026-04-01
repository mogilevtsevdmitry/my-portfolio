import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { allProjects, getProjectBySlug } from '@/lib/projects';
import { Badge } from '@/components/ui/Badge';
import { Section } from '@/components/ui/Section';
import { GlowText } from '@/components/ui/GlowText';
import { Link } from '@/navigation';
import { locales, type Locale } from '@/i18n';

interface Props {
  params: { locale: string; slug: string };
}

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    allProjects.map((p) => ({ locale, slug: p.slug })),
  );
}

export const revalidate = false; // on-demand revalidation only

export async function generateMetadata({ params: { locale, slug } }: Props): Promise<Metadata> {
  const project = getProjectBySlug(slug);
  if (!project) return {};
  const content = project[locale as Locale] ?? project.ru;
  return {
    title: content.title,
    description: content.shortDescription,
    openGraph: {
      title: content.title,
      description: content.shortDescription,
      images: [{ url: project.previewImage }],
    },
  };
}

export default async function ProjectPage({ params: { locale, slug } }: Props) {
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const content = project[locale as Locale] ?? project.ru;
  const t = await getTranslations({ locale, namespace: 'projects' });

  const sections = [
    { key: 'description', label: t('sections.description'), content: content.description },
    { key: 'problem', label: t('sections.problem'), content: content.problem },
    { key: 'solution', label: t('sections.solution'), content: content.solution },
    { key: 'result', label: t('sections.result'), content: content.result },
    { key: 'ai', label: t('sections.ai'), content: content.aiUsage },
  ];

  return (
    <Section className="pt-24">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-accent transition-colors mb-8 text-sm"
      >
        ← Назад
      </Link>

      <GlowText as="h1" className="text-3xl md:text-5xl font-bold mb-4">
        {content.title}
      </GlowText>
      <p className="text-[var(--text-muted)] text-lg mb-8">{content.shortDescription}</p>

      {/* Technologies */}
      <div className="flex flex-wrap gap-2 mb-12">
        {project.technologies.map((tech) => (
          <Badge key={tech}>{tech}</Badge>
        ))}
      </div>

      {/* Case sections */}
      <div className="space-y-8">
        {sections.map(({ key, label, content: text }) => (
          <div key={key} className="glass-card p-6">
            <h2 className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
              {label}
            </h2>
            <p className="text-[var(--text-muted)] leading-relaxed">{text}</p>
          </div>
        ))}
      </div>

      {project.link && (
        <div className="mt-10">
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-accent hover:underline font-medium"
          >
            {t('openProject')} →
          </a>
        </div>
      )}
    </Section>
  );
}

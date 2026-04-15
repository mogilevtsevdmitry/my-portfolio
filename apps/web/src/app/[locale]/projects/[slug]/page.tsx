import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { fetchProjectBySlug, getProjectTranslation } from '@/lib/projects';
import { Badge } from '@/components/ui/Badge';
import { Section } from '@/components/ui/Section';
import { GlowText } from '@/components/ui/GlowText';
import { Link } from '@/navigation';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

interface Props {
  params: { locale: string; slug: string };
}

export async function generateMetadata({ params: { locale, slug } }: Props): Promise<Metadata> {
  const project = await fetchProjectBySlug(slug);
  if (!project) return {};
  const content = getProjectTranslation(project, locale);
  return {
    title: content?.title ?? slug,
    description: content?.shortDescription,
    openGraph: {
      title: content?.title ?? slug,
      description: content?.shortDescription,
      ...(project.previewUrl ? { images: [{ url: project.previewUrl }] } : {}),
    },
  };
}

export default async function ProjectPage({ params: { locale, slug } }: Props) {
  const project = await fetchProjectBySlug(slug);
  if (!project) notFound();

  const content = getProjectTranslation(project, locale);
  const t = await getTranslations({ locale, namespace: 'projects' });

  return (
    <Section className="pt-24">
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-accent transition-colors mb-8 text-sm"
      >
        ← {t('allProjects')}
      </Link>

      {/* Preview */}
      {project.previewUrl && (
        <div className="relative w-full rounded-xl overflow-hidden mb-10" style={{ aspectRatio: '16/9', background: 'var(--bg-secondary)' }}>
          {project.previewType === 'video' ? (
            <video
              src={project.previewUrl}
              className="w-full h-full object-cover"
              controls
              playsInline
            />
          ) : (
            <Image
              src={project.previewUrl}
              alt={content?.title ?? slug}
              fill
              className="object-cover"
              priority
            />
          )}
        </div>
      )}

      {/* Category badge */}
      {project.category && (
        <span className="label-badge" style={{ display: 'inline-flex', marginBottom: '1rem' }}>
          {project.category}
        </span>
      )}

      <GlowText as="h1" className="text-3xl md:text-5xl font-bold mb-4">
        {content?.title ?? slug}
      </GlowText>
      <p className="text-[var(--text-muted)] text-lg mb-8">{content?.shortDescription}</p>

      {/* Technologies */}
      {project.technologies.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10">
          {project.technologies.map((tech) => (
            <Badge key={tech}>{tech}</Badge>
          ))}
        </div>
      )}

      {/* Description */}
      {content?.description && (
        <div className="glass-card p-6 mb-8">
          <h2 className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
            {t('sections.description')}
          </h2>
          <p className="text-[var(--text-muted)] leading-relaxed whitespace-pre-line">
            {content.description}
          </p>
        </div>
      )}

      {/* Links */}
      <div className="flex flex-wrap gap-4 mt-10">
        {project.projectUrl && (
          <a
            href={project.projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-accent hover:underline font-medium"
          >
            {t('openProject')} →
          </a>
        )}
        {project.sourceUrl && (
          <a
            href={project.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-accent transition-colors"
          >
            {t('sourceCode')} ↗
          </a>
        )}
      </div>
    </Section>
  );
}

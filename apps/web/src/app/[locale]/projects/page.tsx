import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import type { Metadata } from 'next';
import { fetchAllProjects, getProjectTranslation, type WebProject } from '@/lib/projects';
import { Link } from '@/navigation';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface CategoryGroup {
  category: string;
  projects: WebProject[];
}

function groupByCategory(projects: WebProject[]): CategoryGroup[] {
  const map = new Map<string, WebProject[]>();
  for (const project of projects) {
    const existing = map.get(project.category);
    if (existing) {
      existing.push(project);
    } else {
      map.set(project.category, [project]);
    }
  }
  return Array.from(map.entries()).map(([category, items]) => ({ category, projects: items }));
}

function projectCountLabel(count: number, t: (key: string) => string): string {
  return count === 1 ? t('countOne') : t('countMany');
}

// ---------------------------------------------------------------------------
// Project card (server component — locale comes from props, no hooks)
// ---------------------------------------------------------------------------

interface ProjectListCardProps {
  project: WebProject;
  locale: string;
}

function ProjectListCard({ project, locale }: ProjectListCardProps) {
  const content = getProjectTranslation(project, locale);

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="glass-card group block"
      style={{ textDecoration: 'none', padding: '1.5rem' }}
    >
      {/* Preview image / video */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/9',
          borderRadius: '0.75rem',
          overflow: 'hidden',
          marginBottom: '1.25rem',
          background: 'var(--bg-secondary)',
        }}
      >
        {project.previewUrl ? (
          project.previewType === 'video' ? (
            <video
              src={project.previewUrl}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              muted
              playsInline
            />
          ) : (
            <Image
              src={project.previewUrl}
              alt={content?.title ?? project.slug}
              fill
              className="object-cover"
            />
          )
        ) : (
          <div
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)', fontSize: '0.75rem',
            }}
          >
            {project.category}
          </div>
        )}
        {/* Hover overlay */}
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'rgba(201,168,76,0.08)',
            opacity: 0,
            transition: 'opacity 0.3s',
          }}
          className="group-hover:opacity-100"
        />
      </div>

      {/* Category badge */}
      <span className="label-badge" style={{ display: 'inline-flex', marginBottom: '0.75rem' }}>
        {project.category}
      </span>

      {/* Title */}
      <h3
        style={{
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-syne)',
          fontWeight: 600,
          fontSize: '1.1rem',
          marginTop: '0.75rem',
          marginBottom: '0.5rem',
        }}
      >
        {content?.title ?? project.slug}
      </h3>

      {/* Short description */}
      <p
        style={{
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
          lineHeight: 1.6,
          marginBottom: '1rem',
        }}
      >
        {content?.shortDescription}
      </p>

      {/* Technologies */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
        {project.technologies.slice(0, 4).map((tech) => (
          <span key={tech} className="tech-badge">{tech}</span>
        ))}
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// generateMetadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'projects' });
  return {
    title: t('pageTitle'),
    description: t('pageSubtitle'),
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface ProjectsPageProps {
  params: { locale: string };
}

export default async function ProjectsPage({ params: { locale } }: ProjectsPageProps) {
  const t = await getTranslations({ locale, namespace: 'projects' });
  const allProjects = await fetchAllProjects();
  const categoryGroups = groupByCategory(allProjects);

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '5rem' }}>
      {/* Ambient glow */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          transform: 'translateX(-50%)',
          width: '700px',
          height: '350px',
          background: 'radial-gradient(ellipse, rgba(201,168,76,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Page header */}
      <section
        style={{
          padding: '4rem 2rem 3rem',
          maxWidth: '1400px',
          margin: '0 auto',
          position: 'relative',
        }}
      >
        <span className="section-eyebrow">/ {t('pageTitle')}</span>
        <hr className="gold-divider" style={{ width: '3rem', marginTop: '0.75rem', marginBottom: '1.5rem' }} />
        <h1
          className="font-display font-light"
          style={{
            fontSize: 'clamp(3rem, 7vw, 6rem)',
            lineHeight: 1.05,
            background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--accent) 60%, var(--text-secondary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '1rem',
          }}
        >
          {t('pageTitle')}
        </h1>
        <p
          style={{
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '1rem',
            maxWidth: '480px',
          }}
        >
          {t('pageSubtitle')}
        </p>
      </section>

      {/* Category groups */}
      {categoryGroups.length === 0 ? (
        <section style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '4rem 0' }}>
            {t('empty')}
          </p>
        </section>
      ) : (
        categoryGroups.map(({ category, projects }) => (
          <section
            key={category}
            style={{
              padding: '2rem',
              maxWidth: '1400px',
              margin: '0 auto',
              marginBottom: '3rem',
            }}
          >
            {/* Category label + divider */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '2rem',
              }}
            >
              <span className="label-badge">{category}</span>
              <hr className="gold-divider" style={{ flex: 1 }} />
              <span
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-syne)',
                  whiteSpace: 'nowrap',
                }}
              >
                {projects.length} {projectCountLabel(projects.length, t)}
              </span>
            </div>

            {/* Cards grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {projects.map((project) => (
                <ProjectListCard key={project.slug} project={project} locale={locale} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

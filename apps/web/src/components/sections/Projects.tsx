'use client';

import { useTranslations } from 'next-intl';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { ProjectCard } from './ProjectCard';
import type { WebProject } from '@/lib/projects';
import { Link } from '@/navigation';

interface ProjectsProps {
  projects: WebProject[];
}

export function Projects({ projects }: ProjectsProps) {
  const t = useTranslations('projects');
  const tCommon = useTranslations('common');
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      id="projects"
      className="relative py-24 md:py-32 px-6 md:px-16 lg:px-24 overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Ambient glow */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-0 w-[600px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(201,168,76,0.04) 0%, transparent 70%)' }}
        aria-hidden
      />

      <div className="max-w-[1400px] mx-auto">
        <div ref={ref} className={`reveal ${isVisible ? 'is-visible' : ''} mb-14`}>
          <span className="section-eyebrow">{tCommon('sections.projects')}</span>
          <hr className="gold-divider mt-3" style={{ width: '3rem' }} />
        </div>

        <div className={`reveal ${isVisible ? 'is-visible' : ''} flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14`}>
          <h2
            className="font-display font-light leading-tight"
            style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', color: 'var(--text-primary)', maxWidth: '560px' }}
          >
            {t('title')}
          </h2>
          <p
            className="text-sm max-w-xs text-right"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-dm-sans)' }}
          >
            {t('subtitle')}
          </p>
        </div>

        {projects.length === 0 ? (
          <p className="text-[var(--text-muted)] text-center py-16">{t('empty')}</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((project, i) => (
              <div
                key={project.slug}
                className={`reveal reveal-delay-${(i % 2) + 1} ${isVisible ? 'is-visible' : ''}`}
              >
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full transition-all duration-300 hover:bg-[rgba(201,168,76,0.06)]"
            style={{
              border: '1px solid var(--border-hover)',
              color: 'var(--accent)',
              fontFamily: 'var(--font-syne)',
              fontWeight: 600,
              letterSpacing: '0.08em',
              fontSize: '0.875rem',
            }}
          >
            {t('allProjectsBtn')}
          </Link>
        </div>
      </div>
    </section>
  );
}

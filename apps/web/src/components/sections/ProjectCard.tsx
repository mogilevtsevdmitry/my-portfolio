'use client';

import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import type { WebProject } from '@/lib/projects';
import { getProjectTranslation } from '@/lib/projects';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Link } from '@/navigation';
import { TiltedCard } from '@/components/effects/TiltedCard';

interface ProjectCardProps {
  project: WebProject;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const t = useTranslations('projects');
  const locale = useLocale();
  const content = getProjectTranslation(project, locale);

  return (
    <TiltedCard maxTilt={7} scale={1.02} glare className="h-full">
      <Card className="flex flex-col h-full">
        {/* Preview image / video */}
        <div className="relative w-full h-44 rounded-lg overflow-hidden mb-4 bg-[var(--bg-secondary)]">
          {project.previewUrl ? (
            project.previewType === 'video' ? (
              <video
                src={project.previewUrl}
                className="absolute inset-0 w-full h-full object-cover"
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
            <div className="absolute inset-0 flex items-center justify-center text-[var(--text-muted)] text-xs">
              {project.category}
            </div>
          )}
        </div>

        {/* Title + description */}
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
          {content?.title ?? project.slug}
        </h3>
        <p className="text-sm text-[var(--text-muted)] mb-4 flex-1">
          {content?.shortDescription}
        </p>

        {/* Technologies */}
        <div className="flex flex-wrap gap-2 mb-5">
          {project.technologies.slice(0, 4).map((tech) => (
            <Badge key={tech}>{tech}</Badge>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link href={`/projects/${project.slug}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              {t('details')}
            </Button>
          </Link>
          {project.projectUrl && (
            <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button size="sm" className="w-full">{t('openProject')}</Button>
            </a>
          )}
        </div>
      </Card>
    </TiltedCard>
  );
}

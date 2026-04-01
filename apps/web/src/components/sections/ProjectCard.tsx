'use client';

import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import type { Project } from '@portfolio/content/src/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Link } from '@/navigation';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const t = useTranslations('projects');
  const locale = useLocale() as 'ru' | 'en';
  const content = project[locale];

  return (
    <Card className="flex flex-col h-full">
      {/* Preview image */}
      <div className="relative w-full h-44 rounded-lg overflow-hidden mb-4 bg-[var(--bg-secondary)]">
        <Image
          src={project.previewImage}
          alt={content.title}
          fill
          className="object-cover"
          onError={() => {}}
        />
      </div>

      {/* Title + description */}
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
        {content.title}
      </h3>
      <p className="text-sm text-[var(--text-muted)] mb-4 flex-1">
        {content.shortDescription}
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
        {project.link && (
          <a href={project.link} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button size="sm" className="w-full">{t('openProject')}</Button>
          </a>
        )}
      </div>
    </Card>
  );
}

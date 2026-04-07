import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { MediaUpload } from '@/components/ui/MediaUpload';

type Locale = 'ru' | 'en';
type ProjectStatus = 'DRAFT' | 'PUBLISHED';

interface Translation {
  locale: Locale;
  title: string;
  shortDescription: string;
  description: string;
}

interface ProjectData {
  id?: string;
  slug: string;
  status: ProjectStatus;
  category: string;
  technologies: string;
  order: number;
  previewUrl: string;
  previewType: string;
  projectUrl: string;
  sourceUrl: string;
  translations: Translation[];
}

const emptyTranslation = (locale: Locale): Translation => ({
  locale,
  title: '',
  shortDescription: '',
  description: '',
});

const emptyProject = (): ProjectData => ({
  slug: '',
  status: 'DRAFT',
  category: '',
  technologies: '',
  order: 0,
  previewUrl: '',
  previewType: 'image',
  projectUrl: '',
  sourceUrl: '',
  translations: [emptyTranslation('ru'), emptyTranslation('en')],
});

function normalizeTechnologies(value: unknown): string {
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'string') return value;
  return '';
}

export function ProjectEditPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [activeLocale, setActiveLocale] = useState<Locale>('ru');
  const [project, setProject] = useState<ProjectData>(emptyProject);
  const [saveError, setSaveError] = useState('');

  const { data: fetchedProject, isLoading } = useQuery({
    queryKey: ['admin-projects', id],
    queryFn: () => projectsApi.get(id!),
    enabled: !isNew && !!id,
  });

  useEffect(() => {
    if (fetchedProject) {
      setProject({
        id: fetchedProject.id,
        slug: fetchedProject.slug ?? '',
        status: fetchedProject.status ?? 'DRAFT',
        category: fetchedProject.category ?? '',
        technologies: normalizeTechnologies(fetchedProject.technologies),
        order: fetchedProject.order ?? 0,
        previewUrl: fetchedProject.previewUrl ?? '',
        previewType: fetchedProject.previewType ?? 'image',
        projectUrl: fetchedProject.projectUrl ?? '',
        sourceUrl: fetchedProject.sourceUrl ?? '',
        translations: (['ru', 'en'] as Locale[]).map((locale) => {
          const found = fetchedProject.translations?.find((t: any) => t.locale === locale);
          return {
            locale,
            title: found?.title ?? '',
            shortDescription: found?.shortDescription ?? '',
            description: found?.description ?? '',
          };
        }),
      });
    }
  }, [fetchedProject]);

  const saveMutation = useMutation({
    mutationFn: async (data: ProjectData) => {
      const payload = {
        slug: data.slug,
        status: data.status,
        category: data.category || null,
        technologies: data.technologies
          ? data.technologies.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
        order: data.order,
        previewUrl: data.previewUrl || null,
        previewType: data.previewType || null,
        projectUrl: data.projectUrl || null,
        sourceUrl: data.sourceUrl || null,
        translations: data.translations.map((t) => ({
          locale: t.locale,
          title: t.title,
          shortDescription: t.shortDescription,
          description: t.description,
        })),
      };
      if (isNew) {
        return projectsApi.create(payload);
      }
      return projectsApi.update(id!, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-projects'] });
      navigate('/projects');
    },
    onError: (err: Error) => setSaveError(err.message),
  });

  const updateTranslation = (locale: Locale, field: keyof Translation, value: string) => {
    setProject((prev) => ({
      ...prev,
      translations: prev.translations.map((t) =>
        t.locale === locale ? { ...t, [field]: value } : t,
      ),
    }));
  };

  const activeT =
    project.translations.find((t) => t.locale === activeLocale) ?? emptyTranslation(activeLocale);

  if (!isNew && isLoading) return <Spinner />;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">{isNew ? 'New Project' : 'Edit Project'}</h1>
        <div className="flex gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
            Cancel
          </Button>
          <Button
            variant="outline"
            size="sm"
            loading={saveMutation.isPending}
            onClick={() => saveMutation.mutate({ ...project, status: 'DRAFT' })}
          >
            Save Draft
          </Button>
          <Button
            size="sm"
            loading={saveMutation.isPending}
            onClick={() => saveMutation.mutate({ ...project, status: 'PUBLISHED' })}
          >
            Publish
          </Button>
        </div>
      </div>

      <div className="space-y-5">
        {/* Core fields */}
        <Input
          id="slug"
          label="Slug"
          value={project.slug}
          onChange={(e) => setProject((p) => ({ ...p, slug: e.target.value }))}
          placeholder="my-project-slug"
          className="font-mono"
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="status"
              className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider"
            >
              Status
            </label>
            <select
              id="status"
              value={project.status}
              onChange={(e) =>
                setProject((p) => ({ ...p, status: e.target.value as ProjectStatus }))
              }
              className="input-base"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>

          <Input
            id="category"
            label="Category"
            value={project.category}
            onChange={(e) => setProject((p) => ({ ...p, category: e.target.value }))}
            placeholder="AI, SaaS, Fullstack..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="technologies"
            label="Technologies (comma-separated)"
            value={project.technologies}
            onChange={(e) => setProject((p) => ({ ...p, technologies: e.target.value }))}
            placeholder="React, NestJS, PostgreSQL"
          />

          <Input
            id="order"
            label="Order"
            type="number"
            value={project.order}
            onChange={(e) =>
              setProject((p) => ({ ...p, order: parseInt(e.target.value, 10) || 0 }))
            }
            placeholder="0"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="projectUrl"
            label="Project URL"
            type="url"
            value={project.projectUrl}
            onChange={(e) => setProject((p) => ({ ...p, projectUrl: e.target.value }))}
            placeholder="https://example.com"
          />

          <Input
            id="sourceUrl"
            label="Source Code URL"
            type="url"
            value={project.sourceUrl}
            onChange={(e) => setProject((p) => ({ ...p, sourceUrl: e.target.value }))}
            placeholder="https://github.com/..."
          />
        </div>

        <MediaUpload
          label="Preview Media"
          value={project.previewUrl}
          mediaType={project.previewType}
          onChange={(url, type) =>
            setProject((p) => ({ ...p, previewUrl: url, previewType: type }))
          }
        />

        {/* Locale tabs */}
        <div>
          <div className="flex gap-1 mb-4">
            {(['ru', 'en'] as Locale[]).map((locale) => (
              <button
                key={locale}
                type="button"
                onClick={() => setActiveLocale(locale)}
                className={`px-4 py-1.5 text-sm rounded-lg transition-colors font-medium ${
                  activeLocale === locale
                    ? 'bg-accent text-bg-primary'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {locale.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <Input
              label="Title"
              value={activeT.title}
              onChange={(e) => updateTranslation(activeLocale, 'title', e.target.value)}
              placeholder={activeLocale === 'ru' ? 'Название проекта' : 'Project title'}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                Short Description
              </label>
              <textarea
                value={activeT.shortDescription}
                onChange={(e) =>
                  updateTranslation(activeLocale, 'shortDescription', e.target.value)
                }
                placeholder={
                  activeLocale === 'ru' ? 'Краткое описание...' : 'Short description...'
                }
                rows={2}
                className="input-base resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                Full Description
              </label>
              <textarea
                value={activeT.description}
                onChange={(e) =>
                  updateTranslation(activeLocale, 'description', e.target.value)
                }
                placeholder={
                  activeLocale === 'ru' ? 'Полное описание...' : 'Full description...'
                }
                rows={6}
                className="input-base resize-y"
              />
            </div>
          </div>
        </div>

        {saveError && <p className="text-sm text-red-400">{saveError}</p>}
      </div>
    </div>
  );
}

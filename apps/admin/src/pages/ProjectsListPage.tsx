import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { projectsApi } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

interface ProjectTranslation {
  locale: string;
  title: string;
  shortDescription: string;
}

interface Project {
  id: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED';
  category: string | null;
  previewUrl: string | null;
  previewType: string | null;
  updatedAt: string;
  translations: ProjectTranslation[];
}

export function ProjectsListPage() {
  const qc = useQueryClient();
  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ['admin-projects'],
    queryFn: projectsApi.list,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-projects'] }),
  });

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Delete "${title}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <Spinner />;
  if (error) return <p className="text-red-400">Failed to load projects.</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Projects</h1>
        <Link to="/projects/new">
          <Button size="sm">+ New Project</Button>
        </Link>
      </div>

      {!projects?.length ? (
        <div className="glass-card p-8 text-center text-[var(--text-muted)]">
          No projects yet. <Link to="/projects/new" className="text-accent underline">Create one</Link>.
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-muted)] text-left">
                <th className="px-4 py-3 font-medium w-16">Preview</th>
                <th className="px-4 py-3 font-medium">Title (RU)</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => {
                const ruTitle = project.translations.find((t) => t.locale === 'ru')?.title ?? project.slug;
                return (
                  <tr
                    key={project.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-card)]"
                  >
                    <td className="px-4 py-3">
                      {project.previewUrl ? (
                        project.previewType === 'video' ? (
                          <video
                            src={project.previewUrl}
                            className="w-12 h-10 object-cover rounded"
                          />
                        ) : (
                          <img
                            src={project.previewUrl}
                            alt=""
                            className="w-12 h-10 object-cover rounded"
                          />
                        )
                      ) : (
                        <div className="w-12 h-10 bg-[var(--bg-card)] rounded flex items-center justify-center text-[var(--text-muted)] text-xs border border-[var(--border)]">
                          —
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-primary)] font-medium">{ruTitle}</td>
                    <td className="px-4 py-3 text-[var(--text-muted)] font-mono text-xs">{project.slug}</td>
                    <td className="px-4 py-3 text-[var(--text-muted)] text-xs">{project.category ?? '—'}</td>
                    <td className="px-4 py-3">
                      <Badge status={project.status} />
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)] text-xs">
                      {new Date(project.updatedAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <Link to={`/projects/${project.id}`}>
                          <Button variant="outline" size="sm">Edit</Button>
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          loading={deleteMutation.isPending}
                          onClick={() => handleDelete(project.id, ruTitle)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

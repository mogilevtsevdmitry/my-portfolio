import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiFetch } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

interface BlogPost {
  id: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt: string | null;
  updatedAt: string;
  translations: Array<{ locale: string; title: string; excerpt: string }>;
}

async function fetchPosts(): Promise<BlogPost[]> {
  const res = await apiFetch('/admin/blog');
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}

export function BlogListPage() {
  const qc = useQueryClient();
  const { data: posts, isLoading, error } = useQuery({ queryKey: ['admin-blog'], queryFn: fetchPosts });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/admin/blog/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-blog'] }),
  });

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Delete "${title}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <Spinner />;
  if (error) return <p className="text-red-400">Failed to load posts.</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Blog Posts</h1>
        <Link to="/blog/new">
          <Button size="sm">+ New Post</Button>
        </Link>
      </div>

      {!posts?.length ? (
        <div className="glass-card p-8 text-center text-[var(--text-muted)]">
          No posts yet. <Link to="/blog/new" className="text-accent underline">Create one</Link>.
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-muted)] text-left">
                <th className="px-4 py-3 font-medium">Title (RU)</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => {
                const ruTitle = post.translations.find((t) => t.locale === 'ru')?.title ?? '—';
                return (
                  <tr key={post.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-card)]">
                    <td className="px-4 py-3 text-[var(--text-primary)] font-medium">{ruTitle}</td>
                    <td className="px-4 py-3 text-[var(--text-muted)] font-mono text-xs">{post.slug}</td>
                    <td className="px-4 py-3"><Badge status={post.status} /></td>
                    <td className="px-4 py-3 text-[var(--text-muted)] text-xs">
                      {new Date(post.updatedAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <Link to={`/blog/${post.id}`}>
                          <Button variant="outline" size="sm">Edit</Button>
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          loading={deleteMutation.isPending}
                          onClick={() => handleDelete(post.id, ruTitle)}
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

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { RichEditor } from '@/components/editor/RichEditor';

type Locale = 'ru' | 'en';
type PostStatus = 'DRAFT' | 'PUBLISHED';

interface Translation {
  locale: Locale;
  title: string;
  excerpt: string;
  content: object | null;
}

interface PostData {
  id?: string;
  slug: string;
  status: PostStatus;
  translations: Translation[];
}

const emptyTranslation = (locale: Locale): Translation => ({
  locale,
  title: '',
  excerpt: '',
  content: null,
});

const emptyPost = (): PostData => ({
  slug: '',
  status: 'DRAFT',
  translations: [emptyTranslation('ru'), emptyTranslation('en')],
});

export function BlogEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [activeLocale, setActiveLocale] = useState<Locale>('ru');
  const [post, setPost] = useState<PostData>(emptyPost);
  const [saveError, setSaveError] = useState('');

  // Fetch existing post by fetching list and finding by id
  // (GET /admin/blog/:id is not in the spec; GET /admin/blog returns all posts)
  const { data: postsList, isLoading } = useQuery({
    queryKey: ['admin-blog'],
    queryFn: async () => {
      const res = await apiFetch('/admin/blog');
      if (!res.ok) throw new Error('Failed to load posts');
      return res.json() as Promise<PostData[]>;
    },
    enabled: !isNew,
  });

  useEffect(() => {
    if (postsList && id) {
      const found = postsList.find((p: PostData) => p.id === id);
      if (found) setPost(found);
    }
  }, [postsList, id]);

  const saveMutation = useMutation({
    mutationFn: async (data: PostData) => {
      const url = isNew ? '/admin/blog' : `/admin/blog/${id}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await apiFetch(url, {
        method,
        body: JSON.stringify({
          slug: data.slug,
          status: data.status,
          translations: data.translations.map((t) => ({
            locale: t.locale,
            title: t.title,
            excerpt: t.excerpt,
            content: t.content ?? { type: 'doc', content: [] },
          })),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? 'Save failed');
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-blog'] });
      navigate('/blog');
    },
    onError: (err: Error) => setSaveError(err.message),
  });

  const updateTranslation = (locale: Locale, field: keyof Translation, value: string | object | null) => {
    setPost((prev) => ({
      ...prev,
      translations: prev.translations.map((t) =>
        t.locale === locale ? { ...t, [field]: value } : t,
      ),
    }));
  };

  const activeT = post.translations.find((t) => t.locale === activeLocale) ?? emptyTranslation(activeLocale);

  if (!isNew && isLoading) return <Spinner />;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">{isNew ? 'New Post' : 'Edit Post'}</h1>
        <div className="flex gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/blog')}>Cancel</Button>
          <Button
            variant="outline"
            size="sm"
            loading={saveMutation.isPending}
            onClick={() => saveMutation.mutate({ ...post, status: 'DRAFT' })}
          >
            Save Draft
          </Button>
          <Button
            size="sm"
            loading={saveMutation.isPending}
            onClick={() => saveMutation.mutate({ ...post, status: 'PUBLISHED' })}
          >
            Publish
          </Button>
        </div>
      </div>

      <div className="space-y-5">
        <Input
          id="slug"
          label="Slug"
          value={post.slug}
          onChange={(e) => setPost((p) => ({ ...p, slug: e.target.value }))}
          placeholder="my-post-slug"
          className="font-mono"
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
              placeholder={activeLocale === 'ru' ? 'Заголовок' : 'Title'}
            />
            <Input
              label="Excerpt"
              value={activeT.excerpt}
              onChange={(e) => updateTranslation(activeLocale, 'excerpt', e.target.value)}
              placeholder={activeLocale === 'ru' ? 'Краткое описание' : 'Short description'}
            />
            <div>
              <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Content</p>
              <RichEditor
                content={activeT.content}
                onChange={(json) => updateTranslation(activeLocale, 'content', json)}
                placeholder={activeLocale === 'ru' ? 'Текст статьи...' : 'Article content...'}
              />
            </div>
          </div>
        </div>

        {saveError && <p className="text-sm text-red-400">{saveError}</p>}
      </div>
    </div>
  );
}

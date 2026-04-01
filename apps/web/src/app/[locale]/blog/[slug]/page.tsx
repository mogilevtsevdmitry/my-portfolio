import { notFound } from 'next/navigation';
import { Section } from '@/components/ui/Section';
import { GlowText } from '@/components/ui/GlowText';
import { Link } from '@/navigation';
import type { Metadata } from 'next';
import { BlogAnalytics } from './BlogAnalytics';

export const revalidate = false; // on-demand only

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface BlogPost {
  id: string;
  slug: string;
  publishedAt: string | null;
  translations: Array<{
    locale: string;
    title: string;
    excerpt: string;
    content: unknown;
    updatedAt: string;
  }>;
}

async function fetchPost(slug: string, locale: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API_URL}/blog/${slug}?locale=${locale}`, {
      next: { revalidate: false },
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params: { locale, slug },
}: { params: { locale: string; slug: string } }): Promise<Metadata> {
  const post = await fetchPost(slug, locale);
  if (!post) return {};
  const t = post.translations[0];
  return {
    title: t?.title,
    description: t?.excerpt,
  };
}

export default async function BlogPostPage({
  params: { locale, slug },
}: { params: { locale: string; slug: string } }) {
  const post = await fetchPost(slug, locale);
  if (!post) notFound();

  const translation = post.translations[0];
  if (!translation) notFound();

  return (
    <>
      <BlogAnalytics slug={slug} />
      <Section className="pt-24 max-w-3xl">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-accent transition-colors mb-8 text-sm"
        >
          ← {locale === 'ru' ? 'Назад к блогу' : 'Back to blog'}
        </Link>

        <GlowText as="h1" className="text-3xl md:text-5xl font-bold mb-4">
          {translation.title}
        </GlowText>

        {post.publishedAt && (
          <time className="block text-[var(--text-muted)] text-sm mb-8">
            {new Date(post.publishedAt).toLocaleDateString(
              locale === 'ru' ? 'ru-RU' : 'en-US',
              { year: 'numeric', month: 'long', day: 'numeric' },
            )}
          </time>
        )}

        <div className="glass-card p-6 prose prose-invert max-w-none">
          <p className="text-[var(--text-muted)] leading-relaxed">
            {renderContent(translation.content)}
          </p>
        </div>
      </Section>
    </>
  );
}

// Basic TipTap JSON → text extraction (full renderer in Plan 3 admin)
function renderContent(content: unknown): string {
  if (typeof content === 'string') return content;
  if (typeof content !== 'object' || !content) return '';
  const node = content as { type?: string; text?: string; content?: unknown[] };
  if (node.text) return node.text;
  if (node.content) return node.content.map(renderContent).join('\n');
  return '';
}

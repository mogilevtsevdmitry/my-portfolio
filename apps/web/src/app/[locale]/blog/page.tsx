import { Section } from '@/components/ui/Section';
import { GlowText } from '@/components/ui/GlowText';
import { Card } from '@/components/ui/Card';
import { Link } from '@/navigation';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface BlogPost {
  id: string;
  slug: string;
  publishedAt: string | null;
  translations: Array<{
    locale: string;
    title: string;
    excerpt: string;
  }>;
}

async function fetchPosts(locale: string): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${API_URL}/blog?locale=${locale}&limit=20`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params: { locale },
}: { params: { locale: string } }): Promise<Metadata> {
  return {
    title: locale === 'ru' ? 'Блог' : 'Blog',
    description:
      locale === 'ru'
        ? 'Статьи об AI и архитектуре систем'
        : 'Articles about AI and system architecture',
  };
}

export default async function BlogListPage({
  params: { locale },
}: { params: { locale: string } }) {
  const posts = await fetchPosts(locale);

  return (
    <Section className="pt-24">
      <GlowText as="h1" className="text-3xl md:text-5xl font-bold mb-12">
        {locale === 'ru' ? 'Блог' : 'Blog'}
      </GlowText>

      {posts.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-[var(--text-muted)]">
            {locale === 'ru' ? 'Скоро здесь появятся статьи' : 'Articles coming soon'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => {
            const translation = post.translations[0];
            if (!translation) return null;
            return (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="hover:border-accent transition-colors cursor-pointer">
                  <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                    {translation.title}
                  </h2>
                  <p className="text-[var(--text-muted)] text-sm mb-3">{translation.excerpt}</p>
                  {post.publishedAt && (
                    <time className="text-xs text-[var(--text-muted)]/60">
                      {new Date(post.publishedAt).toLocaleDateString(
                        locale === 'ru' ? 'ru-RU' : 'en-US',
                        { year: 'numeric', month: 'long', day: 'numeric' },
                      )}
                    </time>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </Section>
  );
}

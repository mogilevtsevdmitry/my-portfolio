export type PostStatus = 'DRAFT' | 'PUBLISHED';
export type Locale = 'ru' | 'en';

export interface BlogPostTranslation {
  locale: Locale;
  title: string;
  excerpt: string;
  content: unknown; // TipTap JSON document
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  status: PostStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  translations: BlogPostTranslation[];
}

export interface BlogPostListItem {
  id: string;
  slug: string;
  status: PostStatus;
  publishedAt: string | null;
  translation: BlogPostTranslation | null;
}

export interface CreateBlogPostDto {
  slug: string;
  translations: Array<{
    locale: Locale;
    title: string;
    excerpt: string;
    content: unknown;
  }>;
}

export interface UpdateBlogPostDto {
  slug?: string;
  status?: PostStatus;
  translations?: Array<{
    locale: Locale;
    title: string;
    excerpt: string;
    content: unknown;
  }>;
}

export interface BlogListQuery {
  locale?: Locale;
  page?: number;
  limit?: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface WebProjectTranslation {
  id: string;
  locale: string;
  title: string;
  shortDescription: string;
  description: string;
}

export interface WebProject {
  id: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED';
  previewUrl: string | null;
  previewType: string | null;
  projectUrl: string | null;
  sourceUrl: string | null;
  category: string;
  technologies: string[];
  order: number;
  translations: WebProjectTranslation[];
  createdAt: string;
  updatedAt: string;
}

export async function fetchAllProjects(): Promise<WebProject[]> {
  try {
    const res = await fetch(`${API_URL}/projects`, {
      next: { tags: ['projects'] },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchProjectBySlug(slug: string): Promise<WebProject | null> {
  try {
    const res = await fetch(`${API_URL}/projects/${slug}`, {
      next: { tags: [`project-${slug}`] },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export function getProjectTranslation(
  project: WebProject,
  locale: string,
): WebProjectTranslation | undefined {
  return project.translations.find((t) => t.locale === locale)
    ?? project.translations.find((t) => t.locale === 'ru');
}

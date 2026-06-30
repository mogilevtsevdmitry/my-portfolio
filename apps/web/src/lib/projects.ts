const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface WebProjectMetric {
  value: string;
  label: string;
}

export interface WebProjectTranslation {
  id: string;
  locale: string;
  title: string;
  shortDescription: string;
  description: string;
  problem: string;
  solution: string;
  result: string;
  metrics: WebProjectMetric[] | null;
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
      // Time-based ISR (60s) in addition to the on-demand `projects` tag, so the
      // listing reliably reflects DB changes (incl. migrations/seed that don't
      // go through the API's revalidation hook) even on the localized
      // `/[locale]/projects` route. On-demand tag invalidation still applies.
      next: { revalidate: 60, tags: ['projects'] },
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
      next: { revalidate: 60, tags: [`project-${slug}`] },
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

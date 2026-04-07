export type ProjectStatus = 'DRAFT' | 'PUBLISHED';

export interface ProjectTranslation {
  id: string;
  locale: string;
  title: string;
  shortDescription: string;
  description: string;
}

export interface Project {
  id: string;
  slug: string;
  status: ProjectStatus;
  previewUrl: string | null;
  previewType: string | null;
  projectUrl: string | null;
  sourceUrl: string | null;
  category: string;
  technologies: string[];
  order: number;
  translations: ProjectTranslation[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  slug: string;
  status?: ProjectStatus;
  previewUrl?: string;
  previewType?: string;
  projectUrl?: string;
  sourceUrl?: string;
  category?: string;
  technologies?: string[];
  order?: number;
  translations: Array<{
    locale: string;
    title: string;
    shortDescription: string;
    description: string;
  }>;
}

export interface UpdateProjectDto {
  slug?: string;
  status?: ProjectStatus;
  previewUrl?: string;
  previewType?: string;
  projectUrl?: string;
  sourceUrl?: string;
  category?: string;
  technologies?: string[];
  order?: number;
  translations?: Array<{
    locale: string;
    title: string;
    shortDescription: string;
    description: string;
  }>;
}

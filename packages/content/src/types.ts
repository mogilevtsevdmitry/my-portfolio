export interface ProjectTranslation {
  title: string;
  shortDescription: string;
  description: string;
  problem: string;
  solution: string;
  result: string;
  aiUsage: string;
}

export interface Project {
  slug: string;
  previewImage: string; // path relative to /public
  link?: string;
  technologies: string[];
  ru: ProjectTranslation;
  en: ProjectTranslation;
}

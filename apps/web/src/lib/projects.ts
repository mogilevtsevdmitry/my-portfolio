import type { Project } from '@portfolio/content/src/types';

// Static imports for all projects (SSG-friendly)
import agentOrchestrator from '@portfolio/content/projects/agent-orchestrator.json';
import marketplace from '@portfolio/content/projects/marketplace.json';
import gineo from '@portfolio/content/projects/gineo.json';
import telegramBots from '@portfolio/content/projects/telegram-bots.json';

export const allProjects: Project[] = [
  agentOrchestrator as Project,
  marketplace as Project,
  gineo as Project,
  telegramBots as Project,
];

export function getProjectBySlug(slug: string): Project | undefined {
  return allProjects.find((p) => p.slug === slug);
}

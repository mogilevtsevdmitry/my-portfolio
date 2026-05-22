import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProjectStatus } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async findAll() {
    return this.prisma.project.findMany({
      include: { translations: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findAllPublished() {
    return this.prisma.project.findMany({
      where: { status: 'PUBLISHED' },
      include: { translations: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { translations: true },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async findBySlug(slug: string) {
    const project = await this.prisma.project.findUnique({
      where: { slug },
      include: { translations: true },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async create(dto: CreateProjectDto) {
    const { translations, ...data } = dto;
    const project = await this.prisma.project.create({
      data: {
        ...data,
        status: data.status as ProjectStatus | undefined,
        translations: {
          create: translations,
        },
      },
      include: { translations: true },
    });

    await this.revalidateProjectPaths(project.slug);
    return project;
  }

  async update(id: string, dto: UpdateProjectDto) {
    const existing = await this.findOne(id);
    const { translations, ...data } = dto;

    if (translations && translations.length > 0) {
      await Promise.all(
        translations.map((t) =>
          this.prisma.projectTranslation.upsert({
            where: { projectId_locale: { projectId: id, locale: t.locale } },
            create: { ...t, projectId: id },
            update: t,
          }),
        ),
      );
    }

    const project = await this.prisma.project.update({
      where: { id },
      data: {
        ...data,
        status: data.status as ProjectStatus | undefined,
      },
      include: { translations: true },
    });

    // Revalidate both the old slug (на случай переименования) и новый.
    await this.revalidateProjectPaths(existing.slug);
    if (project.slug !== existing.slug) {
      await this.revalidateProjectPaths(project.slug);
    }
    return project;
  }

  async remove(id: string) {
    const project = await this.findOne(id);
    await this.prisma.project.delete({ where: { id } });
    await this.revalidateProjectPaths(project.slug);
    return { success: true };
  }

  /**
   * Invalidate all Next.js cached pages that depend on the projects table.
   * Главная (`/`) показывает превью-сетку, `/projects` — полный листинг,
   * `/projects/{slug}` — детальную карточку.
   */
  private async revalidateProjectPaths(slug: string) {
    await Promise.all([
      this.triggerRevalidation('/'),
      this.triggerRevalidation('/projects'),
      this.triggerRevalidation(`/projects/${slug}`),
    ]);
  }

  private async triggerRevalidation(path: string) {
    const webUrl = this.config.get<string>('WEB_URL') ?? 'http://web:3000';
    const secret = this.config.get<string>('REVALIDATION_SECRET');
    if (!secret) return;

    try {
      await fetch(
        `${webUrl}/api/revalidate?secret=${secret}&path=${encodeURIComponent(path)}`,
        { method: 'POST' },
      );
    } catch {
      console.warn(`Failed to trigger revalidation for ${path}`);
    }
  }
}

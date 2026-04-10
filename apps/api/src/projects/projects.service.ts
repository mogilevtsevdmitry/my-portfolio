import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectStatus } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

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
    return this.prisma.project.create({
      data: {
        ...data,
        status: data.status as ProjectStatus | undefined,
        translations: {
          create: translations,
        },
      },
      include: { translations: true },
    });
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.findOne(id);
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

    return this.prisma.project.update({
      where: { id },
      data: {
        ...data,
        status: data.status as ProjectStatus | undefined,
      },
      include: { translations: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.project.delete({ where: { id } });
    return { success: true };
  }
}

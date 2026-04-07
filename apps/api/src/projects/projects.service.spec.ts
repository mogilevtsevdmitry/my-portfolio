import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prisma: any;

  const mockProject = {
    id: 'project-1',
    slug: 'test-project',
    status: 'PUBLISHED',
    previewUrl: 'https://example.com/preview.png',
    previewType: 'image',
    projectUrl: 'https://example.com',
    sourceUrl: 'https://github.com/example',
    category: 'web',
    technologies: ['React', 'NestJS'],
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    translations: [
      {
        id: 'tr-1',
        locale: 'ru',
        title: 'Тестовый проект',
        shortDescription: 'Краткое описание',
        description: 'Полное описание',
        projectId: 'project-1',
      },
      {
        id: 'tr-2',
        locale: 'en',
        title: 'Test Project',
        shortDescription: 'Short description',
        description: 'Full description',
        projectId: 'project-1',
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: PrismaService,
          useValue: {
            project: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            projectTranslation: {
              upsert: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    prisma = module.get(PrismaService);
  });

  describe('findAll', () => {
    it('should return all projects ordered by order asc then createdAt desc', async () => {
      prisma.project.findMany.mockResolvedValue([mockProject]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(prisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { translations: true },
          orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        }),
      );
    });
  });

  describe('findAllPublished', () => {
    it('should return only published projects', async () => {
      prisma.project.findMany.mockResolvedValue([mockProject]);

      const result = await service.findAllPublished();

      expect(result).toHaveLength(1);
      expect(prisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'PUBLISHED' },
          include: { translations: true },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a project by id', async () => {
      prisma.project.findUnique.mockResolvedValue(mockProject);

      const result = await service.findOne('project-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('project-1');
      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: 'project-1' },
        include: { translations: true },
      });
    });

    it('should throw NotFoundException when project not found', async () => {
      prisma.project.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findBySlug', () => {
    it('should return a project by slug', async () => {
      prisma.project.findUnique.mockResolvedValue(mockProject);

      const result = await service.findBySlug('test-project');

      expect(result).toBeDefined();
      expect(result.slug).toBe('test-project');
      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { slug: 'test-project' },
        include: { translations: true },
      });
    });

    it('should throw NotFoundException when slug not found', async () => {
      prisma.project.findUnique.mockResolvedValue(null);

      await expect(service.findBySlug('not-found')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a project with translations', async () => {
      prisma.project.create.mockResolvedValue(mockProject);

      const dto = {
        slug: 'test-project',
        category: 'web',
        technologies: ['React', 'NestJS'],
        order: 0,
        translations: [
          {
            locale: 'ru',
            title: 'Тестовый проект',
            shortDescription: 'Краткое описание',
            description: 'Полное описание',
          },
        ],
      };

      const result = await service.create(dto);

      expect(result).toBeDefined();
      expect(result.slug).toBe('test-project');
      expect(prisma.project.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            slug: 'test-project',
            translations: { create: dto.translations },
          }),
          include: { translations: true },
        }),
      );
    });
  });

  describe('update', () => {
    it('should update a project', async () => {
      prisma.project.findUnique.mockResolvedValue(mockProject);
      prisma.project.update.mockResolvedValue({ ...mockProject, category: 'mobile' });

      const result = await service.update('project-1', { category: 'mobile' });

      expect(result.category).toBe('mobile');
      expect(prisma.project.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'project-1' } }),
      );
    });

    it('should upsert translations when provided', async () => {
      prisma.project.findUnique.mockResolvedValue(mockProject);
      prisma.projectTranslation.upsert.mockResolvedValue({});
      prisma.project.update.mockResolvedValue(mockProject);

      await service.update('project-1', {
        translations: [
          {
            locale: 'ru',
            title: 'Обновлённый проект',
            shortDescription: 'Обновлённое краткое',
            description: 'Обновлённое полное',
          },
        ],
      });

      expect(prisma.projectTranslation.upsert).toHaveBeenCalledTimes(1);
      expect(prisma.projectTranslation.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { projectId_locale: { projectId: 'project-1', locale: 'ru' } },
        }),
      );
    });

    it('should throw NotFoundException when project not found', async () => {
      prisma.project.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent', { category: 'web' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a project', async () => {
      prisma.project.findUnique.mockResolvedValue(mockProject);
      prisma.project.delete.mockResolvedValue(mockProject);

      const result = await service.remove('project-1');

      expect(result).toEqual({ success: true });
      expect(prisma.project.delete).toHaveBeenCalledWith({ where: { id: 'project-1' } });
    });

    it('should throw NotFoundException when project not found', async () => {
      prisma.project.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});

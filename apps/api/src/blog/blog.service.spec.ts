import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BlogService } from './blog.service';
import { PrismaService } from '../prisma/prisma.service';

describe('BlogService', () => {
  let service: BlogService;
  let prisma: any;

  const mockPost = {
    id: 'post-1',
    slug: 'test-post',
    status: 'PUBLISHED',
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    translations: [
      {
        id: 'tr-1',
        locale: 'ru',
        title: 'Тест',
        excerpt: 'Тестовый пост',
        content: {},
        updatedAt: new Date(),
        postId: 'post-1',
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogService,
        {
          provide: PrismaService,
          useValue: {
            blogPost: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            blogPostTranslation: {
              upsert: jest.fn(),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('test_secret') },
        },
      ],
    }).compile();

    service = module.get<BlogService>(BlogService);
    prisma = module.get(PrismaService);
  });

  describe('findPublished', () => {
    it('should return paginated published posts', async () => {
      prisma.blogPost.findMany.mockResolvedValue([mockPost] as any);
      prisma.blogPost.count.mockResolvedValue(1);

      const result = await service.findPublished({ locale: 'ru', page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(prisma.blogPost.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'PUBLISHED' },
        }),
      );
    });
  });

  describe('findBySlug', () => {
    it('should return a post by slug', async () => {
      prisma.blogPost.findUnique.mockResolvedValue(mockPost as any);

      const result = await service.findBySlug('test-post', 'ru');

      expect(result).toBeDefined();
      expect(result?.slug).toBe('test-post');
    });

    it('should return null when post not found', async () => {
      prisma.blogPost.findUnique.mockResolvedValue(null);

      const result = await service.findBySlug('not-found', 'ru');

      expect(result).toBeNull();
    });
  });
});

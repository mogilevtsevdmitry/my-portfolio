import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

interface FindPublishedOptions {
  locale?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class BlogService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async findPublished(options: FindPublishedOptions = {}) {
    const locale = options.locale || 'ru';
    const limit = Number(options.limit) || 10;
    const page = Number(options.page) || 1;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where: { status: 'PUBLISHED' },
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        include: {
          translations: {
            where: { locale },
          },
        },
      }),
      this.prisma.blogPost.count({ where: { status: 'PUBLISHED' } }),
    ]);

    return { data, total, page, limit };
  }

  async findBySlug(slug: string, locale: string = 'ru') {
    return this.prisma.blogPost.findUnique({
      where: { slug },
      include: {
        translations: {
          where: { locale },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
      include: { translations: true },
    });
  }

  async create(dto: CreatePostDto) {
    const post = await this.prisma.blogPost.create({
      data: {
        slug: dto.slug,
        ...(dto.status ? { status: dto.status as any, publishedAt: dto.status === 'PUBLISHED' ? new Date() : null } : {}),
        translations: {
          create: dto.translations.map((t) => ({
            locale: t.locale,
            title: t.title,
            excerpt: t.excerpt,
            content: t.content ?? {},
          })),
        },
      },
      include: { translations: true },
    });

    await this.triggerRevalidation(`/blog/${dto.slug}`);
    await this.triggerRevalidation('/blog');
    return post;
  }

  async update(id: string, dto: UpdatePostDto) {
    const existing = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Post not found');

    const data: Record<string, unknown> = {};
    if (dto.slug) data.slug = dto.slug;
    if (dto.status) {
      data.status = dto.status;
      data.publishedAt =
        dto.status === 'PUBLISHED' && !existing.publishedAt
          ? new Date()
          : existing.publishedAt;
    }

    const post = await this.prisma.blogPost.update({
      where: { id },
      data: {
        ...data,
        ...(dto.translations && {
          translations: {
            upsert: dto.translations.map((t) => ({
              where: {
                postId_locale: { postId: id, locale: t.locale },
              },
              create: {
                locale: t.locale,
                title: t.title,
                excerpt: t.excerpt,
                content: t.content ?? {},
              },
              update: {
                title: t.title,
                excerpt: t.excerpt,
                content: t.content ?? {},
              },
            })),
          },
        }),
      },
      include: { translations: true },
    });

    const slug = (dto.slug ?? existing.slug) as string;
    await this.triggerRevalidation(`/blog/${slug}`);
    await this.triggerRevalidation('/blog');
    return post;
  }

  async remove(id: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');

    await this.prisma.blogPost.delete({ where: { id } });
    await this.triggerRevalidation(`/blog/${post.slug}`);
    await this.triggerRevalidation('/blog');
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

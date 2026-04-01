import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { BlogService } from './blog.service';

@Controller('blog')
export class BlogController {
  constructor(private blogService: BlogService) {}

  @Get()
  findAll(
    @Query('locale') locale: string = 'ru',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.blogService.findPublished({ locale, page: +page, limit: +limit });
  }

  @Get(':slug')
  async findOne(
    @Param('slug') slug: string,
    @Query('locale') locale: string = 'ru',
  ) {
    const post = await this.blogService.findBySlug(slug, locale);
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }
}

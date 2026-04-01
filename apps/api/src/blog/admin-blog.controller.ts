import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BlogService } from './blog.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('admin/blog')
@UseGuards(JwtAuthGuard)
export class AdminBlogController {
  constructor(private blogService: BlogService) {}

  @Get()
  findAll() {
    return this.blogService.findAll();
  }

  @Post()
  create(@Body() dto: CreatePostDto) {
    return this.blogService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePostDto) {
    return this.blogService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.blogService.remove(id);
  }
}

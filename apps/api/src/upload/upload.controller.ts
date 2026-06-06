import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from './upload.service';
import { PresignDto } from './dto/presign.dto';

@Controller('admin/upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('presign')
  getPresignedUrl(@Body() dto: PresignDto) {
    return this.uploadService.getPresignedUrl(dto.fileName, dto.contentType);
  }
}

import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from './upload.service';

@Controller('admin/upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('presign')
  getPresignedUrl(@Body() body: { fileName: string; contentType: string }) {
    return this.uploadService.getPresignedUrl(body.fileName, body.contentType);
  }
}

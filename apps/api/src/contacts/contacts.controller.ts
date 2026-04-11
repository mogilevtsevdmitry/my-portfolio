import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContactsService } from './contacts.service';
import { CaptchaService } from './captcha.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactStatusDto } from './dto/update-contact-status.dto';

@Controller('contacts')
export class ContactsController {
  constructor(
    private contactsService: ContactsService,
    private captchaService: CaptchaService,
  ) {}

  @Get('captcha')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  issueCaptcha() {
    return this.captchaService.issue();
  }

  @Post()
  @HttpCode(201)
  @Throttle({ default: { limit: 5, ttl: 3600000 } })
  create(@Body() dto: CreateContactDto) {
    return this.contactsService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.contactsService.findAll();
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateContactStatusDto,
  ) {
    return this.contactsService.updateStatus(id, dto.status);
  }
}

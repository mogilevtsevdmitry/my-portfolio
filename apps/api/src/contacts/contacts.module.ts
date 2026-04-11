import { Module } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { ContactsController } from './contacts.controller';
import { CaptchaService } from './captcha.service';
import { TelegramService } from './notifications/telegram.service';
import { EmailService } from './notifications/email.service';

@Module({
  controllers: [ContactsController],
  providers: [ContactsService, CaptchaService, TelegramService, EmailService],
})
export class ContactsModule {}

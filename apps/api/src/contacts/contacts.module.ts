import { Module } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { ContactsController } from './contacts.controller';
import { TelegramService } from './notifications/telegram.service';
import { EmailService } from './notifications/email.service';

@Module({
  controllers: [ContactsController],
  providers: [ContactsService, TelegramService, EmailService],
})
export class ContactsModule {}

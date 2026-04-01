import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from './notifications/telegram.service';
import { EmailService } from './notifications/email.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactsService {
  constructor(
    private prisma: PrismaService,
    private telegram: TelegramService,
    private email: EmailService,
  ) {}

  async create(dto: CreateContactDto) {
    const contact = await this.prisma.contact.create({ data: dto });

    const message = [
      `📩 <b>New Contact Request</b>`,
      ``,
      `👤 <b>Name:</b> ${dto.name}`,
      `📬 <b>Contact:</b> ${dto.contact}`,
      `📝 <b>Description:</b>`,
      dto.description,
    ].join('\n');

    this.telegram.sendMessage(message).catch(() => undefined);
    this.email.sendContactNotification(dto).catch(() => undefined);

    return contact;
  }

  findAll() {
    return this.prisma.contact.findMany({ orderBy: { createdAt: 'desc' } });
  }

  updateStatus(id: string, status: string) {
    return this.prisma.contact.update({
      where: { id },
      data: { status: status as any },
    });
  }
}

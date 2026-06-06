import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ContactStatus } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from './notifications/telegram.service';
import { EmailService } from './notifications/email.service';
import { CaptchaService } from './captcha.service';
import { CreateContactDto } from './dto/create-contact.dto';

const escapeHtml = (s: string): string =>
  s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!),
  );

@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);

  constructor(
    private prisma: PrismaService,
    private telegram: TelegramService,
    private email: EmailService,
    private captcha: CaptchaService,
  ) {}

  async create(dto: CreateContactDto) {
    // 1. Honeypot. Real browsers leave `website` empty; bots fill every field.
    if (dto.website && dto.website.length > 0) {
      this.logger.warn('Honeypot triggered, silently dropping request');
      // Return a fake success so scrapers don't learn they're blocked.
      return { id: 'silent-drop', createdAt: new Date() };
    }

    // 2. Math captcha verification.
    if (!this.captcha.verify(dto.captchaToken, dto.captchaAnswer)) {
      // Return a machine-readable `code` so the frontend can pick a
      // localized message (the user's locale isn't known to the server).
      throw new BadRequestException({
        statusCode: 400,
        code: 'CAPTCHA_INVALID',
        message: 'Captcha verification failed',
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { captchaToken, captchaAnswer, website, ...data } = dto;
    const contact = await this.prisma.contact.create({ data });

    const message = [
      `📩 <b>Новая заявка с сайта</b>`,
      ``,
      `👤 <b>Имя:</b> ${escapeHtml(dto.name)}`,
      `📬 <b>Контакт:</b> ${escapeHtml(dto.contact)}`,
      `📝 <b>Описание:</b>`,
      escapeHtml(dto.description),
    ].join('\n');

    this.telegram.sendMessage(message).catch(() => undefined);
    this.email.sendContactNotification(dto).catch(() => undefined);

    return contact;
  }

  findAll() {
    return this.prisma.contact.findMany({ orderBy: { createdAt: 'desc' } });
  }

  // SEC-018: status is constrained by UpdateContactStatusDto's @IsIn allowlist
  // (NEW | READ | ARCHIVED), so we can safely accept the typed Prisma enum
  // instead of casting through `any`.
  updateStatus(id: string, status: ContactStatus) {
    return this.prisma.contact.update({
      where: { id },
      data: { status },
    });
  }
}

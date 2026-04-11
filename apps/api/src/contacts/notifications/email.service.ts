import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

/** Escape user-supplied strings so they can't inject HTML into the email body. */
const escapeHtml = (s: string): string =>
  s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!),
  );

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    if (!host || !user || !pass) return;

    const port = parseInt(this.config.get<string>('SMTP_PORT') ?? '587', 10);
    // SMTP_SECURE explicit override (truthy string enables SSL). Otherwise
    // auto-detect: port 465 uses implicit TLS, everything else (587/25/etc)
    // uses STARTTLS which nodemailer handles with `secure: false`.
    const secureEnv = this.config.get<string>('SMTP_SECURE');
    const secure =
      secureEnv !== undefined
        ? secureEnv === 'true' || secureEnv === '1'
        : port === 465;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });

    this.logger.log(
      `SMTP transporter ready: ${user}@${host}:${port} (secure=${secure})`,
    );
  }

  async sendContactNotification(data: {
    name: string;
    contact: string;
    description: string;
  }): Promise<void> {
    if (!this.transporter) {
      this.logger.warn('SMTP not configured, skipping email notification');
      return;
    }

    const to = this.config.get<string>('NOTIFICATION_EMAIL');
    if (!to) {
      this.logger.warn('NOTIFICATION_EMAIL not set, skipping email notification');
      return;
    }

    const name = escapeHtml(data.name);
    const contact = escapeHtml(data.contact);
    // Preserve line breaks from the description, escape the rest.
    const description = escapeHtml(data.description).replace(/\n/g, '<br />');

    try {
      await this.transporter.sendMail({
        from: this.config.get<string>('SMTP_USER'),
        to,
        subject: `Новая заявка с сайта — ${data.name}`,
        html: `
          <h2>Новая заявка</h2>
          <p><strong>Имя:</strong> ${name}</p>
          <p><strong>Контакт:</strong> ${contact}</p>
          <p><strong>Описание:</strong></p>
          <p>${description}</p>
          <hr />
          <p style="color:#888;font-size:12px">
            webmogilevtsev.ru — автоматическое уведомление формы обратной связи
          </p>
        `,
      });
      this.logger.log(`Email notification sent to ${to}`);
    } catch (err: any) {
      this.logger.error(
        `Failed to send email notification: code=${err?.code ?? 'unknown'} msg=${err?.message ?? '(no msg)'}`,
      );
    }
  }
}

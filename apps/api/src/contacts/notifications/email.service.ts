import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: parseInt(this.config.get<string>('SMTP_PORT') ?? '587'),
        secure: false,
        auth: { user, pass },
      });
    }
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
    if (!to) return;

    try {
      await this.transporter.sendMail({
        from: this.config.get<string>('SMTP_USER'),
        to,
        subject: `New contact from ${data.name}`,
        html: `
          <h2>New Contact Request</h2>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Contact:</strong> ${data.contact}</p>
          <p><strong>Description:</strong></p>
          <p>${data.description}</p>
        `,
      });
    } catch (err) {
      this.logger.error('Failed to send email notification', err);
    }
  }
}

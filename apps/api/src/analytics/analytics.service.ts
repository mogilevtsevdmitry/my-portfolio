import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';

const VALID_EVENTS = new Set([
  'hero_cta_click',
  'project_view',
  'project_cta_click',
  'contact_form_open',
  'contact_submit',
  'blog_post_view',
]);

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  async track(dto: CreateEventDto): Promise<void> {
    if (!VALID_EVENTS.has(dto.event)) {
      this.logger.warn(`Unknown analytics event: ${dto.event}`);
      return;
    }

    try {
      await this.prisma.analyticsEvent.create({
        data: {
          event: dto.event,
          payload: dto.payload ?? undefined,
          sessionId: dto.sessionId,
        },
      });
    } catch (err) {
      this.logger.error('Failed to record analytics event', err);
    }
  }
}

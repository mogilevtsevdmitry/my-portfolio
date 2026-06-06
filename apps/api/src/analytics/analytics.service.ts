import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { isWithinPayloadBounds } from './dto/payload-bounds';

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

    // SEC-012: defense-in-depth size guard. The DTO validator already enforces
    // these bounds, but the controller fires this method fire-and-forget, so we
    // re-check here to make sure an oversized payload never reaches the DB.
    const payload = this.sanitizePayload(dto.payload);

    try {
      await this.prisma.analyticsEvent.create({
        data: {
          event: dto.event,
          // Already validated as a bounded, JSON-serializable plain object by
          // sanitizePayload; cast to Prisma's JSON input type at the boundary.
          payload:
            (payload as Prisma.InputJsonValue | undefined) ?? undefined,
          sessionId: dto.sessionId,
        },
      });
    } catch (err) {
      this.logger.error('Failed to record analytics event', err);
    }
  }

  /**
   * Drop an over-budget payload rather than persisting it. Returns undefined
   * when the payload is absent or exceeds the SEC-012 bounds. Shares the exact
   * same bounds check as the DTO validator via {@link isWithinPayloadBounds}.
   */
  private sanitizePayload(
    payload: Record<string, unknown> | undefined,
  ): Record<string, unknown> | undefined {
    if (!payload) return undefined;

    if (!isWithinPayloadBounds(payload)) {
      this.logger.warn(
        'Analytics payload exceeded SEC-012 bounds, dropping payload',
      );
      return undefined;
    }

    return payload;
  }
}

import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AnalyticsService } from './analytics.service';
import { CreateEventDto } from './dto/create-event.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Post('event')
  @HttpCode(204)
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  async track(@Body() dto: CreateEventDto) {
    this.analyticsService.track(dto).catch(() => undefined);
  }
}

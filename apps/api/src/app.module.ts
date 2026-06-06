import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { BlogModule } from './blog/blog.module';
import { ContactsModule } from './contacts/contacts.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { UploadModule } from './upload/upload.module';
import { CsrfGuard } from './common/csrf.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    BlogModule,
    ContactsModule,
    AnalyticsModule,
    ProjectsModule,
    UploadModule,
  ],
  providers: [
    // SEC-001: register the throttler globally so the per-route @Throttle
    // decorators (login, contacts, analytics) are actually enforced.
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // SEC-005: Origin-based CSRF protection for mutating requests. Runs as a
    // global guard; safe methods and missing-origin public traffic are
    // unaffected (see CsrfGuard docs).
    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
    },
  ],
})
export class AppModule {}

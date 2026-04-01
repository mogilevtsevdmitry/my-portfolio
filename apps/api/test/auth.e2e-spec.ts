import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
  });

  afterAll(() => app.close());

  describe('POST /auth/login', () => {
    it('should set httpOnly cookies on valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: process.env.ADMIN_EMAIL ?? 'admin@example.com',
          password: process.env.ADMIN_PASSWORD ?? 'admin123secure',
        })
        .expect(200);

      const cookies = res.headers['set-cookie'] as unknown as string[];
      expect(cookies).toBeDefined();
      expect(
        cookies.some((c: string) => c.startsWith('access_token=')),
      ).toBe(true);
      expect(
        cookies.some((c: string) => c.startsWith('refresh_token=')),
      ).toBe(true);
      expect(cookies.every((c: string) => c.includes('HttpOnly'))).toBe(true);
    });

    it('should return 401 on invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'wrong@example.com', password: 'wrongpass' })
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('should clear cookies after logout', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: process.env.ADMIN_EMAIL ?? 'admin@example.com',
          password: process.env.ADMIN_PASSWORD ?? 'admin123secure',
        });

      const cookies = loginRes.headers['set-cookie'] as unknown as string[];

      const logoutRes = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', cookies)
        .expect(200);

      const logoutCookies = logoutRes.headers['set-cookie'] as unknown as string[];
      expect(
        logoutCookies.some((c: string) => c.includes('access_token=;')),
      ).toBe(true);
    });
  });
});

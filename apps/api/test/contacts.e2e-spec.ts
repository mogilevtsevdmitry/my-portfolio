import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';

describe('ContactsController (e2e)', () => {
  let app: INestApplication;
  let authCookies: any;

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

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: process.env.ADMIN_EMAIL ?? 'admin@example.com',
        password: process.env.ADMIN_PASSWORD ?? 'admin123secure',
      });
    authCookies = res.headers['set-cookie'];
  });

  afterAll(() => app.close());

  describe('POST /contacts', () => {
    it('should accept valid email contact', async () => {
      await request(app.getHttpServer())
        .post('/contacts')
        .send({
          name: 'Test User',
          contact: 'test@example.com',
          description: 'This is a test contact request for the portfolio.',
        })
        .expect(201);
    });

    it('should accept valid telegram contact', async () => {
      await request(app.getHttpServer())
        .post('/contacts')
        .send({
          name: 'Telegram User',
          contact: '@testuser',
          description: 'This is another test contact for the portfolio.',
        })
        .expect(201);
    });

    it('should reject invalid contact format', async () => {
      await request(app.getHttpServer())
        .post('/contacts')
        .send({
          name: 'Bad User',
          contact: 'not_valid',
          description: 'This should fail validation.',
        })
        .expect(400);
    });

    it('should reject short description', async () => {
      await request(app.getHttpServer())
        .post('/contacts')
        .send({
          name: 'User',
          contact: 'valid@email.com',
          description: 'short',
        })
        .expect(400);
    });
  });

  describe('GET /contacts (admin)', () => {
    it('should reject unauthenticated access', async () => {
      await request(app.getHttpServer()).get('/contacts').expect(401);
    });

    it('should return contacts list for authenticated admin', async () => {
      const res = await request(app.getHttpServer())
        .get('/contacts')
        .set('Cookie', authCookies)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});

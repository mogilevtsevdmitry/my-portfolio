import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';

describe('BlogController (e2e)', () => {
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

  describe('GET /blog', () => {
    it('should return paginated posts', async () => {
      const res = await request(app.getHttpServer())
        .get('/blog?locale=ru')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('Admin blog CRUD', () => {
    let createdId: string;

    it('should reject unauthenticated request', async () => {
      await request(app.getHttpServer()).get('/admin/blog').expect(401);
    });

    it('should create a post', async () => {
      const res = await request(app.getHttpServer())
        .post('/admin/blog')
        .set('Cookie', authCookies)
        .send({
          slug: `test-e2e-post-${Date.now()}`,
          translations: [
            {
              locale: 'ru',
              title: 'Тестовый пост',
              excerpt: 'Краткое описание',
              content: {},
            },
            {
              locale: 'en',
              title: 'Test Post',
              excerpt: 'Brief description',
              content: {},
            },
          ],
        })
        .expect(201);

      createdId = res.body.id;
      expect(createdId).toBeDefined();
    });

    it('should publish the post', async () => {
      const res = await request(app.getHttpServer())
        .put(`/admin/blog/${createdId}`)
        .set('Cookie', authCookies)
        .send({ status: 'PUBLISHED' })
        .expect(200);

      expect(res.body.status).toBe('PUBLISHED');
    });

    it('should delete the post', async () => {
      await request(app.getHttpServer())
        .delete(`/admin/blog/${createdId}`)
        .set('Cookie', authCookies)
        .expect(204);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';

describe('ProjectsController (e2e)', () => {
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

  describe('GET /projects', () => {
    it('should return published projects', async () => {
      const res = await request(app.getHttpServer()).get('/projects').expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('Admin projects CRUD', () => {
    let createdId: string;
    const slug = `test-e2e-project-${Date.now()}`;

    it('should reject unauthenticated request', async () => {
      await request(app.getHttpServer()).get('/admin/projects').expect(401);
    });

    it('should create a project', async () => {
      const res = await request(app.getHttpServer())
        .post('/admin/projects')
        .set('Cookie', authCookies)
        .send({
          slug,
          category: 'web',
          technologies: ['NestJS', 'Prisma'],
          order: 99,
          translations: [
            {
              locale: 'ru',
              title: 'Тестовый E2E проект',
              shortDescription: 'Краткое описание',
              description: 'Полное описание проекта',
            },
            {
              locale: 'en',
              title: 'Test E2E Project',
              shortDescription: 'Short description',
              description: 'Full project description',
            },
          ],
        })
        .expect(201);

      createdId = res.body.id;
      expect(createdId).toBeDefined();
      expect(res.body.slug).toBe(slug);
      expect(res.body.translations).toHaveLength(2);
    });

    it('should fetch the created project by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/admin/projects/${createdId}`)
        .set('Cookie', authCookies)
        .expect(200);

      expect(res.body.id).toBe(createdId);
    });

    it('should publish the project', async () => {
      const res = await request(app.getHttpServer())
        .put(`/admin/projects/${createdId}`)
        .set('Cookie', authCookies)
        .send({ status: 'PUBLISHED' })
        .expect(200);

      expect(res.body.status).toBe('PUBLISHED');
    });

    it('should appear in public endpoint after publishing', async () => {
      const res = await request(app.getHttpServer()).get('/projects').expect(200);

      const found = res.body.find((p: any) => p.id === createdId);
      expect(found).toBeDefined();
    });

    it('should fetch the project by slug from public endpoint', async () => {
      const res = await request(app.getHttpServer())
        .get(`/projects/${slug}`)
        .expect(200);

      expect(res.body.slug).toBe(slug);
    });

    it('should update project translations', async () => {
      const res = await request(app.getHttpServer())
        .put(`/admin/projects/${createdId}`)
        .set('Cookie', authCookies)
        .send({
          translations: [
            {
              locale: 'ru',
              title: 'Обновлённый проект',
              shortDescription: 'Обновлённое краткое',
              description: 'Обновлённое полное описание',
            },
          ],
        })
        .expect(200);

      const ruTranslation = res.body.translations.find((t: any) => t.locale === 'ru');
      expect(ruTranslation.title).toBe('Обновлённый проект');
    });

    it('should return 404 for nonexistent project', async () => {
      await request(app.getHttpServer())
        .get('/admin/projects/nonexistent-id')
        .set('Cookie', authCookies)
        .expect(404);
    });

    it('should delete the project', async () => {
      await request(app.getHttpServer())
        .delete(`/admin/projects/${createdId}`)
        .set('Cookie', authCookies)
        .expect(204);
    });

    it('should return 404 after deletion', async () => {
      await request(app.getHttpServer())
        .get(`/admin/projects/${createdId}`)
        .set('Cookie', authCookies)
        .expect(404);
    });
  });
});

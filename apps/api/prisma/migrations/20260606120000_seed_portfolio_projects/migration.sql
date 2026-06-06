-- Data migration: seed two portfolio projects (top-100, geneo).
-- Idempotent: safe to run multiple times.
--   * Project rows use ON CONFLICT (slug) DO NOTHING.
--   * ProjectTranslation rows use ON CONFLICT ("projectId", locale) DO NOTHING.
-- Stable string ids guarantee translations always reference the right project
-- and repeated runs do not create duplicates. No schema changes here.

-- ----------------------------------------------------------------------------
-- Project 1: top-100
-- ----------------------------------------------------------------------------
INSERT INTO "Project" (
  "id", "slug", "status", "previewUrl", "previewType", "projectUrl",
  "sourceUrl", "category", "technologies", "order", "createdAt", "updatedAt"
) VALUES (
  'seed-top-100',
  'top-100',
  'PUBLISHED',
  NULL,
  NULL,
  'https://топ-100.рф',
  NULL,
  'Web Platform',
  ARRAY['Next.js','React','TypeScript','Express','Prisma','PostgreSQL','Redis','Tailwind','Docker Swarm','Traefik','SEO / JSON-LD']::text[],
  1,
  now(),
  now()
)
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "ProjectTranslation" (
  "id", "locale", "title", "shortDescription", "description", "projectId"
) VALUES (
  'seed-top-100-ru',
  'ru',
  'Топ-100 — рейтинг-каталог индустрии',
  'Публичная рейтинг-платформа: профили медийных персон, ведущих, лауреатов, организаторов, основателей, партнёров и ароматистов, связанные с мероприятиями. Каталог + админка + SEO.',
  'Контентная платформа-рейтинг с публичным каталогом персон и компаний индустрии. Роли (медийные персоны, ведущие, лауреаты, организаторы, основатели, партнёры, ароматисты) реализованы единой моделью PersonRole и pivot-связью персона↔мероприятие. Публичные страницы-каталоги с карточками и детальными профилями, SEO из коробки (sitemap, JSON-LD ItemList, управляемые SEO-дефолты), адаптивное меню. Фронтенд — Next.js (App Router, ISR revalidate=60), бэкенд — Express + Prisma, хранилище PostgreSQL 18 + Redis. Полноценная админка с CRUD по каждому разделу. Развёрнут через Docker Swarm за Traefik.',
  'seed-top-100'
)
ON CONFLICT ("projectId", "locale") DO NOTHING;

INSERT INTO "ProjectTranslation" (
  "id", "locale", "title", "shortDescription", "description", "projectId"
) VALUES (
  'seed-top-100-en',
  'en',
  'Top-100 — industry rating catalogue',
  'Public rating platform: profiles of media figures, hosts, laureates, organizers, founders, partners and aromatists tied to events. Catalogue + admin + SEO.',
  'A content rating platform with a public catalogue of industry people and companies. Roles (media figures, hosts, laureates, organizers, founders, partners, aromatists) are implemented with a single PersonRole model and a person-event pivot. Public catalogue pages with cards and detailed profiles, SEO out of the box (sitemap, JSON-LD ItemList, manageable SEO defaults), responsive menu. Frontend — Next.js (App Router, ISR revalidate=60), backend — Express + Prisma, storage PostgreSQL 18 + Redis. A full admin panel with CRUD per section. Deployed via Docker Swarm behind Traefik.',
  'seed-top-100'
)
ON CONFLICT ("projectId", "locale") DO NOTHING;

-- ----------------------------------------------------------------------------
-- Project 2: geneo
-- ----------------------------------------------------------------------------
INSERT INTO "Project" (
  "id", "slug", "status", "previewUrl", "previewType", "projectUrl",
  "sourceUrl", "category", "technologies", "order", "createdAt", "updatedAt"
) VALUES (
  'seed-geneo',
  'geneo',
  'PUBLISHED',
  NULL,
  NULL,
  'https://генео.рф',
  NULL,
  'Web App',
  ARRAY['NestJS','Vite','React','TypeScript','Prisma','PostgreSQL','Redis','RabbitMQ','Gotenberg','Kubernetes','Helm','Argo CD','GitLab CI','Vault']::text[],
  2,
  now(),
  now()
)
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "ProjectTranslation" (
  "id", "locale", "title", "shortDescription", "description", "projectId"
) VALUES (
  'seed-geneo-ru',
  'ru',
  'Генео — построение генеалогического древа',
  'Веб-сервис для построения и хранения семейного древа: 135 000+ записей, интерактивное древо, экспорт в PDF, платный доступ и фоновые задачи. NestJS + React, развёрнут в Kubernetes.',
  'Сервис для составления родословной: интерактивное генеалогическое древо, профили родственников и связи между ними, поиск по дереву. Генерация PDF-документов древа через Gotenberg, платные функции с онлайн-оплатой, фоновые задачи (импорт, экспорт, рассылки) через очередь RabbitMQ. Бэкенд на NestJS, фронтенд на Vite + React за nginx с single-domain /api-прокси. Хранилище — PostgreSQL (таблица family_tree на 135k+ строк) + Redis для авторизации. Инфраструктура: Kubernetes (k3s), Helm-чарт, доставка через Argo CD и GitLab CI (Kaniko), секреты в Vault (External Secrets), ежедневные бэкапы БД CronJob.',
  'seed-geneo'
)
ON CONFLICT ("projectId", "locale") DO NOTHING;

INSERT INTO "ProjectTranslation" (
  "id", "locale", "title", "shortDescription", "description", "projectId"
) VALUES (
  'seed-geneo-en',
  'en',
  'Geneo — family tree builder',
  'Web service for building and storing a family tree: 135,000+ records, interactive tree, PDF export, paid access and background jobs. NestJS + React, deployed on Kubernetes.',
  'A service for building your genealogy: an interactive family tree, relative profiles and the links between them, search across the tree. PDF tree documents are generated via Gotenberg; paid features with online payments; background jobs (import, export, mailings) run through a RabbitMQ queue. NestJS backend, Vite + React frontend behind nginx with a single-domain /api proxy. Storage — PostgreSQL (family_tree table, 135k+ rows) + Redis for auth. Infrastructure: Kubernetes (k3s), a Helm chart, delivery via Argo CD and GitLab CI (Kaniko), secrets in Vault (External Secrets), daily DB backups via a CronJob.',
  'seed-geneo'
)
ON CONFLICT ("projectId", "locale") DO NOTHING;

-- Add structured case fields to ProjectTranslation:
--   problem / solution / result — narrative sections (NOT NULL, default '').
--   metrics                     — optional quantified highlights (JSONB, nullable),
--                                 shape: [{ "value": "...", "label": "..." }].
-- New columns are additive and backwards-compatible: existing rows get '' / NULL.

ALTER TABLE "ProjectTranslation"
  ADD COLUMN "problem"  TEXT NOT NULL DEFAULT '',
  ADD COLUMN "solution" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "result"   TEXT NOT NULL DEFAULT '',
  ADD COLUMN "metrics"  JSONB;

-- ----------------------------------------------------------------------------
-- Honest backfill for the two existing portfolio projects. Only narrative copy
-- derived from the existing descriptions; the single numeric metric (135k+) was
-- already stated verbatim in Geneo's description, so it is not fabricated.
-- Guarded with `WHERE "problem" = ''` so a re-run never clobbers later edits.
-- ----------------------------------------------------------------------------

-- top-100 (ru)
UPDATE "ProjectTranslation" SET
  "problem"  = 'Индустрии нужен публичный, управляемый рейтинг-каталог персон и компаний с профилями по ролям и привязкой к мероприятиям — вместо разрозненных списков.',
  "solution" = 'Контентная платформа: единая модель ролей (PersonRole) и pivot персона↔мероприятие, публичные каталоги и детальные профили, SEO из коробки (sitemap, JSON-LD), полноценная админка с CRUD.',
  "result"   = 'Запущенный публичный рейтинг с управляемым контентом и SEO-страницами; новые персоны и мероприятия добавляются контент-редактором без участия разработчика.'
WHERE "id" = 'seed-top-100-ru' AND "problem" = '';

-- top-100 (en)
UPDATE "ProjectTranslation" SET
  "problem"  = 'The industry needed a public, manageable rating catalogue of people and companies with role-based profiles tied to events — instead of scattered lists.',
  "solution" = 'A content platform: a single role model (PersonRole) and a person-event pivot, public catalogues and detailed profiles, SEO out of the box (sitemap, JSON-LD), a full admin panel with CRUD.',
  "result"   = 'A launched public rating with managed content and SEO pages; new people and events are added by an editor without developer involvement.'
WHERE "id" = 'seed-top-100-en' AND "problem" = '';

-- geneo (ru)
UPDATE "ProjectTranslation" SET
  "problem"  = 'Пользователям нужно собирать, хранить и визуализировать родословную с экспортом документов и платным доступом — задача с тяжёлыми фоновыми операциями.',
  "solution" = 'Веб-сервис на NestJS + React: интерактивное древо, профили и связи, генерация PDF через Gotenberg, онлайн-оплата, фоновые задачи через RabbitMQ; развёрнут в Kubernetes с Argo CD и ежедневными бэкапами.',
  "result"   = 'Работающий в продакшене сервис с базой родства, экспортом древа в PDF и платными функциями.',
  "metrics"  = '[{"value":"135k+","label":"записей родства"}]'::jsonb
WHERE "id" = 'seed-geneo-ru' AND "problem" = '';

-- geneo (en)
UPDATE "ProjectTranslation" SET
  "problem"  = 'Users need to collect, store and visualise their genealogy with document export and paid access — a task with heavy background operations.',
  "solution" = 'A NestJS + React web service: an interactive tree, profiles and relations, PDF generation via Gotenberg, online payments, background jobs over RabbitMQ; deployed on Kubernetes with Argo CD and daily backups.',
  "result"   = 'A production service with a kinship database, PDF tree export and paid features.',
  "metrics"  = '[{"value":"135k+","label":"kinship records"}]'::jsonb
WHERE "id" = 'seed-geneo-en' AND "problem" = '';

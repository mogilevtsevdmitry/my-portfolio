# Foundation & Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the Turborepo monorepo, shared packages, and fully-tested NestJS API with Auth, Blog, Contacts, and Analytics modules.

**Architecture:** Turborepo monorepo with `apps/api` (NestJS), `packages/shared` (TypeScript types), `packages/i18n` (translation JSONs), and `packages/content` (project data JSONs). NestJS uses PostgreSQL via Prisma, httpOnly cookie JWT auth, `@nestjs/throttler` rate limiting, and Telegram + Email notifications.

**Tech Stack:** pnpm workspaces, Turborepo, NestJS, Prisma, PostgreSQL, @nestjs/jwt, @nestjs/throttler, bcryptjs, nodemailer, node-telegram-bot-api, Jest (unit), supertest (e2e)

**This is Plan 1 of 3:**
- Plan 1 (this): Monorepo scaffold + packages + NestJS API + Docker Compose
- Plan 2: Next.js Web app (landing, projects, blog, design system, i18n)
- Plan 3: React/Vite Admin panel (auth, TipTap blog editor, contacts)

---

## File Map

```
portfolio/
├── package.json                          # pnpm workspaces root
├── pnpm-workspace.yaml
├── turbo.json                            # Turborepo pipeline
├── .gitignore
├── .env.example                          # all env vars documented
├── docker-compose.yml                    # 6 services
│
├── packages/
│   ├── shared/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── types/
│   │       │   ├── auth.ts
│   │       │   ├── blog.ts
│   │       │   ├── contact.ts
│   │       │   └── analytics.ts
│   │       └── index.ts
│   │
│   ├── i18n/
│   │   ├── package.json
│   │   └── locales/
│   │       ├── ru/
│   │       │   ├── common.json
│   │       │   ├── hero.json
│   │       │   ├── about.json
│   │       │   ├── values.json
│   │       │   ├── projects.json
│   │       │   ├── tech.json
│   │       │   ├── process.json
│   │       │   └── contacts.json
│   │       └── en/                       # mirrors ru/
│   │
│   └── content/
│       ├── package.json
│       ├── tsconfig.json
│       ├── src/
│       │   └── types.ts                  # Project content types
│       └── projects/
│           ├── agent-orchestrator.json
│           ├── marketplace.json
│           ├── gineo.json
│           └── telegram-bots.json
│
└── apps/
    └── api/
        ├── package.json
        ├── nest-cli.json
        ├── tsconfig.json
        ├── tsconfig.build.json
        ├── Dockerfile
        ├── .env                          # local dev (gitignored)
        ├── prisma/
        │   ├── schema.prisma
        │   ├── seed.ts
        │   └── migrations/
        ├── src/
        │   ├── main.ts
        │   ├── app.module.ts
        │   ├── auth/
        │   │   ├── auth.module.ts
        │   │   ├── auth.controller.ts
        │   │   ├── auth.service.ts
        │   │   ├── dto/
        │   │   │   └── login.dto.ts
        │   │   ├── strategies/
        │   │   │   └── jwt.strategy.ts
        │   │   └── guards/
        │   │       └── jwt-auth.guard.ts
        │   ├── blog/
        │   │   ├── blog.module.ts
        │   │   ├── blog.controller.ts        # public endpoints
        │   │   ├── admin-blog.controller.ts  # admin endpoints (JWT guarded)
        │   │   ├── blog.service.ts
        │   │   └── dto/
        │   │       ├── create-post.dto.ts
        │   │       └── update-post.dto.ts
        │   ├── contacts/
        │   │   ├── contacts.module.ts
        │   │   ├── contacts.controller.ts
        │   │   ├── contacts.service.ts
        │   │   ├── dto/
        │   │   │   └── create-contact.dto.ts
        │   │   └── notifications/
        │   │       ├── telegram.service.ts
        │   │       └── email.service.ts
        │   └── analytics/
        │       ├── analytics.module.ts
        │       ├── analytics.controller.ts
        │       ├── analytics.service.ts
        │       └── dto/
        │           └── create-event.dto.ts
        └── test/
            ├── jest-e2e.json
            ├── auth.e2e-spec.ts
            ├── contacts.e2e-spec.ts
            └── blog.e2e-spec.ts
```

---

### Task 1: Monorepo Root Scaffold

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `turbo.json`
- Create: `.gitignore`
- Create: `.env.example`

- [ ] **Step 1: Initialize git repo and pnpm workspace root**

```bash
cd /Users/dmitry/Work/MyProjects/portfolio
git init
```

Create `package.json`:
```json
{
  "name": "portfolio",
  "private": true,
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "lint": "turbo lint",
    "test": "turbo test",
    "test:e2e": "turbo test:e2e",
    "db:generate": "turbo db:generate",
    "db:migrate": "turbo db:migrate",
    "db:seed": "turbo db:seed"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.4.0"
  },
  "packageManager": "pnpm@9.0.0",
  "engines": {
    "node": ">=20.0.0"
  }
}
```

Create `pnpm-workspace.yaml`:
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- [ ] **Step 2: Create Turborepo config**

Create `turbo.json`:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "test": {
      "cache": false
    },
    "test:e2e": {
      "cache": false,
      "dependsOn": ["build"]
    },
    "db:generate": {
      "cache": false
    },
    "db:migrate": {
      "cache": false
    },
    "db:seed": {
      "cache": false
    }
  }
}
```

- [ ] **Step 3: Create .gitignore**

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Build outputs
dist/
.next/
out/
build/

# Env files
.env
.env.local
.env.*.local

# Turbo cache
.turbo/

# Logs
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/settings.json
.idea/

# Prisma
prisma/migrations/dev.db
```

- [ ] **Step 4: Create .env.example**

```bash
# apps/api
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/portfolio
JWT_SECRET=change_me_in_production_min_32_chars
REFRESH_TOKEN_SECRET=change_me_in_production_min_32_chars
REVALIDATION_SECRET=change_me_in_production_min_32_chars
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
NOTIFICATION_EMAIL=
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change_me_in_production
WEB_URL=http://localhost:3000
ADMIN_URL=http://localhost:3002
UMAMI_APP_SECRET=change_me_in_production

# apps/web
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_UMAMI_ID=
REVALIDATION_SECRET=change_me_in_production_min_32_chars

# Docker Compose
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=portfolio
UMAMI_POSTGRES_DB=umami
```

- [ ] **Step 5: Install Turborepo and verify**

```bash
pnpm install
```

Expected: `node_modules/` created at root, `turbo` binary available.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-workspace.yaml turbo.json .gitignore .env.example
git commit -m "chore: initialize turborepo monorepo scaffold"
```

---

### Task 2: Package — shared (TypeScript types)

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/types/auth.ts`
- Create: `packages/shared/src/types/blog.ts`
- Create: `packages/shared/src/types/contact.ts`
- Create: `packages/shared/src/types/analytics.ts`
- Create: `packages/shared/src/index.ts`

- [ ] **Step 1: Create package.json and tsconfig**

```bash
mkdir -p packages/shared/src/types
```

`packages/shared/package.json`:
```json
{
  "name": "@portfolio/shared",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "tsc",
    "lint": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.4.0"
  }
}
```

`packages/shared/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "declaration": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 2: Create auth types**

`packages/shared/src/types/auth.ts`:
```typescript
export interface LoginDto {
  email: string;
  password: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
}
```

- [ ] **Step 3: Create blog types**

`packages/shared/src/types/blog.ts`:
```typescript
export type PostStatus = 'DRAFT' | 'PUBLISHED';
export type Locale = 'ru' | 'en';

export interface BlogPostTranslation {
  locale: Locale;
  title: string;
  excerpt: string;
  content: unknown; // TipTap JSON document
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  status: PostStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  translations: BlogPostTranslation[];
}

export interface BlogPostListItem {
  id: string;
  slug: string;
  status: PostStatus;
  publishedAt: string | null;
  translation: BlogPostTranslation | null; // single locale
}

export interface CreateBlogPostDto {
  slug: string;
  translations: Array<{
    locale: Locale;
    title: string;
    excerpt: string;
    content: unknown;
  }>;
}

export interface UpdateBlogPostDto {
  slug?: string;
  status?: PostStatus;
  translations?: Array<{
    locale: Locale;
    title: string;
    excerpt: string;
    content: unknown;
  }>;
}

export interface BlogListQuery {
  locale?: Locale;
  page?: number;
  limit?: number;
}
```

- [ ] **Step 4: Create contact types**

`packages/shared/src/types/contact.ts`:
```typescript
export type ContactStatus = 'NEW' | 'READ' | 'ARCHIVED';

export interface Contact {
  id: string;
  name: string;
  contact: string;
  description: string;
  status: ContactStatus;
  createdAt: string;
}

export interface CreateContactDto {
  name: string;
  contact: string; // email or @telegram_handle
  description: string;
}

export interface UpdateContactStatusDto {
  status: ContactStatus;
}
```

- [ ] **Step 5: Create analytics types**

`packages/shared/src/types/analytics.ts`:
```typescript
export type FunnelEvent =
  | 'hero_cta_click'
  | 'project_view'
  | 'project_cta_click'
  | 'contact_form_open'
  | 'contact_submit'
  | 'blog_post_view';

export interface CreateAnalyticsEventDto {
  event: FunnelEvent;
  payload?: Record<string, string>;
  sessionId?: string;
}
```

- [ ] **Step 6: Create barrel index**

`packages/shared/src/index.ts`:
```typescript
export * from './types/auth';
export * from './types/blog';
export * from './types/contact';
export * from './types/analytics';
```

- [ ] **Step 7: Verify types compile**

```bash
cd packages/shared && pnpm exec tsc --noEmit
```

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
cd /Users/dmitry/Work/MyProjects/portfolio
git add packages/shared/
git commit -m "feat(shared): add TypeScript types for all domain entities"
```

---

### Task 3: Package — i18n (Translation JSONs)

**Files:**
- Create: `packages/i18n/package.json`
- Create: `packages/i18n/locales/ru/*.json` (8 files)
- Create: `packages/i18n/locales/en/*.json` (8 files)

- [ ] **Step 1: Create package.json**

```bash
mkdir -p packages/i18n/locales/ru packages/i18n/locales/en
```

`packages/i18n/package.json`:
```json
{
  "name": "@portfolio/i18n",
  "version": "0.0.1",
  "private": true,
  "exports": {
    "./locales/*": "./locales/*"
  }
}
```

- [ ] **Step 2: Create RU translations**

`packages/i18n/locales/ru/common.json`:
```json
{
  "nav": {
    "about": "Обо мне",
    "projects": "Проекты",
    "tech": "Технологии",
    "blog": "Блог",
    "contacts": "Контакты"
  },
  "buttons": {
    "discuss": "Обсудить проект",
    "viewCases": "Посмотреть кейсы",
    "openProject": "Открыть проект",
    "details": "Подробнее",
    "send": "Отправить",
    "back": "Назад"
  },
  "lang": {
    "ru": "RU",
    "en": "EN"
  }
}
```

`packages/i18n/locales/ru/hero.json`:
```json
{
  "name": "Дмитрий Могилевцев",
  "title": "Архитектор AI-систем и масштабируемых продуктов",
  "subtitle": "Помогаю бизнесу автоматизировать процессы, снижать расходы и расти через AI и системную архитектуру",
  "cta": {
    "discuss": "Обсудить проект",
    "cases": "Посмотреть кейсы"
  }
}
```

`packages/i18n/locales/ru/about.json`:
```json
{
  "title": "Чем я занимаюсь",
  "theses": [
    "Строю AI-экосистемы и оркестраторы агентов",
    "Работаю с DDD, микросервисами и event-driven архитектурой",
    "Создаю агентов, заменяющих ручной труд",
    "Проектирую масштабируемые системы: multi-tenant, high-load",
    "Фокус на ROI, а не на коде",
    "Опыт: backend + fullstack + продуктовая разработка"
  ]
}
```

`packages/i18n/locales/ru/values.json`:
```json
{
  "title": "Чем я полезен",
  "cards": [
    {
      "key": "ai",
      "title": "AI-агенты и автоматизация",
      "problem": "Ручные процессы, требующие постоянного участия команды",
      "solution": "Разработка AI-агентов и автоматизированных пайплайнов",
      "result": "Снижение операционных затрат до 60%"
    },
    {
      "key": "saas",
      "title": "SaaS и архитектура",
      "problem": "Монолит, который не масштабируется под рост",
      "solution": "Проектирование микросервисной архитектуры с DDD",
      "result": "Системы, готовые к 10x росту нагрузки"
    },
    {
      "key": "devops",
      "title": "DevOps и инфраструктура",
      "problem": "Долгие релизы, нестабильные деплои",
      "solution": "Настройка CI/CD, Docker, Kubernetes-окружений",
      "result": "Деплой за минуты, не часы"
    },
    {
      "key": "consulting",
      "title": "Консалтинг и аудит",
      "problem": "Не понятно, где узкие места и что оптимизировать",
      "solution": "Аудит системы, архитектурные рекомендации",
      "result": "Чёткий roadmap улучшений с приоритетами"
    }
  ]
}
```

`packages/i18n/locales/ru/projects.json`:
```json
{
  "title": "Проекты",
  "subtitle": "Реальные кейсы с измеримыми результатами",
  "openProject": "Открыть проект",
  "details": "Подробнее",
  "sections": {
    "description": "Описание",
    "problem": "Проблема",
    "solution": "Решение",
    "result": "Результат",
    "tech": "Технологии",
    "ai": "AI / Агенты"
  }
}
```

`packages/i18n/locales/ru/tech.json`:
```json
{
  "title": "Технологии",
  "subtitle": "Стек как инструмент решения задач",
  "groups": {
    "backend": "Backend",
    "architecture": "Архитектура",
    "infrastructure": "Инфраструктура",
    "ai": "AI"
  }
}
```

`packages/i18n/locales/ru/process.json`:
```json
{
  "title": "Процесс работы",
  "steps": [
    { "number": "01", "title": "Анализ задачи", "description": "Погружаюсь в бизнес-контекст, выявляю реальную проблему за запросом" },
    { "number": "02", "title": "Проектирование", "description": "Создаю архитектуру решения, обсуждаем trade-offs" },
    { "number": "03", "title": "Разработка MVP", "description": "Быстро создаю рабочий прототип для валидации гипотез" },
    { "number": "04", "title": "Масштабирование", "description": "Оптимизирую, добавляю надёжность и готовность к росту" },
    { "number": "05", "title": "Поддержка", "description": "Сопровождаю систему, реагирую на изменения требований" }
  ]
}
```

`packages/i18n/locales/ru/contacts.json`:
```json
{
  "title": "Обсудить проект",
  "subtitle": "Расскажите о задаче, я отвечу в течение 24 часов",
  "form": {
    "name": "Имя",
    "namePlaceholder": "Ваше имя",
    "contact": "Контакт",
    "contactPlaceholder": "Email или @telegram",
    "description": "Описание задачи",
    "descriptionPlaceholder": "Расскажите подробнее о проекте...",
    "submit": "Отправить заявку",
    "success": "Заявка отправлена! Отвечу в течение 24 часов.",
    "error": "Что-то пошло не так. Попробуйте ещё раз."
  },
  "or": "или напишите напрямую",
  "telegram": "Telegram",
  "email": "Email"
}
```

- [ ] **Step 3: Create EN translations (mirrors RU)**

`packages/i18n/locales/en/common.json`:
```json
{
  "nav": {
    "about": "About",
    "projects": "Projects",
    "tech": "Tech",
    "blog": "Blog",
    "contacts": "Contact"
  },
  "buttons": {
    "discuss": "Discuss Project",
    "viewCases": "View Cases",
    "openProject": "Open Project",
    "details": "Details",
    "send": "Send",
    "back": "Back"
  },
  "lang": {
    "ru": "RU",
    "en": "EN"
  }
}
```

`packages/i18n/locales/en/hero.json`:
```json
{
  "name": "Dmitry Mogilevtsev",
  "title": "AI Systems Architect & Scalable Product Builder",
  "subtitle": "I help businesses automate processes, reduce costs, and grow through AI and systems architecture",
  "cta": {
    "discuss": "Discuss Project",
    "cases": "View Cases"
  }
}
```

`packages/i18n/locales/en/about.json`:
```json
{
  "title": "What I Do",
  "theses": [
    "Build AI ecosystems and agent orchestrators",
    "Work with DDD, microservices, and event-driven architecture",
    "Create agents that replace manual labor",
    "Design scalable systems: multi-tenant, high-load",
    "Focus on ROI, not code",
    "Experience: backend + fullstack + product development"
  ]
}
```

`packages/i18n/locales/en/values.json`:
```json
{
  "title": "How I Can Help",
  "cards": [
    {
      "key": "ai",
      "title": "AI Agents & Automation",
      "problem": "Manual processes requiring constant team involvement",
      "solution": "Building AI agents and automated pipelines",
      "result": "Reduce operational costs by up to 60%"
    },
    {
      "key": "saas",
      "title": "SaaS & Architecture",
      "problem": "A monolith that won't scale with growth",
      "solution": "Designing microservice architecture with DDD",
      "result": "Systems ready for 10x load increase"
    },
    {
      "key": "devops",
      "title": "DevOps & Infrastructure",
      "problem": "Slow releases, unstable deployments",
      "solution": "Setting up CI/CD, Docker, Kubernetes environments",
      "result": "Deploy in minutes, not hours"
    },
    {
      "key": "consulting",
      "title": "Consulting & Audit",
      "problem": "Unclear bottlenecks and optimization priorities",
      "solution": "System audit, architectural recommendations",
      "result": "Clear improvement roadmap with priorities"
    }
  ]
}
```

`packages/i18n/locales/en/projects.json`:
```json
{
  "title": "Projects",
  "subtitle": "Real cases with measurable results",
  "openProject": "Open Project",
  "details": "Details",
  "sections": {
    "description": "Description",
    "problem": "Problem",
    "solution": "Solution",
    "result": "Result",
    "tech": "Technologies",
    "ai": "AI / Agents"
  }
}
```

`packages/i18n/locales/en/tech.json`:
```json
{
  "title": "Technologies",
  "subtitle": "Stack as a problem-solving tool",
  "groups": {
    "backend": "Backend",
    "architecture": "Architecture",
    "infrastructure": "Infrastructure",
    "ai": "AI"
  }
}
```

`packages/i18n/locales/en/process.json`:
```json
{
  "title": "Work Process",
  "steps": [
    { "number": "01", "title": "Task Analysis", "description": "I dive into the business context and find the real problem behind the request" },
    { "number": "02", "title": "Architecture Design", "description": "I design the solution architecture and discuss trade-offs" },
    { "number": "03", "title": "MVP Development", "description": "Quickly build a working prototype to validate hypotheses" },
    { "number": "04", "title": "Scaling", "description": "Optimize, add reliability and readiness for growth" },
    { "number": "05", "title": "Support", "description": "Maintain the system, respond to changing requirements" }
  ]
}
```

`packages/i18n/locales/en/contacts.json`:
```json
{
  "title": "Discuss a Project",
  "subtitle": "Tell me about your task, I'll respond within 24 hours",
  "form": {
    "name": "Name",
    "namePlaceholder": "Your name",
    "contact": "Contact",
    "contactPlaceholder": "Email or @telegram",
    "description": "Task Description",
    "descriptionPlaceholder": "Tell me more about the project...",
    "submit": "Send Request",
    "success": "Request sent! I'll respond within 24 hours.",
    "error": "Something went wrong. Please try again."
  },
  "or": "or write directly",
  "telegram": "Telegram",
  "email": "Email"
}
```

- [ ] **Step 4: Commit**

```bash
git add packages/i18n/
git commit -m "feat(i18n): add RU/EN translation files for all landing sections"
```

---

### Task 4: Package — content (Project Data JSONs)

**Files:**
- Create: `packages/content/package.json`
- Create: `packages/content/tsconfig.json`
- Create: `packages/content/src/types.ts`
- Create: `packages/content/projects/*.json` (4 files)

- [ ] **Step 1: Create package structure**

```bash
mkdir -p packages/content/src packages/content/projects
```

`packages/content/package.json`:
```json
{
  "name": "@portfolio/content",
  "version": "0.0.1",
  "private": true,
  "main": "./src/types.ts",
  "types": "./src/types.ts",
  "exports": {
    "./projects/*": "./projects/*",
    "./src/*": "./src/*"
  }
}
```

`packages/content/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*", "projects/**/*"]
}
```

- [ ] **Step 2: Create project content types**

`packages/content/src/types.ts`:
```typescript
export interface ProjectTranslation {
  title: string;
  shortDescription: string;
  description: string;
  problem: string;
  solution: string;
  result: string;
  aiUsage: string;
}

export interface Project {
  slug: string;
  previewImage: string; // path relative to /public
  link?: string;
  technologies: string[];
  ru: ProjectTranslation;
  en: ProjectTranslation;
}
```

- [ ] **Step 3: Create Agent Orchestrator project**

`packages/content/projects/agent-orchestrator.json`:
```json
{
  "slug": "agent-orchestrator",
  "previewImage": "/projects/agent-orchestrator.png",
  "technologies": ["NestJS", "PostgreSQL", "Redis", "OpenAI", "Docker"],
  "ru": {
    "title": "Agent Orchestrator",
    "shortDescription": "Платформа для управления и оркестрации AI-агентов в бизнес-процессах",
    "description": "Система оркестрации AI-агентов для автоматизации бизнес-процессов. Поддерживает создание, настройку и мониторинг агентов с разными ролями.",
    "problem": "Компании хотят автоматизировать процессы с помощью AI, но не имеют единой платформы для управления агентами, их задачами и результатами.",
    "solution": "Построил event-driven оркестратор на NestJS с очередями задач (BullMQ), персистентным состоянием агентов в PostgreSQL и real-time мониторингом через WebSocket.",
    "result": "Автоматизировано 15+ повторяющихся бизнес-процессов. Время выполнения рутинных задач сократилось с 4 часов до 5 минут.",
    "aiUsage": "LLM-агенты с контекстной памятью, инструментами (tool use) и возможностью делегирования задач между агентами."
  },
  "en": {
    "title": "Agent Orchestrator",
    "shortDescription": "Platform for managing and orchestrating AI agents in business processes",
    "description": "AI agent orchestration system for business process automation. Supports creating, configuring, and monitoring agents with different roles.",
    "problem": "Companies want to automate processes with AI but lack a unified platform for managing agents, their tasks, and results.",
    "solution": "Built an event-driven orchestrator on NestJS with task queues (BullMQ), persistent agent state in PostgreSQL, and real-time monitoring via WebSocket.",
    "result": "Automated 15+ repetitive business processes. Routine task execution time reduced from 4 hours to 5 minutes.",
    "aiUsage": "LLM agents with contextual memory, tool use, and ability to delegate tasks between agents."
  }
}
```

- [ ] **Step 4: Create Marketplace project**

`packages/content/projects/marketplace.json`:
```json
{
  "slug": "marketplace",
  "previewImage": "/projects/marketplace.png",
  "technologies": ["NestJS", "Next.js", "PostgreSQL", "Prisma", "Stripe"],
  "ru": {
    "title": "Marketplace AI-агентов",
    "shortDescription": "Маркетплейс для покупки и продажи готовых AI-агентов и автоматизаций",
    "description": "Платформа для монетизации AI-агентов: разработчики публикуют агентов, бизнес подключает нужные автоматизации без разработки с нуля.",
    "problem": "Разработчики AI-агентов не имеют канала монетизации, а бизнес тратит месяцы на разработку того, что уже существует.",
    "solution": "Multi-tenant SaaS с разделением ролей (seller/buyer), системой оплаты через Stripe Connect, API-ключами для интеграции и витриной агентов.",
    "result": "Запущено в продакшн с 30+ агентами. Средний time-to-value для нового клиента — 1 день вместо 3 месяцев разработки.",
    "aiUsage": "Встроенный тестировщик агентов, автоматическая генерация документации через LLM, интеллектуальный поиск по описанию задачи."
  },
  "en": {
    "title": "AI Agent Marketplace",
    "shortDescription": "Marketplace for buying and selling ready-made AI agents and automations",
    "description": "Platform for monetizing AI agents: developers publish agents, businesses connect needed automations without building from scratch.",
    "problem": "AI agent developers lack a monetization channel, while businesses spend months building what already exists.",
    "solution": "Multi-tenant SaaS with role separation (seller/buyer), Stripe Connect payments, API keys for integration, and an agent showcase.",
    "result": "Launched to production with 30+ agents. Average time-to-value for a new client is 1 day instead of 3 months of development.",
    "aiUsage": "Built-in agent tester, automatic documentation generation via LLM, intelligent search by task description."
  }
}
```

- [ ] **Step 5: Create Gineo project**

`packages/content/projects/gineo.json`:
```json
{
  "slug": "gineo",
  "previewImage": "/projects/gineo.png",
  "link": "https://gineo.app",
  "technologies": ["Next.js", "NestJS", "PostgreSQL", "Prisma", "D3.js"],
  "ru": {
    "title": "Gineo — Семейное дерево",
    "shortDescription": "Приложение для создания и исследования интерактивных семейных деревьев",
    "description": "Веб-приложение для построения семейных деревьев с интерактивной визуализацией, совместным редактированием и хранением истории семьи.",
    "problem": "Люди хотят сохранять и передавать семейную историю, но существующие инструменты сложны и не дают красивой визуализации.",
    "solution": "Fullstack приложение с интерактивным D3.js-деревом, multi-tenant архитектурой для семей, real-time коллаборацией и экспортом в PDF.",
    "result": "500+ активных семей. Средняя сессия 12 минут, NPS 72.",
    "aiUsage": "AI-помощник для обработки старых фотографий (восстановление, подписи), автоматическое предложение связей на основе введённых данных."
  },
  "en": {
    "title": "Gineo — Family Tree",
    "shortDescription": "App for creating and exploring interactive family trees",
    "description": "Web application for building family trees with interactive visualization, collaborative editing, and family history storage.",
    "problem": "People want to preserve and pass on family history, but existing tools are complex and don't provide beautiful visualization.",
    "solution": "Fullstack app with interactive D3.js tree, multi-tenant architecture for families, real-time collaboration, and PDF export.",
    "result": "500+ active families. Average session 12 minutes, NPS 72.",
    "aiUsage": "AI assistant for processing old photos (restoration, captions), automatic relationship suggestions based on entered data."
  }
}
```

- [ ] **Step 6: Create Telegram Bots project**

`packages/content/projects/telegram-bots.json`:
```json
{
  "slug": "telegram-bots",
  "previewImage": "/projects/telegram-bots.png",
  "technologies": ["NestJS", "Telegraf", "PostgreSQL", "OpenAI", "Redis"],
  "ru": {
    "title": "Telegram AI-боты",
    "shortDescription": "Серия умных Telegram-ботов для автоматизации бизнес-задач",
    "description": "Разработка кастомных Telegram-ботов с AI-возможностями: от обработки заявок до полноценных AI-ассистентов с памятью и инструментами.",
    "problem": "Бизнес хочет автоматизировать коммуникации и обработку запросов в Telegram без найма дополнительного персонала.",
    "solution": "Модульная платформа на NestJS + Telegraf с поддержкой сценариев, базой знаний, интеграцией с CRM и AI-обработкой естественного языка.",
    "result": "Снижение нагрузки на поддержку на 70%. Боты обрабатывают 500+ сообщений в день без участия человека.",
    "aiUsage": "GPT-4 для понимания намерений, RAG на базе знаний компании, мультиагентные сценарии для сложных запросов."
  },
  "en": {
    "title": "Telegram AI Bots",
    "shortDescription": "A series of smart Telegram bots for automating business tasks",
    "description": "Development of custom Telegram bots with AI capabilities: from processing requests to full-featured AI assistants with memory and tools.",
    "problem": "Businesses want to automate communications and request processing in Telegram without hiring additional staff.",
    "solution": "Modular platform on NestJS + Telegraf with scenario support, knowledge base, CRM integration, and AI natural language processing.",
    "result": "Support workload reduced by 70%. Bots handle 500+ messages per day without human involvement.",
    "aiUsage": "GPT-4 for intent understanding, RAG on company knowledge base, multi-agent scenarios for complex requests."
  }
}
```

- [ ] **Step 7: Commit**

```bash
git add packages/content/
git commit -m "feat(content): add bilingual project data for all 4 portfolio projects"
```

---

### Task 5: NestJS App Bootstrap

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/nest-cli.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/tsconfig.build.json`
- Create: `apps/api/src/main.ts`
- Create: `apps/api/src/app.module.ts`

- [ ] **Step 1: Create NestJS app via CLI**

```bash
cd apps
pnpm dlx @nestjs/cli new api --package-manager pnpm --skip-git
cd ..
```

If CLI fails, create manually:

`apps/api/package.json`:
```json
{
  "name": "@portfolio/api",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "build": "nest build",
    "start": "node dist/main",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:seed": "ts-node prisma/seed.ts"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/throttler": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "@portfolio/shared": "workspace:*",
    "bcryptjs": "^2.4.3",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.0",
    "cookie-parser": "^1.4.6",
    "nodemailer": "^6.9.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/bcryptjs": "^2.4.6",
    "@types/cookie-parser": "^1.4.7",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.0",
    "@types/nodemailer": "^6.4.14",
    "@types/passport-jwt": "^4.0.1",
    "@types/supertest": "^6.0.2",
    "jest": "^29.5.0",
    "prisma": "^5.0.0",
    "supertest": "^7.0.0",
    "ts-jest": "^29.1.0",
    "ts-node": "^10.9.0",
    "typescript": "^5.4.0"
  },
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
```

`apps/api/nest-cli.json`:
```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
```

`apps/api/tsconfig.json`:
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false,
    "resolveJsonModule": true
  }
}
```

`apps/api/tsconfig.build.json`:
```json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts"]
}
```

- [ ] **Step 2: Configure main.ts**

`apps/api/src/main.ts`:
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: [
      process.env.WEB_URL ?? 'http://localhost:3000',
      process.env.ADMIN_URL ?? 'http://localhost:3002',
    ],
    credentials: true, // required for httpOnly cookies
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`API running on http://localhost:${port}`);
}

bootstrap();
```

- [ ] **Step 3: Configure AppModule**

`apps/api/src/app.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { BlogModule } from './blog/blog.module';
import { ContactsModule } from './contacts/contacts.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { PrismaModule } from './prisma/prisma.module';

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
  ],
})
export class AppModule {}
```

- [ ] **Step 4: Create PrismaModule**

```bash
mkdir -p apps/api/src/prisma
```

`apps/api/src/prisma/prisma.module.ts`:
```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

`apps/api/src/prisma/prisma.service.ts`:
```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

- [ ] **Step 5: Install dependencies**

```bash
cd apps/api && pnpm install && cd ../..
```

- [ ] **Step 6: Commit**

```bash
git add apps/api/
git commit -m "feat(api): bootstrap NestJS app with config, CORS, cookie-parser, validation"
```

---

### Task 6: Prisma Schema, Migration, and Seed

**Files:**
- Create: `apps/api/prisma/schema.prisma`
- Create: `apps/api/prisma/seed.ts`
- Create: `apps/api/.env` (local, gitignored)

- [ ] **Step 1: Create .env for local development**

```bash
cp .env.example apps/api/.env
# Edit apps/api/.env with real local values:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/portfolio
# JWT_SECRET=dev_jwt_secret_min_32_characters_long
# REFRESH_TOKEN_SECRET=dev_refresh_secret_min_32_chars
# REVALIDATION_SECRET=dev_revalidation_secret_min_32chars
# ADMIN_EMAIL=admin@example.com
# ADMIN_PASSWORD=admin123
```

- [ ] **Step 2: Write Prisma schema**

`apps/api/prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id               String   @id @default(cuid())
  email            String   @unique
  password         String
  refreshTokenHash String?
  createdAt        DateTime @default(now())
}

model BlogPost {
  id           String               @id @default(cuid())
  slug         String               @unique
  status       PostStatus           @default(DRAFT)
  publishedAt  DateTime?
  createdAt    DateTime             @default(now())
  updatedAt    DateTime             @updatedAt
  translations BlogPostTranslation[]
}

model BlogPostTranslation {
  id        String   @id @default(cuid())
  locale    String
  title     String
  excerpt   String
  content   Json
  updatedAt DateTime @updatedAt
  post      BlogPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId    String

  @@unique([postId, locale])
}

model Contact {
  id          String        @id @default(cuid())
  name        String
  contact     String
  description String
  status      ContactStatus @default(NEW)
  createdAt   DateTime      @default(now())
}

model AnalyticsEvent {
  id        String   @id @default(cuid())
  event     String
  payload   Json?
  sessionId String?
  createdAt DateTime @default(now())
}

enum PostStatus    { DRAFT PUBLISHED }
enum ContactStatus { NEW READ ARCHIVED }
```

- [ ] **Step 3: Generate Prisma client and run migration**

```bash
cd apps/api
pnpm exec prisma generate
pnpm exec prisma migrate dev --name init
```

Expected: migration file created in `prisma/migrations/`, client generated.

- [ ] **Step 4: Write seed script**

`apps/api/prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD env vars are required');
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Admin user already exists, skipping seed.');
    return;
  }

  const hash = await bcrypt.hash(password, 12);
  await prisma.user.create({ data: { email, password: hash } });
  console.log(`Admin user created: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

Add to `apps/api/package.json` prisma config:
```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

- [ ] **Step 5: Run seed**

```bash
cd apps/api
pnpm exec prisma db seed
```

Expected: `Admin user created: admin@example.com`

- [ ] **Step 6: Commit**

```bash
cd /Users/dmitry/Work/MyProjects/portfolio
git add apps/api/prisma/
git commit -m "feat(api): add Prisma schema with all models, migration, and admin seed"
```

---

### Task 7: Auth Module (JWT httpOnly cookies)

**Files:**
- Create: `apps/api/src/auth/dto/login.dto.ts`
- Create: `apps/api/src/auth/strategies/jwt.strategy.ts`
- Create: `apps/api/src/auth/guards/jwt-auth.guard.ts`
- Create: `apps/api/src/auth/auth.service.ts`
- Create: `apps/api/src/auth/auth.controller.ts`
- Create: `apps/api/src/auth/auth.module.ts`
- Create: `apps/api/src/auth/auth.service.spec.ts`
- Create: `apps/api/test/auth.e2e-spec.ts`

- [ ] **Step 1: Write failing unit test for AuthService**

`apps/api/src/auth/auth.service.spec.ts`:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: jest.Mocked<PrismaService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    id: 'user-1',
    email: 'admin@example.com',
    password: bcrypt.hashSync('password123', 10),
    refreshTokenHash: null,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('mock_token') },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                REFRESH_TOKEN_SECRET: 'test_refresh_secret',
                JWT_SECRET: 'test_jwt_secret',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
    jwtService = module.get(JwtService);
  });

  describe('validateUser', () => {
    it('should return user without password on valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateUser(
        'admin@example.com',
        'password123',
      );

      expect(result).toBeDefined();
      expect(result?.id).toBe('user-1');
      expect(result).not.toHaveProperty('password');
    });

    it('should return null on invalid password', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateUser(
        'admin@example.com',
        'wrong_password',
      );

      expect(result).toBeNull();
    });

    it('should return null when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser('nobody@example.com', 'pass');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access and refresh tokens', async () => {
      prisma.user.update.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue('signed_token');

      const result = await service.login({ id: 'user-1', email: 'admin@example.com' });

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });
  });
});
```

- [ ] **Step 2: Run test to see it fail**

```bash
cd apps/api && pnpm test src/auth/auth.service.spec.ts
```

Expected: FAIL — `AuthService` not found.

- [ ] **Step 3: Implement AuthService**

`apps/api/src/auth/auth.service.ts`:
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from '@portfolio/shared';

interface UserWithoutPassword {
  id: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserWithoutPassword | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return null;

    const { password: _, ...result } = user;
    return result;
  }

  async login(user: UserWithoutPassword): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const payload: JwtPayload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: '7d',
    });

    const hash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: hash },
    });

    return { accessToken, refreshToken };
  }

  async refresh(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user?.refreshTokenHash) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    const valid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!valid) throw new UnauthorizedException('Invalid refresh token');

    return this.login({ id: user.id, email: user.email });
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd apps/api && pnpm test src/auth/auth.service.spec.ts
```

Expected: PASS (3 tests in validateUser, 1 in login).

- [ ] **Step 5: Create JWT strategy (reads from cookie)**

`apps/api/src/auth/strategies/jwt.strategy.ts`:
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '@portfolio/shared';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.access_token ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) throw new UnauthorizedException();
    return { id: user.id, email: user.email };
  }
}
```

- [ ] **Step 6: Create JWT guard**

`apps/api/src/auth/guards/jwt-auth.guard.ts`:
```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

- [ ] **Step 7: Create login DTO**

`apps/api/src/auth/dto/login.dto.ts`:
```typescript
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
```

- [ ] **Step 8: Create AuthController**

`apps/api/src/auth/auth.controller.ts`:
```typescript
import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UnauthorizedException,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

const COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 900000 } }) // 10 per 15 min
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const { accessToken, refreshToken } = await this.authService.login(user);

    res.cookie('access_token', accessToken, {
      ...COOKIE_BASE,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie('refresh_token', refreshToken, {
      ...COOKIE_BASE,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { message: 'ok' };
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.refresh_token;
    if (!token) throw new UnauthorizedException('No refresh token');

    const { accessToken, refreshToken } = await this.authService.refresh(token);

    res.cookie('access_token', accessToken, {
      ...COOKIE_BASE,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refresh_token', refreshToken, {
      ...COOKIE_BASE,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { message: 'ok' };
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async logout(
    @Req() req: Request & { user: { id: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(req.user.id);
    res.clearCookie('access_token', COOKIE_BASE);
    res.clearCookie('refresh_token', COOKIE_BASE);
    return { message: 'ok' };
  }
}
```

- [ ] **Step 9: Create AuthModule**

`apps/api/src/auth/auth.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
```

Note: export `JwtAuthGuard` from module so other modules can use it.

Add `JwtAuthGuard` to exports:
```typescript
import { JwtAuthGuard } from './guards/jwt-auth.guard';
// add to exports array: JwtAuthGuard
```

- [ ] **Step 10: Write e2e test for auth**

`apps/api/test/auth.e2e-spec.ts`:
```typescript
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
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(() => app.close());

  describe('POST /auth/login', () => {
    it('should set httpOnly cookies on valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD })
        .expect(200);

      const cookies = res.headers['set-cookie'] as string[];
      expect(cookies).toBeDefined();
      expect(cookies.some((c: string) => c.startsWith('access_token='))).toBe(true);
      expect(cookies.some((c: string) => c.startsWith('refresh_token='))).toBe(true);
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
      // Login first
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });

      const cookies = loginRes.headers['set-cookie'];

      // Logout
      const logoutRes = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', cookies)
        .expect(200);

      const logoutCookies = logoutRes.headers['set-cookie'] as string[];
      expect(logoutCookies.some((c: string) => c.includes('access_token=;'))).toBe(true);
    });
  });
});
```

`apps/api/test/jest-e2e.json`:
```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}
```

- [ ] **Step 11: Run e2e tests**

```bash
cd apps/api && pnpm test:e2e test/auth.e2e-spec.ts
```

Expected: PASS. Requires running PostgreSQL (start with `docker compose up postgres -d`).

- [ ] **Step 12: Commit**

```bash
cd /Users/dmitry/Work/MyProjects/portfolio
git add apps/api/src/auth/ apps/api/test/auth.e2e-spec.ts apps/api/test/jest-e2e.json
git commit -m "feat(api): implement JWT auth with httpOnly cookies and refresh token rotation"
```

---

### Task 8: Blog Module

**Files:**
- Create: `apps/api/src/blog/dto/create-post.dto.ts`
- Create: `apps/api/src/blog/dto/update-post.dto.ts`
- Create: `apps/api/src/blog/blog.service.ts`
- Create: `apps/api/src/blog/blog.service.spec.ts`
- Create: `apps/api/src/blog/blog.controller.ts`
- Create: `apps/api/src/blog/admin-blog.controller.ts`
- Create: `apps/api/src/blog/blog.module.ts`
- Create: `apps/api/test/blog.e2e-spec.ts`

- [ ] **Step 1: Create DTOs**

`apps/api/src/blog/dto/create-post.dto.ts`:
```typescript
import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested, IsIn } from 'class-validator';

class TranslationDto {
  @IsIn(['ru', 'en'])
  locale: string;

  @IsString()
  title: string;

  @IsString()
  excerpt: string;

  content: unknown; // TipTap JSON, no validation
}

export class CreatePostDto {
  @IsString()
  slug: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TranslationDto)
  translations: TranslationDto[];
}
```

`apps/api/src/blog/dto/update-post.dto.ts`:
```typescript
import { PartialType } from '@nestjs/mapped-types';
import { IsIn, IsOptional } from 'class-validator';
import { CreatePostDto } from './create-post.dto';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsOptional()
  @IsIn(['DRAFT', 'PUBLISHED'])
  status?: string;
}
```

- [ ] **Step 2: Write failing unit test for BlogService**

`apps/api/src/blog/blog.service.spec.ts`:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BlogService } from './blog.service';
import { PrismaService } from '../prisma/prisma.service';

describe('BlogService', () => {
  let service: BlogService;
  let prisma: jest.Mocked<PrismaService>;

  const mockPost = {
    id: 'post-1',
    slug: 'test-post',
    status: 'PUBLISHED',
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    translations: [
      {
        id: 'tr-1',
        locale: 'ru',
        title: 'Тест',
        excerpt: 'Тестовый пост',
        content: {},
        updatedAt: new Date(),
        postId: 'post-1',
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogService,
        {
          provide: PrismaService,
          useValue: {
            blogPost: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            blogPostTranslation: {
              upsert: jest.fn(),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('test_secret') },
        },
      ],
    }).compile();

    service = module.get<BlogService>(BlogService);
    prisma = module.get(PrismaService);
  });

  describe('findPublished', () => {
    it('should return paginated published posts for a locale', async () => {
      prisma.blogPost.findMany.mockResolvedValue([mockPost] as any);
      prisma.blogPost.count.mockResolvedValue(1);

      const result = await service.findPublished({ locale: 'ru', page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(prisma.blogPost.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'PUBLISHED' },
        }),
      );
    });
  });

  describe('findBySlug', () => {
    it('should return a post with the requested locale translation', async () => {
      prisma.blogPost.findUnique.mockResolvedValue(mockPost as any);

      const result = await service.findBySlug('test-post', 'ru');

      expect(result).toBeDefined();
      expect(result?.slug).toBe('test-post');
    });

    it('should return null when post not found', async () => {
      prisma.blogPost.findUnique.mockResolvedValue(null);

      const result = await service.findBySlug('not-found', 'ru');

      expect(result).toBeNull();
    });
  });
});
```

- [ ] **Step 3: Run test to see it fail**

```bash
cd apps/api && pnpm test src/blog/blog.service.spec.ts
```

Expected: FAIL — `BlogService` not found.

- [ ] **Step 4: Implement BlogService**

`apps/api/src/blog/blog.service.ts`:
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

interface FindPublishedOptions {
  locale?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class BlogService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async findPublished(options: FindPublishedOptions = {}) {
    const { locale = 'ru', page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where: { status: 'PUBLISHED' },
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        include: {
          translations: {
            where: { locale },
          },
        },
      }),
      this.prisma.blogPost.count({ where: { status: 'PUBLISHED' } }),
    ]);

    return { data, total, page, limit };
  }

  async findBySlug(slug: string, locale: string = 'ru') {
    return this.prisma.blogPost.findUnique({
      where: { slug },
      include: {
        translations: {
          where: { locale },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
      include: { translations: true },
    });
  }

  async create(dto: CreatePostDto) {
    const post = await this.prisma.blogPost.create({
      data: {
        slug: dto.slug,
        translations: {
          create: dto.translations.map((t) => ({
            locale: t.locale,
            title: t.title,
            excerpt: t.excerpt,
            content: t.content ?? {},
          })),
        },
      },
      include: { translations: true },
    });

    await this.triggerRevalidation(`/blog/${dto.slug}`);
    await this.triggerRevalidation('/blog');
    return post;
  }

  async update(id: string, dto: UpdatePostDto) {
    const existing = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Post not found');

    const data: Record<string, unknown> = {};
    if (dto.slug) data.slug = dto.slug;
    if (dto.status) {
      data.status = dto.status;
      data.publishedAt =
        dto.status === 'PUBLISHED' && !existing.publishedAt
          ? new Date()
          : existing.publishedAt;
    }

    const post = await this.prisma.blogPost.update({
      where: { id },
      data: {
        ...data,
        ...(dto.translations && {
          translations: {
            upsert: dto.translations.map((t) => ({
              where: {
                postId_locale: { postId: id, locale: t.locale },
              },
              create: {
                locale: t.locale,
                title: t.title,
                excerpt: t.excerpt,
                content: t.content ?? {},
              },
              update: {
                title: t.title,
                excerpt: t.excerpt,
                content: t.content ?? {},
              },
            })),
          },
        }),
      },
      include: { translations: true },
    });

    const slug = (dto.slug ?? existing.slug) as string;
    await this.triggerRevalidation(`/blog/${slug}`);
    await this.triggerRevalidation('/blog');
    return post;
  }

  async remove(id: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');

    await this.prisma.blogPost.delete({ where: { id } });
    await this.triggerRevalidation(`/blog/${post.slug}`);
    await this.triggerRevalidation('/blog');
  }

  private async triggerRevalidation(path: string) {
    const webUrl = this.config.get<string>('WEB_URL') ?? 'http://web:3000';
    const secret = this.config.get<string>('REVALIDATION_SECRET');
    if (!secret) return;

    try {
      await fetch(
        `${webUrl}/api/revalidate?secret=${secret}&path=${encodeURIComponent(path)}`,
        { method: 'POST' },
      );
    } catch {
      // Non-blocking: log but don't fail
      console.warn(`Failed to trigger revalidation for ${path}`);
    }
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
cd apps/api && pnpm test src/blog/blog.service.spec.ts
```

Expected: PASS.

- [ ] **Step 6: Create public BlogController**

`apps/api/src/blog/blog.controller.ts`:
```typescript
import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { BlogService } from './blog.service';

@Controller('blog')
export class BlogController {
  constructor(private blogService: BlogService) {}

  @Get()
  findAll(
    @Query('locale') locale: string = 'ru',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.blogService.findPublished({ locale, page: +page, limit: +limit });
  }

  @Get(':slug')
  async findOne(
    @Param('slug') slug: string,
    @Query('locale') locale: string = 'ru',
  ) {
    const post = await this.blogService.findBySlug(slug, locale);
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }
}
```

- [ ] **Step 7: Create admin AdminBlogController**

`apps/api/src/blog/admin-blog.controller.ts`:
```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BlogService } from './blog.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('admin/blog')
@UseGuards(JwtAuthGuard)
export class AdminBlogController {
  constructor(private blogService: BlogService) {}

  @Get()
  findAll() {
    return this.blogService.findAll();
  }

  @Post()
  create(@Body() dto: CreatePostDto) {
    return this.blogService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePostDto) {
    return this.blogService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.blogService.remove(id);
  }
}
```

- [ ] **Step 8: Create BlogModule**

`apps/api/src/blog/blog.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { AdminBlogController } from './admin-blog.controller';

@Module({
  controllers: [BlogController, AdminBlogController],
  providers: [BlogService],
})
export class BlogModule {}
```

- [ ] **Step 9: Write e2e test for blog public endpoints**

`apps/api/test/blog.e2e-spec.ts`:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';

describe('BlogController (e2e)', () => {
  let app: INestApplication;
  let authCookies: string[];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    // Login
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
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

  describe('Admin blog CRUD (POST /admin/blog)', () => {
    let createdId: string;

    it('should reject unauthenticated request', async () => {
      await request(app.getHttpServer()).get('/admin/blog').expect(401);
    });

    it('should create a post', async () => {
      const res = await request(app.getHttpServer())
        .post('/admin/blog')
        .set('Cookie', authCookies)
        .send({
          slug: 'test-e2e-post',
          translations: [
            { locale: 'ru', title: 'Тест', excerpt: 'Краткое', content: {} },
            { locale: 'en', title: 'Test', excerpt: 'Brief', content: {} },
          ],
        })
        .expect(201);

      createdId = res.body.id;
      expect(res.body.slug).toBe('test-e2e-post');
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
```

- [ ] **Step 10: Run e2e tests**

```bash
cd apps/api && pnpm test:e2e test/blog.e2e-spec.ts
```

Expected: PASS.

- [ ] **Step 11: Commit**

```bash
cd /Users/dmitry/Work/MyProjects/portfolio
git add apps/api/src/blog/ apps/api/test/blog.e2e-spec.ts
git commit -m "feat(api): implement blog module with public and admin CRUD + revalidation trigger"
```

---

### Task 9: Contacts Module

**Files:**
- Create: `apps/api/src/contacts/dto/create-contact.dto.ts`
- Create: `apps/api/src/contacts/dto/update-contact-status.dto.ts`
- Create: `apps/api/src/contacts/notifications/telegram.service.ts`
- Create: `apps/api/src/contacts/notifications/email.service.ts`
- Create: `apps/api/src/contacts/contacts.service.ts`
- Create: `apps/api/src/contacts/contacts.service.spec.ts`
- Create: `apps/api/src/contacts/contacts.controller.ts`
- Create: `apps/api/src/contacts/contacts.module.ts`
- Create: `apps/api/test/contacts.e2e-spec.ts`

- [ ] **Step 1: Create DTOs**

`apps/api/src/contacts/dto/create-contact.dto.ts`:
```typescript
import { IsString, MinLength, Matches } from 'class-validator';

export class CreateContactDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @Matches(/^([^\s@]+@[^\s@]+\.[^\s@]+|@[a-zA-Z0-9_]{4,32})$/, {
    message: 'contact must be a valid email or Telegram handle starting with @',
  })
  contact: string;

  @IsString()
  @MinLength(10)
  description: string;
}
```

`apps/api/src/contacts/dto/update-contact-status.dto.ts`:
```typescript
import { IsIn } from 'class-validator';

export class UpdateContactStatusDto {
  @IsIn(['NEW', 'READ', 'ARCHIVED'])
  status: string;
}
```

- [ ] **Step 2: Create notification services**

`apps/api/src/contacts/notifications/telegram.service.ts`:
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  constructor(private config: ConfigService) {}

  async sendMessage(text: string): Promise<void> {
    const token = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    const chatId = this.config.get<string>('TELEGRAM_CHAT_ID');

    if (!token || !chatId) {
      this.logger.warn('Telegram not configured, skipping notification');
      return;
    }

    try {
      const url = `https://api.telegram.org/bot${token}/sendMessage`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
        }),
      });

      if (!res.ok) {
        this.logger.error(`Telegram API error: ${res.status}`);
      }
    } catch (err) {
      this.logger.error('Failed to send Telegram message', err);
    }
  }
}
```

`apps/api/src/contacts/notifications/email.service.ts`:
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: parseInt(this.config.get<string>('SMTP_PORT') ?? '587'),
        secure: false,
        auth: { user, pass },
      });
    }
  }

  async sendContactNotification(data: {
    name: string;
    contact: string;
    description: string;
  }): Promise<void> {
    if (!this.transporter) {
      this.logger.warn('SMTP not configured, skipping email notification');
      return;
    }

    const to = this.config.get<string>('NOTIFICATION_EMAIL');
    if (!to) return;

    try {
      await this.transporter.sendMail({
        from: this.config.get<string>('SMTP_USER'),
        to,
        subject: `New contact from ${data.name}`,
        html: `
          <h2>New Contact Request</h2>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Contact:</strong> ${data.contact}</p>
          <p><strong>Description:</strong></p>
          <p>${data.description}</p>
        `,
      });
    } catch (err) {
      this.logger.error('Failed to send email notification', err);
    }
  }
}
```

- [ ] **Step 3: Write failing unit test for ContactsService**

`apps/api/src/contacts/contacts.service.spec.ts`:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ContactsService } from './contacts.service';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from './notifications/telegram.service';
import { EmailService } from './notifications/email.service';

describe('ContactsService', () => {
  let service: ContactsService;
  let prisma: jest.Mocked<PrismaService>;
  let telegram: jest.Mocked<TelegramService>;
  let email: jest.Mocked<EmailService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactsService,
        {
          provide: PrismaService,
          useValue: {
            contact: {
              create: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: TelegramService,
          useValue: { sendMessage: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: EmailService,
          useValue: { sendContactNotification: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    service = module.get<ContactsService>(ContactsService);
    prisma = module.get(PrismaService);
    telegram = module.get(TelegramService);
    email = module.get(EmailService);
  });

  describe('create', () => {
    it('should save contact and send both notifications', async () => {
      const dto = {
        name: 'Ivan',
        contact: 'ivan@example.com',
        description: 'I need help with my AI project',
      };

      prisma.contact.create.mockResolvedValue({
        id: 'c-1',
        ...dto,
        status: 'NEW',
        createdAt: new Date(),
      });

      await service.create(dto);

      expect(prisma.contact.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ name: 'Ivan' }),
      });
      expect(telegram.sendMessage).toHaveBeenCalledTimes(1);
      expect(email.sendContactNotification).toHaveBeenCalledTimes(1);
    });
  });
});
```

- [ ] **Step 4: Run test to see it fail**

```bash
cd apps/api && pnpm test src/contacts/contacts.service.spec.ts
```

Expected: FAIL — `ContactsService` not found.

- [ ] **Step 5: Implement ContactsService**

`apps/api/src/contacts/contacts.service.ts`:
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from './notifications/telegram.service';
import { EmailService } from './notifications/email.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactsService {
  constructor(
    private prisma: PrismaService,
    private telegram: TelegramService,
    private email: EmailService,
  ) {}

  async create(dto: CreateContactDto) {
    const contact = await this.prisma.contact.create({ data: dto });

    const message = [
      `📩 <b>New Contact Request</b>`,
      ``,
      `👤 <b>Name:</b> ${dto.name}`,
      `📬 <b>Contact:</b> ${dto.contact}`,
      `📝 <b>Description:</b>`,
      dto.description,
    ].join('\n');

    // Fire-and-forget notifications
    this.telegram.sendMessage(message).catch(() => undefined);
    this.email.sendContactNotification(dto).catch(() => undefined);

    return contact;
  }

  findAll() {
    return this.prisma.contact.findMany({ orderBy: { createdAt: 'desc' } });
  }

  updateStatus(id: string, status: string) {
    return this.prisma.contact.update({
      where: { id },
      data: { status: status as any },
    });
  }
}
```

- [ ] **Step 6: Run test to verify it passes**

```bash
cd apps/api && pnpm test src/contacts/contacts.service.spec.ts
```

Expected: PASS.

- [ ] **Step 7: Create ContactsController**

`apps/api/src/contacts/contacts.controller.ts`:
```typescript
import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactStatusDto } from './dto/update-contact-status.dto';

@Controller('contacts')
export class ContactsController {
  constructor(private contactsService: ContactsService) {}

  @Post()
  @HttpCode(201)
  @Throttle({ default: { limit: 5, ttl: 3600000 } }) // 5 per hour
  create(@Body() dto: CreateContactDto) {
    return this.contactsService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.contactsService.findAll();
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateContactStatusDto,
  ) {
    return this.contactsService.updateStatus(id, dto.status);
  }
}
```

- [ ] **Step 8: Create ContactsModule**

`apps/api/src/contacts/contacts.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { ContactsController } from './contacts.controller';
import { TelegramService } from './notifications/telegram.service';
import { EmailService } from './notifications/email.service';

@Module({
  controllers: [ContactsController],
  providers: [ContactsService, TelegramService, EmailService],
})
export class ContactsModule {}
```

- [ ] **Step 9: Write e2e test**

`apps/api/test/contacts.e2e-spec.ts`:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';

describe('ContactsController (e2e)', () => {
  let app: INestApplication;
  let authCookies: string[];

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
      .send({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
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
          description: 'This is a test contact request.',
        })
        .expect(201);
    });

    it('should accept valid telegram contact', async () => {
      await request(app.getHttpServer())
        .post('/contacts')
        .send({
          name: 'Telegram User',
          contact: '@testuser',
          description: 'This is another test contact request.',
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
```

- [ ] **Step 10: Run e2e tests**

```bash
cd apps/api && pnpm test:e2e test/contacts.e2e-spec.ts
```

Expected: PASS.

- [ ] **Step 11: Commit**

```bash
cd /Users/dmitry/Work/MyProjects/portfolio
git add apps/api/src/contacts/ apps/api/test/contacts.e2e-spec.ts
git commit -m "feat(api): implement contacts module with Telegram+Email notifications and rate limiting"
```

---

### Task 10: Analytics Module

**Files:**
- Create: `apps/api/src/analytics/dto/create-event.dto.ts`
- Create: `apps/api/src/analytics/analytics.service.ts`
- Create: `apps/api/src/analytics/analytics.controller.ts`
- Create: `apps/api/src/analytics/analytics.module.ts`

- [ ] **Step 1: Create DTO**

`apps/api/src/analytics/dto/create-event.dto.ts`:
```typescript
import { IsString, IsOptional, IsObject } from 'class-validator';

const VALID_EVENTS = [
  'hero_cta_click',
  'project_view',
  'project_cta_click',
  'contact_form_open',
  'contact_submit',
  'blog_post_view',
];

export class CreateEventDto {
  @IsString()
  event: string; // validated against enum in service

  @IsOptional()
  @IsObject()
  payload?: Record<string, string>;

  @IsOptional()
  @IsString()
  sessionId?: string;
}
```

- [ ] **Step 2: Implement AnalyticsService**

`apps/api/src/analytics/analytics.service.ts`:
```typescript
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
```

- [ ] **Step 3: Create AnalyticsController**

`apps/api/src/analytics/analytics.controller.ts`:
```typescript
import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AnalyticsService } from './analytics.service';
import { CreateEventDto } from './dto/create-event.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Post('event')
  @HttpCode(204)
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 per minute
  async track(@Body() dto: CreateEventDto) {
    // Fire-and-forget: don't await, return immediately
    this.analyticsService.track(dto).catch(() => undefined);
  }
}
```

- [ ] **Step 4: Create AnalyticsModule**

`apps/api/src/analytics/analytics.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
```

- [ ] **Step 5: Quick smoke test**

```bash
cd apps/api && pnpm start:dev &
sleep 5
curl -X POST http://localhost:3001/analytics/event \
  -H "Content-Type: application/json" \
  -d '{"event":"hero_cta_click","payload":{"cta_type":"discuss"},"sessionId":"test-session-123"}'
# Expected: HTTP 204 No Content
```

- [ ] **Step 6: Commit**

```bash
cd /Users/dmitry/Work/MyProjects/portfolio
git add apps/api/src/analytics/
git commit -m "feat(api): implement analytics module for funnel event tracking"
```

---

### Task 11: Docker Compose + Dockerfiles

**Files:**
- Create: `apps/api/Dockerfile`
- Create: `docker-compose.yml`

- [ ] **Step 1: Create API Dockerfile**

`apps/api/Dockerfile`:
```dockerfile
FROM node:20-alpine AS base
RUN npm install -g pnpm

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY . .
RUN pnpm --filter @portfolio/shared build 2>/dev/null || true
RUN pnpm --filter @portfolio/api build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
# Copy root node_modules (hoisted pnpm deps like @prisma/client)
COPY --from=builder /app/node_modules ./node_modules
# Copy api-local node_modules on top (overrides where needed)
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/prisma ./prisma
EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
```

- [ ] **Step 2: Create Docker Compose**

`docker-compose.yml`:
```yaml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: ${POSTGRES_DB:-portfolio}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres}"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - portfolio

  postgres-umami:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: ${UMAMI_POSTGRES_DB:-umami}
    volumes:
      - postgres_umami_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres}"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - portfolio

  umami:
    image: ghcr.io/umami-software/umami:postgresql-latest
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-postgres}@postgres-umami:5432/${UMAMI_POSTGRES_DB:-umami}
      DATABASE_TYPE: postgresql
      APP_SECRET: ${UMAMI_APP_SECRET:-changeme}
    depends_on:
      postgres-umami:
        condition: service_healthy
    ports:
      - "3003:3000"
    networks:
      - portfolio

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-postgres}@postgres:5432/${POSTGRES_DB:-portfolio}
      JWT_SECRET: ${JWT_SECRET}
      REFRESH_TOKEN_SECRET: ${REFRESH_TOKEN_SECRET}
      REVALIDATION_SECRET: ${REVALIDATION_SECRET}
      WEB_URL: http://web:3000
      ADMIN_URL: http://admin:80
      TELEGRAM_BOT_TOKEN: ${TELEGRAM_BOT_TOKEN:-}
      TELEGRAM_CHAT_ID: ${TELEGRAM_CHAT_ID:-}
      SMTP_HOST: ${SMTP_HOST:-}
      SMTP_PORT: ${SMTP_PORT:-587}
      SMTP_USER: ${SMTP_USER:-}
      SMTP_PASS: ${SMTP_PASS:-}
      NOTIFICATION_EMAIL: ${NOTIFICATION_EMAIL:-}
      ADMIN_EMAIL: ${ADMIN_EMAIL}
      ADMIN_PASSWORD: ${ADMIN_PASSWORD}
    depends_on:
      postgres:
        condition: service_healthy
    ports:
      - "3001:3001"
    networks:
      - portfolio

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:-http://localhost:3001}
      NEXT_PUBLIC_UMAMI_ID: ${NEXT_PUBLIC_UMAMI_ID:-}
      REVALIDATION_SECRET: ${REVALIDATION_SECRET}
    depends_on:
      - api
    ports:
      - "3000:3000"
    networks:
      - portfolio

  admin:
    build:
      context: .
      dockerfile: apps/admin/Dockerfile
    depends_on:
      - api
    ports:
      - "3002:80"
    networks:
      - portfolio

volumes:
  postgres_data:
  postgres_umami_data:

networks:
  portfolio:
    driver: bridge
```

Note: `web` and `admin` Dockerfiles will be added in Plans 2 and 3. Comment them out if running Plan 1 in isolation:

```yaml
# Comment out web and admin services until Plans 2 and 3 are complete:
# web: ...
# admin: ...
```

- [ ] **Step 3: Verify API starts with Docker Compose**

```bash
# Copy .env.example to .env and fill in required values
cp .env.example .env
# Edit .env: set JWT_SECRET, REFRESH_TOKEN_SECRET, REVALIDATION_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD

docker compose up postgres api -d
docker compose logs api --follow
```

Expected: `API running on http://localhost:3001`, no errors.

- [ ] **Step 4: Seed database in Docker**

```bash
docker compose exec api npx prisma db seed
```

Expected: `Admin user created: admin@example.com`

- [ ] **Step 5: Run full smoke test**

```bash
# Test login
curl -c cookies.txt -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your_admin_password"}'
# Expected: {"message":"ok"} with Set-Cookie headers

# Test protected endpoint
curl -b cookies.txt http://localhost:3001/admin/blog
# Expected: [] (empty array)

# Test contact submission
curl -X POST http://localhost:3001/contacts \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","contact":"test@example.com","description":"Testing the contact form"}'
# Expected: {"id":"...","name":"Test",...}

# Test analytics
curl -X POST http://localhost:3001/analytics/event \
  -H "Content-Type: application/json" \
  -d '{"event":"hero_cta_click","payload":{"cta_type":"discuss"}}'
# Expected: HTTP 204
```

- [ ] **Step 6: Commit**

```bash
cd /Users/dmitry/Work/MyProjects/portfolio
git add docker-compose.yml apps/api/Dockerfile
git commit -m "feat(infra): add Docker Compose with all 6 services and API Dockerfile"
```

---

### Task 12: Run Full Test Suite

- [ ] **Step 1: Run all unit tests**

```bash
cd apps/api && pnpm test --passWithNoTests
```

Expected: PASS — AuthService, BlogService, ContactsService tests all green.

- [ ] **Step 2: Run e2e tests (requires running DB)**

```bash
docker compose up postgres -d
cd apps/api && pnpm test:e2e
```

Expected: PASS — auth, blog, contacts e2e tests all green.

- [ ] **Step 3: Final commit**

```bash
cd /Users/dmitry/Work/MyProjects/portfolio
git add .
git commit -m "feat: complete Plan 1 - foundation, packages, and backend API"
```

---

## Summary

After completing all 12 tasks you will have:

✅ Turborepo monorepo with pnpm workspaces
✅ `@portfolio/shared` — TypeScript types for all domain entities
✅ `@portfolio/i18n` — RU/EN translation JSON files
✅ `@portfolio/content` — bilingual project data JSONs
✅ NestJS API with 4 modules: Auth, Blog, Contacts, Analytics
✅ PostgreSQL schema with Prisma migrations + seed
✅ JWT auth via httpOnly cookies with refresh token rotation
✅ Rate limiting on public endpoints
✅ Telegram + Email notifications for contacts
✅ On-demand revalidation trigger for Next.js
✅ Unit tests for all services
✅ E2e tests for all endpoints
✅ Docker Compose with 6 services

**Next:** Plan 2 — Next.js Web app (landing, projects, blog, design system, i18n)

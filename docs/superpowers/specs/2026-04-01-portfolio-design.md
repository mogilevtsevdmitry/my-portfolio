# Portfolio Site — Design Spec
Date: 2026-04-01

## Overview

Personal portfolio site for Dmitry Mogilevtsev — AI systems architect. The site functions as a sales tool, lead filter, and personal brand hub. Goal: position as a CTO/ecosystem builder, not a "fullstack dev".

**Core message:** "I build systems and AI agents that replace processes, not just write code"

---

## Architecture

### Monorepo (Turborepo)

```
portfolio/
├── apps/
│   ├── web/        # Next.js 14+ (App Router, SSR/SSG)
│   ├── api/        # NestJS + PostgreSQL + Prisma
│   └── admin/      # React (Vite) SPA
├── packages/
│   ├── shared/     # TypeScript types, DTOs, constants
│   ├── i18n/       # UI string translations (next-intl JSON)
│   └── content/    # Structured project data (bilingual JSON)
├── docker-compose.yml
├── turbo.json
└── package.json
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14+ (App Router) |
| Backend | NestJS |
| Database | PostgreSQL 16 (app) + PostgreSQL 16 (umami, separate) |
| ORM | Prisma |
| Admin UI | React + Vite |
| WYSIWYG | TipTap |
| i18n | next-intl |
| Analytics | Umami (self-hosted) + custom funnel events |
| Rate Limiting | @nestjs/throttler |
| Deploy | VPS + Docker Compose + Dokploy |

---

## Frontend (apps/web)

### Routing

```
app/
└── [locale]/                      # ru | en
    ├── page.tsx                   # Landing (all sections)
    ├── not-found.tsx              # 404 page
    ├── error.tsx                  # Error boundary
    ├── projects/
    │   └── [slug]/page.tsx        # Project detail page (SSG + on-demand revalidation)
    └── blog/
        ├── page.tsx               # Blog list (SSG, revalidate: 60s)
        └── [slug]/page.tsx        # Blog post (SSG + on-demand revalidation)
```

### Rendering Strategy

- **Landing page (`/`)** — SSR (dynamic, locale-aware)
- **Project detail pages** — SSG with on-demand revalidation. Admin triggers `POST /api/revalidate?secret=TOKEN&path=/projects/[slug]` after editing
- **Blog list** — SSG with `revalidate: 60` (ISR, 1 minute)
- **Blog post pages** — SSG with on-demand revalidation. Admin triggers revalidation after publish/update

### Landing Page Sections

1. **Hero** — name, headline, subheadline, two CTAs ("Discuss project" / "View cases")
2. **About** — 5–7 value-focused theses (not biography)
3. **Value Proposition** — cards: AI agents, SaaS architecture, DevOps, Consulting
4. **Projects** — grid of ProjectCards from static JSON
5. **Tech Stack** — grouped: Backend, Architecture, Infrastructure, AI
6. **AI & Agents** — dedicated block (key differentiator)
7. **Work Process** — 5-step numbered flow
8. **Contacts** — form (name, contact, description) + Telegram/Email buttons

### Project Detail Page

Each project is a mini-case with sections:
- Description (what it is, who it's for)
- Problem (pain solved)
- Solution (architecture/approach)
- Result (metrics if available)
- Technologies
- AI/Agents usage

### SEO & Social Metadata

Every page includes:
- `<title>` and `<meta name="description">` via Next.js `generateMetadata`
- Open Graph tags: `og:title`, `og:description`, `og:image`, `og:type`
- Twitter Card: `twitter:card=summary_large_image`
- OG images: static default (`/og-default.png`) + dynamic per-project via `next/og` (`ImageResponse`)
- Favicon set: `favicon.ico`, `icon.png`, `apple-touch-icon.png`

### i18n

- Library: `next-intl`
- Middleware redirects based on `Accept-Language` header → cookie → `ru` default
- Language switcher preserves current path: `/ru/projects/gineo` ↔ `/en/projects/gineo`
- Malformed locale (e.g. `/de/...`) → middleware redirects to `/ru/...`

```
packages/i18n/locales/
├── ru/
│   ├── common.json    # nav, buttons, shared strings
│   ├── hero.json
│   ├── about.json
│   ├── values.json
│   ├── projects.json  # projects section labels only
│   ├── tech.json
│   ├── process.json
│   └── contacts.json
└── en/               # mirrors ru/

packages/content/projects/
├── agent-orchestrator.json   # { ru: { title, description, ... }, en: { ... } }
├── marketplace.json
├── gineo.json
└── telegram-bots.json
```

**Consumption pattern:**
- `packages/i18n` — consumed via `useTranslations()` hook (next-intl)
- `packages/content` — consumed via typed static imports (`import project from '@portfolio/content/projects/gineo.json'`)

### Design System

**Color Palette:**
```
--bg-primary:    #0B1F1A
--bg-secondary:  #0F2A24
--bg-card:       rgba(255,255,255,0.04)   // glassmorphism
--accent:        #4ADE80                  // lime-400
--accent-glow:   rgba(74,222,128,0.15)
--text-primary:  #F0FDF4
--text-muted:    #86EFAC
--border:        rgba(74,222,128,0.12)
```

**Typography:**
- Headings: Inter 700/800
- Body: Inter 400/500
- Code: JetBrains Mono

**Components:**
- `Button` — primary / outline / ghost variants
- `Card` — glassmorphism (backdrop-blur + border + glow)
- `Section` — wrapper with padding and max-width
- `Badge` — technology tags
- `ProjectCard` — thumbnail + title + description + action buttons
- `AnimatedCounter` — metric numbers with animation
- `GlowText` — gradient/glow headings

**UX:**
- Mobile-first
- Burger menu on mobile
- CTA always visible
- Large spacing, clear blocks

---

## Backend (apps/api)

### Modules

| Module | Responsibility |
|--------|---------------|
| `auth` | JWT login, bcrypt password, single admin user, refresh tokens |
| `blog` | CRUD posts with translations, TipTap JSON content, revalidation trigger |
| `contacts` | Receive leads, validate input, notify via Telegram + Email |
| `analytics` | Store custom funnel events |

### Authentication

- **Mechanism:** httpOnly cookies (no localStorage, no token in response body)
- **Flow:**
  1. `POST /auth/login` → validates credentials → sets two httpOnly cookies: `access_token` (15min) and `refresh_token` (7 days)
  2. `POST /auth/refresh` → validates refresh cookie → rotates both tokens
  3. `POST /auth/logout` → clears both cookies
- **Refresh token storage:** hashed in `User.refreshTokenHash` (DB column)
- **Guards:** `JwtAuthGuard` reads token from cookie (not Authorization header)

### Rate Limiting (@nestjs/throttler)

- `POST /contacts` — 5 requests / 60 minutes per IP
- `POST /analytics/event` — 60 requests / 60 seconds per IP
- `POST /auth/login` — 10 requests / 15 minutes per IP

### API Endpoints

**Auth**
- `POST /auth/login` → sets httpOnly cookies (access + refresh)
- `POST /auth/refresh` → rotates tokens
- `POST /auth/logout` → clears cookies

**Blog (public)**
- `GET /blog?locale=ru&page=1` → paginated published posts
- `GET /blog/:slug?locale=ru` → single post

**Blog (admin, JWT cookie protected)**
- `GET /admin/blog` → all posts including drafts
- `POST /admin/blog` → create post → triggers Next.js revalidation
- `PUT /admin/blog/:id` → update post → triggers revalidation
- `DELETE /admin/blog/:id` → delete post → triggers revalidation

**Contacts**
- `POST /contacts` → submit lead (rate limited) → validate → Telegram + Email notification
  - Validation: `name` required, `contact` must match email regex OR start with `@` (Telegram handle), `description` required

**Contacts (admin, JWT cookie protected)**
- `GET /admin/contacts` → list leads
- `PUT /admin/contacts/:id` → update status (NEW → READ → ARCHIVED)

**Analytics**
- `POST /analytics/event` → record funnel event (rate limited, fire-and-forget)

**Revalidation (internal, secret-protected)**
- `POST /api/revalidate` (Next.js API route) → `?secret=REVALIDATION_SECRET&path=/blog/my-post`

---

## Database Schema (Prisma)

```prisma
model User {
  id               String   @id @default(cuid())
  email            String   @unique
  password         String   // bcrypt
  refreshTokenHash String?  // hashed refresh token, null when logged out
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
  locale    String   // "ru" | "en"
  title     String
  excerpt   String
  content   Json     // TipTap JSON document
  updatedAt DateTime @updatedAt
  post      BlogPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId    String

  @@unique([postId, locale])
}

model Contact {
  id          String        @id @default(cuid())
  name        String
  contact     String        // validated: email OR @telegram_handle
  description String
  status      ContactStatus @default(NEW)
  createdAt   DateTime      @default(now())
}

model AnalyticsEvent {
  id        String   @id @default(cuid())
  event     String   // see funnel events table
  payload   Json?
  sessionId String?  // client-generated UUID, stored in localStorage, sent with each event
  createdAt DateTime @default(now())
}

enum PostStatus    { DRAFT PUBLISHED }
enum ContactStatus { NEW READ ARCHIVED }
```

### Initial Admin User

A Prisma seed script (`api/prisma/seed.ts`) creates the admin user on first run:
```
ADMIN_EMAIL and ADMIN_PASSWORD from environment variables
```
Run via `prisma db seed` as part of first deployment.

---

## Admin Panel (apps/admin)

React + Vite SPA. Served at **`admin.{domain}`** (subdomain routing, separate Dokploy service with own SSL cert).

**Vite config:** `base: '/'` (no sub-path rewriting needed).

**Pages:**
- `/login` — sets httpOnly cookies via API
- `/blog` — post list with status badges + create button
- `/blog/new` — TipTap editor, RU/EN tabs, publish controls
- `/blog/:id` — edit existing post
- `/contacts` — leads table with status management (NEW / READ / ARCHIVED)

**Auth flow:**
1. Login → `POST /auth/login` → httpOnly cookies set by API
2. All admin requests include cookies automatically (same-site config)
3. On 401 → `POST /auth/refresh` → if fails → redirect to `/login`

---

## Analytics & Funnel

### Umami (self-hosted)
General traffic: page views, referrers, devices, countries.
Uses its own dedicated `postgres-umami` database.

### Session Identity

`sessionId` = UUID v4 generated client-side on first visit, stored in `localStorage` key `_sid`. Sent with every `POST /analytics/event` call. No server-side session management needed.

### Custom Funnel Events

| Event | Trigger | Payload |
|-------|---------|---------|
| `hero_cta_click` | CTA button click | `{ cta_type: "discuss" \| "cases" }` |
| `project_view` | Project page open | `{ slug }` |
| `project_cta_click` | "Open project" click | `{ slug }` |
| `contact_form_open` | Contact form opens | — |
| `contact_submit` | Form submitted | `{ locale }` |
| `blog_post_view` | Blog post opened | `{ slug }` — standalone vanity metric, not part of primary funnel |

**Primary funnel:** `hero_cta_click` → `project_view` → `contact_form_open` → `contact_submit`

Events sent via `POST /analytics/event` (fire-and-forget, non-blocking).

---

## Infrastructure

### Docker Compose

```yaml
services:
  web:          # Next.js — :3000
  api:          # NestJS  — :3001
  admin:        # React/nginx — :3002
  postgres:     # PostgreSQL 16 — app DB (internal only)
  postgres-umami: # PostgreSQL 16 — Umami DB (internal only)
  umami:        # Umami — :3003 (depends on postgres-umami)
```

All services on a shared internal network. `postgres` and `postgres-umami` have no external ports. Dokploy (Traefik) manages routing and SSL:

| Domain | Service |
|--------|---------|
| `dmitry.dev` | web (:3000) |
| `admin.dmitry.dev` | admin (:3002) |
| `api.dmitry.dev` | api (:3001) |
| `analytics.dmitry.dev` | umami (:3003) |

### Environment Variables

```
# api
DATABASE_URL=
JWT_SECRET=
REFRESH_TOKEN_SECRET=
REVALIDATION_SECRET=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
NOTIFICATION_EMAIL=
ADMIN_EMAIL=
ADMIN_PASSWORD=

# web
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_UMAMI_ID=
REVALIDATION_SECRET=
```

---

## Out of Scope (v1)

- Blog SEO optimization (structured data, sitemaps, link building) — content infrastructure is in v1, SEO optimization is later
- A/B testing framework
- Lead magnet / auto-funnel
- Project management through admin (projects stay in static JSON)
- Multiple admin users / roles
- CMS / headless content management

---

## Success Criteria

- Site loads in < 2s (Lighthouse performance > 90)
- All sections render correctly in RU and EN
- Malformed locale redirects gracefully to default
- Contact form validates input, submits, delivers Telegram + Email notification
- Rate limiting prevents spam on public endpoints
- Blog posts created in admin appear on site after revalidation
- Funnel events recorded in DB with sessionId
- All services running via single `docker compose up`
- Admin accessible at `admin.{domain}` with httpOnly cookie auth

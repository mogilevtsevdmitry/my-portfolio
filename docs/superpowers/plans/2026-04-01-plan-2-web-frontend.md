# Next.js Web Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full Next.js 14 App Router web app — landing page, project detail pages, blog, i18n (RU/EN), design system, analytics tracking, SEO metadata, and revalidation endpoint.

**Architecture:** Next.js 14 with App Router, Server Components by default, Client Components only where browser interaction is needed (Navbar, ContactForm, analytics). Locale routing via next-intl middleware (`/ru/...`, `/en/...`). Landing page is SSR; project pages are SSG + on-demand revalidation; blog list is ISR (60s); blog posts are SSG + on-demand revalidation.

**Tech Stack:** Next.js 14, next-intl v3, Tailwind CSS, Framer Motion, clsx, uuid (sessionId), @portfolio/shared, @portfolio/i18n, @portfolio/content, Jest + @testing-library/react

**This is Plan 2 of 3:**
- Plan 1 ✅: Monorepo scaffold + packages + NestJS API + Docker Compose
- Plan 2 (this): Next.js Web app
- Plan 3: React/Vite Admin panel

**Prerequisites:** Plan 1 completed. API running at `http://localhost:3001` for e2e smoke tests.

---

## File Map

```
apps/web/
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── jest.config.ts
├── jest.setup.ts
├── Dockerfile
├── public/
│   ├── favicon.ico            # placeholder (replace with real asset)
│   ├── icon.png               # placeholder
│   ├── og-default.png         # placeholder OG image (1200×630)
│   └── projects/
│       ├── agent-orchestrator.png   # placeholder screenshots
│       ├── marketplace.png
│       ├── gineo.png
│       └── telegram-bots.png
├── src/
│   ├── middleware.ts           # next-intl locale routing
│   ├── i18n.ts                 # next-intl request config
│   ├── navigation.ts           # typed Link/useRouter wrappers
│   ├── lib/
│   │   ├── api.ts              # contact form POST to backend
│   │   ├── analytics.ts        # trackEvent() — sessionId + POST /analytics/event
│   │   └── projects.ts         # load + type project JSON from packages/content
│   ├── styles/
│   │   └── globals.css         # CSS variables + Tailwind directives
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx      # primary/outline/ghost variants
│   │   │   ├── Card.tsx        # glassmorphism card wrapper
│   │   │   ├── Badge.tsx       # tech tag pill
│   │   │   ├── Section.tsx     # section wrapper (max-width, padding)
│   │   │   └── GlowText.tsx    # gradient headline text
│   │   ├── layout/
│   │   │   ├── Navbar.tsx      # 'use client' — burger menu, lang switcher
│   │   │   └── Footer.tsx      # server component
│   │   └── sections/
│   │       ├── Hero.tsx            # server component
│   │       ├── About.tsx           # server component
│   │       ├── Values.tsx          # server component
│   │       ├── Projects.tsx        # server component — grid of ProjectCard
│   │       ├── ProjectCard.tsx     # server component
│   │       ├── TechStack.tsx       # server component
│   │       ├── AIAgents.tsx        # server component
│   │       ├── WorkProcess.tsx     # server component
│   │       └── ContactForm.tsx     # 'use client' — form state, submit, analytics
│   └── app/
│       ├── layout.tsx              # root layout — fonts
│       ├── [locale]/
│       │   ├── layout.tsx          # locale layout — NextIntlClientProvider
│       │   ├── page.tsx            # landing page (SSR) — all sections
│       │   ├── not-found.tsx       # 404 page
│       │   ├── error.tsx           # error boundary ('use client')
│       │   ├── projects/
│       │   │   └── [slug]/
│       │   │       └── page.tsx    # project detail (SSG + revalidate)
│       │   └── blog/
│       │       ├── page.tsx        # blog list (ISR revalidate: 60)
│       │       └── [slug]/
│       │           └── page.tsx    # blog post (SSG + revalidate)
│       └── api/
│           └── revalidate/
│               └── route.ts        # POST /api/revalidate — secret-protected
│   __tests__/
│   ├── lib/
│   │   ├── analytics.test.ts
│   │   └── api.test.ts
│   └── api/
│       └── revalidate.test.ts
```

---

### Task 1: Next.js App Scaffold

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/next.config.ts`
- Create: `apps/web/tailwind.config.ts`
- Create: `apps/web/postcss.config.mjs`
- Create: `apps/web/jest.config.ts`
- Create: `apps/web/jest.setup.ts`

- [ ] **Step 1: Create package.json**

```bash
mkdir -p apps/web/src/app apps/web/src/components apps/web/src/lib apps/web/src/styles apps/web/public apps/web/__tests__/lib apps/web/__tests__/api
```

`apps/web/package.json`:
```json
{
  "name": "@portfolio/web",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "next-intl": "^3.15.0",
    "@portfolio/shared": "workspace:*",
    "@portfolio/i18n": "workspace:*",
    "@portfolio/content": "workspace:*",
    "framer-motion": "^11.0.0",
    "clsx": "^2.1.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/uuid": "^9.0.0",
    "@types/jest": "^29.5.0",
    "@testing-library/react": "^15.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "autoprefixer": "^10.4.0",
    "jest": "^29.5.0",
    "jest-environment-jsdom": "^29.5.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "ts-jest": "^29.1.0",
    "typescript": "^5.4.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

`apps/web/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"],
      "@portfolio/shared": ["../../packages/shared/src/index.ts"],
      "@portfolio/i18n/*": ["../../packages/i18n/*"],
      "@portfolio/content/*": ["../../packages/content/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create next.config.ts**

```bash
pnpm add -w createNextIntlPlugin 2>/dev/null || true
```

`apps/web/next.config.ts`:
```typescript
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {
  transpilePackages: ['@portfolio/shared', '@portfolio/i18n', '@portfolio/content'],
  images: {
    remotePatterns: [],
  },
  experimental: {
    typedRoutes: false,
  },
};

export default withNextIntl(nextConfig);
```

- [ ] **Step 4: Create Tailwind config**

`apps/web/tailwind.config.ts`:
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0B1F1A',
        'bg-secondary': '#0F2A24',
        'accent': '#4ADE80',
        'text-primary': '#F0FDF4',
        'text-muted': '#86EFAC',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
```

`apps/web/postcss.config.mjs`:
```javascript
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
```

- [ ] **Step 5: Create Jest config**

`apps/web/jest.config.ts`:
```typescript
import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@portfolio/shared$': '<rootDir>/../../packages/shared/src/index.ts',
    '^@portfolio/i18n/(.*)$': '<rootDir>/../../packages/i18n/$1',
    '^@portfolio/content/(.*)$': '<rootDir>/../../packages/content/$1',
  },
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
};

export default createJestConfig(config);
```

`apps/web/jest.setup.ts`:
```typescript
import '@testing-library/jest-dom';
```

- [ ] **Step 6: Install dependencies**

```bash
cd apps/web && pnpm install
```

Expected: all packages installed, no errors.

- [ ] **Step 7: Commit**

```bash
git add apps/web/package.json apps/web/tsconfig.json apps/web/next.config.ts apps/web/tailwind.config.ts apps/web/postcss.config.mjs apps/web/jest.config.ts apps/web/jest.setup.ts
git commit -m "feat(web): scaffold Next.js app with Tailwind, next-intl, and Jest"
```

---

### Task 2: Global Styles + Design System (UI Components)

**Files:**
- Create: `apps/web/src/styles/globals.css`
- Create: `apps/web/src/components/ui/Button.tsx`
- Create: `apps/web/src/components/ui/Card.tsx`
- Create: `apps/web/src/components/ui/Badge.tsx`
- Create: `apps/web/src/components/ui/Section.tsx`
- Create: `apps/web/src/components/ui/GlowText.tsx`

- [ ] **Step 1: Create global CSS with design tokens**

`apps/web/src/styles/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-primary: #0B1F1A;
  --bg-secondary: #0F2A24;
  --bg-card: rgba(255, 255, 255, 0.04);
  --accent: #4ADE80;
  --accent-glow: rgba(74, 222, 128, 0.15);
  --text-primary: #F0FDF4;
  --text-muted: #86EFAC;
  --border: rgba(74, 222, 128, 0.12);
  --border-hover: rgba(74, 222, 128, 0.3);
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: var(--font-inter), system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: var(--bg-primary);
}
::-webkit-scrollbar-thumb {
  background: var(--border-hover);
  border-radius: 3px;
}

/* Selection */
::selection {
  background: var(--accent-glow);
  color: var(--accent);
}

@layer components {
  .glass-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-radius: 1rem;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .glass-card:hover {
    border-color: var(--border-hover);
    box-shadow: 0 0 24px var(--accent-glow);
  }

  .glow-text {
    background: linear-gradient(135deg, #F0FDF4 0%, #4ADE80 50%, #86EFAC 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .accent-glow {
    box-shadow: 0 0 20px var(--accent-glow);
  }
}

/* Grid pattern overlay for hero */
.grid-pattern {
  background-image:
    linear-gradient(rgba(74, 222, 128, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(74, 222, 128, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
}
```

- [ ] **Step 2: Create Button component**

`apps/web/src/components/ui/Button.tsx`:
```tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary: [
    'bg-accent text-bg-primary font-semibold',
    'hover:bg-opacity-90 hover:shadow-lg',
    'shadow-[0_0_20px_rgba(74,222,128,0.3)]',
    'active:scale-[0.98]',
  ].join(' '),
  outline: [
    'border border-[var(--border-hover)] text-accent',
    'hover:bg-[var(--accent-glow)]',
    'active:scale-[0.98]',
  ].join(' '),
  ghost: [
    'text-[var(--text-muted)]',
    'hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]',
  ].join(' '),
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm rounded-lg',
  md: 'px-6 py-3 text-base rounded-xl',
  lg: 'px-8 py-4 text-lg rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  ),
);

Button.displayName = 'Button';
```

- [ ] **Step 3: Create Card component**

`apps/web/src/components/ui/Card.tsx`:
```tsx
import { HTMLAttributes } from 'react';
import clsx from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

export function Card({ glow = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'glass-card p-6',
        glow && 'accent-glow',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Create Badge, Section, GlowText**

`apps/web/src/components/ui/Badge.tsx`:
```tsx
import clsx from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-block px-3 py-1 text-xs font-medium rounded-full',
        'bg-[var(--accent-glow)] text-accent border border-[var(--border)]',
        className,
      )}
    >
      {children}
    </span>
  );
}
```

`apps/web/src/components/ui/Section.tsx`:
```tsx
import clsx from 'clsx';
import { HTMLAttributes } from 'react';

interface SectionProps extends HTMLAttributes<HTMLElement> {
  alt?: boolean; // alternate background
}

export function Section({ alt = false, className, children, ...props }: SectionProps) {
  return (
    <section
      className={clsx(
        'py-16 md:py-24 px-4 md:px-8',
        alt ? 'bg-bg-secondary' : 'bg-bg-primary',
        className,
      )}
      {...props}
    >
      <div className="max-w-6xl mx-auto">
        {children}
      </div>
    </section>
  );
}
```

`apps/web/src/components/ui/GlowText.tsx`:
```tsx
import clsx from 'clsx';
import { HTMLAttributes } from 'react';

interface GlowTextProps extends HTMLAttributes<HTMLSpanElement> {
  as?: 'h1' | 'h2' | 'h3' | 'span';
}

export function GlowText({ as: Tag = 'span', className, children, ...props }: GlowTextProps) {
  return (
    <Tag
      className={clsx('glow-text', className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/styles/ apps/web/src/components/ui/
git commit -m "feat(web): add global styles and UI component library"
```

---

### Task 3: i18n Setup (next-intl)

**Files:**
- Create: `apps/web/src/middleware.ts`
- Create: `apps/web/src/i18n.ts`
- Create: `apps/web/src/navigation.ts`

- [ ] **Step 1: Create i18n request config**

`apps/web/src/i18n.ts`:
```typescript
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['ru', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'ru';

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as Locale)) notFound();

  const messages = {
    common: (await import(`@portfolio/i18n/locales/${locale}/common.json`)).default,
    hero: (await import(`@portfolio/i18n/locales/${locale}/hero.json`)).default,
    about: (await import(`@portfolio/i18n/locales/${locale}/about.json`)).default,
    values: (await import(`@portfolio/i18n/locales/${locale}/values.json`)).default,
    projects: (await import(`@portfolio/i18n/locales/${locale}/projects.json`)).default,
    tech: (await import(`@portfolio/i18n/locales/${locale}/tech.json`)).default,
    process: (await import(`@portfolio/i18n/locales/${locale}/process.json`)).default,
    contacts: (await import(`@portfolio/i18n/locales/${locale}/contacts.json`)).default,
  };

  return { messages };
});
```

- [ ] **Step 2: Create middleware for locale routing**

`apps/web/src/middleware.ts`:
```typescript
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export const config = {
  matcher: [
    '/((?!_next|_vercel|api|favicon.ico|icon.png|og-default.png|projects|.*\\..*).*)',
  ],
};
```

- [ ] **Step 3: Create typed navigation helpers**

`apps/web/src/navigation.ts`:
```typescript
import { createSharedPathnamesNavigation } from 'next-intl/navigation';
import { locales } from './i18n';

export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation({ locales });
```

- [ ] **Step 4: Verify i18n compiles**

```bash
cd apps/web && pnpm exec tsc --noEmit 2>&1 | head -20
```

Expected: no errors (or only "not found" errors for next-env.d.ts, which generates on first build).

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/middleware.ts apps/web/src/i18n.ts apps/web/src/navigation.ts
git commit -m "feat(web): configure next-intl with locale routing middleware"
```

---

### Task 4: Root Layout + Locale Layout + Navbar + Footer

**Files:**
- Create: `apps/web/src/app/layout.tsx`
- Create: `apps/web/src/app/[locale]/layout.tsx`
- Create: `apps/web/src/components/layout/Navbar.tsx`
- Create: `apps/web/src/components/layout/Footer.tsx`

- [ ] **Step 1: Create root layout (fonts)**

`apps/web/src/app/layout.tsx`:
```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { JetBrains_Mono } from 'next/font/google';
import '../styles/globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dmitry.dev'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrains.variable}`}>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Create locale layout**

`apps/web/src/app/[locale]/layout.tsx`:
```tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import type { Metadata } from 'next';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params: { locale },
}: { params: { locale: string } }): Promise<Metadata> {
  if (!locales.includes(locale as Locale)) return {};
  const t = await getTranslations({ locale, namespace: 'hero' });
  return {
    title: {
      default: `${t('name')} — ${t('title')}`,
      template: `%s | ${t('name')}`,
    },
    description: t('subtitle'),
    openGraph: {
      type: 'website',
      locale: locale === 'ru' ? 'ru_RU' : 'en_US',
      images: [{ url: '/og-default.png', width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: LocaleLayoutProps) {
  if (!locales.includes(locale as Locale)) notFound();

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Navbar locale={locale as Locale} />
      <main>{children}</main>
      <Footer />
    </NextIntlClientProvider>
  );
}
```

- [ ] **Step 3: Create Navbar**

`apps/web/src/components/layout/Navbar.tsx`:
```tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/navigation';
import clsx from 'clsx';
import type { Locale } from '@/i18n';

interface NavbarProps {
  locale: Locale;
}

export function Navbar({ locale }: NavbarProps) {
  const t = useTranslations('common');
  const currentPath = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { href: '#about', label: t('nav.about') },
    { href: '#projects', label: t('nav.projects') },
    { href: '#tech', label: t('nav.tech') },
    { href: '/blog', label: t('nav.blog') },
    { href: '#contacts', label: t('nav.contacts') },
  ] as const;

  const switchLocale = () => {
    router.replace(currentPath, { locale: locale === 'ru' ? 'en' : 'ru' });
  };

  return (
    <nav
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-[var(--bg-primary)]/90 backdrop-blur-md border-b border-[var(--border)]'
          : 'bg-transparent',
      )}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-accent font-bold text-lg tracking-tight hover:opacity-80 transition-opacity">
          DM
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              {label}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Language switcher */}
          <button
            onClick={switchLocale}
            className="text-sm text-[var(--text-muted)] hover:text-accent transition-colors px-2 py-1 rounded border border-[var(--border)] hover:border-[var(--border-hover)]"
            aria-label="Switch language"
          >
            {locale === 'ru' ? 'EN' : 'RU'}
          </button>

          {/* Burger (mobile) */}
          <button
            className="md:hidden p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <span className="sr-only">Menu</span>
            <div className="w-5 flex flex-col gap-1">
              <span className={clsx('h-0.5 bg-current transition-all', open && 'rotate-45 translate-y-1.5')} />
              <span className={clsx('h-0.5 bg-current transition-all', open && 'opacity-0')} />
              <span className={clsx('h-0.5 bg-current transition-all', open && '-rotate-45 -translate-y-1.5')} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[var(--bg-secondary)] border-b border-[var(--border)] px-4 py-4 flex flex-col gap-4">
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors py-2"
            >
              {label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
```

- [ ] **Step 4: Create Footer**

`apps/web/src/components/layout/Footer.tsx`:
```tsx
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="py-8 px-4 md:px-8 border-t border-[var(--border)]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-[var(--text-muted)]">
          © {year} Dmitry Mogilevtsev
        </p>
        <div className="flex items-center gap-6 text-sm text-[var(--text-muted)]">
          <a
            href="https://t.me/your_handle"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-colors"
          >
            Telegram
          </a>
          <a
            href="mailto:hello@dmitry.dev"
            className="hover:text-accent transition-colors"
          >
            Email
          </a>
          <a
            href="https://github.com/your-handle"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/ apps/web/src/components/layout/
git commit -m "feat(web): add root/locale layouts, Navbar, and Footer"
```

---

### Task 5: Landing Page Sections — Hero, About, Values

**Files:**
- Create: `apps/web/src/components/sections/Hero.tsx`
- Create: `apps/web/src/components/sections/About.tsx`
- Create: `apps/web/src/components/sections/Values.tsx`

- [ ] **Step 1: Create Hero section**

`apps/web/src/components/sections/Hero.tsx`:
```tsx
import { useTranslations } from 'next-intl';
import { GlowText } from '@/components/ui/GlowText';
import { Button } from '@/components/ui/Button';

export function Hero() {
  const t = useTranslations('hero');
  const tc = useTranslations('common');

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center px-4 md:px-8 grid-pattern overflow-hidden"
    >
      {/* Gradient orb */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(74,222,128,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Name */}
        <p className="text-accent text-sm font-medium tracking-widest uppercase mb-4">
          {t('name')}
        </p>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
          <GlowText>{t('title')}</GlowText>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
          {t('subtitle')}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#contacts">
            <Button
              size="lg"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(
                    new CustomEvent('track', {
                      detail: { event: 'hero_cta_click', payload: { cta_type: 'discuss' } },
                    }),
                  );
                }
              }}
            >
              {t('cta.discuss')}
            </Button>
          </a>
          <a href="#projects">
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(
                    new CustomEvent('track', {
                      detail: { event: 'hero_cta_click', payload: { cta_type: 'cases' } },
                    }),
                  );
                }
              }}
            >
              {t('cta.cases')}
            </Button>
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="mt-20 flex justify-center">
          <div className="w-6 h-10 border-2 border-[var(--border)] rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-accent rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create About section**

`apps/web/src/components/sections/About.tsx`:
```tsx
import { useTranslations } from 'next-intl';
import { Section } from '@/components/ui/Section';
import { GlowText } from '@/components/ui/GlowText';

export function About() {
  const t = useTranslations('about');
  const theses = t.raw('theses') as string[];

  return (
    <Section id="about">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <GlowText as="h2" className="text-3xl md:text-4xl font-bold mb-6">
            {t('title')}
          </GlowText>
          <ul className="space-y-4">
            {theses.map((thesis, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                <span className="text-[var(--text-muted)] leading-relaxed">{thesis}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Stats / visual side */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { num: '5+', label: 'лет опыта' },
            { num: '20+', label: 'проектов' },
            { num: '10+', label: 'AI-агентов' },
            { num: '60%', label: 'экономия затрат' },
          ].map(({ num, label }) => (
            <div
              key={label}
              className="glass-card p-6 text-center"
            >
              <div className="text-3xl font-bold text-accent mb-1">{num}</div>
              <div className="text-sm text-[var(--text-muted)]">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
```

- [ ] **Step 3: Create Values section**

`apps/web/src/components/sections/Values.tsx`:
```tsx
import { useTranslations } from 'next-intl';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { GlowText } from '@/components/ui/GlowText';

const icons: Record<string, string> = {
  ai: '🤖',
  saas: '🏗️',
  devops: '⚙️',
  consulting: '🔍',
};

export function Values() {
  const t = useTranslations('values');
  const cards = t.raw('cards') as Array<{
    key: string;
    title: string;
    problem: string;
    solution: string;
    result: string;
  }>;

  return (
    <Section id="values" alt>
      <GlowText as="h2" className="text-3xl md:text-4xl font-bold text-center mb-12">
        {t('title')}
      </GlowText>

      <div className="grid md:grid-cols-2 gap-6">
        {cards.map((card) => (
          <Card key={card.key}>
            <div className="text-3xl mb-4">{icons[card.key] ?? '✦'}</div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              {card.title}
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex gap-2">
                <span className="text-red-400 font-medium shrink-0">→</span>
                <span className="text-[var(--text-muted)]">{card.problem}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-accent font-medium shrink-0">✓</span>
                <span className="text-[var(--text-muted)]">{card.solution}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-accent font-bold shrink-0">⚡</span>
                <span className="text-accent font-medium">{card.result}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/sections/Hero.tsx apps/web/src/components/sections/About.tsx apps/web/src/components/sections/Values.tsx
git commit -m "feat(web): add Hero, About, Values landing sections"
```

---

### Task 6: Projects Section + Project Detail Page

**Files:**
- Create: `apps/web/src/lib/projects.ts`
- Create: `apps/web/src/components/sections/ProjectCard.tsx`
- Create: `apps/web/src/components/sections/Projects.tsx`
- Create: `apps/web/src/app/[locale]/projects/[slug]/page.tsx`

- [ ] **Step 1: Create projects lib**

`apps/web/src/lib/projects.ts`:
```typescript
import type { Project } from '@portfolio/content/src/types';

// Static imports for all projects (SSG-friendly)
import agentOrchestrator from '@portfolio/content/projects/agent-orchestrator.json';
import marketplace from '@portfolio/content/projects/marketplace.json';
import gineo from '@portfolio/content/projects/gineo.json';
import telegramBots from '@portfolio/content/projects/telegram-bots.json';

export const allProjects: Project[] = [
  agentOrchestrator as Project,
  marketplace as Project,
  gineo as Project,
  telegramBots as Project,
];

export function getProjectBySlug(slug: string): Project | undefined {
  return allProjects.find((p) => p.slug === slug);
}
```

- [ ] **Step 2: Create ProjectCard component**

`apps/web/src/components/sections/ProjectCard.tsx`:
```tsx
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import type { Project } from '@portfolio/content/src/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Link } from '@/navigation';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const t = useTranslations('projects');
  const locale = useLocale() as 'ru' | 'en';
  const content = project[locale];

  return (
    <Card className="flex flex-col h-full">
      {/* Preview image */}
      <div className="relative w-full h-44 rounded-lg overflow-hidden mb-4 bg-[var(--bg-secondary)]">
        <Image
          src={project.previewImage}
          alt={content.title}
          fill
          className="object-cover"
          onError={() => {}}
        />
      </div>

      {/* Title + description */}
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
        {content.title}
      </h3>
      <p className="text-sm text-[var(--text-muted)] mb-4 flex-1">
        {content.shortDescription}
      </p>

      {/* Technologies */}
      <div className="flex flex-wrap gap-2 mb-5">
        {project.technologies.slice(0, 4).map((tech) => (
          <Badge key={tech}>{tech}</Badge>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link href={`/projects/${project.slug}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            {t('details')}
          </Button>
        </Link>
        {project.link && (
          <a href={project.link} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button size="sm" className="w-full">{t('openProject')}</Button>
          </a>
        )}
      </div>
    </Card>
  );
}
```

- [ ] **Step 3: Create Projects section**

`apps/web/src/components/sections/Projects.tsx`:
```tsx
import { useTranslations } from 'next-intl';
import { Section } from '@/components/ui/Section';
import { GlowText } from '@/components/ui/GlowText';
import { ProjectCard } from './ProjectCard';
import { allProjects } from '@/lib/projects';

export function Projects() {
  const t = useTranslations('projects');

  return (
    <Section id="projects">
      <div className="text-center mb-12">
        <GlowText as="h2" className="text-3xl md:text-4xl font-bold mb-4">
          {t('title')}
        </GlowText>
        <p className="text-[var(--text-muted)]">{t('subtitle')}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {allProjects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 4: Create project detail page**

`apps/web/src/app/[locale]/projects/[slug]/page.tsx`:
```tsx
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { allProjects, getProjectBySlug } from '@/lib/projects';
import { Badge } from '@/components/ui/Badge';
import { Section } from '@/components/ui/Section';
import { GlowText } from '@/components/ui/GlowText';
import { Link } from '@/navigation';
import { locales, type Locale } from '@/i18n';

interface Props {
  params: { locale: string; slug: string };
}

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    allProjects.map((p) => ({ locale, slug: p.slug })),
  );
}

export const revalidate = false; // on-demand revalidation only

export async function generateMetadata({ params: { locale, slug } }: Props): Promise<Metadata> {
  const project = getProjectBySlug(slug);
  if (!project) return {};
  const content = project[locale as Locale] ?? project.ru;
  return {
    title: content.title,
    description: content.shortDescription,
    openGraph: {
      title: content.title,
      description: content.shortDescription,
      images: [{ url: project.previewImage }],
    },
  };
}

export default async function ProjectPage({ params: { locale, slug } }: Props) {
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const content = project[locale as Locale] ?? project.ru;
  const t = await getTranslations({ locale, namespace: 'projects' });

  const sections = [
    { key: 'description', label: t('sections.description'), content: content.description },
    { key: 'problem', label: t('sections.problem'), content: content.problem },
    { key: 'solution', label: t('sections.solution'), content: content.solution },
    { key: 'result', label: t('sections.result'), content: content.result },
    { key: 'ai', label: t('sections.ai'), content: content.aiUsage },
  ];

  return (
    <Section className="pt-24">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-accent transition-colors mb-8 text-sm"
      >
        ← Назад
      </Link>

      <GlowText as="h1" className="text-3xl md:text-5xl font-bold mb-4">
        {content.title}
      </GlowText>
      <p className="text-[var(--text-muted)] text-lg mb-8">{content.shortDescription}</p>

      {/* Technologies */}
      <div className="flex flex-wrap gap-2 mb-12">
        {project.technologies.map((tech) => (
          <Badge key={tech}>{tech}</Badge>
        ))}
      </div>

      {/* Case sections */}
      <div className="space-y-8">
        {sections.map(({ key, label, content: text }) => (
          <div key={key} className="glass-card p-6">
            <h2 className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
              {label}
            </h2>
            <p className="text-[var(--text-muted)] leading-relaxed">{text}</p>
          </div>
        ))}
      </div>

      {project.link && (
        <div className="mt-10">
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-accent hover:underline font-medium"
          >
            🔗 {t('openProject')} →
          </a>
        </div>
      )}
    </Section>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/projects.ts apps/web/src/components/sections/ProjectCard.tsx apps/web/src/components/sections/Projects.tsx apps/web/src/app/
git commit -m "feat(web): add Projects section, ProjectCard, and project detail page (SSG)"
```

---

### Task 7: TechStack, AIAgents, WorkProcess Sections

**Files:**
- Create: `apps/web/src/components/sections/TechStack.tsx`
- Create: `apps/web/src/components/sections/AIAgents.tsx`
- Create: `apps/web/src/components/sections/WorkProcess.tsx`

- [ ] **Step 1: Create TechStack section**

`apps/web/src/components/sections/TechStack.tsx`:
```tsx
import { useTranslations } from 'next-intl';
import { Section } from '@/components/ui/Section';
import { GlowText } from '@/components/ui/GlowText';
import { Badge } from '@/components/ui/Badge';

const techGroups = {
  backend: ['NestJS', 'PostgreSQL', 'Prisma', 'Redis', 'GraphQL'],
  architecture: ['DDD', 'Clean Architecture', 'Event-driven', 'Microservices', 'CQRS'],
  infrastructure: ['Docker', 'Kubernetes', 'CI/CD', 'Nginx', 'Terraform'],
  ai: ['LLM', 'Multi-agent systems', 'Orchestration', 'RAG', 'Tool use'],
} as const;

export function TechStack() {
  const t = useTranslations('tech');

  return (
    <Section id="tech" alt>
      <div className="text-center mb-12">
        <GlowText as="h2" className="text-3xl md:text-4xl font-bold mb-4">
          {t('title')}
        </GlowText>
        <p className="text-[var(--text-muted)]">{t('subtitle')}</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(Object.keys(techGroups) as Array<keyof typeof techGroups>).map((group) => (
          <div key={group} className="glass-card p-5">
            <h3 className="text-sm font-semibold text-accent uppercase tracking-wider mb-4">
              {t(`groups.${group}`)}
            </h3>
            <div className="flex flex-wrap gap-2">
              {techGroups[group].map((tech) => (
                <Badge key={tech}>{tech}</Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 2: Create AIAgents section**

`apps/web/src/components/sections/AIAgents.tsx`:
```tsx
import { useTranslations } from 'next-intl';
import { Section } from '@/components/ui/Section';
import { GlowText } from '@/components/ui/GlowText';
import { Card } from '@/components/ui/Card';

const capabilities = [
  { icon: '🧠', key: 'llm', title: 'LLM интеграция', desc: 'GPT-4, Claude, Gemini — выбираю модель под задачу' },
  { icon: '🔄', key: 'pipeline', title: 'AI пайплайны', desc: 'Многошаговые процессы с ветвлением и условиями' },
  { icon: '🤝', key: 'multi', title: 'Мульти-агентные системы', desc: 'Оркестрация команд агентов для сложных задач' },
  { icon: '🔌', key: 'rag', title: 'RAG и базы знаний', desc: 'Векторный поиск + контекстная память агентов' },
  { icon: '⚡', key: 'automation', title: 'Process automation', desc: 'Замена ручных процессов на AI-воркфлоу' },
  { icon: '📊', key: 'monitor', title: 'Мониторинг агентов', desc: 'Трекинг решений, затрат и качества ответов' },
];

export function AIAgents() {
  const t = useTranslations('common');

  return (
    <Section id="ai">
      <div className="text-center mb-12">
        <GlowText as="h2" className="text-3xl md:text-4xl font-bold mb-4">
          AI-агенты и автоматизация
        </GlowText>
        <p className="text-[var(--text-muted)] max-w-2xl mx-auto">
          Создаю системы, где AI не просто отвечает на вопросы — а выполняет работу
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {capabilities.map(({ icon, key, title, desc }) => (
          <Card key={key}>
            <div className="text-2xl mb-3">{icon}</div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
            <p className="text-sm text-[var(--text-muted)]">{desc}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 3: Create WorkProcess section**

`apps/web/src/components/sections/WorkProcess.tsx`:
```tsx
import { useTranslations } from 'next-intl';
import { Section } from '@/components/ui/Section';
import { GlowText } from '@/components/ui/GlowText';

export function WorkProcess() {
  const t = useTranslations('process');
  const steps = t.raw('steps') as Array<{
    number: string;
    title: string;
    description: string;
  }>;

  return (
    <Section id="process" alt>
      <GlowText as="h2" className="text-3xl md:text-4xl font-bold text-center mb-12">
        {t('title')}
      </GlowText>

      <div className="relative">
        {/* Vertical line (desktop) */}
        <div className="hidden md:block absolute left-[calc(50%-1px)] top-0 bottom-0 w-0.5 bg-[var(--border)]" />

        <div className="space-y-8">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className={`relative flex flex-col md:flex-row items-start md:items-center gap-6 ${
                i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              {/* Content */}
              <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                <div className="glass-card p-5 inline-block w-full md:max-w-sm">
                  <h3 className="font-semibold text-[var(--text-primary)] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)]">{step.description}</p>
                </div>
              </div>

              {/* Number bubble */}
              <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full bg-[var(--bg-secondary)] border-2 border-accent flex items-center justify-center font-bold text-accent text-sm">
                {step.number}
              </div>

              {/* Empty spacer on other side */}
              <div className="flex-1 hidden md:block" />
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/sections/TechStack.tsx apps/web/src/components/sections/AIAgents.tsx apps/web/src/components/sections/WorkProcess.tsx
git commit -m "feat(web): add TechStack, AIAgents, WorkProcess sections"
```

---

### Task 8: Contact Form + Analytics Client

**Files:**
- Create: `apps/web/src/lib/api.ts`
- Create: `apps/web/src/lib/analytics.ts`
- Create: `apps/web/src/components/sections/ContactForm.tsx`
- Create: `apps/web/__tests__/lib/api.test.ts`
- Create: `apps/web/__tests__/lib/analytics.test.ts`

- [ ] **Step 1: Write failing test for api.ts**

`apps/web/__tests__/lib/api.test.ts`:
```typescript
import { submitContact } from '@/lib/api';

global.fetch = jest.fn();

describe('submitContact', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockReset();
  });

  it('should POST to /contacts with correct payload', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

    await submitContact({
      name: 'Test User',
      contact: 'test@example.com',
      description: 'Hello from tests',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/contacts'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          contact: 'test@example.com',
          description: 'Hello from tests',
        }),
      }),
    );
  });

  it('should throw on non-ok response', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 400 });

    await expect(
      submitContact({ name: 'A', contact: 'b@c.com', description: 'test' }),
    ).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run test to see it fail**

```bash
cd apps/web && pnpm test __tests__/lib/api.test.ts
```

Expected: FAIL — `submitContact` not found.

- [ ] **Step 3: Implement api.ts**

`apps/web/src/lib/api.ts`:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface ContactPayload {
  name: string;
  contact: string;
  description: string;
}

export async function submitContact(payload: ContactPayload): Promise<void> {
  const res = await fetch(`${API_URL}/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'omit',
  });

  if (!res.ok) {
    throw new Error(`Contact submission failed: ${res.status}`);
  }
}
```

- [ ] **Step 4: Run api test to verify it passes**

```bash
cd apps/web && pnpm test __tests__/lib/api.test.ts
```

Expected: PASS (2 tests).

- [ ] **Step 5: Write failing test for analytics.ts**

`apps/web/__tests__/lib/analytics.test.ts`:
```typescript
import { trackEvent, getSessionId } from '@/lib/analytics';

const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    clear: jest.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('analytics', () => {
  beforeEach(() => {
    mockFetch.mockReset().mockResolvedValue({ ok: true });
    localStorageMock.clear();
  });

  describe('getSessionId', () => {
    it('should create and persist a UUID on first call', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);

      const id1 = getSessionId();
      const id2 = getSessionId();

      expect(id1).toBeDefined();
      expect(typeof id1).toBe('string');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('_sid', id1);
    });

    it('should return existing sessionId from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('existing-session-id');

      const id = getSessionId();
      expect(id).toBe('existing-session-id');
    });
  });

  describe('trackEvent', () => {
    it('should POST to /analytics/event with event and sessionId', async () => {
      localStorageMock.getItem.mockReturnValue('test-session');

      await trackEvent('hero_cta_click', { cta_type: 'discuss' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/analytics/event'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            event: 'hero_cta_click',
            payload: { cta_type: 'discuss' },
            sessionId: 'test-session',
          }),
        }),
      );
    });

    it('should not throw if fetch fails (fire-and-forget)', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(
        trackEvent('hero_cta_click'),
      ).resolves.not.toThrow();
    });
  });
});
```

- [ ] **Step 6: Run analytics test to see it fail**

```bash
cd apps/web && pnpm test __tests__/lib/analytics.test.ts
```

Expected: FAIL — `trackEvent` not found.

- [ ] **Step 7: Implement analytics.ts**

`apps/web/src/lib/analytics.ts`:
```typescript
import { v4 as uuidv4 } from 'uuid';
import type { FunnelEvent } from '@portfolio/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const SESSION_KEY = '_sid';

export function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) return existing;

  const id = uuidv4();
  localStorage.setItem(SESSION_KEY, id);
  return id;
}

export async function trackEvent(
  event: FunnelEvent,
  payload?: Record<string, string>,
): Promise<void> {
  try {
    const sessionId = getSessionId();
    await fetch(`${API_URL}/analytics/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, payload, sessionId }),
    });
  } catch {
    // Fire-and-forget: never throw
  }
}

// Listen for custom DOM events dispatched from server components via Hero CTAs
if (typeof window !== 'undefined') {
  window.addEventListener('track', ((e: CustomEvent) => {
    trackEvent(e.detail.event, e.detail.payload);
  }) as EventListener);
}
```

- [ ] **Step 8: Run analytics test to verify it passes**

```bash
cd apps/web && pnpm test __tests__/lib/analytics.test.ts
```

Expected: PASS.

- [ ] **Step 9: Create ContactForm**

`apps/web/src/components/sections/ContactForm.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { GlowText } from '@/components/ui/GlowText';
import { submitContact } from '@/lib/api';
import { trackEvent } from '@/lib/analytics';

type Status = 'idle' | 'loading' | 'success' | 'error';

export function ContactForm() {
  const t = useTranslations('contacts');
  const [status, setStatus] = useState<Status>('idle');
  const [form, setForm] = useState({ name: '', contact: '', description: '' });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFocus = () => {
    if (status === 'idle') {
      trackEvent('contact_form_open');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      await submitContact(form);
      trackEvent('contact_submit');
      setStatus('success');
      setForm({ name: '', contact: '', description: '' });
    } catch {
      setStatus('error');
    }
  };

  const inputClass = [
    'w-full px-4 py-3 rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50',
    'bg-[var(--bg-card)] border border-[var(--border)]',
    'focus:outline-none focus:border-[var(--border-hover)] focus:shadow-[0_0_0_3px_var(--accent-glow)]',
    'transition-all duration-200',
  ].join(' ');

  return (
    <Section id="contacts">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <GlowText as="h2" className="text-3xl md:text-4xl font-bold mb-4">
            {t('title')}
          </GlowText>
          <p className="text-[var(--text-muted)]">{t('subtitle')}</p>
        </div>

        {status === 'success' ? (
          <div className="glass-card p-8 text-center">
            <div className="text-4xl mb-4">✅</div>
            <p className="text-accent font-medium">{t('form.success')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5">
            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-2">
                {t('form.name')}
              </label>
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                onFocus={handleFocus}
                placeholder={t('form.namePlaceholder')}
                required
                minLength={2}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-2">
                {t('form.contact')}
              </label>
              <input
                name="contact"
                type="text"
                value={form.contact}
                onChange={handleChange}
                placeholder={t('form.contactPlaceholder')}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-2">
                {t('form.description')}
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder={t('form.descriptionPlaceholder')}
                required
                minLength={10}
                rows={5}
                className={`${inputClass} resize-none`}
              />
            </div>

            {status === 'error' && (
              <p className="text-red-400 text-sm">{t('form.error')}</p>
            )}

            <Button
              type="submit"
              size="lg"
              loading={status === 'loading'}
              className="w-full"
            >
              {t('form.submit')}
            </Button>
          </form>
        )}

        {/* Direct contact links */}
        <div className="mt-6 text-center">
          <p className="text-[var(--text-muted)] text-sm mb-3">{t('or')}</p>
          <div className="flex justify-center gap-6">
            <a
              href="https://t.me/your_handle"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline font-medium"
            >
              {t('telegram')}
            </a>
            <a
              href="mailto:hello@dmitry.dev"
              className="text-accent hover:underline font-medium"
            >
              {t('email')}
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}
```

- [ ] **Step 10: Commit**

```bash
git add apps/web/src/lib/ apps/web/src/components/sections/ContactForm.tsx apps/web/__tests__/
git commit -m "feat(web): add contact form, api client, and analytics tracking with tests"
```

---

### Task 9: Landing Page + Blog Pages

**Files:**
- Create: `apps/web/src/app/[locale]/page.tsx`
- Create: `apps/web/src/app/[locale]/blog/page.tsx`
- Create: `apps/web/src/app/[locale]/blog/[slug]/page.tsx`
- Create: `apps/web/src/app/[locale]/not-found.tsx`
- Create: `apps/web/src/app/[locale]/error.tsx`

- [ ] **Step 1: Create landing page**

`apps/web/src/app/[locale]/page.tsx`:
```tsx
import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { Values } from '@/components/sections/Values';
import { Projects } from '@/components/sections/Projects';
import { TechStack } from '@/components/sections/TechStack';
import { AIAgents } from '@/components/sections/AIAgents';
import { WorkProcess } from '@/components/sections/WorkProcess';
import { ContactForm } from '@/components/sections/ContactForm';

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Values />
      <Projects />
      <TechStack />
      <AIAgents />
      <WorkProcess />
      <ContactForm />
    </>
  );
}
```

- [ ] **Step 2: Create 404 and error pages**

`apps/web/src/app/[locale]/not-found.tsx`:
```tsx
import { Link } from '@/navigation';
import { Section } from '@/components/ui/Section';
import { GlowText } from '@/components/ui/GlowText';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <Section className="min-h-screen flex items-center justify-center text-center">
      <div>
        <GlowText as="h1" className="text-8xl font-bold mb-4">404</GlowText>
        <p className="text-[var(--text-muted)] mb-8">Страница не найдена</p>
        <Link href="/">
          <Button>На главную</Button>
        </Link>
      </div>
    </Section>
  );
}
```

`apps/web/src/app/[locale]/error.tsx`:
```tsx
'use client';

import { Button } from '@/components/ui/Button';
import { Section } from '@/components/ui/Section';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <Section className="min-h-screen flex items-center justify-center text-center">
      <div>
        <h1 className="text-4xl font-bold text-red-400 mb-4">Что-то пошло не так</h1>
        <p className="text-[var(--text-muted)] mb-8">{error.message}</p>
        <Button onClick={reset}>Попробовать снова</Button>
      </div>
    </Section>
  );
}
```

- [ ] **Step 3: Create blog list page (ISR)**

`apps/web/src/app/[locale]/blog/page.tsx`:
```tsx
import { getTranslations } from 'next-intl/server';
import { Section } from '@/components/ui/Section';
import { GlowText } from '@/components/ui/GlowText';
import { Card } from '@/components/ui/Card';
import { Link } from '@/navigation';
import type { Metadata } from 'next';
import type { Locale } from '@/i18n';

export const revalidate = 60;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface BlogPost {
  id: string;
  slug: string;
  publishedAt: string | null;
  translations: Array<{
    locale: string;
    title: string;
    excerpt: string;
  }>;
}

async function fetchPosts(locale: string): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${API_URL}/blog?locale=${locale}&limit=20`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params: { locale },
}: { params: { locale: string } }): Promise<Metadata> {
  return {
    title: locale === 'ru' ? 'Блог' : 'Blog',
    description: locale === 'ru' ? 'Статьи об AI и архитектуре систем' : 'Articles about AI and system architecture',
  };
}

export default async function BlogListPage({
  params: { locale },
}: { params: { locale: string } }) {
  const posts = await fetchPosts(locale);

  return (
    <Section className="pt-24">
      <GlowText as="h1" className="text-3xl md:text-5xl font-bold mb-12">
        {locale === 'ru' ? 'Блог' : 'Blog'}
      </GlowText>

      {posts.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-[var(--text-muted)]">
            {locale === 'ru' ? 'Скоро здесь появятся статьи' : 'Articles coming soon'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => {
            const translation = post.translations[0];
            if (!translation) return null;
            return (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="hover:border-accent transition-colors cursor-pointer">
                  <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                    {translation.title}
                  </h2>
                  <p className="text-[var(--text-muted)] text-sm mb-3">
                    {translation.excerpt}
                  </p>
                  {post.publishedAt && (
                    <time className="text-xs text-[var(--text-muted)]/60">
                      {new Date(post.publishedAt).toLocaleDateString(
                        locale === 'ru' ? 'ru-RU' : 'en-US',
                        { year: 'numeric', month: 'long', day: 'numeric' },
                      )}
                    </time>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </Section>
  );
}
```

- [ ] **Step 4: Create blog post page (SSG + on-demand revalidation)**

`apps/web/src/app/[locale]/blog/[slug]/page.tsx`:
```tsx
import { notFound } from 'next/navigation';
import { Section } from '@/components/ui/Section';
import { GlowText } from '@/components/ui/GlowText';
import { Link } from '@/navigation';
import type { Metadata } from 'next';
import { BlogAnalytics } from './BlogAnalytics';

export const revalidate = false; // on-demand only

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface BlogPost {
  id: string;
  slug: string;
  publishedAt: string | null;
  translations: Array<{
    locale: string;
    title: string;
    excerpt: string;
    content: unknown;
    updatedAt: string;
  }>;
}

async function fetchPost(slug: string, locale: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API_URL}/blog/${slug}?locale=${locale}`, {
      next: { revalidate: false },
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params: { locale, slug },
}: { params: { locale: string; slug: string } }): Promise<Metadata> {
  const post = await fetchPost(slug, locale);
  if (!post) return {};
  const t = post.translations[0];
  return {
    title: t?.title,
    description: t?.excerpt,
  };
}

export default async function BlogPostPage({
  params: { locale, slug },
}: { params: { locale: string; slug: string } }) {
  const post = await fetchPost(slug, locale);
  if (!post) notFound();

  const translation = post.translations[0];
  if (!translation) notFound();

  return (
    <>
      <BlogAnalytics slug={slug} />
      <Section className="pt-24 max-w-3xl">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-accent transition-colors mb-8 text-sm"
        >
          ← {locale === 'ru' ? 'Назад к блогу' : 'Back to blog'}
        </Link>

        <GlowText as="h1" className="text-3xl md:text-5xl font-bold mb-4">
          {translation.title}
        </GlowText>

        {post.publishedAt && (
          <time className="block text-[var(--text-muted)] text-sm mb-8">
            {new Date(post.publishedAt).toLocaleDateString(
              locale === 'ru' ? 'ru-RU' : 'en-US',
              { year: 'numeric', month: 'long', day: 'numeric' },
            )}
          </time>
        )}

        <div className="glass-card p-6 prose prose-invert max-w-none">
          <p className="text-[var(--text-muted)] leading-relaxed">
            {/* TipTap JSON rendering — basic text extraction for now */}
            {renderContent(translation.content)}
          </p>
        </div>
      </Section>
    </>
  );
}

// Basic TipTap JSON → text extraction (full renderer in Plan 3 admin)
function renderContent(content: unknown): string {
  if (typeof content === 'string') return content;
  if (typeof content !== 'object' || !content) return '';

  const node = content as { type?: string; text?: string; content?: unknown[] };
  if (node.text) return node.text;
  if (node.content) {
    return node.content.map(renderContent).join('\n');
  }
  return '';
}
```

Create the client analytics component for blog post views:

`apps/web/src/app/[locale]/blog/[slug]/BlogAnalytics.tsx`:
```tsx
'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

export function BlogAnalytics({ slug }: { slug: string }) {
  useEffect(() => {
    trackEvent('blog_post_view', { slug });
  }, [slug]);

  return null;
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/
git commit -m "feat(web): add landing page, blog pages (ISR + SSG), 404/error pages"
```

---

### Task 10: Revalidation API Route

**Files:**
- Create: `apps/web/src/app/api/revalidate/route.ts`
- Create: `apps/web/__tests__/api/revalidate.test.ts`

- [ ] **Step 1: Write failing test**

`apps/web/__tests__/api/revalidate.test.ts`:
```typescript
// Mock next/cache before imports
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

import { POST } from '@/app/api/revalidate/route';
import { revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';

describe('POST /api/revalidate', () => {
  const SECRET = 'test_revalidation_secret';

  beforeEach(() => {
    process.env.REVALIDATION_SECRET = SECRET;
    (revalidatePath as jest.Mock).mockReset();
  });

  it('should revalidate path on valid secret', async () => {
    const req = new NextRequest(
      `http://localhost:3000/api/revalidate?secret=${SECRET}&path=/blog/my-post`,
      { method: 'POST' },
    );

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.revalidated).toBe(true);
    expect(revalidatePath).toHaveBeenCalledWith('/blog/my-post');
  });

  it('should return 401 on wrong secret', async () => {
    const req = new NextRequest(
      'http://localhost:3000/api/revalidate?secret=wrong&path=/blog/test',
      { method: 'POST' },
    );

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('should return 400 when path is missing', async () => {
    const req = new NextRequest(
      `http://localhost:3000/api/revalidate?secret=${SECRET}`,
      { method: 'POST' },
    );

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 2: Run test to see it fail**

```bash
cd apps/web && pnpm test __tests__/api/revalidate.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement revalidation route**

`apps/web/src/app/api/revalidate/route.ts`:
```typescript
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  const path = req.nextUrl.searchParams.get('path');

  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!path) {
    return NextResponse.json({ error: 'Missing path' }, { status: 400 });
  }

  revalidatePath(path);

  return NextResponse.json({ revalidated: true, path, now: Date.now() });
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd apps/web && pnpm test __tests__/api/revalidate.test.ts
```

Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/api/ apps/web/__tests__/api/
git commit -m "feat(web): add revalidation API route with secret protection and tests"
```

---

### Task 11: SEO Metadata + OG Images

**Files:**
- Create: `apps/web/src/app/[locale]/projects/[slug]/opengraph-image.tsx`
- Create: `apps/web/public/og-default.png` (placeholder)
- Create: `apps/web/public/favicon.ico` (placeholder)

- [ ] **Step 1: Create placeholder public assets**

```bash
# Create placeholder images (1x1 PNG encoded in base64 is enough for CI)
# In production, replace with real assets

# Create a minimal 1x1 pixel PNG as placeholder
node -e "
const fs = require('fs');
const path = require('path');
// 1x1 transparent PNG
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
['apps/web/public/favicon.ico', 'apps/web/public/icon.png', 'apps/web/public/og-default.png'].forEach(p => {
  if (!fs.existsSync(p)) fs.writeFileSync(p, png);
});
['apps/web/public/projects/agent-orchestrator.png', 'apps/web/public/projects/marketplace.png', 'apps/web/public/projects/gineo.png', 'apps/web/public/projects/telegram-bots.png'].forEach(p => {
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(p)) fs.writeFileSync(p, png);
});
console.log('Placeholder images created');
"
```

- [ ] **Step 2: Create dynamic OG image for project pages**

`apps/web/src/app/[locale]/projects/[slug]/opengraph-image.tsx`:
```tsx
import { ImageResponse } from 'next/og';
import { getProjectBySlug } from '@/lib/projects';

export const runtime = 'edge';
export const alt = 'Project';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  const project = getProjectBySlug(slug);
  const content = project?.[locale as 'ru' | 'en'] ?? project?.ru;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px',
          background: 'linear-gradient(135deg, #0B1F1A 0%, #0F2A24 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ color: '#4ADE80', fontSize: 18, marginBottom: 20 }}>
          Dmitry Mogilevtsev
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: '#F0FDF4',
            lineHeight: 1.1,
            marginBottom: 20,
          }}
        >
          {content?.title ?? slug}
        </div>
        <div style={{ fontSize: 22, color: '#86EFAC', maxWidth: 700 }}>
          {content?.shortDescription ?? ''}
        </div>
        {project?.technologies && (
          <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
            {project.technologies.slice(0, 5).map((tech) => (
              <span
                key={tech}
                style={{
                  padding: '6px 14px',
                  background: 'rgba(74,222,128,0.15)',
                  border: '1px solid rgba(74,222,128,0.3)',
                  borderRadius: 20,
                  color: '#4ADE80',
                  fontSize: 14,
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>
    ),
    size,
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/public/ apps/web/src/app/[locale]/projects/
git commit -m "feat(web): add placeholder public assets and dynamic OG image for projects"
```

---

### Task 12: Dockerfile + Docker Compose Integration + Smoke Test

**Files:**
- Create: `apps/web/Dockerfile`
- Modify: `docker-compose.yml` (uncomment web service)

- [ ] **Step 1: Create web Dockerfile**

`apps/web/Dockerfile`:
```dockerfile
FROM node:20-alpine AS base
RUN npm install -g pnpm

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
COPY packages/i18n/package.json ./packages/i18n/
COPY packages/content/package.json ./packages/content/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN cd apps/web && pnpm exec next build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
```

Add `output: 'standalone'` to `next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@portfolio/shared', '@portfolio/i18n', '@portfolio/content'],
  // ... rest
};
```

- [ ] **Step 2: Uncomment web service in docker-compose.yml**

In `docker-compose.yml`, uncomment and update the web service:
```yaml
  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:-http://api:3001}
      NEXT_PUBLIC_UMAMI_ID: ${NEXT_PUBLIC_UMAMI_ID:-}
      REVALIDATION_SECRET: ${REVALIDATION_SECRET}
    depends_on:
      - api
    ports:
      - "3000:3000"
    networks:
      - portfolio
```

- [ ] **Step 3: Run unit tests**

```bash
cd apps/web && pnpm test
```

Expected: PASS — api.test.ts (2), analytics.test.ts (4), revalidate.test.ts (3) = 9 tests total.

- [ ] **Step 4: Smoke test — dev server starts**

```bash
cd apps/web
NEXT_PUBLIC_API_URL=http://localhost:3001 pnpm dev &
sleep 10
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ru
# Expected: 200
kill %1
```

- [ ] **Step 5: Final commit**

```bash
git add apps/web/Dockerfile docker-compose.yml apps/web/next.config.ts
git commit -m "feat(web): add Dockerfile, standalone build, and integrate with docker-compose"
```

---

## Summary

After completing all 12 tasks:

✅ Next.js 14 App Router with SSR/SSG/ISR rendering strategies
✅ next-intl with `/ru` and `/en` locale routing
✅ Glassmorphism design system (Tailwind + CSS variables)
✅ Navbar (burger menu, lang switcher) + Footer
✅ Landing page: Hero, About, Values, Projects, TechStack, AIAgents, WorkProcess, ContactForm
✅ Project detail pages (SSG + on-demand revalidation)
✅ Blog list (ISR, 60s) + Blog post pages (SSG + on-demand revalidation)
✅ Contact form → API → Telegram+Email
✅ Analytics tracking (sessionId, funnel events)
✅ Revalidation API route (secret-protected)
✅ Dynamic OG images for project pages
✅ Unit tests: 9 passing
✅ Docker standalone build + docker-compose integration

**Next:** Plan 3 — React/Vite Admin Panel (auth, TipTap blog editor, contacts management)

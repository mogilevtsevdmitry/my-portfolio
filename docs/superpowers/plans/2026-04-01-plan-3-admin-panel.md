# Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a React/Vite SPA admin panel at `admin.{domain}` for managing blog posts (TipTap WYSIWYG, RU/EN, publish/draft) and leads (status management).

**Architecture:** React 18 + Vite 5 SPA with React Router v6, TanStack Query v5, TipTap v2. Auth via httpOnly cookies (no token in localStorage). On 401 → auto-refresh → retry → redirect to /login on failure. Design matches portfolio dark-green + lime-accent system. Deployed via nginx static serving in Docker.

**Tech Stack:** React 18, Vite 5, React Router v6, TanStack Query v5, TipTap v2 (@tiptap/react + starter-kit), Tailwind CSS v3, TypeScript 5, Vitest + @testing-library/react

**This is Plan 3 of 3:**
- Plan 1 ✅: Monorepo scaffold + NestJS API
- Plan 2 ✅: Next.js Web app
- Plan 3 (this): React/Vite Admin panel

**Prerequisites:** Plan 1 complete. API endpoints:
- `POST /auth/login` → sets httpOnly cookies `access_token` (15min) + `refresh_token` (7d)
- `POST /auth/refresh` → rotates tokens
- `POST /auth/logout` → clears cookies
- `GET /admin/blog` → all posts (draft + published), requires JWT cookie
- `POST /admin/blog` → create post `{ slug, translations: [{locale,title,excerpt,content}] }`
- `PUT /admin/blog/:id` → update post
- `DELETE /admin/blog/:id` → delete post
- `GET /admin/contacts` → list leads
- `PUT /admin/contacts/:id` → update status `{ status: 'NEW'|'READ'|'ARCHIVED' }`

---

## File Map

```
apps/admin/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── vitest.setup.ts
├── Dockerfile
├── nginx.conf
├── src/
│   ├── main.tsx                         # ReactDOM.createRoot + QueryClientProvider + Router
│   ├── App.tsx                          # Route definitions (login, /blog, /blog/new, /blog/:id, /contacts)
│   ├── styles/
│   │   └── globals.css                  # CSS variables + Tailwind directives
│   ├── lib/
│   │   └── api.ts                       # apiFetch wrapper: credentials:include, 401→refresh→retry
│   ├── hooks/
│   │   └── useAuth.ts                   # login(), logout(), useCurrentUser()
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx               # primary/outline/ghost, loading state
│   │   │   ├── Input.tsx                # controlled text input + label + error
│   │   │   ├── Badge.tsx                # status pill: NEW(yellow), READ(blue), ARCHIVED(gray)
│   │   │   │                            # and post status: DRAFT(yellow), PUBLISHED(green)
│   │   │   └── Spinner.tsx              # full-page loading spinner
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx              # nav links: Blog, Contacts; logout button
│   │   │   ├── Layout.tsx               # Sidebar + <main> content area
│   │   │   └── ProtectedRoute.tsx       # checks /auth/me or cookie existence; redirects to /login
│   │   └── editor/
│   │       └── RichEditor.tsx           # TipTap editor wrapper: toolbar (bold/italic/h2/h3/ul/ol/link) + content
│   └── pages/
│       ├── LoginPage.tsx                # email+password form, POST /auth/login
│       ├── BlogListPage.tsx             # table of posts, status badges, delete, link to editor
│       ├── BlogEditorPage.tsx           # slug + RU/EN tabs (title/excerpt/RichEditor) + status + save
│       └── ContactsPage.tsx             # table of leads, inline status dropdown
├── __tests__/
│   ├── lib/
│   │   └── api.test.ts                  # apiFetch: 401→refresh→retry, auth endpoints skip refresh
│   └── pages/
│       ├── LoginPage.test.tsx           # render, fill, submit, API called
│       ├── BlogListPage.test.tsx        # empty state, posts table render
│       └── ContactsPage.test.tsx        # empty state, contact name render
```

---

### Task 1: Vite App Scaffold

**Files:**
- Create: `apps/admin/package.json`
- Create: `apps/admin/tsconfig.json`
- Create: `apps/admin/vite.config.ts`
- Create: `apps/admin/tailwind.config.ts`
- Create: `apps/admin/postcss.config.mjs`
- Create: `apps/admin/vitest.setup.ts`
- Create: `apps/admin/index.html`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p apps/admin/src/styles apps/admin/src/lib apps/admin/src/hooks apps/admin/src/components/ui apps/admin/src/components/layout apps/admin/src/components/editor apps/admin/src/pages apps/admin/__tests__/lib apps/admin/__tests__/pages
```

- [ ] **Step 2: Create package.json**

`apps/admin/package.json`:
```json
{
  "name": "@portfolio/admin",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --port 3002",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.26.0",
    "@tanstack/react-query": "^5.56.0",
    "@tiptap/react": "^2.7.0",
    "@tiptap/starter-kit": "^2.7.0",
    "@tiptap/extension-placeholder": "^2.7.0",
    "clsx": "^2.1.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0",
    "vitest": "^2.1.0",
    "@vitest/coverage-v8": "^2.1.0",
    "jsdom": "^25.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.5.0",
    "@testing-library/user-event": "^14.5.0"
  }
}
```

- [ ] **Step 3: Create tsconfig.json**

`apps/admin/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "paths": {
      "@/*": ["./src/*"],
      "@portfolio/shared": ["../../packages/shared/src/index.ts"]
    }
  },
  "include": ["src", "__tests__", "vitest.setup.ts"]
}
```

- [ ] **Step 4: Create vite.config.ts**

`apps/admin/vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@portfolio/shared': resolve(__dirname, '../../packages/shared/src/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
  server: {
    port: 3002,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
```

- [ ] **Step 5: Create tailwind + postcss configs**

`apps/admin/tailwind.config.ts`:
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0B1F1A',
        'bg-secondary': '#0F2A24',
        'accent': '#4ADE80',
        'text-primary': '#F0FDF4',
        'text-muted': '#86EFAC',
      },
    },
  },
  plugins: [],
};

export default config;
```

`apps/admin/postcss.config.mjs`:
```javascript
const config = {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};
export default config;
```

- [ ] **Step 6: Create vitest setup and index.html**

`apps/admin/vitest.setup.ts`:
```typescript
import '@testing-library/jest-dom';
```

`apps/admin/index.html`:
```html
<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Admin — Portfolio</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Install dependencies**

```bash
cd apps/admin && pnpm install
```

Expected: packages installed, no errors.

- [ ] **Step 8: Commit**

```bash
git add apps/admin/package.json apps/admin/tsconfig.json apps/admin/vite.config.ts apps/admin/tailwind.config.ts apps/admin/postcss.config.mjs apps/admin/vitest.setup.ts apps/admin/index.html
git commit -m "feat(admin): scaffold Vite + React + Tailwind + Vitest"
```

---

### Task 2: Global Styles + UI Components + Layout

**Files:**
- Create: `apps/admin/src/styles/globals.css`
- Create: `apps/admin/src/components/ui/Button.tsx`
- Create: `apps/admin/src/components/ui/Input.tsx`
- Create: `apps/admin/src/components/ui/Badge.tsx`
- Create: `apps/admin/src/components/ui/Spinner.tsx`
- Create: `apps/admin/src/components/layout/Sidebar.tsx`
- Create: `apps/admin/src/components/layout/Layout.tsx`
- Create: `apps/admin/src/components/layout/ProtectedRoute.tsx`

- [ ] **Step 1: Create globals.css**

`apps/admin/src/styles/globals.css`:
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

* { box-sizing: border-box; }

html, body, #root {
  height: 100%;
  margin: 0;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
}

@layer components {
  .glass-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 0.75rem;
  }
  .input-base {
    width: 100%;
    padding: 0.625rem 0.875rem;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    color: var(--text-primary);
    font-size: 0.875rem;
    outline: none;
    transition: border-color 0.15s;
  }
  .input-base:focus {
    border-color: var(--border-hover);
    box-shadow: 0 0 0 3px var(--accent-glow);
  }
  .input-base::placeholder {
    color: color-mix(in srgb, var(--text-muted) 50%, transparent);
  }
}
```

- [ ] **Step 2: Create Button component**

`apps/admin/src/components/ui/Button.tsx`:
```tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'outline' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  size?: 'sm' | 'md';
}

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-bg-primary font-semibold hover:opacity-90 shadow-[0_0_16px_rgba(74,222,128,0.25)]',
  outline: 'border border-[var(--border-hover)] text-accent hover:bg-[var(--accent-glow)]',
  ghost: 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]',
  danger: 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'active:scale-[0.97]',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
```

- [ ] **Step 3: Create Input component**

`apps/admin/src/components/ui/Input.tsx`:
```tsx
import { InputHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={clsx('input-base', error && 'border-red-500/60', className)}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  ),
);
Input.displayName = 'Input';
```

- [ ] **Step 4: Create Badge and Spinner**

`apps/admin/src/components/ui/Badge.tsx`:
```tsx
import clsx from 'clsx';

type ContactStatus = 'NEW' | 'READ' | 'ARCHIVED';
type PostStatus = 'DRAFT' | 'PUBLISHED';
type Status = ContactStatus | PostStatus;

const statusStyles: Record<Status, string> = {
  NEW: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  READ: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  ARCHIVED: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  DRAFT: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  PUBLISHED: 'bg-green-500/15 text-green-400 border-green-500/30',
};

interface BadgeProps {
  status: Status;
  className?: string;
}

export function Badge({ status, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-block px-2.5 py-0.5 text-xs font-medium rounded-full border',
        statusStyles[status],
        className,
      )}
    >
      {status}
    </span>
  );
}
```

`apps/admin/src/components/ui/Spinner.tsx`:
```tsx
export function Spinner() {
  return (
    <div className="flex items-center justify-center h-full min-h-[200px]">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
```

- [ ] **Step 5: Create Sidebar**

`apps/admin/src/components/layout/Sidebar.tsx`:
```tsx
import { NavLink, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { Button } from '@/components/ui/Button';
import { apiFetch } from '@/lib/api';

const navItems = [
  { to: '/blog', label: 'Blog' },
  { to: '/contacts', label: 'Contacts' },
];

export function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await apiFetch('/auth/logout', { method: 'POST' });
    navigate('/login');
  };

  return (
    <aside className="w-56 flex-shrink-0 bg-[var(--bg-secondary)] border-r border-[var(--border)] flex flex-col">
      <div className="p-5 border-b border-[var(--border)]">
        <span className="text-accent font-bold text-lg">Admin</span>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'block px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-[var(--accent-glow)] text-accent font-medium'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]',
              )
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-[var(--border)]">
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 6: Create Layout and ProtectedRoute**

`apps/admin/src/components/layout/Layout.tsx`:
```tsx
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function Layout() {
  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
```

`apps/admin/src/components/layout/ProtectedRoute.tsx`:
```tsx
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { apiFetch } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';

export function ProtectedRoute() {
  const [status, setStatus] = useState<'checking' | 'ok' | 'unauthenticated'>('checking');

  useEffect(() => {
    // GET /admin/blog is a protected endpoint — 200 = authenticated, 401 = not authenticated
    // (GET /auth/me is not in the API spec)
    apiFetch('/admin/blog')
      .then((res) => setStatus(res.ok ? 'ok' : 'unauthenticated'))
      .catch(() => setStatus('unauthenticated'));
  }, []);

  if (status === 'checking') return <Spinner />;
  if (status === 'unauthenticated') return <Navigate to="/login" replace />;
  return <Outlet />;
}
```

- [ ] **Step 7: Commit**

```bash
git add apps/admin/src/
git commit -m "feat(admin): add global styles, UI components, and layout"
```

---

### Task 3: API Client + Auth with 401 Refresh Interceptor

**Files:**
- Create: `apps/admin/src/lib/api.ts`
- Create: `apps/admin/src/hooks/useAuth.ts`
- Create: `apps/admin/__tests__/lib/api.test.ts`

- [ ] **Step 1: Write failing tests for api.ts**

`apps/admin/__tests__/lib/api.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiFetch } from '@/lib/api';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Mock window.location.href setter
const locationSpy = vi.spyOn(window, 'location', 'get').mockReturnValue({
  ...window.location,
  href: '',
} as Location);

describe('apiFetch', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('sends request with credentials:include', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200 });

    await apiFetch('/admin/blog');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/blog'),
      expect.objectContaining({ credentials: 'include' }),
    );
  });

  it('on 401: calls /auth/refresh then retries original request', async () => {
    // First call → 401, second (refresh) → 200, third (retry) → 200
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 401 })
      .mockResolvedValueOnce({ ok: true, status: 200 })  // refresh
      .mockResolvedValueOnce({ ok: true, status: 200 }); // retry

    const res = await apiFetch('/admin/blog');

    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('/auth/refresh'),
      expect.objectContaining({ method: 'POST' }),
    );
    expect(res.status).toBe(200);
  });

  it('on 401 + failed refresh: does not loop and throws', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 401 })
      .mockResolvedValueOnce({ ok: false, status: 401 }); // refresh also fails

    await expect(apiFetch('/admin/blog')).rejects.toThrow();
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('does not retry refresh endpoint on 401 (prevents loop)', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 401 });

    await expect(apiFetch('/auth/refresh', { method: 'POST' })).rejects.toThrow();
    // Only called once — no refresh retry for /auth/* paths
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run tests to see them fail**

```bash
cd apps/admin && pnpm test __tests__/lib/api.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement api.ts**

`apps/admin/src/lib/api.ts`:
```typescript
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

let refreshPromise: Promise<void> | null = null;

async function doRefresh(): Promise<void> {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Refresh failed');
}

export async function apiFetch(
  path: string,
  options?: RequestInit & { _isRetry?: boolean },
): Promise<Response> {
  const { _isRetry, ...fetchOptions } = options ?? {};

  const res = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...fetchOptions.headers },
  });

  // Skip refresh for auth endpoints to prevent infinite loops
  if (res.status === 401 && !_isRetry && !path.startsWith('/auth/')) {
    if (!refreshPromise) {
      refreshPromise = doRefresh().finally(() => { refreshPromise = null; });
    }
    try {
      await refreshPromise;
      return apiFetch(path, { ...options, _isRetry: true });
    } catch {
      window.location.href = '/login';
      throw new Error('Session expired');
    }
  }

  return res;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd apps/admin && pnpm test __tests__/lib/api.test.ts
```

Expected: PASS (4 tests).

- [ ] **Step 5: Create useAuth hook**

`apps/admin/src/hooks/useAuth.ts`:
```typescript
import { apiFetch } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const navigate = useNavigate();

  const login = async (email: string, password: string): Promise<void> => {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message ?? 'Invalid credentials');
    }
  };

  const logout = async (): Promise<void> => {
    await apiFetch('/auth/logout', { method: 'POST' });
    navigate('/login');
  };

  return { login, logout };
}
```

- [ ] **Step 6: Commit**

```bash
git add apps/admin/src/lib/ apps/admin/src/hooks/ apps/admin/__tests__/lib/
git commit -m "feat(admin): add API fetch client with 401 refresh interceptor and tests"
```

---

### Task 4: App Entry + Login Page

**Files:**
- Create: `apps/admin/src/main.tsx`
- Create: `apps/admin/src/App.tsx`
- Create: `apps/admin/src/pages/LoginPage.tsx`
- Create: `apps/admin/__tests__/pages/LoginPage.test.tsx`

- [ ] **Step 1: Write failing test for LoginPage**

`apps/admin/__tests__/pages/LoginPage.test.tsx`:
```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from '@/pages/LoginPage';

// Mock apiFetch
vi.mock('@/lib/api', () => ({
  apiFetch: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

import { apiFetch } from '@/lib/api';

describe('LoginPage', () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
    mockNavigate.mockReset();
  });

  it('renders email and password fields', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('calls apiFetch with credentials on submit', async () => {
    vi.mocked(apiFetch).mockResolvedValue({ ok: true } as Response);

    render(<MemoryRouter><LoginPage /></MemoryRouter>);

    await userEvent.type(screen.getByLabelText(/email/i), 'admin@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'secret');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/auth/login', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'admin@test.com', password: 'secret' }),
      }));
    });
  });

  it('navigates to /blog on success', async () => {
    vi.mocked(apiFetch).mockResolvedValue({ ok: true } as Response);

    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    await userEvent.type(screen.getByLabelText(/email/i), 'a@b.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'pw');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/blog'));
  });

  it('shows error message on failed login', async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Invalid credentials' }),
    } as Response);

    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    await userEvent.type(screen.getByLabelText(/email/i), 'a@b.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument());
  });
});
```

- [ ] **Step 2: Run tests to see them fail**

```bash
cd apps/admin && pnpm test __tests__/pages/LoginPage.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Create LoginPage**

`apps/admin/src/pages/LoginPage.tsx`:
```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.message ?? 'Login failed');
        return;
      }
      navigate('/blog');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card w-full max-w-sm p-8">
        <h1 className="text-xl font-bold text-accent mb-6 text-center">Admin Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" loading={loading} className="w-full">
            Login
          </Button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create main.tsx and App.tsx**

`apps/admin/src/main.tsx`:
```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from './App';
import './styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
```

`apps/admin/src/App.tsx`:
```tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { BlogListPage } from '@/pages/BlogListPage';
import { BlogEditorPage } from '@/pages/BlogEditorPage';
import { ContactsPage } from '@/pages/ContactsPage';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/blog" replace />} />
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/new" element={<BlogEditorPage />} />
          <Route path="/blog/:id" element={<BlogEditorPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/blog" replace />} />
    </Routes>
  );
}
```

- [ ] **Step 5: Run tests to verify LoginPage tests pass**

```bash
cd apps/admin && pnpm test __tests__/pages/LoginPage.test.tsx
```

Expected: PASS (4 tests).

- [ ] **Step 6: Run all tests**

```bash
cd apps/admin && pnpm test
```

Expected: 8 tests total (4 api + 4 login).

- [ ] **Step 7: Commit**

```bash
git add apps/admin/src/ apps/admin/__tests__/pages/
git commit -m "feat(admin): add app entry, routing, and login page with tests"
```

---

### Task 5: Blog List Page

**Files:**
- Create: `apps/admin/src/pages/BlogListPage.tsx`
- Create: `apps/admin/__tests__/pages/BlogListPage.test.tsx`

- [ ] **Step 1: Write failing test for BlogListPage**

`apps/admin/__tests__/pages/BlogListPage.test.tsx`:
```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { BlogListPage } from '@/pages/BlogListPage';

vi.mock('@/lib/api', () => ({ apiFetch: vi.fn() }));
import { apiFetch } from '@/lib/api';

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('BlogListPage', () => {
  beforeEach(() => vi.mocked(apiFetch).mockReset());

  it('shows empty state when no posts', async () => {
    vi.mocked(apiFetch).mockResolvedValue({ ok: true, json: async () => [] } as Response);
    render(<BlogListPage />, { wrapper: Wrapper });
    await waitFor(() => expect(screen.getByText(/no posts yet/i)).toBeInTheDocument());
  });

  it('shows post slug in table when posts exist', async () => {
    const posts = [{
      id: '1', slug: 'hello-world', status: 'PUBLISHED',
      publishedAt: null, updatedAt: '2024-01-01T00:00:00Z',
      translations: [{ locale: 'ru', title: 'Привет мир', excerpt: '' }],
    }];
    vi.mocked(apiFetch).mockResolvedValue({ ok: true, json: async () => posts } as Response);
    render(<BlogListPage />, { wrapper: Wrapper });
    await waitFor(() => expect(screen.getByText('hello-world')).toBeInTheDocument());
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd apps/admin && pnpm test __tests__/pages/BlogListPage.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create BlogListPage**

`apps/admin/src/pages/BlogListPage.tsx`:
```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiFetch } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

interface BlogPost {
  id: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt: string | null;
  updatedAt: string;
  translations: Array<{ locale: string; title: string; excerpt: string }>;
}

async function fetchPosts(): Promise<BlogPost[]> {
  const res = await apiFetch('/admin/blog');
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}

export function BlogListPage() {
  const qc = useQueryClient();
  const { data: posts, isLoading, error } = useQuery({ queryKey: ['admin-blog'], queryFn: fetchPosts });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/admin/blog/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-blog'] }),
  });

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Delete "${title}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <Spinner />;
  if (error) return <p className="text-red-400">Failed to load posts.</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Blog Posts</h1>
        <Link to="/blog/new">
          <Button size="sm">+ New Post</Button>
        </Link>
      </div>

      {!posts?.length ? (
        <div className="glass-card p-8 text-center text-[var(--text-muted)]">
          No posts yet. <Link to="/blog/new" className="text-accent underline">Create one</Link>.
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-muted)] text-left">
                <th className="px-4 py-3 font-medium">Title (RU)</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => {
                const ruTitle = post.translations.find((t) => t.locale === 'ru')?.title ?? '—';
                return (
                  <tr key={post.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-card)]">
                    <td className="px-4 py-3 text-[var(--text-primary)] font-medium">{ruTitle}</td>
                    <td className="px-4 py-3 text-[var(--text-muted)] font-mono text-xs">{post.slug}</td>
                    <td className="px-4 py-3"><Badge status={post.status} /></td>
                    <td className="px-4 py-3 text-[var(--text-muted)] text-xs">
                      {new Date(post.updatedAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <Link to={`/blog/${post.id}`}>
                          <Button variant="outline" size="sm">Edit</Button>
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          loading={deleteMutation.isPending}
                          onClick={() => handleDelete(post.id, ruTitle)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd apps/admin && pnpm test __tests__/pages/BlogListPage.test.tsx
```

Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/pages/BlogListPage.tsx apps/admin/__tests__/pages/BlogListPage.test.tsx
git commit -m "feat(admin): add blog list page with tests"
```

---

### Task 6: TipTap Editor + Blog Editor Page

**Files:**
- Create: `apps/admin/src/components/editor/RichEditor.tsx`
- Create: `apps/admin/src/pages/BlogEditorPage.tsx`

- [ ] **Step 1: Create RichEditor wrapper**

`apps/admin/src/components/editor/RichEditor.tsx`:
```tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';
import clsx from 'clsx';

interface RichEditorProps {
  content: object | null;
  onChange: (json: object) => void;
  placeholder?: string;
}

const toolbarBtn = (active: boolean) =>
  clsx(
    'px-2 py-1 rounded text-xs font-medium transition-colors',
    active
      ? 'bg-accent text-bg-primary'
      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]',
  );

export function RichEditor({ content, onChange, placeholder }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: placeholder ?? 'Start writing...' }),
    ],
    content: content ?? undefined,
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
    editorProps: {
      attributes: {
        class: 'outline-none min-h-[200px] prose prose-invert max-w-none text-[var(--text-muted)] leading-relaxed',
      },
    },
  });

  // Sync external content changes (e.g. locale tab switch)
  useEffect(() => {
    if (!editor) return;
    const current = JSON.stringify(editor.getJSON());
    const incoming = JSON.stringify(content);
    if (current !== incoming) {
      editor.commands.setContent(content ?? '');
    }
  }, [content]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!editor) return null;

  return (
    <div className="border border-[var(--border)] rounded-xl overflow-hidden focus-within:border-[var(--border-hover)]">
      {/* Toolbar */}
      <div className="flex gap-1 px-3 py-2 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
        <button type="button" className={toolbarBtn(editor.isActive('bold'))} onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
        <button type="button" className={toolbarBtn(editor.isActive('italic'))} onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>
        <button type="button" className={toolbarBtn(editor.isActive('heading', { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
        <button type="button" className={toolbarBtn(editor.isActive('heading', { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
        <button type="button" className={toolbarBtn(editor.isActive('bulletList'))} onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>
        <button type="button" className={toolbarBtn(editor.isActive('orderedList'))} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</button>
        <button type="button" className={toolbarBtn(editor.isActive('blockquote'))} onClick={() => editor.chain().focus().toggleBlockquote().run()}>❝</button>
        <button type="button" className={toolbarBtn(false)} onClick={() => editor.chain().focus().undo().run()}>↩</button>
        <button type="button" className={toolbarBtn(false)} onClick={() => editor.chain().focus().redo().run()}>↪</button>
      </div>
      {/* Content area */}
      <div className="px-4 py-3 bg-[var(--bg-card)]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create BlogEditorPage**

`apps/admin/src/pages/BlogEditorPage.tsx`:
```tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { RichEditor } from '@/components/editor/RichEditor';

type Locale = 'ru' | 'en';
type PostStatus = 'DRAFT' | 'PUBLISHED';

interface Translation {
  locale: Locale;
  title: string;
  excerpt: string;
  content: object | null;
}

interface PostData {
  id?: string;
  slug: string;
  status: PostStatus;
  translations: Translation[];
}

const emptyTranslation = (locale: Locale): Translation => ({
  locale,
  title: '',
  excerpt: '',
  content: null,
});

const emptyPost = (): PostData => ({
  slug: '',
  status: 'DRAFT',
  translations: [emptyTranslation('ru'), emptyTranslation('en')],
});

export function BlogEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [activeLocale, setActiveLocale] = useState<Locale>('ru');
  const [post, setPost] = useState<PostData>(emptyPost);
  const [saveError, setSaveError] = useState('');

  // Fetch existing post by fetching list and finding by id
  // (GET /admin/blog/:id is not in the spec; GET /admin/blog returns all posts)
  const { data: postsList, isLoading } = useQuery({
    queryKey: ['admin-blog'],
    queryFn: async () => {
      const res = await apiFetch('/admin/blog');
      if (!res.ok) throw new Error('Failed to load posts');
      return res.json() as Promise<PostData[]>;
    },
    enabled: !isNew,
  });

  useEffect(() => {
    if (postsList && id) {
      const found = postsList.find((p: PostData) => p.id === id);
      if (found) setPost(found);
    }
  }, [postsList, id]);

  const saveMutation = useMutation({
    mutationFn: async (data: PostData) => {
      const url = isNew ? '/admin/blog' : `/admin/blog/${id}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await apiFetch(url, {
        method,
        body: JSON.stringify({
          slug: data.slug,
          status: data.status,
          translations: data.translations.map((t) => ({
            locale: t.locale,
            title: t.title,
            excerpt: t.excerpt,
            content: t.content ?? { type: 'doc', content: [] },
          })),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? 'Save failed');
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-blog'] });
      navigate('/blog');
    },
    onError: (err: Error) => setSaveError(err.message),
  });

  const updateTranslation = (locale: Locale, field: keyof Translation, value: string | object | null) => {
    setPost((prev) => ({
      ...prev,
      translations: prev.translations.map((t) =>
        t.locale === locale ? { ...t, [field]: value } : t,
      ),
    }));
  };

  const activeT = post.translations.find((t) => t.locale === activeLocale) ?? emptyTranslation(activeLocale);

  if (!isNew && isLoading) return <Spinner />;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">{isNew ? 'New Post' : 'Edit Post'}</h1>
        <div className="flex gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/blog')}>Cancel</Button>
          <Button
            variant="outline"
            size="sm"
            loading={saveMutation.isPending}
            onClick={() => { setPost((p) => ({ ...p, status: 'DRAFT' })); saveMutation.mutate({ ...post, status: 'DRAFT' }); }}
          >
            Save Draft
          </Button>
          <Button
            size="sm"
            loading={saveMutation.isPending}
            onClick={() => { setPost((p) => ({ ...p, status: 'PUBLISHED' })); saveMutation.mutate({ ...post, status: 'PUBLISHED' }); }}
          >
            Publish
          </Button>
        </div>
      </div>

      <div className="space-y-5">
        <Input
          id="slug"
          label="Slug"
          value={post.slug}
          onChange={(e) => setPost((p) => ({ ...p, slug: e.target.value }))}
          placeholder="my-post-slug"
          className="font-mono"
        />

        {/* Locale tabs */}
        <div>
          <div className="flex gap-1 mb-4">
            {(['ru', 'en'] as Locale[]).map((locale) => (
              <button
                key={locale}
                type="button"
                onClick={() => setActiveLocale(locale)}
                className={`px-4 py-1.5 text-sm rounded-lg transition-colors font-medium ${
                  activeLocale === locale
                    ? 'bg-accent text-bg-primary'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {locale.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <Input
              label="Title"
              value={activeT.title}
              onChange={(e) => updateTranslation(activeLocale, 'title', e.target.value)}
              placeholder={activeLocale === 'ru' ? 'Заголовок' : 'Title'}
            />
            <Input
              label="Excerpt"
              value={activeT.excerpt}
              onChange={(e) => updateTranslation(activeLocale, 'excerpt', e.target.value)}
              placeholder={activeLocale === 'ru' ? 'Краткое описание' : 'Short description'}
            />
            <div>
              <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Content</p>
              <RichEditor
                content={activeT.content}
                onChange={(json) => updateTranslation(activeLocale, 'content', json)}
                placeholder={activeLocale === 'ru' ? 'Текст статьи...' : 'Article content...'}
              />
            </div>
          </div>
        </div>

        {saveError && <p className="text-sm text-red-400">{saveError}</p>}
      </div>
    </div>
  );
}
```

Note: `BlogEditorPage` is intentionally not unit-tested — TipTap requires full DOM APIs (`document.createRange`, `MutationObserver`) that jsdom doesn't fully implement, making TipTap tests unreliable. The component is covered indirectly through the API client tests (Task 3) and manual smoke test (Task 8).

- [ ] **Step 3: Commit**

```bash
git add apps/admin/src/components/editor/ apps/admin/src/pages/BlogEditorPage.tsx
git commit -m "feat(admin): add TipTap editor and blog editor page"
```

---

### Task 7: Contacts Page

**Files:**
- Create: `apps/admin/src/pages/ContactsPage.tsx`
- Create: `apps/admin/__tests__/pages/ContactsPage.test.tsx`

- [ ] **Step 1: Write failing test for ContactsPage**

`apps/admin/__tests__/pages/ContactsPage.test.tsx`:
```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ContactsPage } from '@/pages/ContactsPage';

vi.mock('@/lib/api', () => ({ apiFetch: vi.fn() }));
import { apiFetch } from '@/lib/api';

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      {children}
    </QueryClientProvider>
  );
}

describe('ContactsPage', () => {
  beforeEach(() => vi.mocked(apiFetch).mockReset());

  it('shows empty state when no contacts', async () => {
    vi.mocked(apiFetch).mockResolvedValue({ ok: true, json: async () => [] } as Response);
    render(<ContactsPage />, { wrapper: Wrapper });
    await waitFor(() => expect(screen.getByText(/no leads yet/i)).toBeInTheDocument());
  });

  it('shows contact name in table when contacts exist', async () => {
    const contacts = [{
      id: '1', name: 'Иван Иванов', contact: 'ivan@test.com',
      description: 'Hello', status: 'NEW', createdAt: '2024-01-01T00:00:00Z',
    }];
    vi.mocked(apiFetch).mockResolvedValue({ ok: true, json: async () => contacts } as Response);
    render(<ContactsPage />, { wrapper: Wrapper });
    await waitFor(() => expect(screen.getByText('Иван Иванов')).toBeInTheDocument());
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd apps/admin && pnpm test __tests__/pages/ContactsPage.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create ContactsPage**

`apps/admin/src/pages/ContactsPage.tsx`:
```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';

type ContactStatus = 'NEW' | 'READ' | 'ARCHIVED';

interface Contact {
  id: string;
  name: string;
  contact: string;
  description: string;
  status: ContactStatus;
  createdAt: string;
}

async function fetchContacts(): Promise<Contact[]> {
  const res = await apiFetch('/admin/contacts');
  if (!res.ok) throw new Error('Failed to fetch contacts');
  return res.json();
}

const nextStatus: Record<ContactStatus, ContactStatus> = {
  NEW: 'READ',
  READ: 'ARCHIVED',
  ARCHIVED: 'NEW',
};

const statusLabel: Record<ContactStatus, string> = {
  NEW: 'Mark Read',
  READ: 'Archive',
  ARCHIVED: 'Reopen',
};

export function ContactsPage() {
  const qc = useQueryClient();
  const { data: contacts, isLoading, error } = useQuery({
    queryKey: ['admin-contacts'],
    queryFn: fetchContacts,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ContactStatus }) => {
      const res = await apiFetch(`/admin/contacts/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Update failed');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-contacts'] }),
  });

  if (isLoading) return <Spinner />;
  if (error) return <p className="text-red-400">Failed to load contacts.</p>;

  return (
    <div>
      <h1 className="text-xl font-bold text-[var(--text-primary)] mb-6">Contacts</h1>

      {!contacts?.length ? (
        <div className="glass-card p-8 text-center text-[var(--text-muted)]">No leads yet.</div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-muted)] text-left">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Message</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-card)]">
                  <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{c.name}</td>
                  <td className="px-4 py-3 text-[var(--text-muted)] text-xs">{c.contact}</td>
                  <td className="px-4 py-3 text-[var(--text-muted)] max-w-xs truncate">{c.description}</td>
                  <td className="px-4 py-3"><Badge status={c.status} /></td>
                  <td className="px-4 py-3 text-[var(--text-muted)] text-xs">
                    {new Date(c.createdAt).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => updateMutation.mutate({ id: c.id, status: nextStatus[c.status] })}
                      disabled={updateMutation.isPending}
                      className="text-xs text-accent hover:underline disabled:opacity-50"
                    >
                      {statusLabel[c.status]}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd apps/admin && pnpm test __tests__/pages/ContactsPage.test.tsx
```

Expected: PASS (2 tests).

- [ ] **Step 5: Run all tests**

```bash
cd apps/admin && pnpm test
```

Expected: 12 tests total (4 api + 4 login + 2 blog-list + 2 contacts).

- [ ] **Step 6: Commit**

```bash
git add apps/admin/src/pages/ContactsPage.tsx apps/admin/__tests__/pages/ContactsPage.test.tsx
git commit -m "feat(admin): add contacts page with tests"
```

---

### Task 8: Dockerfile + nginx + Docker Compose Integration + Smoke Test

**Files:**
- Create: `apps/admin/nginx.conf`
- Create: `apps/admin/Dockerfile`
- Modify: `docker-compose.yml` — add admin service

- [ ] **Step 1: Create nginx config**

`apps/admin/nginx.conf`:
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # SPA routing — all paths → index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy /api/* to NestJS API service (Docker internal hostname)
    location /api/ {
        proxy_pass http://api:3001/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/html text/css application/javascript application/json;
}
```

- [ ] **Step 2: Create Dockerfile**

`apps/admin/Dockerfile`:
```dockerfile
FROM node:20-alpine AS deps
RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/admin/package.json ./apps/admin/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

FROM node:20-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app
# Copy entire deps stage output (includes root node_modules, apps/admin/node_modules,
# packages/shared/node_modules and the pnpm virtual store)
COPY --from=deps /app/ ./
# Overlay with actual source code
COPY . .
# VITE_API_URL=/api means the SPA calls /api/... which nginx proxies to the api service
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}
RUN cd apps/admin && pnpm build

FROM nginx:alpine AS runner
COPY --from=builder /app/apps/admin/dist /usr/share/nginx/html
COPY apps/admin/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

- [ ] **Step 3: Update docker-compose.yml**

In `docker-compose.yml`, replace the admin comment with an active service. The file currently has:
```yaml
  # admin service will be added in Plan 3
  # admin:
  #   build:
  #     context: .
  #     dockerfile: apps/admin/Dockerfile
  #   ...
```

Replace with:
```yaml
  admin:
    build:
      context: .
      dockerfile: apps/admin/Dockerfile
    ports:
      - "3002:80"
    depends_on:
      - api
    networks:
      - portfolio
```

Note: `VITE_API_URL` defaults to `/api` in the Dockerfile. nginx then proxies `/api/*` to the `api` Docker service. In production with Traefik/Dokploy, the reverse proxy handles routing at the domain level — no change needed.

- [ ] **Step 4: Run all tests**

```bash
cd apps/admin && pnpm test 2>&1 | tail -15
```

Expected: 12 tests passing (4 api + 4 login + 2 blog-list + 2 contacts).

- [ ] **Step 5: Smoke test — dev server starts**

```bash
cd apps/admin
VITE_API_URL=http://localhost:3001 pnpm dev &
DEV_PID=$!
sleep 5
HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3002)
echo "HTTP: $HTTP"
kill $DEV_PID 2>/dev/null
```

Expected: HTTP 200 (Vite serves `index.html`).

- [ ] **Step 6: Final commit**

```bash
git add apps/admin/nginx.conf apps/admin/Dockerfile docker-compose.yml
git commit -m "feat(admin): add Dockerfile, nginx config, and docker-compose integration"
```

---

## Summary

After completing all 8 tasks:

✅ React 18 + Vite 5 SPA at port 3002
✅ Auth via httpOnly cookies — 401 auto-refresh with no token in localStorage
✅ Login page with form validation and error handling
✅ Blog list: all posts (draft + published) with delete confirmation
✅ Blog editor: TipTap WYSIWYG, RU/EN tabs, slug, publish/draft controls
✅ Contacts: leads table with one-click status cycling (NEW → READ → ARCHIVED)
✅ 12 unit tests passing (API client + LoginPage + BlogListPage + ContactsPage)
✅ nginx SPA routing + Docker standalone build
✅ docker-compose integration (admin service added)

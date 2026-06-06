FROM node:22-alpine AS base
# Pin pnpm to the version in package.json#packageManager. An unpinned
# `npm i -g pnpm` pulls the latest major (11.x), which (a) ignores the
# `pnpm.overrides` field location and (b) resolves transitive deps (e.g.
# dotenv used by prisma.config.ts) differently than the committed lockfile —
# breaking reproducibility and the SEC-006 override-based patches.
RUN npm install -g pnpm@10.26.1

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
# Copy entire deps stage output to preserve pnpm virtual store and workspace symlinks
COPY --from=deps /app/ ./
# Overlay with actual source code
COPY . .
# Prisma 7 prisma.config.ts ссылается на env('DATABASE_URL') — даже для generate
# (которому реальная БД не нужна, только URL для парсинга). При билде задаём
# плейсхолдер, в рантайме перетирается реальной DATABASE_URL из Vault.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"
RUN cd apps/api && pnpm exec prisma generate
RUN cd apps/api && pnpm exec nest build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# SEC-008: run as a non-root user. Create it before copying so the app tree is
# owned by the unprivileged user — prisma CLI (migrate deploy) needs to read
# the workspace node_modules / query engine and may write to a tmp/cache dir,
# and node must read the dist output. App listens on 3001 (non-privileged), so
# no port change is needed.
RUN addgroup -S app && adduser -S app -G app
# Copy entire builder output WITH non-root ownership. This preserves pnpm
# workspace symlinks (apps/api/node_modules → .pnpm store,
# @portfolio/shared → packages/shared, etc.) and keeps the locally-pinned
# prisma CLI reachable via the bin wrapper.
COPY --from=builder --chown=app:app /app/ ./
USER app
WORKDIR /app/apps/api
EXPOSE 3001
# Use the locally-installed prisma CLI from the workspace node_modules.
# Nest build in this monorepo emits to dist/apps/api/src/main.js (preserving
# the workspace directory structure), not dist/main.js.
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/apps/api/src/main.js"]

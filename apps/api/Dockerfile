FROM node:22-alpine AS base
RUN npm install -g pnpm

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
RUN cd apps/api && pnpm exec prisma generate
RUN cd apps/api && pnpm exec nest build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Copy entire builder output. This preserves pnpm workspace symlinks
# (apps/api/node_modules → .pnpm store, @portfolio/shared → packages/shared, etc.)
# and keeps the locally-pinned prisma CLI reachable via the bin wrapper.
COPY --from=builder /app/ ./
WORKDIR /app/apps/api
EXPOSE 3001
# Use the locally-installed prisma CLI from the workspace node_modules.
# Nest build in this monorepo emits to dist/apps/api/src/main.js (preserving
# the workspace directory structure), not dist/main.js.
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/apps/api/src/main.js"]

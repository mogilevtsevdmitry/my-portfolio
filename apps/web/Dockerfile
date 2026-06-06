FROM node:20-alpine AS base
# Pin pnpm to package.json#packageManager for reproducible builds — an
# unpinned `npm i -g pnpm` would pull the latest major and resolve transitive
# deps differently than the committed lockfile.
RUN npm install -g pnpm@10.26.1

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
COPY packages/i18n/package.json ./packages/i18n/
COPY packages/content/package.json ./packages/content/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
# Copy entire deps stage output to preserve pnpm virtual store and workspace symlinks
COPY --from=deps /app/ ./
# Overlay with actual source code
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# NEXT_PUBLIC_* запекается в client-бандл на этапе билда. Без этого все client-side
# fetch (captcha, contact form, analytics) падают на default 'http://localhost:3001'
# и ловят CORS на проде. ARG переопределяется в CI через --build-arg.
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
RUN cd apps/web && pnpm exec next build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# SEC-008: run as a non-root user. Next standalone server only reads its bundle
# at runtime; it listens on 3000 (non-privileged), so no port change is needed.
# Copy with non-root ownership so the server can read every asset.
RUN addgroup -S app && adduser -S app -G app
COPY --from=builder --chown=app:app /app/apps/web/.next/standalone ./
COPY --from=builder --chown=app:app /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=app:app /app/apps/web/public ./apps/web/public
USER app
EXPOSE 3000
CMD ["node", "apps/web/server.js"]

FROM node:20-alpine AS base
RUN npm install -g pnpm

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/admin/package.json ./apps/admin/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

FROM base AS builder
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

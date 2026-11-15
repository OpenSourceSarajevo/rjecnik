# Build from the repo root so the shared code in packages/ is part of the context:
#   docker build -f apps/admin/Dockerfile .
FROM node:24-alpine AS deps
WORKDIR /repo/apps/admin
COPY apps/admin/package.json apps/admin/package-lock.json ./
RUN npm ci

FROM node:24-alpine AS builder
WORKDIR /repo
COPY packages ./packages
COPY apps/admin ./apps/admin
COPY --from=deps /repo/apps/admin/node_modules ./apps/admin/node_modules
# NEXT_PUBLIC_* values are inlined into the bundle at build time, read from apps/admin/.env.
# A build arg overrides the .env value (Next.js never overwrites variables that are already set).
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_TELEMETRY_DISABLED=1 NEXT_OUTPUT=standalone
WORKDIR /repo/apps/admin
# The standalone output copies .env; drop it so secrets stay out of the image (compose passes it at runtime)
RUN npm run build \
    && rm -f .next/standalone/apps/admin/.env*

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000
# outputFileTracingRoot is the repo root, so the standalone server lives under apps/admin/
COPY --from=builder --chown=node:node /repo/apps/admin/.next/standalone ./
COPY --from=builder --chown=node:node /repo/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=builder --chown=node:node /repo/apps/admin/public ./apps/admin/public
USER node
EXPOSE 3000
CMD ["node", "apps/admin/server.js"]

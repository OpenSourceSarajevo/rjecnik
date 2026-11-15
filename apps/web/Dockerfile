# Build from the repo root so the shared code in packages/ is part of the context:
#   docker build -f apps/web/Dockerfile .
FROM node:24-alpine
WORKDIR /repo/apps/web
COPY apps/web/package.json apps/web/package-lock.json ./
RUN npm ci
COPY packages /repo/packages
COPY apps/web ./
RUN chown node:node /repo/apps/web
ENV NEXT_TELEMETRY_DISABLED=1
USER node
EXPOSE 3000
# Built on start rather than in the image: the build prerenders the sitemap from the API,
# which is only reachable once the container runs next to it (see depends_on in compose.yaml)
CMD ["sh", "-c", "npm run build && exec npm start"]

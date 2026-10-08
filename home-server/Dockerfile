# syntax=docker/dockerfile:1

FROM node:24.21.0-bookworm-slim AS base
ENV NPM_CONFIG_FUND=false \
    NPM_CONFIG_UPDATE_NOTIFIER=false
WORKDIR /app

FROM base AS manifests
COPY package.json package-lock.json ./
COPY home-shared/package.json home-shared/
COPY home-server/package.json home-server/
COPY home-web-ui/package.json home-web-ui/

FROM manifests AS build
RUN --mount=type=cache,target=/root/.npm \
    npm ci --ignore-scripts --workspace home-shared --workspace home-server
COPY scripts/ scripts/
COPY home-shared/ home-shared/
COPY home-server/ home-server/
RUN npm run build --workspace home-shared \
 && npm run build --workspace home-server

FROM manifests AS production-dependencies
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --ignore-scripts --workspace home-shared --workspace home-server \
 && mkdir -p home-shared/node_modules home-server/node_modules

FROM base AS runtime
ENV NODE_ENV=production \
    API_PORT=4000
COPY --from=production-dependencies /app/node_modules ./node_modules
COPY --from=production-dependencies /app/home-shared/node_modules ./home-shared/node_modules
COPY --from=production-dependencies /app/home-server/node_modules ./home-server/node_modules
COPY --from=build /app/home-shared/package.json ./home-shared/
COPY --from=build /app/home-shared/build ./home-shared/build
COPY --from=build /app/home-server/package.json ./home-server/
COPY --from=build /app/home-server/build ./home-server/build
RUN mkdir -p home-server/storage && chown node:node home-server/storage
USER node
WORKDIR /app/home-server
EXPOSE 4000
CMD ["node", "build/index.js"]

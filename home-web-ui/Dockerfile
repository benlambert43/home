# syntax=docker/dockerfile:1

FROM node:24.21.0-bookworm-slim AS base
ENV NPM_CONFIG_FUND=false \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

FROM base AS build
ARG BASE_SITE_URL
ARG NEXT_PUBLIC_CAPTCHA_PUBLIC
ENV BASE_SITE_URL=${BASE_SITE_URL} \
    NEXT_PUBLIC_CAPTCHA_PUBLIC=${NEXT_PUBLIC_CAPTCHA_PUBLIC} \
    BASE_API_URL=http://unused-at-build-time.invalid \
    BFF_SESSION_SECRET=unused-at-build-time \
    REVALIDATE_SECRET=unused-at-build-time
COPY package.json package-lock.json ./
COPY home-shared/package.json home-shared/
COPY home-server/package.json home-server/
COPY home-web-ui/package.json home-web-ui/
RUN --mount=type=cache,target=/root/.npm \
    npm ci --ignore-scripts --workspace home-shared --workspace home-web-ui
COPY scripts/ scripts/
COPY home-shared/ home-shared/
COPY home-web-ui/ home-web-ui/
RUN npm run build --workspace home-shared \
 && npm run build --workspace home-web-ui

FROM base AS runtime
ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    PORT=3000
COPY --from=build --chown=node:node /app/home-web-ui/.next/standalone ./
COPY --from=build --chown=node:node /app/home-web-ui/.next/static ./home-web-ui/.next/static
COPY --from=build --chown=node:node /app/home-web-ui/public ./home-web-ui/public
USER node
WORKDIR /app/home-web-ui
EXPOSE 3000
CMD ["node", "server.js"]

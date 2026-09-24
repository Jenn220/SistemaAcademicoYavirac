# syntax=docker/dockerfile:1

# =========================================================
# ETAPA 1: compilar Angular
# =========================================================
FROM node:22.23.1-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY angular.json tsconfig.json tsconfig.app.json ./
COPY public ./public
COPY src ./src

RUN npm run build


# =========================================================
# ETAPA 2: Nginx de producción
# =========================================================
FROM nginx:1.27-alpine AS runtime

RUN rm -f /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist/browser /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s \
    --timeout=5s \
    --start-period=10s \
    --retries=5 \
    CMD wget -q -O /dev/null http://127.0.0.1/health || exit 1
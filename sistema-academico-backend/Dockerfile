# syntax=docker/dockerfile:1

# =========================================================
# ETAPA 1: instalar todas las dependencias
# =========================================================
FROM node:22.23.1-alpine AS dependencies

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci


# =========================================================
# ETAPA 2: compilar NestJS y las migraciones TypeORM
# =========================================================
FROM node:22.23.1-alpine AS build

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src

RUN npm run build


# =========================================================
# ETAPA 3: dependencias exclusivas de runtime
# =========================================================
FROM node:22.23.1-alpine AS production-dependencies

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev && npm cache clean --force


# =========================================================
# ETAPA 4: imagen final
# =========================================================
FROM node:22.23.1-alpine AS runtime

ENV NODE_ENV=production

WORKDIR /app

RUN addgroup -S academico \
    && adduser -S academico -G academico

COPY --from=production-dependencies --chown=academico:academico \
    /app/node_modules ./node_modules

COPY --from=build --chown=academico:academico \
    /app/dist ./dist

COPY --chown=academico:academico \
    package.json package-lock.json ./

USER academico

EXPOSE 3000

HEALTHCHECK --interval=30s \
    --timeout=5s \
    --start-period=20s \
    --retries=5 \
    CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r => { if (!r.ok) process.exit(1); }).catch(() => process.exit(1))"


# syntax=docker/dockerfile:1

# =========================================================
# ETAPA 1: instalar todas las dependencias
# =========================================================
FROM node:22.23.1-alpine AS dependencies

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci


# =========================================================
# ETAPA 2: compilar NestJS y las migraciones TypeORM
# =========================================================
FROM node:22.23.1-alpine AS build

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src

RUN npm run build


# =========================================================
# ETAPA 3: dependencias exclusivas de runtime
# =========================================================
FROM node:22.23.1-alpine AS production-dependencies

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev && npm cache clean --force


# =========================================================
# ETAPA 4: imagen final
# =========================================================
FROM node:22.23.1-alpine AS runtime

ENV NODE_ENV=production

WORKDIR /app

RUN addgroup -S academico \
    && adduser -S academico -G academico

COPY --from=production-dependencies --chown=academico:academico \
    /app/node_modules ./node_modules

COPY --from=build --chown=academico:academico \
    /app/dist ./dist

COPY --chown=academico:academico \
    package.json package-lock.json ./

USER academico

EXPOSE 3000

HEALTHCHECK --interval=30s \
    --timeout=5s \
    --start-period=20s \
    --retries=5 \
    CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r => { if (!r.ok) process.exit(1); }).catch(() => process.exit(1))"


CMD ["node", "dist/main.js"]
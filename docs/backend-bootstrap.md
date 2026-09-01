# Documentación Backend — Arranque (`main.ts`) y `config/`

Sistema Académico Institucional Yavirac — `sistema-academico-backend`
Stack: **NestJS 11 + TypeORM 0.3 + PostgreSQL**.

> Documento hermano de [`backend.md`](./backend.md) (módulos Auth y Portafolio Docente).
> Aquí se cubre la **capa de arranque e infraestructura** del backend: `src/main.ts`, `src/config/`,
> `src/database/data-source.ts`, el wiring de `src/app.module.ts`, `src/shared/`, `src/health/` y `src/app.controller.ts`.
> No cubre la lógica de los módulos de negocio.

---

## Tabla de contenido

- [1. `src/main.ts` — bootstrap HTTP](#1-srcmaints--bootstrap-http)
- [2. `src/app.module.ts` — módulo raíz y TypeORM en runtime](#2-srcappmodulets--módulo-raíz-y-typeorm-en-runtime)
- [3. `src/config/`](#3-srcconfig)
  - [3.1 `bigint-transformer.ts`](#31-bigint-transformerts)
  - [3.2 `database.config.ts`](#32-databaseconfigts)
  - [3.3 `constants.ts` y `env.config.ts` (vacíos)](#33-constantsts-y-envconfigts-vacíos)
- [4. `src/database/data-source.ts` — TypeORM para el CLI de migraciones](#4-srcdatabasedata-sourcets--typeorm-para-el-cli-de-migraciones)
- [5. `src/shared/`](#5-srcshared)
- [6. `src/health/` y `src/app.controller.ts`](#6-srchealth-y-srcappcontrollerts)
- [7. Variables de entorno](#7-variables-de-entorno)
- [8. Scripts npm](#8-scripts-npm)
- [9. Resumen de rutas de infraestructura](#9-resumen-de-rutas-de-infraestructura)

---

## 1. `src/main.ts` — bootstrap HTTP

```ts
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

// El driver pg devuelve bigint (OID 20) como texto; lo convertimos a number al leer.
// Se registra ANTES de NestFactory.create (cuando TypeORM abre la conexión).
const pg = require('pg');
pg.types.setTypeParser(20, (value: string) => (value === null ? null : parseInt(value, 10)));

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );
  app.enableCors({ origin: process.env.CORS_ORIGIN || 'http://localhost:4200' });
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Servidor corriendo en http://localhost:${port}/api`);
}

bootstrap();
```

| Ajuste | Valor real | Efecto |
|--------|-----------|--------|
| **`pg.types.setTypeParser(20, ...)`** | `parseInt(value, 10)` | **Todos** los `bigint` de Postgres llegan a la app como `number` (no string). Se registra a nivel de driver, antes de crear la app. Complementa a `bigint-transformer.ts` (que actúa por columna en las entidades de Auth). |
| **`ValidationPipe` global** | `whitelist: true` | Propiedades del body no declaradas en el DTO se **eliminan** silenciosamente. |
| | `transform: true` | El body se instancia como la clase DTO y los tipos primitivos se castean (habilita `@Type()` de `class-transformer`, y `ParseIntPipe` en params). |
| | `forbidNonWhitelisted: false` | Mandar campos de más **no** produce `400`; simplemente se ignoran. |
| **CORS** | `origin: CORS_ORIGIN || 'http://localhost:4200'` | Un solo origen permitido. Sin `credentials`, sin lista. Para el front Angular en dev: `http://localhost:4200`. |
| **Prefijo global** | `app.setGlobalPrefix('api')` | Todas las rutas cuelgan de `/api`. Un `@Controller('auth')` → `/api/auth`. |
| **Puerto** | `PORT || 3000` | HTTP en `http://localhost:3000/api` por defecto. |

Notas:
- **No** se registran interceptores ni filtros de excepción globales (las clases de `src/shared/` están vacías — ver §5). Las respuestas y los errores son el formato **crudo** de NestJS.
- **No** hay Swagger/OpenAPI configurado.
- **No** hay `app.enableShutdownHooks()` ni logger personalizado; se usa `console.log`.
- El único `import 'reflect-metadata'` de runtime está aquí (requerido por los decoradores de TypeORM/NestJS).

---

## 2. `src/app.module.ts` — módulo raíz y TypeORM en runtime

```ts
@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST') || 'localhost',
        port: config.get<number>('DB_PORT') || 5432,
        username: config.get<string>('DB_USER') || 'postgres',
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: [join(__dirname, '**', '*.entity.{ts,js}')],
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    PortafolioModule,
    VinculacionModule,
    FasePracticaModule,
    HealthModule,
    AuthModule,
    ControlPeriodosModule,
  ],
})
export class AppModule {}
```

| Elemento | Detalle |
|----------|---------|
| **`ConfigModule.forRoot({ isGlobal: true })`** | Lee el `.env` del cwd. `ConfigService` queda inyectable en toda la app sin re-importar `ConfigModule`. No hay validación de esquema de env (no se pasa `validationSchema`). |
| **`TypeOrmModule.forRootAsync`** | Config de la conexión **en runtime** (la app HTTP). Distinta de `data-source.ts` (CLI). |
| `type` | `postgres` (driver `pg`). |
| `host` / `port` / `username` | Con fallback: `localhost` / `5432` / `postgres`. |
| `password` / `database` | **Sin** fallback: si faltan `DB_PASSWORD` / `DB_NAME`, la conexión falla al arrancar. |
| `entities` | Glob `dist-or-src/**/*.entity.{ts,js}`. Cualquier archivo `*.entity.ts` con `@Entity` se registra solo. |
| `autoLoadEntities: true` | Además, las entidades declaradas en `TypeOrmModule.forFeature([...])` de cada módulo se cargan automáticamente. |
| **`synchronize: false`** | TypeORM **nunca** altera el schema. Todo cambio de tablas es por **migración** (competencia de BD/DevOps). |
| `migrations` | **No** se declaran aquí — las migraciones solo las corre el CLI vía `data-source.ts`. |
| `logging` | No se setea → default de TypeORM (solo `error`). |
| **Módulos cargados** | `PortafolioModule`, `VinculacionModule`, `FasePracticaModule`, `HealthModule`, `AuthModule`, `ControlPeriodosModule`. |
| **Controller raíz** | `AppController` (ver §6). |

> `AuthModule` se carga aquí; por eso su estrategia Passport `'jwt'` y sus guards quedan disponibles para módulos que no lo importan explícitamente (Portafolio Docente, etc.).

---

## 3. `src/config/`

Carpeta con 4 archivos. Solo **uno** (`bigint-transformer.ts`) tiene lógica real usada por la app; otro (`database.config.ts`) existe pero **no se usa**; dos están vacíos.

### 3.1 `bigint-transformer.ts`

```ts
import { ValueTransformer } from 'typeorm';

// El driver pg devuelve bigint como texto; lo convertimos a número al leer.
// Se aplica en las columnas para que también funcione en INSERT ... RETURNING.
export const bigintTransformer: ValueTransformer = {
  to: (value?: number | null) => value,
  from: (value?: string | null) =>
    value === null || value === undefined ? null : parseInt(value, 10),
};
```

- **Uso**: se importa en las entidades del módulo **Auth** (`UsuarioEntity`, `RolEntity`, `UsuarioRolEntity`) en cada `@PrimaryColumn` / `@Column` de tipo `bigint`, como `transformer: bigintTransformer`.
- `from`: al leer, castea el string del driver a `number` (o `null`). Cubre también los valores devueltos por `INSERT ... RETURNING` que hace `Repository.save()`.
- `to`: identidad (al escribir no transforma).
- Es redundante con `pg.types.setTypeParser(20, ...)` de `main.ts` en el flujo HTTP normal, pero mantiene la conversión aunque ese parser global no estuviera activo (p.ej. tests, o `data-source.ts` en el CLI).
- Las entidades de **Portafolio Docente** no usan este transformer: declaran los IDs como `@PrimaryGeneratedColumn({ name: '...' })` sin tipo `bigint` explícito y confían en el parser global de `main.ts`.

### 3.2 `database.config.ts`

```ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { PortafolioInformeFinal } from '../modules/portafolio-docente/domain/informe-final.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sistema_academico',
  entities: [PortafolioInformeFinal],
  synchronize: false,
};
```

> ⚠️ **No se importa en ningún lado.** `app.module.ts` arma su propia config con `forRootAsync` (§2), y `data-source.ts` arma la suya (§4). Este objeto quedó como resto de una versión anterior: solo registra **una** entidad (`PortafolioInformeFinal`), así que si alguien lo enchufara tal cual, el resto de módulos no tendría entidades. **Candidato a eliminar** o a convertir en la única fuente de verdad, pero hoy es código muerto.

### 3.3 `constants.ts` y `env.config.ts` (vacíos)

```ts
// src/config/constants.ts
export const constants = {};

// src/config/env.config.ts
export const envConfig = {};
```

Ambos son **stubs vacíos** sin referencias. No hay un módulo central de constantes ni de tipado de variables de entorno. Las constantes de negocio viven dentro de cada service (p.ej. `MAX_INTENTOS = 5`, `SALT_ROUNDS = 10` en `auth.service.ts`).

---

## 4. `src/database/data-source.ts` — TypeORM para el CLI de migraciones

Este `DataSource` es el que usan los comandos `npm run migration:*`. Es **independiente** de la config de `app.module.ts`.

```ts
import 'reflect-metadata';
import 'reflect-metadata';          // (import duplicado — inofensivo, candidato a limpiar)
import * as dotenv from 'dotenv';
import { join } from 'node:path';
import { DataSource } from 'typeorm';

dotenv.config();

const requiredEnvironmentVariables = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'] as const;
for (const variable of requiredEnvironmentVariables) {
  if (!process.env[variable]) {
    throw new Error(`Falta la variable de entorno obligatoria: ${variable}`);
  }
}

const databasePort = Number(process.env.DB_PORT);
if (!Number.isInteger(databasePort) || databasePort <= 0) {
  throw new Error('DB_PORT debe ser un número entero válido.');
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: databasePort,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  synchronize: false,
  migrationsRun: false,
  logging: process.env.NODE_ENV === 'development',

  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  migrationsTableName: 'typeorm_migrations',
});
```

| Punto | Valor | Comentario |
|-------|-------|------------|
| **Validación de env** | Falla al importar si falta cualquiera de `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`. | A diferencia de `app.module.ts`, aquí sí hay chequeo explícito (y de que `DB_PORT` sea entero > 0). |
| **`dotenv.config()`** | Carga el `.env` del cwd. | El CLI no pasa por `ConfigModule`. |
| **`synchronize` / `migrationsRun`** | `false` / `false` | Migrar es siempre un acto explícito (`npm run migration:run`). |
| **`logging`** | `true` solo si `NODE_ENV=development` | Muestra el SQL de cada migración en dev. |
| **`entities`** | glob `src/**/*.entity.{ts,js}` (relativo a `src/database/..`) | Necesario para que las migraciones autogeneradas comparen contra el modelo. |
| **`migrations`** | `src/database/migrations/*.{ts,js}` | ~65 archivos con timestamp en el nombre. |
| **`migrationsTableName`** | `typeorm_migrations` | Tabla de control (no la default `migrations`). |

> **El contenido de las migraciones (schema, seeds, constraints) es competencia de Base de Datos / DevOps** y no se documenta en detalle aquí — ver `PROMPT_MAESTRO_FINAL_TESIS_YAVIRAC.md` en la raíz del repo. Este documento solo describe **cómo está cableado** el `DataSource`.

---

## 5. `src/shared/`

```
src/shared/
├── filters/http-exception.filter.ts     # export class HttpExceptionFilter {}   → VACÍO
├── interceptors/response.interceptor.ts # export class ResponseInterceptor {}   → VACÍO
└── utils/validators.ts
```

- **`HttpExceptionFilter`** y **`ResponseInterceptor`**: clases vacías, **no registradas** en `main.ts` ni en ningún módulo. Consecuencia práctica:
  - Las respuestas **no** llevan envoltura tipo `{ data, meta }`; se devuelve el objeto tal cual lo retorna el controller/service.
  - Los errores usan el formato estándar de NestJS: `{ "statusCode": 404, "message": "...", "error": "Not Found" }`.
- **`utils/validators.ts`**: utilidades de validación compartidas (helpers para DTOs). Revisar el archivo para el detalle vigente.

Si en el futuro se quiere una respuesta uniforme o un manejo central de errores, el lugar previsto es rellenar estas dos clases y registrarlas con `app.useGlobalInterceptors(...)` / `app.useGlobalFilters(...)` en `main.ts`.

---

## 6. `src/health/` y `src/app.controller.ts`

### `HealthModule` → `GET /api/health`

`health/health.module.ts` importa `ConfigModule` y registra `HealthController` + `HealthService`.

`HealthService.check()`:
1. Ejecuta `SELECT 1` contra la BD.
2. Si responde, devuelve `200`:

```json
{
  "status": "ok",
  "application": "up",
  "database": "connected",
  "timestamp": "2026-08-31T19:41:20.913Z",
  "environment": "development",
  "version": "1.0.0",
  "commit": "local"
}
```

`environment` ← `NODE_ENV` (default `development`), `version` ← `APP_VERSION` (default `unknown`), `commit` ← `COMMIT_SHA` (default `local`).

3. Si el `SELECT 1` falla → `503 Service Unavailable` con:

```json
{ "status": "error", "application": "up", "database": "disconnected", "timestamp": "..." }
```

### `AppController` (sin prefijo de ruta propio, cuelga de `/api`)

`app.controller.ts` inyecta el `DataSource` y expone 3 endpoints de diagnóstico:

| Método | Ruta | Devuelve |
|--------|------|----------|
| GET | `/api` | `{ "message": "Backend funcionando", "status": "ok", "database": "conectada" }` (literal, no consulta la BD). |
| GET | `/api/health/db` | `SELECT NOW() as now` → `{ status, database, timestamp }`; en error, `{ status: "error", database: "disconnected", message }` (siempre `200`, el error va en el body). |
| GET | `/api/health/tables` | Lista `information_schema.tables` del schema `public` → `{ status, database, tables: string[] }`. |

> Ojo: `AppController` y `HealthController` **ambos** aportan rutas bajo `health/*`. La de `HealthController` es `GET /api/health`; las de `AppController` son `GET /api/health/db` y `GET /api/health/tables`. No colisionan pero conviene saberlo.

Ninguno de estos endpoints está protegido por guard.

---

## 7. Variables de entorno

Fuente: `.env.example` en la raíz del repo (`C:\INSTITUTO-BACK\.env.example`). El `.env` real vive en la raíz y lo lee tanto `ConfigModule.forRoot` (runtime) como `dotenv.config()` (CLI de migraciones).

| Variable | Ejemplo (`.env.example`) | Usada por | Obligatoria | Notas |
|----------|--------------------------|-----------|-------------|-------|
| `NODE_ENV` | `development` | `HealthService`, `data-source.ts` (logging) | no | Default `development`. |
| `PORT` | `3000` | `main.ts` | no | Default `3000`. |
| `APP_VERSION` | `1.0.0` | `HealthService` | no | Default `unknown` en el health. |
| `COMMIT_SHA` | `local` | `HealthService` | no | Default `local`. Lo suele inyectar el pipeline de DevOps. |
| `DB_HOST` | `localhost` | `app.module.ts`, `data-source.ts` | **sí** para el CLI; runtime tiene fallback `localhost` | En Docker suele ser `postgres`. |
| `DB_PORT` | `5432` | idem | **sí** para el CLI (debe ser entero > 0) | Fallback runtime `5432`. |
| `DB_NAME` | `sistema_academico` | idem | **sí** (runtime sin fallback) | — |
| `DB_USER` | `postgres` | idem | **sí** para el CLI; runtime fallback `postgres` | — |
| `DB_PASSWORD` | `12345` | idem | **sí** (runtime sin fallback) | — |
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` | `sistema_academico` / `postgres` / `12345` | contenedor Postgres (`docker-compose`) | solo Docker | No las lee la app Nest; son para inicializar el contenedor. |
| `JWT_SECRET` | `replace_this_before_staging` | `AuthModule` (`JwtModule`), `JwtStrategy` | **sí** para Auth | **Cambiar antes de cualquier despliegue.** |
| `JWT_EXPIRES_IN` | `1h` | `AuthModule` (`signOptions.expiresIn`) | no | Default en código `'7d'`; con este `.env` el token dura **1 h**. |
| `CORS_ORIGIN` | `http://localhost:4200` | `main.ts` (`enableCors`) | no | Un único origen. Default `http://localhost:4200`. |

---

## 8. Scripts npm

De `sistema-academico-backend/package.json`:

| Script | Comando | Para qué |
|--------|---------|----------|
| `npm run dev` | `ts-node src/main.ts` | Arranque local sin build. |
| `npm run start` | `nest start` | Arranque estándar Nest. |
| `npm run start:dev` | `nest start --watch` | Desarrollo con recarga. |
| `npm run start:debug` | `nest start --debug --watch` | Con inspector. |
| `npm run start:prod` | `node dist/main.js` | Producción (tras `build`). |
| `npm run build` | `nest build` | Compila a `dist/`. |
| `npm run typeorm` | `typeorm-ts-node-commonjs` | Base del CLI de TypeORM (ts-node). |
| `npm run migration:show` | `... migration:show -d src/database/data-source.ts` | Lista migraciones y su estado. |
| `npm run migration:run` | `... migration:run -d src/database/data-source.ts` | Aplica migraciones pendientes. |
| `npm run migration:revert` | `... migration:revert -d src/database/data-source.ts` | Revierte la última. |
| `npm run migration:show:prod` / `:run:prod` / `:revert:prod` | igual con `-d dist/database/data-source.js` | Versiones sobre el build (para el contenedor). |

> No hay scripts de test (`jest`) definidos. No hay `lint` ni `format` en `package.json`.

Dependencias clave: `@nestjs/* ^11`, `typeorm ^0.3.21`, `pg ^8.22`, `@nestjs/jwt ^11`, `@nestjs/passport ^11`, `passport-jwt ^4`, `bcryptjs ^2.4.3`, `class-validator ^0.15`, `class-transformer ^0.5`, `dotenv ^17`. Node fijado por `.nvmrc` en la raíz.

---

## 9. Resumen de rutas de infraestructura

| Método | Ruta | Auth | Origen | Descripción |
|--------|------|------|--------|-------------|
| GET | `/api` | pública | `AppController` | Ping literal (`"Backend funcionando"`). |
| GET | `/api/health` | pública | `HealthController` | Estado app + BD + versión/commit; `503` si la BD no responde. |
| GET | `/api/health/db` | pública | `AppController` | `SELECT NOW()`; error en el body con `200`. |
| GET | `/api/health/tables` | pública | `AppController` | Lista de tablas del schema `public`. |

---

## Apéndice — código muerto / a limpiar detectado en esta capa

| Archivo | Estado | Sugerencia |
|---------|--------|------------|
| `src/config/database.config.ts` | No se importa; solo registra 1 entidad. | Eliminar o volverlo la fuente única de config. |
| `src/config/constants.ts` | `export const constants = {}` | Eliminar o poblar. |
| `src/config/env.config.ts` | `export const envConfig = {}` | Eliminar, o usar para validar env con esquema. |
| `src/shared/filters/http-exception.filter.ts` | Clase vacía, sin registrar. | Implementar + `app.useGlobalFilters` o eliminar. |
| `src/shared/interceptors/response.interceptor.ts` | Clase vacía, sin registrar. | Implementar + `app.useGlobalInterceptors` o eliminar. |
| `src/database/data-source.ts` | `import 'reflect-metadata'` duplicado. | Quitar la línea repetida. |

_Última actualización: 2026-08-31. Generado a partir de `sistema-academico-backend/src/main.ts`, `src/app.module.ts`, `src/config/*`, `src/database/data-source.ts`, `src/shared/*`, `src/health/*` y `src/app.controller.ts`._

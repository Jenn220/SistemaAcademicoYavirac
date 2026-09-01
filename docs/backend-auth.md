# Documentación Backend — Módulo Auth

Sistema Académico Institucional Yavirac — `sistema-academico-backend`
Stack: **NestJS 11 + TypeORM 0.3 + PostgreSQL**. Monolito modular, base de datos compartida.
Ruta del módulo: `src/modules/auth/`

> Documentos hermanos: [`backend-bootstrap.md`](./backend-bootstrap.md) (arranque, `main.ts`, `config/`),
> [`backend-portafolio-docente.md`](./backend-portafolio-docente.md), [`backend-fase-practica.md`](./backend-fase-practica.md),
> [`backend-vinculacion.md`](./backend-vinculacion.md).

---

## Tabla de contenido

- [1. Convenciones del backend](#1-convenciones-del-backend)
- [2. Propósito y dependencias](#2-propósito-y-dependencias)
- [3. Estructura de archivos](#3-estructura-de-archivos)
- [4. Wiring del módulo (`auth.module.ts`)](#4-wiring-del-módulo-authmodulets)
- [5. Tablas de base de datos](#5-tablas-de-base-de-datos)
- [6. Entidades TypeORM](#6-entidades-typeorm)
- [7. JWT: payload, estrategia y `req.user`](#7-jwt-payload-estrategia-y-requser)
- [8. Guards y decorador de roles](#8-guards-y-decorador-de-roles)
- [9. Roles del sistema](#9-roles-del-sistema)
- [10. Reglas de negocio y constantes](#10-reglas-de-negocio-y-constantes)
- [11. Endpoints](#11-endpoints)
- [12. Puerto y adaptador del repositorio (`IUsuarioRepository` / `UsuarioPg`)](#12-puerto-y-adaptador-del-repositorio-iusuariorepository--usuariopg)
- [13. Catálogo de errores](#13-catálogo-de-errores)
- [14. Notas de seguridad y limitaciones](#14-notas-de-seguridad-y-limitaciones)
- [15. Resumen de endpoints](#15-resumen-de-endpoints)

---

## 1. Convenciones del backend

| Tema | Regla real en el código |
|------|-------------------------|
| **Prefijo global** | Todas las rutas cuelgan de `/api` (`app.setGlobalPrefix('api')` en `main.ts`). `@Controller('auth')` → `/api/auth/...`. |
| **Validación** | `ValidationPipe` global con `{ whitelist: true, transform: true, forbidNonWhitelisted: false }`. Propiedades no declaradas en el DTO se **descartan** (no se rechaza la petición). |
| **Forma del body** | DTO de entrada en **snake_case** (igual que la BD y la URL). En Auth las entidades también usan propiedades snake_case (`id_usuario`, `password_hash`...). |
| **IDs `bigint`** | El driver `pg` devuelve `bigint` como texto. Se corrige en (a) `main.ts` con `pg.types.setTypeParser(20, ...)` y (b) `config/bigint-transformer.ts` aplicado columna por columna en las entidades de Auth. Los IDs viajan como número en el JSON. |
| **SQL** | Híbrido: `Repository.update()/count()` para escrituras simples; `dataSource.query()` / `manager.query()` con placeholders `$1, $2...` para lecturas con `JOIN` y para operaciones compuestas. |
| **Envoltura de respuesta** | **No hay.** `shared/interceptors/response.interceptor.ts` y `shared/filters/http-exception.filter.ts` son clases vacías sin registrar. Respuestas crudas de NestJS; errores en formato estándar `{ statusCode, message, error }`. |
| **Transacciones** | `this.dataSource.transaction(async (manager) => { ... })`. En Auth se usa en `crearUsuarioConRol`. |
| **Códigos HTTP** | `200` GET/PATCH ok · `201` POST ok · `400` validación · `401` no autenticado / credenciales · `403` sin rol / cuenta bloqueada · `404` no encontrado. |

---

## 2. Propósito y dependencias

Autenticación por **JWT de acceso** (sin refresh token) y autorización por **roles**. Además, tareas administrativas que solo puede hacer un `COORDINADOR`: alta masiva de usuarios por período y desbloqueo de cuentas.

Dependencias npm relevantes:

| Paquete | Versión | Uso |
|---------|---------|-----|
| `@nestjs/jwt` | ^11.0.0 | Firma/lectura del token (`JwtService`). |
| `@nestjs/passport` | ^11.0.5 | Integración Passport. |
| `passport-jwt` | ^4.0.0 | Estrategia `jwt` (extrae `Authorization: Bearer`). |
| `bcryptjs` | ^2.4.3 | Hash y comparación de contraseñas. |
| `class-validator` / `class-transformer` | ^0.15 / ^0.5 | Validación de DTOs. |

---

## 3. Estructura de archivos

```
src/modules/auth/
├── auth.module.ts
├── controllers/
│   └── auth.controller.ts
├── services/
│   └── auth.service.ts
├── adapters/
│   └── usuario.pg.ts                # implementación PostgreSQL de IUsuarioRepository
├── ports/
│   └── usuario.repository.ts        # interfaz IUsuarioRepository + token USUARIO_REPOSITORY + tipos
├── domain/
│   ├── usuario.entity.ts            # tabla usuario
│   ├── rol.entity.ts                # tabla rol
│   └── usuario-rol.entity.ts        # tabla usuario_rol
├── dto/
│   ├── login.dto.ts
│   ├── login-response.dto.ts        # LoginResponseDto + UsuarioSesionDto
│   ├── cambiar-password.dto.ts
│   ├── generar-accesos.dto.ts
│   ├── desbloquear.dto.ts
│   ├── me-response.dto.ts           # MeResponseDto extends UsuarioSesionDto
│   └── register.dto.ts             # VACÍO (export class RegisterDto {}) — sin uso
├── guards/
│   ├── jwt.guard.ts                 # JwtGuard extends AuthGuard('jwt')
│   └── roles.guard.ts               # RolesGuard (lee metadata ROLES_KEY)
├── strategies/
│   └── jwt.strategy.ts
├── decorators/
│   └── roles.decorator.ts           # @Roles(...roles) + ROLES_KEY
└── interfaces/
    ├── jwt-payload.interface.ts     # JwtPayload
    └── authenticated-request.interface.ts   # AuthenticatedRequest (Request + user: JwtPayload)
```

---

## 4. Wiring del módulo (`auth.module.ts`)

```ts
imports: [
  ConfigModule,
  PassportModule.register({ defaultStrategy: 'jwt' }),
  JwtModule.registerAsync({
    inject: [ConfigService],
    useFactory: (config) => ({
      secret: config.get('JWT_SECRET'),
      signOptions: { expiresIn: config.get('JWT_EXPIRES_IN') || '7d' },
    }),
  }),
  TypeOrmModule.forFeature([UsuarioEntity, RolEntity, UsuarioRolEntity]),
],
controllers: [AuthController],
providers: [
  AuthService,
  JwtStrategy,
  { provide: USUARIO_REPOSITORY, useClass: UsuarioPg },   // inyección por token string
],
```

Notas:
- El **default** del código para `expiresIn` es `'7d'`, pero `.env` / `.env.example` traen `JWT_EXPIRES_IN=1h`, así que en la práctica el token dura **1 hora**.
- `AuthModule` no exporta nada, pero al registrar `JwtStrategy` y `PassportModule` la estrategia `'jwt'` queda disponible para toda la app. Por eso otros módulos (Portafolio Docente, Fase Práctica, Vinculación) pueden usar `JwtGuard` / `RolesGuard` sin importar `AuthModule` — solo importan las clases de guard/decorador directamente.

---

## 5. Tablas de base de datos

Base creada en `1784092320080-CreatePeopleCompaniesAndSecurity.ts`:

```sql
CREATE TABLE public.rol (
    id_rol  bigint NOT NULL,        -- PK, secuencia
    nombre  varchar(50) NOT NULL
);

CREATE TABLE public.usuario (
    id_usuario     bigint NOT NULL,          -- PK, secuencia
    correo         varchar(150) NOT NULL,    -- UNIQUE (usuario_correo_key)
    password_hash  varchar(255) NOT NULL,
    estado         varchar(20) NOT NULL DEFAULT 'ACTIVO'
);

CREATE TABLE public.usuario_rol (
    id_usuario_rol  bigint NOT NULL,   -- PK, secuencia
    id_usuario      bigint NOT NULL,   -- FK → usuario(id_usuario)
    id_rol          bigint NOT NULL    -- FK → rol(id_rol)
);
-- UNIQUE (id_usuario, id_rol)  → uk_usuario_rol
```

Ampliación en `1784167600000-AddAuthFieldsToUsuarioAndSeedRoles.ts`:

```sql
ALTER TABLE public.usuario
  ADD COLUMN id_docente             bigint NULL REFERENCES docente(id_docente),
  ADD COLUMN id_estudiante          bigint NULL REFERENCES estudiante(id_estudiante),
  ADD COLUMN id_empresa             bigint NULL REFERENCES empresa(id_empresa),
  ADD COLUMN debe_cambiar_password  boolean NOT NULL DEFAULT true,
  ADD COLUMN intentos_fallidos      integer NOT NULL DEFAULT 0,
  ADD COLUMN bloqueado              boolean NOT NULL DEFAULT false;

CREATE INDEX idx_usuario_id_docente    ON public.usuario (id_docente);
CREATE INDEX idx_usuario_id_estudiante ON public.usuario (id_estudiante);
CREATE INDEX idx_usuario_id_empresa    ON public.usuario (id_empresa);

-- Semilla de los 4 roles:
INSERT INTO public.rol (nombre) VALUES ('DOCENTE'), ('ESTUDIANTE'), ('TUTOR_EMPRESARIAL'), ('COORDINADOR');
```

Otra migración relacionada: `1785275800000-AddOnDeleteCascadeToUsuarioRol.ts` — pone `ON DELETE CASCADE` en `usuario_rol.fk_usuario_rol_usuario` (al borrar un `usuario` se borran sus filas de `usuario_rol`).

> El vínculo usuario↔persona es exclusivo por diseño de datos, pero **no hay CHECK** que lo fuerce: un `usuario` apunta a lo sumo a uno de `id_docente` / `id_estudiante` / `id_empresa` (los otros dos quedan `NULL`).

---

## 6. Entidades TypeORM

**`UsuarioEntity`** (`@Entity({ name: 'usuario' })`) — propiedades en snake_case:

| Propiedad | Columna | Tipo | Notas |
|-----------|---------|------|-------|
| `id_usuario` | `id_usuario` | `bigint` + `@Generated('increment')` | PK, `bigintTransformer` |
| `correo` | `correo` | `varchar(150)` | único en BD |
| `password_hash` | `password_hash` | `varchar(255)` | hash bcrypt |
| `estado` | `estado` | `varchar(20)` | default `'ACTIVO'` |
| `id_docente` | `id_docente` | `bigint` nullable | `bigintTransformer` |
| `id_estudiante` | `id_estudiante` | `bigint` nullable | `bigintTransformer` |
| `id_empresa` | `id_empresa` | `bigint` nullable | `bigintTransformer` |
| `debe_cambiar_password` | `debe_cambiar_password` | `boolean` | default `true` |
| `intentos_fallidos` | `intentos_fallidos` | `int` | default `0` |
| `bloqueado` | `bloqueado` | `boolean` | default `false` |

**`RolEntity`** (`rol`): `id_rol` (PK, `bigintTransformer`), `nombre` (`varchar(50)`).

**`UsuarioRolEntity`** (`usuario_rol`): `id_usuario_rol` (PK), `id_usuario` (`bigint`), `id_rol` (`bigint`). Sin relaciones declaradas; el join usuario→roles se hace por SQL en el adaptador.

---

## 7. JWT: payload, estrategia y `req.user`

**`JwtPayload`** (lo que se firma y lo que queda en `req.user`):

```ts
interface JwtPayload {
  sub: number;               // id_usuario
  correo: string;
  roles: string[];           // ej. ['DOCENTE', 'COORDINADOR']
  idDocente: number | null;
  idEstudiante: number | null;
  idEmpresa: number | null;
}
```

**`JwtStrategy`** (`strategies/jwt.strategy.ts`):
- `jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()` → header `Authorization: Bearer <token>`.
- `ignoreExpiration: false` → token vencido = `401`.
- `secretOrKey: JWT_SECRET`.
- `validate(payload)` devuelve el **payload tal cual** (no consulta la BD). Passport lo asigna a `request.user`.

Consecuencia: los roles y los `idDocente/idEstudiante/idEmpresa` que usan los controllers salen del **token**, no de una consulta fresca. Si cambian los roles de un usuario, el cambio aplica cuando renueve el token (relogin).

---

## 8. Guards y decorador de roles

| Elemento | Archivo | Comportamiento |
|----------|---------|----------------|
| `JwtGuard` | `guards/jwt.guard.ts` | `extends AuthGuard('jwt')`. Sin token / token inválido / vencido → `401`. Rellena `req.user` con `JwtPayload`. |
| `RolesGuard` | `guards/roles.guard.ts` | Lee metadata `ROLES_KEY` con `Reflector.getAllAndOverride` (handler + clase). Si no hay `@Roles(...)` → deja pasar. Si hay, exige que `req.user.roles` contenga **al menos uno** de los roles pedidos; si no → `ForbiddenException('No tiene permisos para acceder a este recurso')` (`403`). Depende de que `JwtGuard` haya corrido antes. |
| `@Roles(...roles)` | `decorators/roles.decorator.ts` | `SetMetadata(ROLES_KEY, roles)`. `ROLES_KEY = 'roles'`. |

Uso típico: `@UseGuards(JwtGuard, RolesGuard)` + `@Roles('COORDINADOR')`.

---

## 9. Roles del sistema

Sembrados por migración, tabla `rol`:

| Rol | Origen del usuario | Contraseña inicial |
|-----|--------------------|--------------------|
| `DOCENTE` | fila en `docente` | `docente.cedula` |
| `ESTUDIANTE` | fila en `estudiante` | `estudiante.cedula` |
| `TUTOR_EMPRESARIAL` | fila en `empresa` | `empresa.ruc` |
| `COORDINADOR` | se asigna manualmente (no lo crea `generar-accesos`) | — |

---

## 10. Reglas de negocio y constantes

Definidas en `services/auth.service.ts`:

| Constante | Valor | Efecto |
|-----------|-------|--------|
| `MAX_INTENTOS` | `5` | Al 5.º fallo de contraseña, `bloqueado = true`. |
| `SALT_ROUNDS` | `10` | Coste de `bcrypt.hash`. |

- **Login fallido**: `registrarIntentoFallido` hace `intentos_fallidos = intentos_fallidos + 1` y `bloqueado = (intentos_fallidos + 1 >= 5)` en un solo `UPDATE`.
- **Login correcto**: `resetearIntentos` pone `intentos_fallidos = 0` (no toca `bloqueado`).
- **`estado` distinto de `'ACTIVO'`** → login rechazado con `401` genérico (mismo mensaje que credenciales inválidas).
- **Cuenta `bloqueado = true`** → `403` con mensaje explícito de solicitar desbloqueo al coordinador. Solo un `COORDINADOR` la reactiva vía `/api/auth/desbloquear`.
- **`debe_cambiar_password`**: llega en la respuesta de login como `debeCambiarPassword`. El front decide forzar el cambio. `cambiar-password` lo pone en `false`; `desbloquear` lo pone en `true`.

---

## 11. Endpoints

Base: `/api/auth`

---

### `POST /api/auth/login` — público

**Body** (`LoginDto`):

```json
{ "correo": "docente@yavirac.edu.ec", "password": "1712345678" }
```

- `correo`: `@IsNotEmpty() @IsString()`. **No** se valida como email a propósito: para `TUTOR_EMPRESARIAL` el "correo" es la **razón social** de la empresa, no un email.
- `password`: `@IsNotEmpty() @IsString()`.

**Flujo** (`AuthService.login`):
1. `findByCorreoConRoles(correo)`. Si no existe **o** `estado !== 'ACTIVO'` → `401 Credenciales inválidas`.
2. Si `bloqueado` → `403 Cuenta bloqueada por intentos fallidos. Solicite el desbloqueo al coordinador.`
3. `bcrypt.compare(password, password_hash)`. Si falla → `registrarIntentoFallido(id, 5)` y `401 Credenciales inválidas`.
4. Si ok → `resetearIntentos(id)` y se firma el JWT.

**Respuesta `200`** (`LoginResponseDto`):

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 10,
    "correo": "docente@yavirac.edu.ec",
    "roles": ["DOCENTE"],
    "idDocente": 4,
    "idEstudiante": null,
    "idEmpresa": null
  },
  "debeCambiarPassword": true
}
```

---

### `POST /api/auth/cambiar-password` — `JwtGuard`

Cualquier usuario autenticado cambia su propia contraseña. El `idUsuario` sale de `req.user.sub` (no se pasa por body).

**Body** (`CambiarPasswordDto`):

```json
{ "passwordActual": "1712345678", "passwordNueva": "MiClave2026" }
```

- `passwordActual`: `@IsOptional() @IsString()`. Si se envía, se valida con `bcrypt.compare`; si no coincide → `401 La contraseña actual no es correcta`. Si se omite (caso "primer login" / reset), se salta esa validación.
- `passwordNueva`: `@IsNotEmpty() @IsString() @MinLength(6) @Matches(/^\S+$/)` → mínimo 6 caracteres, **sin espacios** (`La contraseña no puede contener espacios`).

**Efecto**: `password_hash = bcrypt.hash(nueva, 10)` y `debe_cambiar_password = false`.
**Respuesta `200`**: cuerpo vacío (el service devuelve `void`).
Si el usuario del token ya no existe → `401 Usuario no encontrado`.

---

### `GET /api/auth/me` — `JwtGuard`

Relee el usuario de BD (`findByIdConRoles(req.user.sub)`) y devuelve `UsuarioSesionDto` (mismo shape que `login.usuario`). `401 Usuario no encontrado` si ya no existe.

```json
{ "id": 10, "correo": "...", "roles": ["DOCENTE"], "idDocente": 4, "idEstudiante": null, "idEmpresa": null }
```

---

### `POST /api/auth/generar-accesos` — `JwtGuard` + `RolesGuard` + `@Roles('COORDINADOR')`

Alta **masiva** de usuarios para todas las personas de un tipo que participan en un período y aún no tienen `usuario`.

**Body** (`GenerarAccesosDto`):

```json
{ "tipo": "ESTUDIANTE", "id_periodo": 4 }
```

- `tipo`: `@IsIn(['ESTUDIANTE', 'DOCENTE', 'EMPRESA'])`.
- `id_periodo`: `@IsNotEmpty() @IsNumber()` (mensajes custom: "El período académico es obligatorio", "El ID del período académico debe ser un número").

**Mapa tipo → rol asignado** (`rolPorTipo`):

| `tipo` | Rol creado | Candidatos (query) | "correo" | Clave temporal |
|--------|-----------|--------------------|----------|----------------|
| `ESTUDIANTE` | `ESTUDIANTE` | `estudiante` con `matricula` en ese `id_periodo` y sin `usuario` | `estudiante.correo` | `estudiante.cedula` |
| `DOCENTE` | `DOCENTE` | `docente` con `oferta_asignatura` → `periodo_carrera.id_periodo` = ese período y sin `usuario` | `docente.correo` | `docente.cedula` |
| `EMPRESA` | `TUTOR_EMPRESARIAL` | `empresa` con `practica_estudiante` en ese `id_periodo` y sin `usuario` | **`empresa.razon_social`** (¡no un email!) | `empresa.ruc` |

**Por cada candidato** (`AuthService.generarAccesos`), se omite con motivo si:
- no tiene `correo` → `Registro id=<id> sin correo, se omitió`;
- no tiene cédula/ruc → `Sin cédula o RUC registrado para generar la contraseña inicial`;
- ese `correo` ya está en uso → `Ese correo ya está en uso por otro usuario, se omitió`.

Si pasa, `crearUsuarioConRol` (transacción): inserta `usuario` (con `password_hash = bcrypt.hash(claveTemporal, 10)` y el `id_docente`/`id_estudiante`/`id_empresa` correspondiente), busca `rol.id_rol` por nombre (error si no existe) e inserta en `usuario_rol`. Los nuevos usuarios nacen con `debe_cambiar_password = true` (default de columna).

**Respuesta `201`**:

```json
{
  "tipo": "ESTUDIANTE",
  "creados": 12,
  "correos": ["ana@yavirac.edu.ec", "..."],
  "errores": [
    { "correo": "sinclave@yavirac.edu.ec", "motivo": "Sin cédula o RUC registrado para generar la contraseña inicial" },
    { "motivo": "Registro id=87 sin correo, se omitió" }
  ]
}
```

`400 El período académico es obligatorio.` si `id_periodo` es falsy.

---

### `POST /api/auth/desbloquear` — `JwtGuard` + `RolesGuard` + `@Roles('COORDINADOR')`

Resetea la contraseña de una cuenta a su cédula/ruc y la desbloquea.

**Body** (`DesbloquearDto`): `{ "correo": "docente@yavirac.edu.ec" }` (`@IsNotEmpty() @IsString()`, tampoco validado como email).

**Flujo**: `buscarClaveTemporalPorCorreo` obtiene `COALESCE(docente.cedula, estudiante.cedula, empresa.ruc)` según a qué persona apunte el usuario. Si no hay ninguna → `404 No se encontró una cédula/ruc para resetear la contraseña de este usuario`. Si hay, `resetearPasswordYDesbloquear`: `password_hash = bcrypt.hash(claveTemporal, 10)`, `debe_cambiar_password = true`, `bloqueado = false`, `intentos_fallidos = 0`.

**Respuesta `201`**:

```json
{
  "mensaje": "Cuenta desbloqueada. La contraseña se reseteó a la cédula/ruc; el usuario deberá cambiarla en su próximo login.",
  "nuevaClaveTemporal": "1712345678"
}
```

---

### `GET /api/auth/periodos-activos` — `JwtGuard` + `RolesGuard` + `@Roles('COORDINADOR')`

Helper para el front (elegir período antes de `generar-accesos`). Devuelve `periodo_academico` con `estado = 'ACTIVO'`, ordenado por `id_periodo DESC`:

```json
[ { "id_periodo": 4, "nombre": "2025-II", "codigo": "2025B" } ]
```

---

## 12. Puerto y adaptador del repositorio (`IUsuarioRepository` / `UsuarioPg`)

Token de inyección: `USUARIO_REPOSITORY = 'USUARIO_REPOSITORY'` (string).
Implementación: `adapters/usuario.pg.ts` (`@Injectable` con `Repository<UsuarioEntity>` + `DataSource`).

| Método | SQL / mecanismo | Devuelve |
|--------|-----------------|----------|
| `findByCorreoConRoles(correo)` | `SELECT ... FROM usuario u LEFT JOIN usuario_rol ur LEFT JOIN rol r WHERE u.correo = $1 GROUP BY u.id_usuario`, con `COALESCE(array_agg(r.nombre) FILTER (WHERE r.nombre IS NOT NULL), '{}') AS roles` | `UsuarioConRoles \| null` |
| `findByIdConRoles(idUsuario)` | idéntico con `WHERE u.id_usuario = $1` | `UsuarioConRoles \| null` |
| `registrarIntentoFallido(id, maxIntentos)` | `UPDATE usuario SET intentos_fallidos = intentos_fallidos + 1, bloqueado = (intentos_fallidos + 1 >= $2) WHERE id_usuario = $1` | `void` |
| `resetearIntentos(id)` | `repo.update(id, { intentos_fallidos: 0 })` | `void` |
| `buscarClaveTemporalPorCorreo(correo)` | `SELECT u.id_usuario AS "idUsuario", COALESCE(d.cedula, e.cedula, emp.ruc) AS "claveTemporal" FROM usuario u LEFT JOIN docente d LEFT JOIN estudiante e LEFT JOIN empresa emp WHERE u.correo = $1` | `{ idUsuario, claveTemporal } \| null` |
| `resetearPasswordYDesbloquear(id, hash)` | `repo.update(id, { password_hash, debe_cambiar_password: true, bloqueado: false, intentos_fallidos: 0 })` | `void` |
| `actualizarPassword(id, hash)` | `repo.update(id, { password_hash, debe_cambiar_password: false })` | `void` |
| `findEstudiantesSinUsuarioPorPeriodo(idPeriodo)` | `estudiante` ⨝ `matricula` (por `id_periodo`) + `NOT EXISTS (usuario)` | `PersonaSinUsuario[]` |
| `findDocentesSinUsuarioPorPeriodo(idPeriodo)` | `docente` ⨝ `oferta_asignatura` ⨝ `periodo_carrera` (por `id_periodo`) + `NOT EXISTS (usuario)` | `PersonaSinUsuario[]` |
| `findEmpresasSinUsuarioPorPeriodo(idPeriodo)` | `empresa` ⨝ `practica_estudiante` (por `id_periodo`) + `NOT EXISTS (usuario)`; **selecciona `razon_social AS correo`** | `PersonaSinUsuario[]` |
| `crearUsuarioConRol(input)` | Transacción: `manager.save(UsuarioEntity)` → `SELECT id_rol FROM rol WHERE nombre = $1` → `INSERT INTO usuario_rol` | `UsuarioEntity` |
| `findPeriodosActivos()` | `SELECT id_periodo, nombre, codigo FROM periodo_academico WHERE estado = 'ACTIVO' ORDER BY id_periodo DESC` | `PeriodoAcademicoResponse[]` |

Tipos del puerto (`ports/usuario.repository.ts`):

```ts
interface UsuarioConRoles {
  id_usuario: number; correo: string; password_hash: string; estado: string;
  id_docente: number | null; id_estudiante: number | null; id_empresa: number | null;
  debe_cambiar_password: boolean; intentos_fallidos: number; bloqueado: boolean;
  roles: string[];
}
interface PersonaSinUsuario { id: number; correo: string; claveTemporal: string; }
interface CrearUsuarioConRolInput {
  correo: string; passwordHash: string;
  idDocente?: number; idEstudiante?: number; idEmpresa?: number; rolNombre: string;
}
interface ClaveTemporalUsuario { idUsuario: number; claveTemporal: string | null; }
interface PeriodoAcademicoResponse { id_periodo: number; nombre: string; codigo: string; }
```

---

## 13. Catálogo de errores

| HTTP | Mensaje | Cuándo |
|------|---------|--------|
| `401` | `Credenciales inválidas` | Correo inexistente, `estado != 'ACTIVO'`, o contraseña incorrecta en login. |
| `403` | `Cuenta bloqueada por intentos fallidos. Solicite el desbloqueo al coordinador.` | Login con `bloqueado = true`. |
| `401` | `La contraseña actual no es correcta` | `cambiar-password` con `passwordActual` errónea. |
| `401` | `Usuario no encontrado` | El `sub` del token ya no existe (`cambiar-password`, `me`). |
| `403` | `No tiene permisos para acceder a este recurso` | `RolesGuard` sin rol requerido. |
| `400` | `El período académico es obligatorio.` | `generar-accesos` sin `id_periodo`. |
| `404` | `No se encontró una cédula/ruc para resetear la contraseña de este usuario` | `desbloquear` de un usuario sin persona asociada con cédula/ruc. |
| `400` | (errores de `class-validator`) | DTO inválido (p.ej. `passwordNueva` < 6 o con espacios). |

---

## 14. Notas de seguridad y limitaciones

- **Sin refresh token.** Cuando el `accessToken` vence (≈1 h con `JWT_EXPIRES_IN=1h`), hay que volver a hacer login.
- **`JWT_SECRET`** en `.env.example` es `replace_this_before_staging`. Cambiarlo antes de cualquier despliegue (competencia de DevOps/BD, ver `PROMPT_MAESTRO_FINAL_TESIS_YAVIRAC.md`).
- **Contraseñas iniciales = cédula / RUC**, que son datos semipúblicos. Por eso `debe_cambiar_password` nace en `true` y el front debe forzar el cambio en el primer acceso.
- **Roles cacheados en el token**: cambiar `usuario_rol` no afecta sesiones ya emitidas hasta el relogin.
- `register.dto.ts` está vacío: **no existe** endpoint de auto-registro. El alta es siempre por `COORDINADOR` (`generar-accesos`) o por seeds/migraciones.
- No hay endpoint para asignar el rol `COORDINADOR`; se hace por SQL/migración.
- El "correo" de un `TUTOR_EMPRESARIAL` es la **razón social**: ese literal es su usuario de login.

---

## 15. Resumen de endpoints

Prefijo global `/api`. Autenticación por `Authorization: Bearer <accessToken>`.

| Método | Ruta | Guard | Rol | Body | Descripción |
|--------|------|-------|-----|------|-------------|
| POST | `/auth/login` | — | público | `LoginDto` | Devuelve `accessToken` + `usuario` + `debeCambiarPassword`. |
| POST | `/auth/cambiar-password` | `JwtGuard` | cualquiera | `CambiarPasswordDto` | Cambia la propia contraseña; `debe_cambiar_password → false`. |
| GET | `/auth/me` | `JwtGuard` | cualquiera | — | Datos de sesión releídos de BD. |
| POST | `/auth/generar-accesos` | `JwtGuard`+`RolesGuard` | `COORDINADOR` | `GenerarAccesosDto` | Alta masiva de usuarios por período y tipo. |
| POST | `/auth/desbloquear` | `JwtGuard`+`RolesGuard` | `COORDINADOR` | `DesbloquearDto` | Resetea password a cédula/ruc y desbloquea. |
| GET | `/auth/periodos-activos` | `JwtGuard`+`RolesGuard` | `COORDINADOR` | — | `periodo_academico` con `estado='ACTIVO'`. |

---

_Última actualización: 2026-08-31. Generado a partir de `sistema-academico-backend/src/modules/auth`._

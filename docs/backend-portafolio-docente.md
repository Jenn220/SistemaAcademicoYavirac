# Documentación Backend — Módulo Portafolio Docente

Sistema Académico Institucional Yavirac — `sistema-academico-backend`
Stack: **NestJS 11 + TypeORM 0.3 + PostgreSQL**. Monolito modular, base de datos compartida.
Ruta del módulo: `src/modules/portafolio-docente/`

> Documentos hermanos: [`backend-bootstrap.md`](./backend-bootstrap.md), [`backend-auth.md`](./backend-auth.md),
> [`backend-fase-practica.md`](./backend-fase-practica.md), [`backend-vinculacion.md`](./backend-vinculacion.md).

---

## Tabla de contenido

- [1. Convenciones del backend](#1-convenciones-del-backend)
- [2. Propósito y features](#2-propósito-y-features)
- [3. Arquitectura hexagonal (5 capas)](#3-arquitectura-hexagonal-5-capas)
- [4. Estructura de archivos](#4-estructura-de-archivos)
- [5. Wiring del módulo (`portafolio.module.ts`)](#5-wiring-del-módulo-portafoliomodulets)
- [6. Seguridad: todos los endpoints exigen rol DOCENTE](#6-seguridad-todos-los-endpoints-exigen-rol-docente)
- [7. Tablas de base de datos](#7-tablas-de-base-de-datos)
- [8. Particularidad del schema: `oferta_asignatura` → `docente`](#8-particularidad-del-schema-oferta_asignatura--docente)
- [9. Feature: Portafolio (ofertas del docente)](#9-feature-portafolio-ofertas-del-docente)
- [10. Feature: Informe Final](#10-feature-informe-final)
- [11. Feature: Aceptación de Notas](#11-feature-aceptación-de-notas)
- [12. Feature: Seguimiento PEA](#12-feature-seguimiento-pea)
- [13. Scaffolding vacío (no usar)](#13-scaffolding-vacío-no-usar)
- [14. Catálogo de errores](#14-catálogo-de-errores)
- [15. Cómo probar (orden de seed)](#15-cómo-probar-orden-de-seed)
- [16. Resumen de endpoints](#16-resumen-de-endpoints)

---

## 1. Convenciones del backend

| Tema | Regla real en el código |
|------|-------------------------|
| **Prefijo global** | Todas las rutas cuelgan de `/api` (`app.setGlobalPrefix('api')`). `@Controller('portafolio/...')` → `/api/portafolio/...`. |
| **Validación** | `ValidationPipe` global `{ whitelist: true, transform: true, forbidNonWhitelisted: false }`. Propiedades no declaradas en el DTO se descartan. |
| **Forma del body** | DTO de entrada en **snake_case** (igual que la BD y la URL): `id_oferta_asignatura`, `id_periodo`... |
| **Entidades TypeORM** | Propiedades en **camelCase** mapeadas con `@Column({ name: 'snake_case' })`. Ej. `idOfertaAsignatura` ↔ `id_oferta_asignatura`. Sin relaciones `@ManyToOne`; los joins se escriben a mano en SQL. |
| **IDs `bigint`** | Llegan como `number` en el JSON gracias a `pg.types.setTypeParser(20, ...)` en `main.ts`. Las entidades de este módulo usan `@PrimaryGeneratedColumn` sin tipo `bigint` explícito. |
| **SQL** | Híbrido: `Repository.save()/update()/count()/findOneBy()` para escrituras y lecturas simples sobre la tabla propia; `dataSource.query()` / `manager.query()` con `$1, $2...` para lecturas con `JOIN`. |
| **Envoltura de respuesta** | **No hay.** Respuestas crudas de NestJS; errores en formato estándar `{ statusCode, message, error }`. |
| **Transacciones** | `this.dataSource.transaction(async (manager) => { ... })`. En este módulo: `generarReporte` y `actualizarNotas` (Aceptación de Notas). |
| **Códigos HTTP** | `200` GET/PATCH ok · `201` POST ok · `400` validación · `401` no autenticado · `403` sin rol · `404` no encontrado · `409` duplicado. |

---

## 2. Propósito y features

Expone los datos que alimentan los formatos del portafolio docente. **Cuatro features activas**, cada una con su controller/service/port/adapter:

| Feature | Base de ruta | Qué resuelve |
|---------|--------------|--------------|
| **Portafolio** | `/api/portafolio` | Lista las ofertas (materias-paralelo) del docente logueado y los estudiantes de una oferta. Es el "índice" del portafolio, con flags de qué formatos ya se generaron. |
| **Informe Final** | `/api/portafolio/informe-final` | Cabecera del informe final de una oferta (docente, asignatura, paralelo, horario, período) + estado de firmas. |
| **Aceptación de Notas** | `/api/portafolio/aceptacion-notas` | Formato 07 — Aceptación de Nota: genera el reporte por tipo (Aporte 1 / Aporte 2 / Supletorio), lista estudiantes y permite cargar sus notas. |
| **Seguimiento PEA** | `/api/portafolio/seguimiento-pea` | Cabecera del seguimiento al Plan de Estudios de Asignatura + estudiante representante del paralelo. |

---

## 3. Arquitectura hexagonal (5 capas)

| Capa | Carpeta | Responsabilidad |
|------|---------|-----------------|
| Dominio | `domain/` | Entidad TypeORM, 1 archivo por tabla. Propiedades camelCase ↔ columnas snake_case. |
| DTO | `dto/` | `Create...Dto` / `Update...Dto` (entrada, snake_case, con `class-validator`) y `...ResponseDto` (salida). |
| Puerto | `ports/` | Interfaz `I...Repository` (o `...Repository`) + token de inyección string (`INFORME_FINAL_REPOSITORY`, etc.). |
| Adaptador | `adapters/` | Implementación Postgres `...Pg` (TypeORM `Repository` + `DataSource` para SQL crudo). |
| Controller / Service | `controllers/`, `services/` | Controller delgado (guards + `@Roles` + parseo de params) que delega en el service; el service tiene la lógica y lanza las excepciones de NestJS (`NotFoundException`, `ConflictException`). |

---

## 4. Estructura de archivos

```
src/modules/portafolio-docente/
├── portafolio.module.ts
├── controllers/
│   ├── portafolio.controller.ts        # GET mis-ofertas · GET oferta/:id/estudiantes
│   ├── informe-final.controller.ts     # GET :id_oferta · POST · PATCH :id_informe_final
│   ├── aceptacion-notas.controller.ts  # POST · GET :id_oferta/:tipo · PATCH :id/notas
│   ├── seguimiento-pea.controller.ts   # POST · GET :id_oferta · PATCH :id/representante
│   └── evidencia.controller.ts         # VACÍO (export class EvidenciaController {}) — sin uso
├── services/
│   ├── portafolio.service.ts
│   ├── informe-final.service.ts
│   ├── aceptacion-notas.service.ts
│   ├── seguimiento-pea.service.ts
│   └── evidencia.service.ts            # VACÍO — sin uso
├── adapters/
│   ├── portafolio.pg.ts
│   ├── informe-final.pg.ts
│   ├── aceptacion-notas.pg.ts
│   └── seguimiento-pea.pg.ts
├── ports/
│   ├── portafolio.repository.ts        # PortafolioRepository + PORTAFOLIO_REPOSITORY
│   ├── informe-final.repository.ts     # IInformeFinalRepository + INFORME_FINAL_REPOSITORY
│   ├── aceptacion-notas.repository.ts  # IAceptacionNotasRepository + ACEPTACION_NOTAS_REPOSITORY
│   └── seguimiento-pea.repository.ts   # ISeguimientoPeaRepository + SEGUIMIENTO_PEA_REPOSITORY
├── domain/
│   ├── informe-final.entity.ts         # portafolio_informe_final
│   ├── reporte-notas.entity.ts         # portafolio_reporte_notas
│   ├── aceptacion-estudiante.entity.ts # portafolio_aceptacion_estudiante
│   ├── seguimiento-pea.entity.ts       # portafolio_seguimiento_pea
│   └── portafolio.entity.ts            # VACÍO (export class PortafolioEntity {}) — sin uso
└── dto/
    ├── oferta-docente.dto.ts               # OfertaDocenteDto (salida de mis-ofertas)
    ├── estudiante-oferta.dto.ts            # EstudianteOfertaDto
    ├── create-informe-final.dto.ts
    ├── informe-final-response.dto.ts       # InformeFinalResponseDto { informe, firmas }
    ├── update-horario-informe-final.dto.ts
    ├── create-reporte-notas.dto.ts
    ├── reporte-notas-response.dto.ts       # ReporteNotasResponseDto { reporte, estudiantes[] }
    ├── update-notas-aceptacion.dto.ts      # UpdateNotasAceptacionDto + NotaEstudianteDto
    ├── tipo-reporte.util.ts                # normalizarTipoReporte() + TIPOS_REPORTE_VALIDOS
    ├── create-seguimiento-pea.dto.ts
    ├── seguimiento-pea-response.dto.ts
    ├── update-representante-seguimiento-pea.dto.ts
    ├── create-portafolio.dto.ts            # VACÍO — sin uso
    └── update-portafolio.dto.ts            # VACÍO — sin uso
```

---

## 5. Wiring del módulo (`portafolio.module.ts`)

```ts
imports: [
  TypeOrmModule.forFeature([
    PortafolioInformeFinal,
    PortafolioReporteNotas,
    PortafolioAceptacionEstudiante,
    PortafolioSeguimientoPea,
  ]),
],
providers: [
  InformeFinalService,      { provide: INFORME_FINAL_REPOSITORY,     useClass: InformeFinalPg },
  AceptacionNotasService,   { provide: ACEPTACION_NOTAS_REPOSITORY,  useClass: AceptacionNotasPg },
  PortafolioService,        { provide: PORTAFOLIO_REPOSITORY,        useClass: PortafolioPg },
  SeguimientoPeaService,    { provide: SEGUIMIENTO_PEA_REPOSITORY,   useClass: SeguimientoPeaPg },
],
controllers: [
  InformeFinalController, AceptacionNotasController, PortafolioController, SeguimientoPeaController,
],
```

- Como `synchronize: false`, cada entidad nueva debe estar **también** en el glob de `entities` de `app.module.ts` (`**/*.entity.{ts,js}` — se cumple por el nombre `*.entity.ts`). `portafolio.entity.ts` está vacío pero igual matchea el glob; no pasa nada porque no tiene `@Entity`.
- No importa `AuthModule`: usa `JwtGuard` / `RolesGuard` / `@Roles` / `AuthenticatedRequest` importando las clases desde `../auth/...`. Funciona porque la estrategia `'jwt'` la registra `AuthModule` a nivel de app.

---

## 6. Seguridad: todos los endpoints exigen rol DOCENTE

Los **cuatro** controllers llevan a nivel de clase:

```ts
@UseGuards(JwtGuard, RolesGuard)
@Roles('DOCENTE')
```

- Sin token → `401`. Token sin rol `DOCENTE` → `403 No tiene permisos para acceder a este recurso`.
- `PortafolioController` e `InformeFinalController` usan `req.user.idDocente` (del JWT) para filtrar por docente. Si un usuario con rol `DOCENTE` tuviera `idDocente = null`, esos endpoints fallarían (se pasa `req.user.idDocente!` con non-null assertion).
- `AceptacionNotasController` y `SeguimientoPeaController` **no** filtran por `idDocente`: operan sobre el `id_oferta_asignatura` que reciban, sin verificar que esa oferta sea del docente logueado.

---

## 7. Tablas de base de datos

Migraciones: `1784092346061-CreatePortafolioNotas.ts`, `1784092370000-CreateReporteNotasView.ts`, `1784167500000-CreatePortafolioInformeFinal.ts`, `1784167700000-AddOfertaAsignaturaToPortafolioInformeFinal.ts`, `1784167800000-CreatePortafolioSeguimientoPea.ts`.

### `portafolio_informe_final`

Nació con `id_docente / id_periodo / id_asignatura / id_paralelo`; la migración `...700000` los **eliminó** y dejó solo `id_oferta_asignatura`:

```sql
portafolio_informe_final (
  id_informe_final         BIGSERIAL PRIMARY KEY,
  id_oferta_asignatura     BIGINT NOT NULL,   -- FK → oferta_asignatura, UNIQUE (uk_pif_oferta_asignatura)
  horario                  VARCHAR(100) NOT NULL,
  fecha_firma_docente      TIMESTAMP NULL,
  fecha_firma_coordinador  TIMESTAMP NULL
)
```

> `UNIQUE(id_oferta_asignatura)` ⇒ **un solo informe final por oferta**.

### `portafolio_reporte_notas`

```sql
portafolio_reporte_notas (
  id_reporte_notas      BIGINT PRIMARY KEY,      -- secuencia
  id_periodo            BIGINT NOT NULL,         -- FK → periodo_academico
  id_oferta_asignatura  BIGINT NOT NULL,         -- FK → oferta_asignatura
  tipo_reporte          VARCHAR(20) NOT NULL,    -- CHECK IN ('APORTE_1','APORTE_2','SUPLETORIO')
  fecha_generacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ruta_archivo_pdf      VARCHAR(255) NULL,
  estado                VARCHAR(20) DEFAULT 'GENERADO'
)
-- UNIQUE (id_oferta_asignatura, tipo_reporte)  → uk_prn_oferta_tipo
```

### `portafolio_aceptacion_estudiante`

```sql
portafolio_aceptacion_estudiante (
  id_aceptacion         BIGINT PRIMARY KEY,      -- secuencia
  id_reporte_notas      BIGINT NOT NULL,         -- FK → portafolio_reporte_notas
  id_matricula_detalle  BIGINT NOT NULL,         -- FK → matricula_detalle
  nota_registrada       NUMERIC(5,2) NULL,
  estado_aceptacion     VARCHAR(20) DEFAULT 'PENDIENTE',
  fecha_aceptacion      TIMESTAMP NULL
)
-- UNIQUE (id_reporte_notas, id_matricula_detalle)  → uk_pae_reporte_matricula
```

### `portafolio_seguimiento_pea`

```sql
portafolio_seguimiento_pea (
  id_seguimiento_pea    BIGSERIAL PRIMARY KEY,
  id_oferta_asignatura  BIGINT NOT NULL,   -- FK → oferta_asignatura, UNIQUE (uk_psp_oferta_asignatura)
  id_representante      BIGINT NULL        -- FK → estudiante(id_estudiante)
)
```

### Vista `vw_reporte_notas`

Creada por migración pero **no usada por este módulo** (el código arma sus propios `JOIN`). Une `oferta_asignatura` con carrera/nivel/asignatura/paralelo/jornada/docente y `matricula_detalle` (`nota_ap1`, `nota_ap2`, `nota_supletorio`, `nota_final`). Queda documentada por si el front o reportería la consumen directo.

**Tablas base que se leen/joinan (no se tocan):** `oferta_asignatura`, `asignatura`, `nivel`, `carrera`, `paralelo`, `jornada`, `periodo_academico`, `periodo_carrera`, `matricula`, `matricula_detalle`, `estudiante`, `docente`.

---

## 8. Particularidad del schema: `oferta_asignatura` → `docente`

**Todos** los adaptadores de este módulo unen el docente así:

```sql
JOIN oferta_asignatura oa ON ...
JOIN docente d ON oa.id_docente = d.id_docente
```

Es decir, el código asume que **`oferta_asignatura` tiene una columna `id_docente`** (FK directa a `docente`), y también usa `oa.id_jornada` y `oa.id_periodo_carrera`. Lo mismo aplica al filtro `WHERE oa.id_docente = $1` en `mis-ofertas` e `informe-final`.

> ⚠️ Una versión anterior de la doc advertía que en la BD desplegada la columna real era `oferta_asignatura.id_periodo_docente` (tabla intermedia `periodo_docente`). El código **actual** ya no usa `periodo_docente` en este módulo. Si al probar contra la BD real un `GET` devuelve error de columna inexistente (`oa.id_docente`), esa es la causa: hay que alinear el schema o reescribir los `JOIN` pasando por `periodo_docente`.

---

## 9. Feature: Portafolio (ofertas del docente)

Base: `/api/portafolio` · Controller `PortafolioController` · Service `PortafolioService` · Port `PortafolioRepository` (`PORTAFOLIO_REPOSITORY`) · Adapter `PortafolioPg`.

### `GET /api/portafolio/mis-ofertas`

Ofertas del docente logueado (`req.user.idDocente`). SQL: `oferta_asignatura` ⨝ `periodo_carrera` ⨝ `periodo_academico` ⨝ `asignatura` ⨝ `paralelo`, con `LEFT JOIN` a `portafolio_informe_final`, `portafolio_seguimiento_pea` y 3 veces a `portafolio_reporte_notas` (uno por `tipo_reporte`). `WHERE oa.id_docente = $1 ORDER BY pa.fecha_inicio DESC`.

**Respuesta `200`** — `OfertaDocenteDto[]`:

```json
[
  {
    "id_oferta_asignatura": 1,
    "id_asignatura": 3,
    "id_paralelo": 1,
    "asignatura": "DEVOPS",
    "paralelo": "5TO C_INTENSIVA",
    "id_periodo": 4,
    "periodo": "2025-II",
    "estado": "ACTIVO",
    "tiene_informe_final": true,
    "tiene_seguimiento_pea": false,
    "tiene_aporte_1": true,
    "tiene_aporte_2": false,
    "tiene_supletorio": false
  }
]
```

### `GET /api/portafolio/oferta/:id_oferta_asignatura/estudiantes`

`:id_oferta_asignatura` → `ParseIntPipe` (`400` si no es entero). SQL: `matricula_detalle` ⨝ `matricula` ⨝ `estudiante` `WHERE md.id_oferta_asignatura = $1 ORDER BY e.apellidos, e.nombres`.

**Respuesta `200`** — `EstudianteOfertaDto[]`:

```json
[
  { "id_estudiante": 10, "cedula": "0850939067", "nombre": "MATIAS ALCIVAR", "telefono": "0999...", "email": "matias@correo.com" }
]
```

`PortafolioRepository`:

```ts
interface PortafolioRepository {
  findOfertasByDocente(idDocente: number): Promise<OfertaDocenteDto[]>;
  findEstudiantesByOferta(idOfertaAsignatura: number): Promise<EstudianteOfertaDto[]>;
}
```

---

## 10. Feature: Informe Final

Base: `/api/portafolio/informe-final` · Controller `InformeFinalController` · Service `InformeFinalService` · Port `IInformeFinalRepository` (`INFORME_FINAL_REPOSITORY`) · Adapter `InformeFinalPg` · Entidad `PortafolioInformeFinal`.

### `GET /api/portafolio/informe-final/:id_oferta_asignatura`

`ParseIntPipe` en el param. Llama `getInformeFinal(req.user.idDocente!, idOfertaAsignatura)`. SQL con `WHERE pif.id_oferta_asignatura = $1 AND oa.id_docente = $2` (doble filtro: la oferta **y** que sea del docente logueado). `404 Informe final no encontrado para este docente y oferta académica` si no hay fila.

**Respuesta `200`** — `InformeFinalResponseDto`:

```json
{
  "informe": {
    "id_informe_final": 7,
    "nombre_docente": "BYRON RODRIGO MORENO MORENO",
    "nombre_asignatura": "DEVOPS",
    "paralelo": "5TO C_INTENSIVA",
    "horario": "Lunes a Viernes 18h00-22h00",
    "periodo": "2025-II"
  },
  "firmas": {
    "docente": "BYRON RODRIGO MORENO MORENO",
    "coordinador": "ANA GOMEZ",
    "fecha_firma_docente": null,
    "fecha_firma_coordinador": null
  }
}
```

(`coordinador` sale de `periodo_carrera.id_coordinador` → `docente`; puede ser `null`.)

### `POST /api/portafolio/informe-final`

**Body** (`CreateInformeFinalDto`) — todos `@IsNotEmpty`, los IDs `@IsNumber`, `horario` `@IsString`:

```json
{ "id_docente": 4, "id_periodo": 4, "id_asignatura": 3, "id_paralelo": 1, "horario": "Lunes a Viernes 18h00-22h00" }
```

`InformeFinalPg.create` primero **resuelve la oferta** a partir de esos 4 campos:

```sql
SELECT oa.id_oferta_asignatura
FROM oferta_asignatura oa
JOIN periodo_carrera pc ON oa.id_periodo_carrera = pc.id_periodo_carrera
WHERE oa.id_docente = $1 AND oa.id_asignatura = $2 AND oa.id_paralelo = $3 AND pc.id_periodo = $4
```

Si no existe → `404 No existe una oferta académica para ese docente, asignatura, paralelo y período`. Si existe, inserta `{ idOfertaAsignatura, horario }`.

**Respuesta `201`** — entidad `PortafolioInformeFinal` cruda (los campos con default de BD llegan `null` porque TypeORM no relee tras el insert):

```json
{ "idInformeFinal": 7, "idOfertaAsignatura": 1, "horario": "Lunes a Viernes 18h00-22h00", "fechaFirmaDocente": null, "fechaFirmaCoordinador": null }
```

Si ya hay informe para esa oferta, el `UNIQUE(id_oferta_asignatura)` hace fallar el insert con error crudo de Postgres (`500`) — no hay chequeo previo tipo `409` como en las otras features.

### `PATCH /api/portafolio/informe-final/:id_informe_final`

`ParseIntPipe` en el param. **Body** (`UpdateHorarioInformeFinalDto`): `{ "horario": "..." }` (`@IsNotEmpty() @IsString()`). `updateHorario` hace `findOneBy({ idInformeFinal })` → `404 Informe final no encontrado` si no existe → `save` con el nuevo horario. Devuelve la entidad actualizada.

`IInformeFinalRepository`:

```ts
interface IInformeFinalRepository {
  findByDocenteAndOferta(idDocente: number, idOfertaAsignatura: number): Promise<InformeFinalResponseDto | null>;
  create(dto: CreateInformeFinalDto): Promise<PortafolioInformeFinal>;
  updateHorario(idInformeFinal: number, horario: string): Promise<PortafolioInformeFinal>;
}
```

---

## 11. Feature: Aceptación de Notas

Base: `/api/portafolio/aceptacion-notas` · Controller `AceptacionNotasController` · Service `AceptacionNotasService` · Port `IAceptacionNotasRepository` (`ACEPTACION_NOTAS_REPOSITORY`) · Adapter `AceptacionNotasPg` · Entidades `PortafolioReporteNotas` + `PortafolioAceptacionEstudiante`.

Corresponde al **Formato 07 — Aceptación de Nota**: cabecera (carrera/nivel/asignatura/paralelo/jornada/docente/coordinador/período/tipo) + tabla de estudiantes con su nota y estado de aceptación.

### `POST /api/portafolio/aceptacion-notas` — generar reporte

**Body** (`CreateReporteNotasDto`):

```json
{ "id_periodo": 4, "id_oferta_asignatura": 1, "tipo_reporte": "APORTE_1" }
```

- `id_periodo`, `id_oferta_asignatura`: `@IsNotEmpty() @IsNumber()`.
- `tipo_reporte`: `@Transform(normalizarTipoReporte)` **antes** de `@IsIn(['APORTE_1','APORTE_2','SUPLETORIO'])`.

`normalizarTipoReporte` (`dto/tipo-reporte.util.ts`) hace `trim().toUpperCase()` y mapea alias:

| Alias aceptado | Valor canónico |
|----------------|----------------|
| `PARCIAL UNO`, `APORTE_1` | `APORTE_1` |
| `PARCIAL DOS`, `APORTE_2` | `APORTE_2` |
| `EXAMEN SUPLETORIO`, `SUPLETORIO` | `SUPLETORIO` |

Cualquier otro valor → `400` (`@IsIn`).

**Flujo** (`AceptacionNotasService.generarReporte`):
1. `existsByOfertaAndTipo(id_oferta_asignatura, tipo_reporte)` (cuenta filas en `portafolio_reporte_notas`). Si ya hay → `409 Ya existe un reporte de <TIPO> generado para esta materia`. (Chequeo previo para no chocar contra `uk_prn_oferta_tipo` con error crudo.)
2. `generarReporte` en **transacción**:
   - inserta `portafolio_reporte_notas { idPeriodo, idOfertaAsignatura, tipoReporte }`;
   - `SELECT id_matricula_detalle FROM matricula_detalle WHERE id_oferta_asignatura = $1`;
   - inserta **una** fila en `portafolio_aceptacion_estudiante` por estudiante, con `notaRegistrada = null` (la nota **no** se copia; se carga después con el `PATCH`).
3. Devuelve el reporte completo releyéndolo con `findByOfertaAndTipo`.

**Respuesta `201`** — `ReporteNotasResponseDto` (ver shape en el `GET`).

### `GET /api/portafolio/aceptacion-notas/:id_oferta_asignatura/:tipo_reporte`

`:id_oferta_asignatura` → `ParseIntPipe`. `:tipo_reporte` se usa **literal** en el SQL (sin normalizar alias): pasar el valor canónico (`APORTE_1`, `APORTE_2`, `SUPLETORIO`). `404 Reporte de notas no encontrado para esta materia y tipo` si no hay cabecera.

**Respuesta `200`** — `ReporteNotasResponseDto`:

```json
{
  "reporte": {
    "id_reporte_notas": 2,
    "carrera": "DESARROLLO DE SOFTWARE",
    "nivel": "5TO",
    "asignatura": "DEVOPS",
    "paralelo": "5TO C_INTENSIVA",
    "jornada": "INTENSIVA",
    "docente": "BYRON RODRIGO MORENO MORENO",
    "coordinador": "ANA GOMEZ",
    "periodo": "2025-II",
    "tipo_reporte": "APORTE_1",
    "fecha_generacion": "2026-07-08T15:30:00.000Z"
  },
  "estudiantes": [
    {
      "id_aceptacion": 1,
      "cedula": "0850939067",
      "estudiante": "MATIAS RAMON ALCIVAR MAGALLANES",
      "nota_registrada": 8.73,
      "estado_aceptacion": "PENDIENTE",
      "fecha_aceptacion": null
    }
  ]
}
```

Estudiantes ordenados por `e.apellidos, e.nombres`.

### `PATCH /api/portafolio/aceptacion-notas/:id_reporte_notas/notas`

`:id_reporte_notas` → `ParseIntPipe`. **Body** (`UpdateNotasAceptacionDto`):

```json
{ "estudiantes": [ { "id_aceptacion": 1, "nota": 8.73 }, { "id_aceptacion": 2, "nota": 9.10 } ] }
```

- `estudiantes`: `@IsArray() @ArrayNotEmpty() @ValidateNested({ each: true }) @Type(() => NotaEstudianteDto)`.
- `NotaEstudianteDto`: `id_aceptacion` `@IsInt()`; `nota` `@IsNumber() @Min(0) @Max(10)`.

`actualizarNotas` en **transacción**: por cada elemento hace
`UPDATE portafolio_aceptacion_estudiante SET nota_registrada = $1 WHERE id_aceptacion = $2 AND id_reporte_notas = $3 RETURNING id_aceptacion`.
Si algún `id_aceptacion` no pertenece a ese reporte → `404 El estudiante con id_aceptacion=<n> no pertenece a este reporte` y **se revierte todo**.
**Respuesta `200`**: cuerpo vacío (`void`).

`IAceptacionNotasRepository`:

```ts
interface IAceptacionNotasRepository {
  existsByOfertaAndTipo(idOfertaAsignatura: number, tipoReporte: string): Promise<boolean>;
  generarReporte(dto: CreateReporteNotasDto): Promise<ReporteNotasResponseDto>;
  findByOfertaAndTipo(idOfertaAsignatura: number, tipoReporte: string): Promise<ReporteNotasResponseDto | null>;
  actualizarNotas(idReporteNotas: number, estudiantes: NotaEstudianteDto[]): Promise<void>;
}
```

> **Firmas y observaciones**: `portafolio_reporte_notas` **no** tiene columnas de firma docente/coordinador (a diferencia de `portafolio_informe_final`). `fecha_generacion` es el timestamp de creación, no una firma. Asistencia y observación por estudiante del Formato 07 **no se persisten**. `ruta_archivo_pdf` existe pero ningún endpoint la escribe (no hay generación de PDF).

---

## 12. Feature: Seguimiento PEA

Base: `/api/portafolio/seguimiento-pea` · Controller `SeguimientoPeaController` · Service `SeguimientoPeaService` · Port `ISeguimientoPeaRepository` (`SEGUIMIENTO_PEA_REPOSITORY`) · Adapter `SeguimientoPeaPg` · Entidad `PortafolioSeguimientoPea`.

### `POST /api/portafolio/seguimiento-pea`

**Body** (`CreateSeguimientoPeaDto`): `id_oferta_asignatura` y `id_representante`, ambos `@IsNotEmpty() @IsInt()`.

**Flujo**:
1. `existsByOferta(id_oferta_asignatura)` → si ya hay → `409 Ya existe un seguimiento PEA generado para esta oferta académica` (respalda el `UNIQUE(id_oferta_asignatura)`).
2. `verificarRepresentanteMatriculado`: `SELECT 1 FROM matricula_detalle md JOIN matricula m ... WHERE md.id_oferta_asignatura = $1 AND m.id_estudiante = $2`. Si el estudiante no está matriculado en esa oferta → `404 El estudiante seleccionado no está matriculado en esta oferta académica`.
3. Inserta `{ idOfertaAsignatura, idRepresentante }` y devuelve el DTO releído.

**Respuesta `201`** — `SeguimientoPeaResponseDto`:

```json
{
  "id_seguimiento_pea": 3,
  "informe": {
    "carrera": "DESARROLLO DE SOFTWARE",
    "asignatura": "DEVOPS",
    "paralelo": "5TO C_INTENSIVA",
    "periodo": "2025-II",
    "docente": "BYRON RODRIGO MORENO MORENO"
  },
  "representante": {
    "id_estudiante": 10,
    "nombre": "MATIAS ALCIVAR",
    "telefono": "0999...",
    "email": "matias@correo.com"
  }
}
```

### `GET /api/portafolio/seguimiento-pea/:id_oferta_asignatura`

`ParseIntPipe`. Devuelve el mismo `SeguimientoPeaResponseDto`. `404 Seguimiento PEA no encontrado para esta oferta académica` si no hay fila. `representante.*` puede venir en `null` si `id_representante` es `NULL` (`LEFT JOIN estudiante`).

### `PATCH /api/portafolio/seguimiento-pea/:id_seguimiento_pea/representante`

`ParseIntPipe`. **Body** (`UpdateRepresentanteSeguimientoPeaDto`): `{ "id_representante": 12 }` (`@IsNotEmpty() @IsInt()`).
`updateRepresentante`: `findOneBy({ idSeguimientoPea })` → `404 No existe el seguimiento PEA con id <n>` → vuelve a validar matrícula del nuevo representante → `update`. **Respuesta `200`**: cuerpo vacío (`void`).

`ISeguimientoPeaRepository`:

```ts
interface ISeguimientoPeaRepository {
  existsByOferta(idOfertaAsignatura: number): Promise<boolean>;
  create(dto: CreateSeguimientoPeaDto): Promise<SeguimientoPeaResponseDto>;
  findByOferta(idOfertaAsignatura: number): Promise<SeguimientoPeaResponseDto | null>;
  updateRepresentante(idSeguimientoPea: number, idRepresentante: number): Promise<void>;
}
```

---

## 13. Scaffolding vacío (no usar)

Archivos que son solo `export class X {}` sin decoradores ni lógica, **no** referenciados por `portafolio.module.ts` (salvo `PortafolioEntity` que ni siquiera tiene `@Entity`):

- `controllers/evidencia.controller.ts` → `EvidenciaController`
- `services/evidencia.service.ts` → `EvidenciaService`
- `domain/portafolio.entity.ts` → `PortafolioEntity`
- `dto/create-portafolio.dto.ts` → `CreatePortafolioDto`
- `dto/update-portafolio.dto.ts` → `UpdatePortafolioDto`

No hay feature de "evidencias" ni CRUD genérico de "portafolio" todavía.

---

## 14. Catálogo de errores

| HTTP | Mensaje | Feature / cuándo |
|------|---------|------------------|
| `401` | (Passport) | Sin token / token inválido o vencido (todas). |
| `403` | `No tiene permisos para acceder a este recurso` | Token sin rol `DOCENTE` (todas). |
| `400` | `Validation failed (numeric string is expected)` | `ParseIntPipe` con param no numérico. |
| `400` | (errores `class-validator`) | Body inválido (p.ej. `tipo_reporte` no reconocido, `nota` fuera de 0–10, `estudiantes` vacío). |
| `404` | `Informe final no encontrado para este docente y oferta académica` | `GET informe-final/:id`. |
| `404` | `No existe una oferta académica para ese docente, asignatura, paralelo y período` | `POST informe-final`. |
| `404` | `Informe final no encontrado` | `PATCH informe-final/:id`. |
| `409` | `Ya existe un reporte de <TIPO> generado para esta materia` | `POST aceptacion-notas` duplicado. |
| `404` | `Reporte de notas no encontrado para esta materia y tipo` | `GET aceptacion-notas/:id/:tipo`. |
| `404` | `El estudiante con id_aceptacion=<n> no pertenece a este reporte` | `PATCH aceptacion-notas/:id/notas`. |
| `409` | `Ya existe un seguimiento PEA generado para esta oferta académica` | `POST seguimiento-pea` duplicado. |
| `404` | `El estudiante seleccionado no está matriculado en esta oferta académica` | `POST` / `PATCH` seguimiento-pea con representante no matriculado. |
| `404` | `No existe el seguimiento PEA con id <n>` | `PATCH seguimiento-pea/:id/representante`. |
| `500` | error crudo de Postgres | `POST informe-final` sobre una oferta que ya tiene informe (choca `uk_pif_oferta_asignatura`), o error de columna si el schema real difiere (ver §8). |

---

## 15. Cómo probar (orden de seed)

La BD normalmente no trae datos base. Para ejercitar estos endpoints hay que poblar, en orden:

`periodo_academico` → `carrera` → `nivel` → `asignatura` → `docente` → `jornada` → `paralelo` → `periodo_carrera` (con `id_coordinador`) → `oferta_asignatura` (ligada al `docente` — ver §8) → `estudiante` → `matricula` → `matricula_detalle` (con `id_oferta_asignatura`) → recién ahí:

1. Login como usuario con rol `DOCENTE` (crear vía `POST /api/auth/generar-accesos` con `tipo: "DOCENTE"`), obtener `accessToken` y `usuario.idDocente`.
2. `GET /api/portafolio/mis-ofertas` → tomar un `id_oferta_asignatura`.
3. `POST /api/portafolio/informe-final` / `POST /api/portafolio/aceptacion-notas` / `POST /api/portafolio/seguimiento-pea`.
4. `GET` de cada feature para ver el detalle; `PATCH` para horario / notas / representante.

Todas las llamadas requieren header `Authorization: Bearer <accessToken>` de un usuario `DOCENTE`.

Hay migraciones de datos de prueba específicas: `1785000000000-CreatePortafolioDatosPruebaRonniVilla.ts` y `1784218110000-CreatePortafolio-DatosPrueba.ts`.

---

## 16. Resumen de endpoints

Prefijo global `/api`. Autenticación por `Authorization: Bearer <accessToken>`. **Todos exigen rol `DOCENTE`.**

| Método | Ruta | Body | Descripción |
|--------|------|------|-------------|
| GET | `/portafolio/mis-ofertas` | — | Ofertas del docente + flags de formatos generados. |
| GET | `/portafolio/oferta/:id_oferta_asignatura/estudiantes` | — | Estudiantes matriculados en la oferta. |
| GET | `/portafolio/informe-final/:id_oferta_asignatura` | — | Cabecera + firmas del informe final. |
| POST | `/portafolio/informe-final` | `CreateInformeFinalDto` | Crea el informe final (resuelve la oferta por docente+asignatura+paralelo+período). |
| PATCH | `/portafolio/informe-final/:id_informe_final` | `UpdateHorarioInformeFinalDto` | Actualiza solo el `horario`. |
| POST | `/portafolio/aceptacion-notas` | `CreateReporteNotasDto` | Genera reporte de notas por tipo; crea 1 fila por estudiante (nota `null`). |
| GET | `/portafolio/aceptacion-notas/:id_oferta_asignatura/:tipo_reporte` | — | Cabecera + estudiantes con nota y estado. |
| PATCH | `/portafolio/aceptacion-notas/:id_reporte_notas/notas` | `UpdateNotasAceptacionDto` | Carga/actualiza notas (0–10) por `id_aceptacion`. |
| POST | `/portafolio/seguimiento-pea` | `CreateSeguimientoPeaDto` | Crea el seguimiento PEA de una oferta + representante. |
| GET | `/portafolio/seguimiento-pea/:id_oferta_asignatura` | — | Cabecera + representante. |
| PATCH | `/portafolio/seguimiento-pea/:id_seguimiento_pea/representante` | `UpdateRepresentanteSeguimientoPeaDto` | Cambia el estudiante representante. |

---

_Última actualización: 2026-08-31. Generado a partir de `sistema-academico-backend/src/modules/portafolio-docente`._

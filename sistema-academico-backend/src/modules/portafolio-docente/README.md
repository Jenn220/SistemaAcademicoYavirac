# Módulo Portafolio Docente

Módulo NestJS que expone los endpoints del portafolio docente: **Informe Final** e **Informe Final** ya existía; esta documentación cubre también lo agregado para **Aceptación de Notas**.

## Índice

- [Arquitectura y convenciones](#arquitectura-y-convenciones)
- [Estructura de archivos](#estructura-de-archivos)
- [Tablas de base de datos usadas](#tablas-de-base-de-datos-usadas)
- [⚠️ Particularidad del schema real: `periodo_docente`](#-particularidad-del-schema-real-periodo_docente)
- [Endpoints — Informe Final](#endpoints--informe-final)
- [Endpoints — Aceptación de Notas](#endpoints--aceptación-de-notas)
- [Wiring en `portafolio.module.ts` / `app.module.ts`](#wiring)
- [Limitaciones conocidas / lo que NO cubre este módulo todavía](#limitaciones-conocidas--lo-que-no-cubre-este-módulo-todavía)
- [Cómo probar (seed de datos)](#cómo-probar-seed-de-datos)

---

## Arquitectura y convenciones

Cada feature del módulo sigue arquitectura hexagonal, en 5 capas dentro de `src/modules/portafolio-docente/`:

| Capa | Carpeta | Responsabilidad |
|---|---|---|
| Dominio | `domain/` | Entidad TypeORM, 1 archivo por tabla |
| DTO | `dto/` | Forma de entrada (`Create...Dto`) y de salida (`...ResponseDto`) de la API |
| Puerto | `ports/` | Interfaz `I...Repository` + token de inyección `..._REPOSITORY` |
| Adaptador | `adapters/` | Implementación Postgres (`...Pg`) |
| Controller / Service | `controllers/`, `services/` | Controller delgado que delega en el service; el service contiene la lógica y lanza excepciones de NestJS |

**Convención de nombres (importante, es mixta a propósito):**

- **Entidad TypeORM** → propiedades en **camelCase**, mapeadas a columnas snake_case de la BD con `@Column({ name: 'snake_case' })`. Ej: `idDocente` ↔ `id_docente`.
- **DTOs de entrada y salida (el JSON que viaja por HTTP)** → **snake_case**, igual que la BD. Ej. `{ "id_periodo": 4, "id_oferta_asignatura": 1 }`.
- El `ValidationPipe` global (`main.ts`) usa `whitelist: true, transform: true` — el body debe coincidir con las propiedades del DTO en snake_case.
- Rutas: prefijo global `/api` (`main.ts`), controllers con `@Controller('portafolio/<feature>')`, params de ruta en snake_case.
- SQL: **híbrido**. TypeORM `Repository` (`create()` + `save()`) para inserts/updates simples sobre la tabla propia de una entidad. SQL crudo vía `dataSource.query()` / `manager.query()` (parametrizado con `$1, $2...`) para lecturas que hacen `JOIN` entre varias tablas. Las entidades no declaran relaciones `@ManyToOne`; todos los joins se escriben a mano.

---

## Estructura de archivos

```
portafolio-docente/
├── domain/
│   ├── informe-final.entity.ts          -> tabla portafolio_informe_final
│   ├── reporte-notas.entity.ts          -> tabla portafolio_reporte_notas
│   └── aceptacion-estudiante.entity.ts  -> tabla portafolio_aceptacion_estudiante
├── dto/
│   ├── create-informe-final.dto.ts
│   ├── informe-final-response.dto.ts
│   ├── create-reporte-notas.dto.ts
│   ├── reporte-notas-response.dto.ts
│   └── tipo-reporte.util.ts             -> normalización de alias de tipo_reporte
├── ports/
│   ├── informe-final.repository.ts
│   └── aceptacion-notas.repository.ts
├── adapters/
│   ├── informe-final.pg.ts
│   └── aceptacion-notas.pg.ts
├── services/
│   ├── informe-final.service.ts
│   └── aceptacion-notas.service.ts
├── controllers/
│   ├── informe-final.controller.ts
│   └── aceptacion-notas.controller.ts
└── portafolio.module.ts
```

> `controllers/portafolio.controller.ts`, `controllers/evidencia.controller.ts`, `domain/portafolio.entity.ts`, `dto/create-portafolio.dto.ts`, `dto/update-portafolio.dto.ts`, `ports/portafolio.repository.ts`, `services/portafolio.service.ts`, `services/evidencia.service.ts` son **scaffolding vacío sin usar** (`export class X {}`), no forman parte de ningún endpoint activo todavía.

---

## Tablas de base de datos usadas

```sql
-- Ya existía (feature "Informe Final")
portafolio_informe_final (
  id_informe_final, id_docente, id_periodo, id_asignatura, id_paralelo,
  horario, fecha_firma_docente, fecha_firma_coordinador
)

-- Agregadas para "Aceptación de Notas"
portafolio_reporte_notas (
  id_reporte_notas, id_periodo, id_oferta_asignatura, tipo_reporte,
  fecha_generacion, ruta_archivo_pdf, estado
)
-- tipo_reporte CHECK IN ('APORTE_1','APORTE_2','SUPLETORIO')
-- UNIQUE(id_oferta_asignatura, tipo_reporte)

portafolio_aceptacion_estudiante (
  id_aceptacion, id_reporte_notas, id_matricula_detalle,
  nota_registrada, estado_aceptacion, fecha_aceptacion
)
-- UNIQUE(id_reporte_notas, id_matricula_detalle)
```

Tablas base (fuera del módulo, no se tocan, solo se leen/joinan): `oferta_asignatura`, `asignatura`, `nivel`, `carrera`, `paralelo`, `jornada`, `periodo_academico`, `periodo_carrera`, `matricula_detalle`, `matricula`, `estudiante`, `docente`, `periodo_docente`.

---

## ⚠️ Particularidad del schema real: `periodo_docente`

El script `.sql` original que se usó para diseñar este módulo dice que `oferta_asignatura` tiene una columna `id_docente` (FK directa a `docente`). **En la base de datos real desplegada eso no es así.**

La columna real es `oferta_asignatura.id_periodo_docente`, que apunta a una tabla intermedia:

```
oferta_asignatura.id_periodo_docente → periodo_docente.id_periodo_docente
periodo_docente.id_docente           → docente.id_docente
periodo_docente.id_periodo           → periodo_academico.id_periodo
```

`periodo_docente` tiene: `id_periodo_docente (PK)`, `id_periodo`, `id_docente`, `estado`.

**Impacto:** cualquier query que necesite el nombre del docente a partir de `oferta_asignatura` debe pasar por `periodo_docente`, no unir `docente` directo. Esto ya está corregido en `adapters/aceptacion-notas.pg.ts` (`findByOfertaAndTipo`):

```sql
JOIN periodo_docente pd   ON oa.id_periodo_docente = pd.id_periodo_docente
JOIN docente d            ON pd.id_docente = d.id_docente
```

`informe-final.pg.ts` **no** se ve afectado por esto porque `portafolio_informe_final.id_docente` es una FK directa y propia de esa tabla, no pasa por `oferta_asignatura`.

Si en el futuro se agregan más endpoints que naveguen desde `oferta_asignatura` hasta `docente`, hay que recordar este salto extra por `periodo_docente`.

---

## Endpoints — Informe Final

Base: `/api/portafolio/informe-final`

### `POST /api/portafolio/informe-final`

Crea el registro de informe final (cabecera: docente, periodo, asignatura, paralelo, horario).

**Body** (`CreateInformeFinalDto`):
```json
{
  "id_docente": 1,
  "id_periodo": 4,
  "id_asignatura": 3,
  "id_paralelo": 1,
  "horario": "Lunes a Viernes 18h00-22h00"
}
```

### `GET /api/portafolio/informe-final/:id_docente/:id_periodo`

Devuelve el informe final de ese docente en ese periodo.

**Respuesta** (`InformeFinalResponseDto`), `404` si no existe:
```json
{
  "informe": {
    "nombre_docente": "BYRON RODRIGO MORENO MORENO",
    "nombre_asignatura": "DEVOPS",
    "paralelo": "5TO C_INTENSIVA",
    "horario": "Lunes a Viernes 18h00-22h00",
    "periodo": "2025-II"
  },
  "firmas": {
    "docente": "BYRON RODRIGO MORENO MORENO",
    "fecha_firma_docente": null,
    "fecha_firma_coordinador": null
  }
}
```

---

## Endpoints — Aceptación de Notas

Base: `/api/portafolio/aceptacion-notas`

Corresponde al **Formato 07 — Aceptación de Nota** (cabecera con carrera/docente/asignatura/paralelo/tipo de nota/periodo + tabla de estudiantes con su nota).

### `POST /api/portafolio/aceptacion-notas` — Generar reporte

Crea la cabecera (`portafolio_reporte_notas`) y copia, para cada estudiante matriculado en esa `oferta_asignatura`, su nota correspondiente desde `matricula_detalle` hacia `portafolio_aceptacion_estudiante` (todo en una transacción).

**Body** (`CreateReporteNotasDto`):
```json
{
  "id_periodo": 4,
  "id_oferta_asignatura": 1,
  "tipo_reporte": "APORTE_1"
}
```

`tipo_reporte` acepta 6 alias fijos que se normalizan al valor canónico antes de validar (`dto/tipo-reporte.util.ts`):

| Alias aceptado | Valor guardado en BD |
|---|---|
| `"PARCIAL UNO"` / `"APORTE_1"` | `APORTE_1` |
| `"PARCIAL DOS"` / `"APORTE_2"` | `APORTE_2` |
| `"EXAMEN SUPLETORIO"` / `"SUPLETORIO"` | `SUPLETORIO` |

Cualquier otro valor → `400 Bad Request` (rechazado por `@IsIn` de `class-validator`).

**Reglas de negocio:**
- Si ya existe un reporte para esa `id_oferta_asignatura` + `tipo_reporte` (constraint `uk_prn_oferta_tipo`), el service lanza `409 Conflict` con mensaje `"Ya existe un reporte de <TIPO> generado para esta materia"` **antes** de intentar el insert (no se deja fallar la BD con el error crudo).
- La columna de nota que se copia depende del tipo: `APORTE_1 → nota_ap1`, `APORTE_2 → nota_ap2`, `SUPLETORIO → nota_supletorio` (mapa `COLUMNA_NOTA` en `aceptacion-notas.pg.ts`).
- Se crea 1 fila de `portafolio_aceptacion_estudiante` por cada fila de `matricula_detalle` con ese `id_oferta_asignatura`, sin filtrar por estado.

**Respuesta** (entidad creada, valores por defecto de BD como `estado`/`fecha_generacion` aparecen `null` porque TypeORM no relee la fila tras el insert):
```json
{
  "idPeriodo": 4,
  "idOfertaAsignatura": 1,
  "tipoReporte": "APORTE_1",
  "fechaGeneracion": null,
  "rutaArchivoPdf": null,
  "estado": null,
  "idReporteNotas": 2
}
```

### `GET /api/portafolio/aceptacion-notas/:id_oferta_asignatura/:tipo_reporte` — Consultar reporte

Trae el detalle completo de un reporte puntual: cabecera + lista de estudiantes con su nota y estado de aceptación. Usa la misma clave que la constraint `uk_prn_oferta_tipo` de la BD (no acepta alias aquí, el valor debe ser el canónico: `APORTE_1`, `APORTE_2` o `SUPLETORIO`).

```
GET /api/portafolio/aceptacion-notas/1/APORTE_1
```

**Respuesta** (`ReporteNotasResponseDto`), `404` si no existe:
```json
{
  "reporte": {
    "carrera": "DESARROLLO DE SOFTWARE",
    "nivel": "5TO",
    "asignatura": "DEVOPS",
    "paralelo": "5TO C_INTENSIVA",
    "jornada": "INTENSIVA",
    "docente": "BYRON RODRIGO MORENO MORENO",
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

> `reporte.fecha_generacion` es la fecha de creación del registro (system timestamp), **no** una firma. Ver [Limitaciones](#limitaciones-conocidas--lo-que-no-cubre-este-módulo-todavía).

### Flujo típico de uso

1. El front resuelve `id_oferta_asignatura` (eligiendo carrera → asignatura → paralelo → periodo) y `id_periodo`.
2. Botón **"Generar reporte"** → `POST` una vez por tipo (`APORTE_1`, `APORTE_2`, `SUPLETORIO` según corresponda). Repetir el mismo `POST` da `409`.
3. Pantalla de visualización/firma → `GET` con los mismos `id_oferta_asignatura` + `tipo_reporte`, se puede llamar cuantas veces se quiera.

---

## Wiring

`portafolio.module.ts` registra ambas entidades nuevas en `TypeOrmModule.forFeature([...])`, sus providers (`AceptacionNotasService` + binding `ACEPTACION_NOTAS_REPOSITORY → AceptacionNotasPg`) y su controller. Como `synchronize: false`, las entidades también deben estar en el arreglo `entities:` de `TypeOrmModule.forRootAsync` en `app.module.ts` — si se agrega una tabla nueva a este módulo, no olvidar añadirla ahí también.

---

## Limitaciones conocidas / lo que NO cubre este módulo todavía

- **Asistencia y observación por estudiante** (columnas visibles en el PDF del Formato 07) **no se persisten** — decisión tomada explícitamente: el PDF firmado en papel es el respaldo físico, la BD solo guarda nota + estado de aceptación. Si se necesitan a futuro, requeriría alterar `portafolio_aceptacion_estudiante`.
- **Firma de Docente y Firma de Coordinador** (caja inferior del PDF, con fecha) **no tienen columna en `portafolio_reporte_notas`** — a diferencia de `portafolio_informe_final`, que sí tiene `fecha_firma_docente` / `fecha_firma_coordinador`. Hoy no hay dónde guardar esas 2 fechas para el reporte de notas.
- No existe endpoint de **historial** (listar todos los reportes generados por un docente/oferta) — solo consulta puntual por `id_oferta_asignatura` + `tipo_reporte`.
- No hay endpoint para que un estudiante **acepte individualmente** su nota (cambiar `estado_aceptacion`/`fecha_aceptacion` de una fila puntual de `portafolio_aceptacion_estudiante`) — quedó fuera de alcance de estos 2 endpoints.
- `ruta_archivo_pdf` existe en la tabla pero ningún endpoint la llena todavía (no hay generación de PDF real, solo los datos en JSON).

---

## Cómo probar (seed de datos)

La BD normalmente no trae datos base. Para poder probar estos endpoints hace falta, en orden: `periodo_academico` → `carrera` → `nivel` → `asignatura` → `docente` → `jornada` → `paralelo` → `periodo_carrera` → `periodo_docente` → `oferta_asignatura` → `estudiante` → `matricula` → `matricula_detalle` (con notas reales) → recién ahí se puede llamar al `POST` de este módulo.

Recordar el detalle de `periodo_docente`: `oferta_asignatura` no se llena con `id_docente` directo, primero hay que crear la fila en `periodo_docente` y usar su `id_periodo_docente`.

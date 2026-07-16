# README — Módulo Fase Práctica (Backend NestJS + TypeORM)

Base URL: `http://localhost:3000`

---

## Estado actual del módulo

Las tablas de fase práctica **ya existen** en la BD (`practica_estudiante`,
`registro_diario_practica`, `plan_rotacion`, `informe_aprendizaje`, `evaluacion_practica`,
`bitacora_semanal`, `catalogo_rubrica`, `empresa`, `documento_fase_practica`). El módulo cuenta con
**CRUD completo** (POST/GET/PATCH/DELETE) validado contra la base de datos real, `ValidationPipe`
global y cálculo de horas cumplidas.

> El reporte original decía que faltaban 8 tablas; eso ya no es así. El problema real estaba en que
> las entidades no coincidían con el esquema (ver "Registro de avance" más abajo).

### Correcciones aplicadas
- La entidad de rúbrica apunta a la tabla real **`catalogo_rubrica`** (no a `rubrica`).
- `empresa` requiere `ruc` y `razon_social` (NOT NULL en BD).
- `plan_rotacion`, `evaluacion_practica` y `bitacora_semanal` envían sus columnas NOT NULL.
- Los IDs son `bigint` y se devuelven como número (no como texto).
- Se agregaron rutas `PATCH` y `DELETE` para todos los recursos.
- No existen las rutas `GET /practicas/:id/asistencia` ni `GET /practicas/:id/informe` del README
  original; el informe consolidado es `GET /fase-practica/informes/:idPractica`.

---

## Resumen de endpoints (`/fase-practica`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/practicas` | Crear práctica |
| GET | `/practicas` | Listar prácticas |
| GET | `/practicas/:id` | Obtener práctica |
| PATCH | `/practicas/:id` | Editar práctica |
| DELETE | `/practicas/:id` | Eliminar práctica |
| POST | `/registro-diario` | Crear registro (recalcula horas) |
| GET | `/registro-diario/practica/:id` | Registros por práctica |
| PATCH | `/registro-diario/:id` | Editar registro |
| DELETE | `/registro-diario/:id` | Eliminar registro |
| POST | `/plan-rotacion` | Crear plan de rotación |
| GET | `/plan-rotacion/practica/:id` | Planes por práctica |
| PATCH | `/plan-rotacion/:id` | Editar plan |
| DELETE | `/plan-rotacion/:id` | Eliminar plan |
| POST | `/informe-aprendizaje` | Crear informe |
| GET | `/informe-aprendizaje/practica/:id` | Informes por práctica |
| PATCH | `/informe-aprendizaje/:id` | Editar informe |
| DELETE | `/informe-aprendizaje/:id` | Eliminar informe |
| POST | `/evaluacion` | Crear evaluación |
| GET | `/evaluacion/practica/:id` | Evaluaciones por práctica |
| PATCH | `/evaluacion/:id` | Editar evaluación |
| DELETE | `/evaluacion/:id` | Eliminar evaluación |
| POST | `/bitacora-semanal` | Crear bitácora |
| GET | `/bitacora-semanal/informe/:id` | Bitácoras por informe |
| PATCH | `/bitacora-semanal/:id` | Editar bitácora |
| DELETE | `/bitacora-semanal/:id` | Eliminar bitácora |
| POST | `/rubrica` | Crear rúbrica (`catalogo_rubrica`) |
| GET | `/rubrica` | Listar rúbricas |
| PATCH | `/rubrica/:id` | Editar rúbrica |
| DELETE | `/rubrica/:id` | Eliminar rúbrica |
| POST | `/empresas` | Crear empresa (ruc + razon_social) |
| GET | `/empresas` | Listar empresas |
| GET | `/empresas/:id` | Obtener empresa |
| PATCH | `/empresas/:id` | Editar empresa |
| DELETE | `/empresas/:id` | Eliminar empresa |
| GET | `/informes/:idPractica` | Informe consolidado (SQL nativo) |
| GET/POST | `/documentos/...` | Documentos con datos quemados + persistencia |

> **Importante:** los `POST` de práctica e hijos requieren que existan las filas padre
> (`matricula_detalle`, `periodo_*`, `item_plan_marco`). Si la BD está vacía, devuelven error de
> clave foránea (esperado, no es un defecto del código).

---

## Para el equipo de frontend

- El backend corre en `http://localhost:3000` (levantar con `npm run dev` o `npx nest start`).
- Colección de Postman lista para importar: `postman/fase-practica.postman_collection.json`
  (variable `{{baseUrl}}` = `http://localhost:3000`). Incluye ~45 requests del módulo.
- Se puede consumir sin datos previos: documentos (`/documentos/*`), empresas, rúbricas e informe
  consolidado.
- Para crear una **práctica** (y su registro/plan/informe/evaluación/bitácora) se necesitan IDs
  válidos de las tablas académicas (`id_matricula_detalle`, `id_periodo_empresa`,
  `id_periodo_tutor_empresarial`, `id_periodo_docente`, `id_item_pm`). El front debe usar los IDs
  reales del sistema académico; mientras esas tablas estén vacías, el POST dará error de clave
  foránea (es correcto, no es falla del backend).
- El backend valida los cuerpos (400 si faltan campos obligatorios) y devuelve 404 si no existe el
  recurso. Los IDs se devuelven como número.

---

## Registro de avance (paso a paso)

Entorno: `sistema-academico-backend` (NestJS 10 + TypeORM 0.3 + PostgreSQL).
BD: `localhost:5433 / SistemaAcademicoYavirac`.

### Hallazgo inicial
- El reporte original decía que faltaban 8 tablas. **Falso**: las 9 tablas ya existen.
- El problema real: las entidades TypeORM no coincidían con el esquema real.
  - `empresa` no tenía `ruc` ni `razon_social` (NOT NULL) → el POST fallaba.
  - La rúbrica apuntaba a `rubrica`, pero en BD es `catalogo_rubrica` → el POST fallaba.
  - `plan_rotacion`, `evaluacion_practica`, `bitacora_semanal` tenían columnas NOT NULL marcadas
    como opcionales → el POST fallaba.
  - Los IDs en BD son `bigint`, pero las entidades usaban `int` → IDs como texto.

### Paso 1 — Alinear entidades y DTOs con la BD ✅
- `empresa.entity.ts`: `ruc` y `razon_social` (NOT NULL); `nombre` opcional.
- `rubrica.entity.ts`: `@Entity({ name: 'catalogo_rubrica' })`.
- `plan-rotacion`, `evaluacion-practica`, `bitacora-semanal`: columnas NOT NULL correctas.
- PK/FK `bigint` alineadas; `config/bigint-transformer.ts` convierte `bigint` (texto) a número.
- DTOs de creación actualizados para exigir campos obligatorios (`class-validator`).
- Verificación: `POST /empresas` y `POST /rubrica` → 201 con id numérico; los demás POST pasaron
  de error "null en columna" a error de **llave foránea** (prueba que el alineamiento es correcto).

### Paso 2 — ValidationPipe global ✅
- `src/main.ts`: `ValidationPipe` global (`whitelist: true`, `transform: true`).
- Verificación: `POST /empresas` sin `ruc`/`razon_social` → 400; `POST /rubrica` sin
  `nombre`/`tipo` → 400.

### Paso 3 — update / remove + cálculos + errores de negocio ✅
- `practica.service.ts`: `update`/`remove` para práctica, registro, plan, informe, evaluación,
  bitácora y rúbrica. `empresa.service.ts`: `updateEmpresa`/`removeEmpresa`.
- Al crear/actualizar/eliminar un `registro_diario` se recalcula `total_horas_cumplidas` de la
  práctica (restando el tiempo de almuerzo).
- Errores: `NotFoundException` si no existe la práctica/informe padre; `BadRequestException` si la
  nota final está fuera de 0–10.
- DTOs de actualización en `dto/update-*.dto.ts`.
- Limpieza: eliminados stubs vacíos (`bitacora.service.ts`, `evaluacion.service.ts`,
  `bitacora.controller.ts`, `evaluacion.controller.ts`, `practica.pg.ts`, `empresa.pg.ts`,
  `ports/practica.repository.ts`, `ports/empresa.repository.ts`).
- Verificación: `PATCH /empresas/8` → 200; `DELETE /rubrica/3` → `{deleted:true}`;
  `PATCH /empresas/99999` → 404.

### Paso 4 — PATCH/DELETE en controladores ✅
- `practica.controller.ts` y `empresa.controller.ts` con rutas `PATCH` y `DELETE` para cada recurso.

### Paso 5 — Tests (Jest) + Swagger — pendiente
No instalados (`@nestjs/swagger`, `jest`, `@nestjs/testing` ausentes). Requiere instalar dependencias
de desarrollo. El módulo queda funcionalmente terminado sin ellos.

---

## 1. Contexto y decisiones de arquitectura

### 1.1 SQL directo vs SQL crudo
El proyecto usa **TypeORM con `Repository`** (patrón repositorio + QueryBuilder):
- **Seguridad:** escapa parámetros (evita SQL injection).
- **Tipado:** devuelve entidades.
- **Portabilidad:** permite cambiar de Postgres a MySQL sin reescribir consultas.
- **Migraciones:** integración con las entidades existentes.

El **SQL crudo** (`dataSource.query('...')`) se reserva para consultas complejas o funciones nativas
de Postgres, como el informe consolidado por id. Conclusión: TypeORM/QueryBuilder para el CRUD; SQL
crudo solo para reportes pesados, siempre con parámetros.

### 1.2 Estructura del módulo
- `controllers/` → transporte (HTTP).
- `services/` → orquestación de casos de uso.
- `ports/` / `adapters/` → contrato e implementación del repositorio (usado en el informe consolidado).
- `domain/` → entidades.
- `dto/` → objetos de transferencia de datos.

---

## 2. Documentos de Fase Práctica (datos quemados + persistencia)

Pre-llenar y persistir los documentos con datos fijos de ejemplo para probar los formatos.

- `services/documento.service.ts` — datos quemados + `guardarDocumento`.
- `controllers/documento.controller.ts` — endpoints GET y POST.
- `domain/documento.entity.ts` — `documento_fase_practica`.
- `dto/create-documento.dto.ts` — body opcional `{ contenido? }`.
- `scripts/001_create_documento_fase_practica.sql` — creación de la tabla.

Endpoints GET (base `/fase-practica/documentos`):

| Método | Ruta | Contenido |
|--------|------|-----------|
| GET | `/datos` | Hoja maestra |
| GET | `/carta-compromiso` | F01 — Carta de compromiso |
| GET | `/curriculum` | F02 — Curriculum |
| GET | `/registro-asistencia` | F05 — Registro asistencia |
| GET | `/informe-aprendizaje` | F06 — Informe aprendizaje |
| GET | `/evaluacion-empresarial` | F07 — Evaluación empresarial |
| GET | `/evaluacion-instituto` | F08 — Evaluación instituto |
| GET | `/todos` | Todos juntos |

Endpoints POST (mismas rutas): sin body (`{}`) guarda los datos quemados; con
`{ "contenido": {...} }` guarda lo enviado. Respuesta:
`{ id_documento, codigo_formato, titulo, contenido, created_at }`.

---

## 3. Informe consolidado por id (SQL crudo)

`GET /fase-practica/informes/:idPractica` devuelve el informe completo de una práctica usando SQL
crudo con `jsonb_build_object`, `jsonb_agg` y `COALESCE`, haciendo JOIN a `registro_diario_practica`,
`informe_aprendizaje`, `bitacora_semanal` y `evaluacion_practica`. Si no existe la práctica,
devuelve `null`.

Archivos: `ports/informe-fase-practica.repository.ts`, `adapters/informe-fase-practica.pg.ts`,
`services/informe-fase-practica.service.ts`, `controllers/informe-fase-practica.controller.ts`.

---

## 4. Instrucciones para el equipo Frontend

El frontend es consumidor del backend: llama los endpoints y muestra los JSON ya formateados.

### Capa de datos sugerida (API client)
- `obtenerDocumento(codigo)` → GET documentos (F01–F08).
- `guardarDocumento(codigo, contenido?)` → POST documentos.
- `obtenerInforme(idPractica)` → GET informes/:id.
- `crearRegistroDiario(payload)` → POST registro-diario.
- `crearEvaluacion(payload)` → POST evaluacion.
- `crearPractica(payload)` → POST practicas (requiere IDs académicos válidos).

### Reglas del equipo
1. No hardcodear textos legales ni datos del estudiante (vienen del backend).
2. No armar el JSON de formatos manualmente (ya viene en el GET).
3. No hacer múltiples llamadas para el informe (el endpoint de informe trae todo).
4. El backend **sí tiene `ValidationPipe` global**: valida los cuerpos y devuelve 400 si faltan
   campos; el front debe enviar los campos obligatorios (`ruc`/`razon_social` en empresa, etc.).
5. Mostrar `id_*` para confirmar guardado.

---

## 5. Resolución del error "no existe la relación documento_fase_practica"

El proyecto usa `synchronize: false` en `src/app.module.ts`, por lo que TypeORM no crea tablas. La
tabla `documento_fase_practica` se crea con `scripts/001_create_documento_fase_practica.sql`:
```sql
CREATE TABLE IF NOT EXISTS documento_fase_practica (
  id_documento SERIAL PRIMARY KEY,
  codigo_formato VARCHAR(20) NOT NULL,
  titulo VARCHAR(200),
  contenido JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_documento_codigo ON documento_fase_practica (codigo_formato);
```
> Nota: si se cambia `synchronize` a `true` para crear tablas automáticamente, volver a `false`
> después para no alterar el esquema en producción.

---

## 6. Notas finales
- Los GET de documentos no tocan la base de datos (datos en memoria); los POST sí requieren la tabla.
- El informe por id usa las tablas reales y funciones JSON de Postgres.
- `tsc --noEmit` compila sin errores en todo lo implementado.
- El CRUD de práctica/hijos requiere datos en las tablas académicas padre (ver nota de arriba).

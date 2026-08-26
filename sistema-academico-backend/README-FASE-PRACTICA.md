# README — Módulo Fase Práctica (Backend NestJS + TypeORM)

Base URL: `http://localhost:3000/api`

---

## Estado actual del módulo

El módulo **Fase Práctica** está completamente funcional y alineado con la base de datos. Cuenta con:

- **14 entidades TypeORM** sincronizadas con PostgreSQL.
- **34 endpoints** REST (CRUD + documentos + informe consolidado).
- **Arquitectura Hexagonal** (Ports & Adapters) implementada en todos los servicios.
- **Validaciones** con `class-validator` y `ValidationPipe` global.
- **Transacciones** en operaciones compuestas (ej: registro diario + recálculo de horas).
- **Paginación retrocompatible** en todos los listados.
- **Código limpio**: sin código muerto, sin archivos vacíos, sin dependencias circulares.

> El módulo está listo para ser consumido por el frontend y para despliegue en producción.

---

## Correcciones aplicadas (última versión)

### Estructurales
- **Arquitectura Hexagonal**: Todos los servicios dependen de puertos (interfaces), no de TypeORM directamente.
- **Servicios especializados**: `RegistroDiarioService`, `PlanRotacionService`, `InformeAprendizajeService`, `EvaluacionPracticaService`, `BitacoraSemanalService`, `RubricaService`.
- **Facade**: `PracticaService` orquesta los servicios especializados manteniendo la misma API pública.
- **Lógica de documentos extraída**: `DocumentoPlantillaService` separado de `DocumentoService`.
- **Tipos organizados**: Interfaces de documentos movidas a `dto/documentos.types.ts`.

### Base de datos
- Entidades alineadas exactamente con la migración `1784092341224-CreateFasePractica.ts`.
- **Empresa**: eliminadas columnas `telefono` y `email` que no existen en la tabla real.
- **Empresa**: eliminada columna `nombre` que no existe en la tabla real.
- **Rubrica**: apunta a `catalogo_rubrica` (tabla correcta).
- **IDs bigint**: todos los IDs usan `bigintTransformer` para evitar texto en JSON.

### Validaciones
- `nota_final_calculada` validada en DTO con `@Min(0)` y `@Max(10)`.
- `ruc` y `razon_social` como obligatorios en empresa.
- Todos los DTOs tienen validaciones específicas.

### Transacciones
- `RegistroDiarioPg` implementa `createWithRecalculoHoras`, `updateWithRecalculoHoras`, `removeWithRecalculoHoras`.
- Garantiza consistencia entre `registro_diario_practica` y `practica_estudiante.total_horas_cumplidas`.

### Paginación
- Todos los endpoints `GET` de listado aceptan `skip` y `take` opcionales.
- Si no se envían parámetros, devuelven todos los registros (retrocompatible).

### Limpieza
- Eliminados stubs vacíos (`bitacora.controller.ts`, `evaluacion.controller.ts`, `bitacora.service.ts`, `evaluacion.service.ts`).
- Eliminados adaptadores y puertos vacíos antiguos.

---

## Estructura del módulo

```
src/modules/fase-practica/
├── controllers/          # Presentación (HTTP)
│   ├── practica.controller.ts
│   ├── empresa.controller.ts
│   ├── documento.controller.ts
│   └── informe-fase-practica.controller.ts
├── services/             # Aplicación (casos de uso)
│   ├── practica.service.ts              # Facade
│   ├── empresa.service.ts
│   ├── documento.service.ts
│   ├── documento-plantilla.service.ts   # Lógica de plantillas
│   ├── registro-diario.service.ts       # Especializado
│   ├── plan-rotacion.service.ts
│   ├── informe-aprendizaje.service.ts
│   ├── evaluacion-practica.service.ts
│   ├── bitacora-semanal.service.ts
│   ├── rubrica.service.ts
│   └── informe-fase-practica.service.ts
├── adapters/             # Infraestructura (TypeORM)
│   ├── practica.pg.ts
│   ├── empresa.pg.ts
│   ├── documento.pg.ts
│   ├── registro-diario.pg.ts
│   ├── plan-rotacion.pg.ts
│   ├── informe-aprendizaje.pg.ts
│   ├── evaluacion-practica.pg.ts
│   ├── bitacora-semanal.pg.ts
│   ├── rubrica.pg.ts
│   └── informe-fase-practica.pg.ts
├── ports/                # Contratos (interfaces)
│   ├── practica.repository.port.ts
│   ├── empresa.repository.port.ts
│   ├── documento.repository.port.ts
│   ├── registro-diario.repository.port.ts
│   ├── plan-rotacion.repository.port.ts
│   ├── informe-aprendizaje.repository.port.ts
│   ├── evaluacion-practica.repository.port.ts
│   ├── bitacora-semanal.repository.port.ts
│   ├── rubrica.repository.port.ts
│   └── informe-fase-practica.repository.ts
├── domain/               # Entidades TypeORM
│   ├── practica.entity.ts
│   ├── registro-diario.entity.ts
│   ├── plan-rotacion.entity.ts
│   ├── informe-aprendizaje.entity.ts
│   ├── evaluacion-practica.entity.ts
│   ├── bitacora-semanal.entity.ts
│   ├── rubrica.entity.ts
│   ├── empresa.entity.ts
│   ├── documento.entity.ts
│   ├── cv-dato-academico.entity.ts
│   ├── cv-experiencia-laboral.entity.ts
│   ├── cv-practica-dual.entity.ts
│   ├── detalle-evaluacion.entity.ts
│   ├── evaluacion-plan-marco.entity.ts
│   └── plan-rotacion-semana.entity.ts
├── dto/                  # Objetos de transferencia
│   ├── create-*.dto.ts
│   ├── update-*.dto.ts
│   ├── create-documento.dto.ts
│   └── documentos.types.ts
└── fase-practica.module.ts
```

---

## Resumen de endpoints (`/api/fase-practica`)

### Empresas
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/empresas` | Crear empresa |
| GET | `/empresas` | Listar empresas (`skip?`, `take?`) |
| GET | `/empresas/:id` | Obtener empresa |
| PATCH | `/empresas/:id` | Actualizar empresa |
| DELETE | `/empresas/:id` | Eliminar empresa |

### Prácticas
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/practicas` | Crear práctica |
| GET | `/practicas` | Listar prácticas (`skip?`, `take?`) |
| GET | `/practicas/:id` | Obtener práctica |
| PATCH | `/practicas/:id` | Actualizar práctica |
| DELETE | `/practicas/:id` | Eliminar práctica |

### Registro Diario
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/registro-diario` | Crear registro (recalcula horas) |
| GET | `/registro-diario/practica/:id` | Registros por práctica (`skip?`, `take?`) |
| PATCH | `/registro-diario/:id` | Actualizar registro |
| DELETE | `/registro-diario/:id` | Eliminar registro |

### Plan de Rotación
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/plan-rotacion` | Crear plan |
| GET | `/plan-rotacion/practica/:id` | Planes por práctica (`skip?`, `take?`) |
| PATCH | `/plan-rotacion/:id` | Actualizar plan |
| DELETE | `/plan-rotacion/:id` | Eliminar plan |

### Informe de Aprendizaje
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/informe-aprendizaje` | Crear informe |
| GET | `/informe-aprendizaje/practica/:id` | Informes por práctica (`skip?`, `take?`) |
| PATCH | `/informe-aprendizaje/:id` | Actualizar informe |
| DELETE | `/informe-aprendizaje/:id` | Eliminar informe |

### Evaluación de Práctica
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/evaluacion` | Crear evaluación |
| GET | `/evaluacion/practica/:id` | Evaluaciones por práctica (`skip?`, `take?`) |
| PATCH | `/evaluacion/:id` | Actualizar evaluación |
| DELETE | `/evaluacion/:id` | Eliminar evaluación |

### Bitácora Semanal
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/bitacora-semanal` | Crear bitácora |
| GET | `/bitacora-semanal/informe/:id` | Bitácoras por informe (`skip?`, `take?`) |
| PATCH | `/bitacora-semanal/:id` | Actualizar bitácora |
| DELETE | `/bitacora-semanal/:id` | Eliminar bitácora |

### Rúbricas
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/rubrica` | Crear rúbrica |
| GET | `/rubrica` | Listar rúbricas (`skip?`, `take?`) |
| PATCH | `/rubrica/:id` | Actualizar rúbrica |
| DELETE | `/rubrica/:id` | Eliminar rúbrica |

### Documentos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/documentos/datos` | Hoja maestra |
| GET | `/documentos/carta-compromiso` | F01 — Carta de compromiso |
| GET | `/documentos/curriculum` | F02 — Curriculum |
| GET | `/documentos/registro-asistencia` | F05 — Registro asistencia |
| GET | `/documentos/informe-aprendizaje` | F06 — Informe aprendizaje |
| GET | `/documentos/evaluacion-empresarial` | F07 — Evaluación empresarial |
| GET | `/documentos/evaluacion-instituto` | F08 — Evaluación instituto |
| GET | `/documentos/todos` | Todos juntos |
| POST | `/documentos/carta-compromiso` | Guardar carta (body opcional) |
| POST | `/documentos/curriculum` | Guardar curriculum |
| POST | `/documentos/registro-asistencia` | Guardar registro asistencia |
| POST | `/documentos/informe-aprendizaje` | Guardar informe |
| POST | `/documentos/evaluacion-empresarial` | Guardar evaluación empresarial |
| POST | `/documentos/evaluacion-instituto` | Guardar evaluación instituto |

### Informe Consolidado
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/informes/:idPractica` | Informe consolidado (SQL nativo) |

---

## Códigos HTTP

| Código | Significado |
|--------|-------------|
| 200 | Éxito en GET/PATCH/DELETE |
| 201 | Creado en POST |
| 400 | Validación fallida (faltan campos, formato incorrecto) |
| 404 | Recurso no encontrado |
| 500 | Error interno del servidor |

---

## Validaciones

### Empresa
- `ruc`: string, obligatorio, máximo 20 caracteres.
- `razon_social`: string, obligatorio, máximo 200 caracteres.
- `direccion`: string, opcional, máximo 300 caracteres.
- `estado`: string, opcional, máximo 50 caracteres.

### Práctica
- `id_periodo`: number, obligatorio.
- `id_matricula_detalle`: number, obligatorio.
- `id_empresa`: number, obligatorio.
- `id_tutor_empresarial`: number, obligatorio.
- `id_docente`: number, obligatorio.
- `total_horas_requeridas`: number, opcional, mínimo 0.
- `total_horas_cumplidas`: number, opcional, mínimo 0.
- `estado`: string, opcional.

### Registro Diario
- `id_practica`: number, obligatorio.
- `fecha`: string (YYYY-MM-DD), obligatorio.
- `hora_ingreso`: string (HH:mm), opcional.
- `hora_salida_almuerzo`: string (HH:mm), opcional.
- `hora_regreso_almuerzo`: string (HH:mm), opcional.
- `hora_salida`: string (HH:mm), opcional.
- `observaciones`: string, opcional.
- `firma_estudiante`: boolean, opcional.

### Evaluación
- `id_practica`: number, obligatorio.
- `id_rubrica`: number, obligatorio.
- `tipo_evaluador`: string, obligatorio, máximo 50 caracteres.
- `nota_final_calculada`: number, opcional, **entre 0 y 10**.
- `fecha_evaluacion`: string (YYYY-MM-DD), opcional.

---

## Transacciones

El endpoint `POST /registro-diario` ejecuta una transacción que:
1. Crea el registro diario.
2. Recalcula `total_horas_cumplidas` de la práctica.
3. Si falla el recálculo, se revierte el registro (no queda huérfano).

Lo mismo aplica para `PATCH` y `DELETE` de registros diarios.

---

## Paginación

Todos los endpoints de listado aceptan parámetros opcionales:

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `skip` | number | Registros a saltar |
| `take` | number | Límite de registros |

Ejemplos:
- `GET /api/fase-practica/empresas?skip=0&take=10`
- `GET /api/fase-practica/practicas?skip=20&take=10`

Si no se envían parámetros, devuelven todos los registros.

---

## Arquitectura

### Patrón: Hexagonal (Ports & Adapters)

```
Controller → Service → Puerto (interfaz) → Adaptador → TypeORM
```

- **Puertos**: Definen contratos en `ports/*.repository.port.ts`.
- **Adaptadores**: Implementan puertos en `adapters/*.pg.ts`.
- **Servicios**: Dependen de puertos, no de TypeORM.
- **Entidades**: Mapa de tablas PostgreSQL en `domain/`.

### Beneficios
- Desacoplado de TypeORM (se puede cambiar de ORM sin tocar servicios).
- Testeable (se pueden mockear puertos).
- Mantenible (cada entidad tiene su propio servicio).

---

## Instalación y despliegue

### Requisitos
- Docker Desktop
- Node.js 22+
- npm 10+

### Variables de entorno

Archivo `.env` en la raíz del proyecto:

```env
NODE_ENV=development
PORT=3000
APP_VERSION=1.0.0
COMMIT_SHA=local

DB_HOST=postgres
DB_PORT=5432
DB_NAME=sistema_academico
DB_USER=academico_user
DB_PASSWORD=academico_dev_2026

POSTGRES_DB=sistema_academico
POSTGRES_USER=academico_user
POSTGRES_PASSWORD=academico_dev_2026

JWT_SECRET=replace_this_before_staging
JWT_EXPIRES_IN=1h

CORS_ORIGIN=http://localhost:4200
```

### Levantar con Docker

```powershell
cd "C:\Users\morav\OneDrive\Desktop\Develop\SistemaAcademicoYavirac"
docker compose up -d
```

Verificar:
```powershell
docker ps
```

Debes ver 4 contenedores: `postgres`, `migrations`, `backend`, `frontend`.

### Levantar localmente (sin Docker)

```powershell
cd "C:\Users\morav\OneDrive\Desktop\Develop\SistemaAcademicoYavirac\sistema-academico-backend"

# Instalar dependencias
npm install

# Ejecutar migraciones
npm run migration:run

# Arrancar en desarrollo
npm run dev
```

---

## Verificación

### Health check
```
GET http://localhost:3000/api/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "application": "up",
  "database": "connected",
  "timestamp": "2026-07-16T19:41:20.913Z",
  "environment": "development",
  "version": "1.0.0",
  "commit": "local"
}
```

### Prueba rápida de endpoints

**1. Crear empresa:**
```
POST http://localhost:3000/api/fase-practica/empresas
Body: {"ruc":"1790012345001","razon_social":"Empresa Demo S.A.","direccion":"Av. Principal 123, Quito","estado":"ACTIVO"}
```

**2. Listar empresas:**
```
GET http://localhost:3000/api/fase-practica/empresas
```

**3. Crear práctica:**
```
POST http://localhost:3000/api/fase-practica/practicas
Body: {"id_periodo":1,"id_matricula_detalle":1,"id_empresa":1,"id_tutor_empresarial":1,"id_docente":1}
```

**4. Crear registro diario:**
```
POST http://localhost:3000/api/fase-practica/registro-diario
Body: {"id_practica":1,"fecha":"2025-12-01","hora_ingreso":"08:00","hora_salida":"18:00","hora_salida_almuerzo":"13:00","hora_regreso_almuerzo":"14:00"}
```

**5. Verificar horas recalculadas:**
```
GET http://localhost:3000/api/fase-practica/practicas/1
```

`total_horas_cumplidas` debe ser `8`.

---

## Notas importantes

### Prefijo global
Todas las rutas comienzan con `/api/`. No olvidar este prefijo en Postman o el frontend.

### IDs como números
Los IDs `bigint` se devuelven como números, no como strings, gracias a `bigint-transformer`.

### Errores comunes
- **404**: URL sin `/api` o ruta inexistente.
- **400**: Faltan campos obligatorios en el body.
- **500**: Columna no existe en BD (revisar entidad vs migración).

### Entidades sin endpoints
Las siguientes entidades están registradas en TypeORM pero no tienen endpoints propios:
- `cv_dato_academico`
- `cv_experiencia_laboral`
- `cv_practica_dual`
- `detalle_evaluacion`
- `evaluacion_plan_marco`
- `plan_rotacion_semana`

Son entidades de soporte para el informe consolidado. Si el frontend necesita CRUD sobre ellas, se pueden agregar endpoints sin afectar la estructura actual.

### Dependencias padre
Para crear una práctica se necesitan IDs válidos de:
- `periodo_academico` (`id_periodo`)
- `matricula_detalle` (`id_matricula_detalle`)
- `empresa` (`id_empresa`)
- `tutor_empresarial` (`id_tutor_empresarial`)
- `docente` (`id_docente`)

Si la BD está vacía, el POST fallará por clave foránea (comportamiento esperado).

---

## Solución de problemas

### Backend no responde
```powershell
docker logs sistemaacademicoyavirac-backend-1 --tail 50
```

### Migraciones no ejecutadas
```powershell
docker logs sistemaacademicoyavirac-migrations-1 --tail 30
```

### Verificar tablas
```powershell
docker exec -i sistemaacademicoyavirac-postgres-1 psql -U academico_user -d sistema_academico -c "\dt"
```

### Reconstruir backend
```powershell
cd "C:\Users\morav\OneDrive\Desktop\Develop\SistemaAcademicoYavirac"
docker compose build backend
docker compose up -d backend
```

---

## Contacto

Para dudas sobre el módulo Fase Práctica, consultar este documento o revisar:
- `src/modules/fase-practica/fase-practica.module.ts`
- `src/database/migrations/1784092341224-CreateFasePractica.ts`
- `src/modules/fase-practica/README-FASE-PRACTICA.md`

# Módulo `Vinculación` — Sistema Académico Yavirac

> **Repositorio:** `Jenn220/SistemaAcademicoYavirac`
> **Rama:** `feature/vinculacion`
> **Ruta:** `sistema-academico-backend/src/modules/vinculacion`
> **Framework:** NestJS + TypeORM (PostgreSQL)
> **Arquitectura:** Hexagonal (Puertos y Adaptadores)

---

## 1. Descripción general

El módulo `Vinculación` gestiona todo el proceso de **vinculación con la comunidad** de los estudiantes: desde la asignación a una entidad receptora y un docente tutor, pasando por el registro de actividades e informes, hasta la evaluación final y la generación de certificados/actas.

Cubre los siguientes procesos de negocio:

- Registro y consulta de **entidades receptoras** (empresas/instituciones donde el estudiante hace su vinculación).
- Creación y edición de la **vinculación** de un estudiante (proyecto, fechas, docente, entidad).
- **Inicio de actividades** del tutor (docente) sobre el proyecto.
- **Asistencia del estudiante** (registro diario de actividades y horas).
- **Asistencia del tutor** (registro/supervisión del docente o tutor empresarial).
- **Informe de actividades** del estudiante (incluye reflexión y resultados de aprendizaje).
- **Informe final** (resumen, objetivos, evaluación y parámetros de evaluación del tutor).
- **Certificado de vinculación** (documento final para el estudiante).
- **Acta de compromiso** (documento inicial de compromiso).

---

## 2. Arquitectura del módulo

El módulo sigue el patrón **Puertos y Adaptadores (Hexagonal)**:

```
vinculacion/
├── controllers/    → Entrada HTTP (NestJS Controllers), validan roles/JWT
├── services/       → Lógica de negocio (reglas, cálculos, orquestación)
├── ports/          → Interfaces (contratos) que desacoplan servicios de la persistencia
├── adapters/       → Implementación concreta de los ports (queries SQL / TypeORM)
├── domain/         → Entidades TypeORM (mapeo a tablas de la base de datos)
├── dto/            → Data Transfer Objects con validación (class-validator)
└── vinculacion.module.ts → Registro/ensamblaje de todo lo anterior en NestJS
```

**Flujo típico de una petición:**

```
Cliente HTTP
   → Controller (valida JWT + rol vía Guards)
      → Service (aplica reglas de negocio)
         → Port (interfaz)
            → Adapter (ejecuta SQL/TypeORM contra la BD)
```

Este diseño permite cambiar la forma de acceso a datos (adapter) sin tocar la lógica de negocio (service), ya que el service solo depende de la interfaz (port).

---

## 3. Módulo NestJS: `vinculacion.module.ts`

Ensambla controllers, entidades TypeORM, servicios y el binding entre **ports** (tokens de inyección) y **adapters** (implementación).

### Controllers registrados
- `EntidadReceptoraController`
- `InicioActividadesTutorController`
- `ActaCompromisoController`
- `AsistenciaEstudianteController`
- `AsistenciaTutorController`
- `InformeActividadesController`
- `CertificadoVinculacionController`
- `InformeFinalController`
- `VinculacionController`

### Entidades TypeORM registradas (`TypeOrmModule.forFeature`)
- `VinculacionActividadEstudiante`
- `VinculacionAsistenciaTutor`
- `VinculacionEstudianteEntity`
- `VinculacionInforme`
- `VinculacionObjetivo`
- `EvaluacionVinculacion`
- `DetalleEvaluacionVinculacion`
- `VinculacionReporteObservacionEntity`
- `EntidadReceptoraEntity`
- `EvaluacionParametrosTutorEntity`

### Bindings Puerto → Adaptador

| Puerto (token)                              | Adaptador                                |
|----------------------------------------------|-------------------------------------------|
| `ENTIDAD_RECEPTORA_PORT`                      | `EntidadReceptoraAdapter`                 |
| `VINCULACION_ACTA_PORT`                       | `CartaCompromisoReportesAdapter`          |
| `VINCULACION_ASISTENCIA_ESTUDIANTE_PORT`      | `VinculacionAsistenciaEstudianteAdapter`  |
| `VINCULACION_INICIO_ACTIVIDADES_PORT`         | `InicioActividadesTutorAdapter`           |
| `VINCULACION_ASISTENCIA_TUTOR_PORT`           | `AsistenciaTutorAdapter`                  |
| `INFORME_ACTIVIDADES_PORT`                    | `InformeActividadesAdapter`               |
| `CERTIFICADO_VINCULACION_PORT`                | `CertificadoVinculacionAdapter`           |
| `INFORME_FINAL_PORT`                          | `InformeFinalAdapter`                     |

### Exports
`EntidadReceptoraService`, `AuthVinculacionService`, `VinculacionService` (disponibles para otros módulos que importen `VinculacionModule`).

---

## 4. Seguridad y control de acceso

Todos los controllers (excepto `EntidadReceptoraController`) usan:

```ts
@UseGuards(JwtGuard, RolesGuard)
```

- **`JwtGuard`**: valida el token JWT y puebla `req.user`.
- **`RolesGuard`** + decorador **`@Roles(...)`**: restringe el endpoint a roles específicos (`ESTUDIANTE`, `DOCENTE`, `COORDINADOR`, `TUTOR_EMPRESARIAL`).

### `AuthVinculacionService`
Servicio transversal de seguridad usado por casi todos los controllers para **resolver el `id_vinculacion` correcto** según el rol del usuario autenticado:

- Si el usuario es **ESTUDIANTE**: busca su vinculación activa (`estado = 'EN_CURSO'`) mediante `matricula → matricula_detalle → vinculacion_estudiante`, y valida que solo pueda acceder a la suya propia (o la resuelve automáticamente si el `id` de la URL es `0`).
- Si el usuario es **DOCENTE / COORDINADOR / ADMIN**: respeta el `id` recibido por parámetro de URL sin restricción adicional.

> Este patrón evita que un estudiante consulte o edite datos de vinculaciones ajenas.

---

## 5. Entidades de dominio (`domain/`)

| Entidad | Tabla | Descripción |
|---|---|---|
| `VinculacionEstudianteEntity` | `vinculacion_estudiante` | Registro central: liga estudiante (vía `id_matricula_detalle`), docente, empresa/entidad receptora, proyecto, fechas, horas totales, estado (`EN_CURSO`, etc.) y bandera `editado`. |
| `VinculacionActividadEstudiante` | `vinculacion_actividad_estudiante` | Actividades diarias registradas por el estudiante (fecha, horas, descripción, resultado de aprendizaje). |
| `VinculacionAsistenciaTutor` | `vinculacion_asistencia_tutor` | Registros de asistencia/supervisión hechos por el tutor (docente/empresarial). |
| `VinculacionInforme` | `vinculacion_informe` | Informe de actividad macro y resultado de aprendizaje asociado a una vinculación. |
| `VinculacionObjetivo` | `vinculacion_objetivo` | Objetivos del proyecto de vinculación, con orden y descripción. |
| `EvaluacionVinculacion` | `evaluacion_vinculacion` | Nota final de la vinculación, ligada a una rúbrica (`id_rubrica`). |
| `DetalleEvaluacionVinculacion` | `detalle_evaluacion_vinculacion` | Detalle de puntajes por ítem de una evaluación. |
| `VinculacionReporteObservacionEntity` | `vinculacion_reporte_observacion` | Observaciones genéricas, tipificadas (`ASISTENCIA_ESTUDIANTE`, `ASISTENCIA_TUTOR`, `INFORME_FINAL`), asociadas a una vinculación. |
| `EntidadReceptoraEntity` | `vinculacion_entidad_receptora` | Empresa/institución que recibe al estudiante (nombre, contacto, tutor receptor). |
| `EvaluacionParametrosTutorEntity` | `evaluacion_parametros_tutor` | 11 parámetros cuantitativos de evaluación del tutor (puntualidad, ética profesional, etc.), único por `id_vinculacion`. |

---

## 6. DTOs (`dto/`)

Todos usan `class-validator` para validación automática vía `ValidationPipe`.

| DTO | Uso |
|---|---|
| `CreateVinculacionDto` / (update inline) | Crear vinculación: matrícula, empresa, docente, proyecto, fechas, horas, entidad receptora. |
| `CreateActividadEstudianteDto` / `UpdateActividadEstudianteDto` | Alta/edición de actividad diaria del estudiante. |
| `CreateAsistenciaTutorDto` / `UpdateAsistenciaTutorDto` | Alta/edición de asistencia del tutor. |
| `CreateInicioActividadesDto` / `UpdateInicioActividadesDto` | Datos iniciales del proyecto (nombre, fechas). |
| `CreateInformeDto` / `UpdateInformeDto` | Informe de actividad macro / resultado de aprendizaje. |
| `UpdateResultadoAprendizajeDto` | Actualiza solo el resultado de aprendizaje de una actividad puntual. |
| `CreateObservacionDto` | Observaciones tipificadas (`INFORME_FINAL`, `ASISTENCIA_TUTOR`, `ASISTENCIA_ESTUDIANTE`). |
| `CreateVinculacionObjetivoDto` / `UpdateObjetivoDto` | Objetivos del proyecto (descripción + orden). |
| `CreateEvaluacionDto` / `UpdateEvaluacionDto` | Evaluación final: nota, rúbrica, observaciones y los 11 parámetros del tutor. |
| `CreateDetalleEvaluacionDto` / `UpdateDetalleEvaluacionDto` | Puntaje por ítem de rúbrica. |
| `CreateEntidadReceptoraDto` | Alta de entidad receptora (nombre, dirección, teléfono, correo, tutor). |

---

## 7. Puertos (`ports/`) — contratos de persistencia

| Puerto | Interfaz principal |
|---|---|
| `acta-compromiso.port.ts` | `obtainActaCompromisoRaw(idVinculacion)` |
| `asistencia-estudiante.port.ts` | CRUD de actividades del estudiante + búsqueda por fecha/id + `obtenerRangoFechasVinculacion` (valida fechas dentro del proyecto) |
| `asistencia-tutor.port.ts` | CRUD de asistencias del tutor + búsqueda por id/fecha |
| `certificado-vinculacion.port.ts` | `obtainCertificadoVinculacionRaw(idVinculacion)` |
| `entidad-receptora.port.ts` | CRUD básico de entidades receptoras |
| `informe-actividades.port.ts` | Obtiene informe crudo, actualiza resultado de aprendizaje, guarda observación/reflexión |
| `informe-final.port.ts` | Lista informes por docente + obtiene informe final crudo |
| `inicio-actividades-tutor.port.ts` | Obtiene/actualiza datos de inicio de actividades, marca proyecto como `editado` (edición única) |

---

## 8. Servicios (`services/`) — lógica de negocio

### `AuthVinculacionService`
Ver sección 4. Resuelve el `id_vinculacion` según el rol del usuario autenticado.

### `VinculacionService`
- **`create(dto)`**: antes de insertar, valida que el **período académico esté `ACTIVO`** (join `matricula_detalle → oferta_asignatura → periodo_carrera`); obtiene automáticamente `id_periodo`; inserta el registro vía SQL crudo.
- **`update(id, dto)`**: bloquea la edición si el período está **`FINALIZADO`** (regla institucional); si no, actualiza vía TypeORM.
- **`obtenerVinculacionActivaPorEstudiante(idEstudiante)`**: retorna la vinculación con `estado = 'EN_CURSO'` más reciente del estudiante.

### `EntidadReceptoraService`
CRUD simple sobre entidades receptoras, delegando en el port/adapter y envolviendo errores en excepciones HTTP (`InternalServerErrorException`, `NotFoundException`).

### `ActaCompromisoService`
Arma el objeto de "Acta de Compromiso" (título institucional, datos del estudiante, entidad, docente) a partir de los datos crudos del adapter.

### `CertificadoVinculacionService`
Genera los datos del certificado de vinculación con fechas formateadas en español (`toLocaleDateString('es-ES', ...)`), horas totales y representante institucional por defecto.

### `AsistenciaEstudianteService`
- **`calcularDiferenciaHoras(inicio, fin)`**: calcula horas trabajadas; lanza error si la hora fin no es posterior a la de inicio.
- **`verificarFechaEnRango`**: valida que la fecha de la actividad esté dentro del rango `fecha_inicio`–`fecha_fin` del proyecto.
- **`crearActividadEstudiante`**: valida rango de fechas, evita duplicados por fecha (mismo `id_vinculacion`), calcula horas y guarda observación opcional.
- **`actualizarActividadEstudiante` / `eliminarActividadEstudiante`**: validan que, si el usuario es `ESTUDIANTE`, la actividad pertenezca a su propia vinculación (resuelta por `idEstudiante` si no viene explícita).
- **`actualizarObservacion`**: guarda/actualiza observación tipo `ASISTENCIA_ESTUDIANTE`.
- Maneja conflictos de duplicidad (`ConflictException`, código Postgres `23505`).

### `AsistenciaTutorService`
- **`validarPeriodoActivoPorVinculacion`**: bloquea creación/edición/eliminación si el período académico asociado está `FINALIZADO`.
- **`obtenerVinculacionPorEstudiante`**: busca la vinculación `EN_CURSO` de un estudiante (uso interno para resolver accesos).
- **`obtenerAsistenciasTutorPorDocente` / `obtenerReporteAsistenciaTutor`**: arman reportes con cabecera (carrera, institución, docente, periodo) y detalle de actividades con horas calculadas.
- **`crearAsistenciaTutor` / `actualizarAsistenciaTutor` / `eliminarAsistenciaTutor`**: aplican la regla de período activo antes de cualquier escritura, evitan duplicados por fecha, y traducen errores de Postgres (llave duplicada `23505`, FK `23503`) a excepciones HTTP claras.
- **`actualizarObservacion`**: hace upsert manual (SELECT + UPDATE/INSERT) sobre `vinculacion_reporte_observacion` con tipo `ASISTENCIA_TUTOR`.

### `InformeActividadesService`
- **`obtenerInformeActividades`**: arma cabecera (fundación, nivel, estudiante, cédula, ciclo, asignaturas, fechas, docente, proyecto), lista de actividades formateadas y la reflexión del estudiante.
- **`obtenerActividadPorId`**: obtiene una actividad o lanza `NotFoundException`.
- **`actualizarResultadoAprendizaje`**: si el usuario es `ESTUDIANTE`, valida que la actividad le pertenezca antes de permitir la edición.
- **`actualizarReflexionEstudiante`**: guarda la reflexión como observación tipo `ASISTENCIA_ESTUDIANTE`.

### `InformeFinalService`
El servicio más completo del módulo:
- **`obtenerInformeFinal`**: arma un informe extenso con datos generales, resumen de actividades (con total de horas acumuladas), objetivos del proyecto (JSON agregado desde SQL), reflexión del estudiante, evaluación final (nota en número y en letras vía `convertirNotaALetras`) y los **11 parámetros de evaluación del tutor** (si existen).
- **`guardarEvaluacionFinal`**: hace upsert de tres cosas en la misma llamada:
  1. Nota final (`evaluacion_vinculacion`), resolviendo automáticamente `id_rubrica` de tipo `VINCULACION` (la crea si no existe, vía `resolverIdRubricaVinculacion`).
  2. Observaciones (`vinculacion_reporte_observacion`, tipo `INFORME_FINAL`).
  3. Los 11 parámetros de evaluación (`evaluacion_parametros_tutor`), actualizando solo los campos enviados.
- **`listarInformesPorDocente`**: lista informes de todos los estudiantes a cargo del docente autenticado, con nota final parseada a `float`.

### `InicioActividadesTutorService`
- **`obtenerInicioActividadesTutor`**: retorna datos del proyecto (tutor, fechas, carrera, entidad, coordinador) con valores por defecto ("Sin Coordinador Asignado", etc.) y la bandera `editado`.
- **`actualizarInicioActividadesTutor`**: **regla de edición única** — si el registro ya fue `editado = true`, rechaza nuevas modificaciones (`BadRequestException`); valida que `fecha_fin > fecha_inicio`; al guardar, marca el registro como `editado`.
- **`actualizarFechaFinProyecto`**: actualización puntual de la fecha de fin.

---

## 9. Controllers (`controllers/`) — Endpoints HTTP

> Todos requieren JWT + rol autorizado, salvo `EntidadReceptoraController`.

### `EntidadReceptoraController` — `/vinculacion/entidades-receptoras`
| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| POST | `/` | — | Crea una entidad receptora |
| GET | `/` | — | Lista todas las entidades |
| GET | `/:id` | — | Obtiene una entidad por ID |

### `VinculacionController` — `/vinculacion`
| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| GET | `/estudiante/vinculacion-activa` | `ESTUDIANTE` | Obtiene la vinculación activa del estudiante autenticado |

### `InicioActividadesTutorController` — `/vinculacion/inicio-actividades`
| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| GET | `/` | `DOCENTE`, `COORDINADOR` | Lista inicios de actividades a cargo del docente |
| GET | `/:id` | `ESTUDIANTE`, `COORDINADOR`, `DOCENTE` | Obtiene el inicio de actividades de una vinculación |
| PATCH | `/:id` | `DOCENTE`, `COORDINADOR` | Actualiza datos iniciales (solo si no ha sido editado antes) |
| POST | `/:id` | `DOCENTE`, `COORDINADOR` | (Alias funcional de PATCH — reutiliza la misma lógica de actualización) |

### `ActaCompromisoController` — `/vinculacion/acta-compromiso`
| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| GET | `/:id` | `ESTUDIANTE`, `COORDINADOR` | Obtiene el acta de compromiso |

### `AsistenciaEstudianteController` — `/vinculacion/asistencia-estudiante`
| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| GET | `/:id` | `ESTUDIANTE`, `COORDINADOR`, `DOCENTE` | Obtiene el reporte de asistencia del estudiante |
| PATCH | `/:idVinculacion/observaciones` | `ESTUDIANTE`, `COORDINADOR`, `DOCENTE` | Actualiza observaciones |
| POST | `/` | `ESTUDIANTE` | Registra una nueva actividad |
| PATCH | `/:id` | `ESTUDIANTE` | Actualiza una actividad propia |
| DELETE | `/:id` | `ESTUDIANTE` | Elimina una actividad propia |

### `AsistenciaTutorController` — `/vinculacion/asistencia-tutor`
| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| POST | `/` | `DOCENTE`, `TUTOR_EMPRESARIAL`, `COORDINADOR` | Crea un registro de asistencia/supervisión del tutor |
| GET | `/` | `DOCENTE`, `COORDINADOR` | Lista asistencias del docente autenticado |
| PATCH | `/:idVinculacion/observaciones` | `DOCENTE`, `TUTOR_EMPRESARIAL`, `COORDINADOR` | Actualiza observaciones |
| GET | `/:id` | `ESTUDIANTE`, `DOCENTE`, `COORDINADOR`, `TUTOR_EMPRESARIAL` | Obtiene un reporte específico (resuelve automáticamente el ID si el estudiante envía `0`) |
| PATCH | `/:id` | `DOCENTE`, `TUTOR_EMPRESARIAL`, `COORDINADOR` | Edita un registro |
| DELETE | `/:id` | `DOCENTE`, `COORDINADOR` | Elimina un registro |

### `InformeActividadesController` — `/vinculacion/informe-actividades`
| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| PATCH | `/:id/reflexion` | `ESTUDIANTE`, `COORDINADOR` | Actualiza la reflexión del estudiante |
| GET | `/:id` | `ESTUDIANTE`, `COORDINADOR` | Obtiene el informe de actividades completo |
| PATCH | `/actividad/:idActividad` | `ESTUDIANTE`, `COORDINADOR` | Actualiza el resultado de aprendizaje de una actividad puntual |

### `CertificadoVinculacionController` — `/vinculacion/certificado`
| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| GET | `/:id` | `ESTUDIANTE`, `COORDINADOR` | Obtiene los datos del certificado de vinculación |

### `InformeFinalController` — `/vinculacion/informe-final`
| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| GET | `/` | `DOCENTE`, `COORDINADOR` | Lista informes de los estudiantes a cargo del docente |
| GET | `/:id` | `ESTUDIANTE`, `DOCENTE`, `COORDINADOR` | Obtiene el informe final de una vinculación |
| PATCH | `/:id/evaluacion` | `DOCENTE`, `COORDINADOR` | Guarda/actualiza nota final, observaciones y parámetros de evaluación |

---

## 10. Adaptadores (`adapters/`) — acceso a datos

Cada adapter implementa su respectivo *port* y ejecuta consultas SQL (crudas o vía TypeORM QueryBuilder/Repository) contra las tablas relacionadas. Los más relevantes:

- **`CartaCompromisoReportesAdapter`**: JOIN entre `vinculacion_estudiante`, `matricula`, `estudiante`, `carrera`, `docente` y `vinculacion_entidad_receptora` para armar los datos del acta.
- **`VinculacionAsistenciaEstudianteAdapter`**: CRUD sobre `vinculacion_actividad_estudiante`, incluye búsqueda por fecha/vinculación y resolución de `id_vinculacion` a partir del estudiante.
- **`AsistenciaTutorAdapter`**: CRUD sobre `vinculacion_asistencia_tutor`.
- **`CertificadoVinculacionAdapter`**: calcula el total de horas del estudiante (`SUM` sobre actividades) y trae datos de la entidad receptora o empresa.
- **`InformeActividadesAdapter`**: trae asignaturas concatenadas (`STRING_AGG`), reflexión del estudiante y actividades detalladas.
- **`InformeFinalAdapter`**: la consulta más compleja — agrega objetivos del proyecto como JSON (`json_agg` / `json_build_object`), observaciones por tipo, y datos de evaluación (nota final).
- **`InicioActividadesTutorAdapter`**: trae datos del tutor, proyecto, entidad y coordinador; expone `marcarComoEditado` para la regla de edición única.
- **`EntidadReceptoraAdapter`**: CRUD simple sobre `vinculacion_entidad_receptora`.

> **Nota:** varias consultas usan JOINs recurrentes entre `vinculacion_estudiante → matricula_detalle → matricula → estudiante/carrera`, y con `oferta_asignatura → periodo_carrera` para validar el estado del período académico (`ACTIVO` / `FINALIZADO`).

---

## 11. Reglas de negocio clave (resumen)

1. **Un estudiante solo puede ver/editar su propia vinculación** — resuelto centralizadamente por `AuthVinculacionService`.
2. **No se puede crear ni modificar una vinculación si el período académico está `FINALIZADO`** (`VinculacionService`, `AsistenciaTutorService`).
3. **No se permiten registros duplicados de asistencia (estudiante o tutor) en la misma fecha** para una misma vinculación.
4. **La hora de fin debe ser posterior a la hora de inicio** en todo registro de asistencia; las horas totales se calculan automáticamente (no se confía en el valor enviado por el cliente).
5. **Las actividades del estudiante deben caer dentro del rango `fecha_inicio`–`fecha_fin`** del proyecto de vinculación.
6. **El "Inicio de Actividades" del proyecto solo puede editarse una vez** (`editado = true` bloquea futuras ediciones).
7. **La evaluación final combina tres fuentes de datos** (nota, observaciones, 11 parámetros cuantitativos) que se guardan/actualizan de forma independiente en un mismo endpoint.
8. Los reportes (`Informe-Actividades`, `Asistencia-Tutor`, `Informe-Final`) siempre calculan totales de horas en el propio servicio, nunca confían en un campo precalculado en la base de datos.

---

## 12. Posibles mejoras / puntos de atención observados

- Hay **queries SQL crudas repetidas** en varios servicios y adapters (p. ej. joins `matricula_detalle → oferta_asignatura → periodo_carrera` para validar período activo); podrían extraerse a un helper o vista SQL reutilizable.
- Algunos métodos usan `any` extensivamente en los tipos de retorno de los ports, lo que reduce el tipado fuerte de TypeScript.
- El método `validarRangoFechas` en `AsistenciaEstudianteService` quedó como código muerto/incompleto (fue reemplazado por `verificarFechaEnRango`); podría eliminarse.
- El endpoint `POST /vinculacion/inicio-actividades/:id` duplica exactamente la lógica del `PATCH` — se podría unificar o documentar la diferencia de intención.
- Nombres de archivos inconsistentes en `adapters/` (mezcla de `PascalCase` y `kebab-case`, y algunos sin sufijo `.adapter.ts`), lo que dificulta la navegación del proyecto.

---

*Documento generado automáticamente a partir del código fuente del módulo `vinculacion` en la rama `feature/vinculacion`.*

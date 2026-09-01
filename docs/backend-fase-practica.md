# Documentacion del Backend — Módulo FASE PRÁCTICA

## 1. Resumen General

| Aspecto             | Detalle                                                                            |
| ------------------- | ---------------------------------------------------------------------------------- |
| **Framework**       | NestJS 11.1.27 + TypeScript 6.0.3                                                  |
| **Base de datos**   | PostgreSQL vía TypeORM 0.3.21 (`synchronize: false`, migraciones manuales)         |
| **Arquitectura**    | Hexagonal (Ports & Adapters)                                                       |
| **Auth**            | JWT (`JwtGuard`) + RBAC (`RolesGuard`) con 4 roles                                 |
| **Validación**      | `class-validator` + `ValidationPipe` global (`whitelist: true`, `transform: true`) |
| **Docker**          | Multi‑stage (4 etapas: dependencies → build → production-deps → runtime)           |
| **Total archivos**  | 158 (22 entities, 22 services, 20 adapters, 20 ports, 16 controllers, 57 DTOs)     |
| **Ruta del módulo** | `src/modules/fase-practica/`                                                       |

---

## 2. Arquitectura Hexagonal (Ports & Adapters)

```

Controller → Service → Puerto (interfaz) → Adaptador (TypeORM) → Base de datos

```

### 2.1. Puertos (`ports/` — 20 archivos)

Cada archivo `*-repository.port.ts` define una interfaz `I*Repository` y exporta una constante símbolo usada como token de inyección.

| Puerto                                      | Token                               | Interface                         | Métodos clave                                                                                                                               |
| ------------------------------------------- | ----------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `practica.repository.port.ts`               | `PRACTICA_REPOSITORY`               | `IPracticaRepository`             | createPractica, findAllPracticas, findPracticaById, updatePractica, removePractica + CRUD registro/plan/informe/evaluacion/bitacora/rubrica |
| `empresa.repository.port.ts`                | `EMPRESA_REPOSITORY`                | `IEmpresaRepository`              | createEmpresa, findAllEmpresas, findEmpresaById, updateEmpresa, removeEmpresa                                                               |
| `documento.repository.port.ts`              | `DOCUMENTO_REPOSITORY`              | `IDocumentoRepository`            | guardarDocumento, buscarPorPracticaYCodigo, listarPorPractica, findOne, actualizarEstado, buscarPorId                                       |
| `registro-diario.repository.port.ts`        | `REGISTRO_DIARIO_REPOSITORY`        | `IRegistroDiarioRepository`       | create, findByPractica, findById, update, remove + createWithRecalculoHoras, updateWithRecalculoHoras, removeWithRecalculoHoras             |
| `plan-rotacion.repository.port.ts`          | `PLAN_ROTACION_REPOSITORY`          | `IPlanRotacionRepository`         | create, findByPractica, findById, update, remove                                                                                            |
| `plan-marco.repository.port.ts`             | `PLAN_MARCO_REPOSITORY`             | `IPlanMarcoRepository`            | create, findByPractica, findById, update, remove                                                                                            |
| `item-plan-marco.repository.port.ts`        | `ITEM_PLAN_MARCO_REPOSITORY`        | `IItemPlanMarcoRepository`        | create, findByPlanMarco, findById, update, remove                                                                                           |
| `evaluacion-practica.repository.port.ts`    | `EVALUACION_PRACTICA_REPOSITORY`    | `IEvaluacionPracticaRepository`   | create, findByPractica, findById, update, remove                                                                                            |
| `evaluacion-plan-marco.repository.port.ts`  | `EVALUACION_PLAN_MARCO_REPOSITORY`  | `IEvaluacionPlanMarcoRepository`  | create, findByPractica, findById, findByItemPlanMarco, update, remove                                                                       |
| `informe-aprendizaje.repository.port.ts`    | `INFORME_APRENDIZAJE_REPOSITORY`    | `IInformeAprendizajeRepository`   | create, findByPractica, findById, update, remove                                                                                            |
| `bitacora-semanal.repository.port.ts`       | `BITACORA_SEMANAL_REPOSITORY`       | `IBitacoraSemanalRepository`      | create, findByInforme, findById, update, remove                                                                                             |
| `rubrica.repository.port.ts`                | `RUBRICA_REPOSITORY`                | `IRubricaRepository`              | create, findAll, findById, update, remove                                                                                                   |
| `item-rubrica.repository.port.ts`           | `ITEM_RUBRICA_REPOSITORY`           | `IItemRubricaRepository`          | create, findByPlanMarco, findOne, update, remove                                                                                            |
| `plan-rotacion-semana.repository.port.ts`   | `PLAN_ROTACION_SEMANA_REPOSITORY`   | `IPlanRotacionSemanaRepository`   | create, findByPlanRotacion, findOne, update, remove, deleteByPlanRotacion                                                                   |
| `detalle-evaluacion.repository.port.ts`     | `DETALLE_EVALUACION_REPOSITORY`     | `IDetalleEvaluacionRepository`    | create, findByEvaluacion, findOne, update, remove                                                                                           |
| `notificacion.repository.port.ts`           | `NOTIFICACION_REPOSITORY`           | `INotificacionRepository`         | crear, listarPorDestinatario, marcarComoLeida, contarNoLeidas                                                                               |
| `cv-dato-academico.repository.port.ts`      | `CV_DATO_ACADEMICO_REPOSITORY`      | `ICvDatoAcademicoRepository`      | create, findByEstudiante, findOne, update, remove                                                                                           |
| `cv-experiencia-laboral.repository.port.ts` | `CV_EXPERIENCIA_LABORAL_REPOSITORY` | `ICvExperienciaLaboralRepository` | create, findByEstudiante, findOne, update, remove                                                                                           |
| `cv-practica-dual.repository.port.ts`       | `CV_PRACTICA_DUAL_REPOSITORY`       | `ICvPracticaDualRepository`       | create, findByEstudiante, findOne, update, remove                                                                                           |
| `informe-fase-practica.repository.port.ts`  | `INFORME_FASE_PRACTICA_REPOSITORY`  | `InformeFasePracticaRepository`   | obtenerInformePorIdPractica (SQL nativo)                                                                                                    |

### 2.2. Adaptadores (`adapters/` — 20 archivos)

Todos con sufijo `.pg.ts`, implementan las interfaces de puertos usando TypeORM `@InjectRepository` y `Repository<T>`.

### 2.3. Servicios (`services/` — 22 archivos)

Contienen la lógica de negocio. Inyectan puertos vía `@Inject(TOKEN)` y `DataSource` para queries nativas.

**Patrón Facade:** `PracticaService` (451 líneas) actúa como fachata orquestando 6 servicios especializados:

- `RegistroDiarioService` (78 líneas)
- `PlanRotacionService` (92 líneas)
- `InformeAprendizajeService` (78 líneas)
- `EvaluacionPracticaService` (~4.4 KB)
- `BitacoraSemanalService` (87 líneas)
- `RubricaService` (38 líneas)
- `ItemRubricaService` (35 líneas)
- `ItemPlanMarcoService` (122 líneas)
- `PlanMarcoService` (156 líneas)
- `PlanRotacionSemanaService` (128 líneas)

Mantiene la misma API pública manteniendo compatibilidad.

### 2.4. Registro en módulo (`fase-practica.module.ts` — 258 líneas)

- `imports`: `TypeOrmModule.forFeature([...])` con 22 entidades
- `controllers`: 16 controladores
- `providers`: 11 servicios + 11 adaptadores (tokens → useClass) + `EvaluacionCalculoService` + `EvaluacionEmpresaService` + `EvaluacionInstitutoService`

---

## 3. Entidades Dominio (22 entidades)

### 3.1. Entidad Principal: `PracticaEntity` (tabla `practica_estudiante`)

```typescript
@Entity({ name: 'practica_estudiante' })
```

- **PK**: **`id_practica`** (bigint, autoincrement, bigintTransformer)
- **FKs**: **`id_periodo`**, **`id_matricula_detalle`**, **`id_empresa`**, **`id_tutor_empresarial`**, **`id_docente`**
- **Campos funcionales**: **`total_horas_requeridas`** (default 400), **`total_horas_cumplidas`** (default 0), **`estado`** (default 'EN_CURSO'), **`fecha_inicio`**, **`fecha_fin`**, **`nombre_proyecto`**, **`cobertura_localizacion`**, **`plazo_ejecucion`**
- **Campos override/denormalizados** (migración 1789100000000): **`nombre_carrera`**, **`nombre_nivel`**, **`nombre_periodo`**, **`nombre_nucleo`**, **`nombre_tutor_academico`**, **`nombre_coordinador`**, **`nombre_empresa`**, **`nombre_tutor_empresarial`**
- **Campos de emergencia** (migración 1784969000000): **`tipo_sangre`**, **`contacto_emergencia_nombre`**, **`contacto_emergencia_telefono`**
- **Campos de matrícula** (migración 1789200000000): **`hornada`**, **`paralelo`**
- **Relaciones ManyToOne eager**: **`empresa`** → **`EmpresaEntity`**, **`tutor_empresarial`** → **`TutorEmpresarialEntity`**
- **Constraint**: **`UNIQUE (id_matricula_detalle)`** — 1:1 con matrícula

### 3.2. Entidades de Soporte

#### `EmpresaEntity` (tabla `empresa`)

- **`id_empresa`** (PK bigint), **`ruc`** (varchar 20), **`razon_social`** (varchar 200), **`direccion`** (text nullable), **`estado`** (varchar 20), **`telefono`** (varchar 50), **`correo`** (varchar 150), **`representante_legal`** (varchar 200)

#### `TutorEmpresarialEntity` (tabla `tutor_empresarial`)

- **`id_tutor_empresarial`** (PK), **`id_empresa`** (FK), **`cedula`**, **`nombres`**, **`apellidos`**, **`cargo`**, **`correo`**, **`estado`**

#### `EstudianteEntity` (tabla `estudiante`)

- **`id_estudiante`** (PK), **`cedula`**, **`nombres`**, **`apellidos`**, **`correo`**, **`telefono`**, **`estado`**, **`estado_civil`**, **`tipo_sangre`**, **`domicilio`**, **`contacto_emergencia_nombre`**, **`contacto_emergencia_telefono`**

#### `NucleoEstructuranteEntity` (tabla `nucleo_estructurante`)

- **`id_nucleo`** (PK), **`id_carrera`** (FK), **`nombre`**, **`objetivo`**, **`estado`**

#### `RegistroDiarioEntity` (tabla `registro_diario_practica`)

- **`id_registro_diario`** (PK), **`id_practica`** (FK), **`fecha`** (date), **`hora_ingreso/salida/hora_salida_almuerzo/hora_regreso_almuerzo`** (time), **`observaciones`** (text), **`firma_estudiante`** (boolean default false)

#### `InformeAprendizajeEntity` (tabla `informe_aprendizaje`)

- **`id_informe`** (PK), **`id_practica`** (FK), **`reflexion_aprendizaje`** (text), **`observaciones_empresa`** (text)

#### `BitacoraSemanalEntity` (tabla `bitacora_semanal`)

- **`id_bitacora`** (PK), **`id_informe`** (FK), **`semana`** (int), **`fecha_inicio_semana/fecha_fin_semana`** (varchar 20), **`puesto_aprendizaje`**, **`actividades_realizadas`**, **`actividades_autonomas`**

#### `PlanRotacionEntity` (tabla `plan_rotacion`)

- **`id_plan_rotacion`** (PK), **`id_practica`** (FK), **`id_item_pm`** (FK), **`puesto_aprendizaje`** (varchar 150)

#### `PlanRotacionSemanaEntity` (tabla `plan_rotacion_semana`)

- **`id_rotacion_semana`** (PK), **`id_plan_rotacion`** (FK, CASCADE), **`id_item_pm`** (FK nullable), **`semana`** (int), **`es_defensa_proyecto`** (boolean)

#### `PlanMarcoFormacionEntity` (tabla `plan_marco_formacion`)

- **`id_plan_marco`** (PK), **`id_practica`** (FK nullable tras migración), **`id_nivel`** (FK nullable), **`horas_formacion`**, **`objetivos_fase_practica`**, **`id_nucleo_estructurante`**, **`estado`**

#### `ItemPlanMarcoEntity` (tabla `item_plan_marco`)

- **`id_item_pm`** (PK), **`id_plan_marco`** (FK), **`resultado_aprendizaje`** (text), **`nivel_logro_esperado`** (int), **`tareas_laborales`**, **`puesto_aprendizaje`**, **`semanas`**, **`nivel_real_alcanzado`**, **`responsable_puesto`**

#### `EvaluacionPracticaEntity` (tabla `evaluacion_practica`)

- **`id_evaluacion`** (PK), **`id_practica`** (FK), **`id_rubrica`** (FK → catalogo_rubrica), **`tipo_evaluador`** (EMPRESA/INSTITUTO), **`nota_final_calculada`** (numeric, validada 0-10)
- 11 columnas de cálculo: **`promedio_desempeno`**, **`nota_ponderada_desempeno`**, **`nota_parcial_defensa`**, **`nota_final_defensa`**, **`nota_ponderada_defensa`**, **`nota_final_empresa`**, **`promedio_proyecto_empresarial`**, **`nota_ponderada_proyecto`**, **`nota_final_instituto`**
- **`fecha_evaluacion`**, **`id_tutor_empresarial`**, **`estado`** (default 'BORRADOR'), **`observaciones`**

#### `DetalleEvaluacionEntity` (tabla `detalle_evaluacion`)

- **`id_detalle_evaluacion`** (PK), **`id_evaluacion`** (FK), **`id_item`** (FK → item_rubrica), **`puntaje_asignado`** (numeric 5,2), **`tipo_criterio`** (default 'DESEMPENO'), **`nivel_calificacion`**, **`observacion`**

#### `ItemRubricaEntity` (tabla `item_rubrica`)

- **`id_item`** (PK), **`id_rubrica`** (FK, ManyToOne), **`descripcion_criterio`** (text), **`puntaje_maximo`** (numeric 5,2), **`ponderacion`** (numeric 5,2 nullable)

#### `RubricaEntity` (tabla `catalogo_rubrica`)

- **`id_rubrica`** (PK), **`nombre`** (varchar 150), **`tipo`** (EMPRESARIAL/INSTITUTO), **`estado`** (default 'ACTIVO')

#### `EvaluacionPlanMarcoEntity` (tabla `evaluacion_plan_marco`)

- **`id_evaluacion_pm`** (PK), **`id_practica`** (FK), **`id_item_pm`** (FK), **`nivel_real_alcanzado`** (int, CHECK 1-4)

#### `DocumentoEntity` (tabla `documento_fase_practica`)

- **`id_documento`** (PK), **`codigo_formato`** (F01-F11), **`titulo`**, **`contenido`** (jsonb), **`id_practica`**, **`id_estudiante`**, **`id_usuario`**, **`estado`** (default 'borrador'), **`version`**, **`comentarios`**, **`created_at`**, **`updated_at`**

#### CV Entities

- **`CvDatoAcademicoEntity`** (cv_dato_academico): id_estudiante FK, anio, institucion, titulo_mencion, nota_final (numeric 5,2)
- **`CvExperienciaLaboralEntity`** (cv_experiencia_laboral): id_estudiante FK, anio, institucion, cargo, actividades
- **`CvPracticaDualEntity`** (cv_practica_dual): id_estudiante FK, anio_periodo, institucion, cargo, actividades_realizadas

#### `NotificacionEntity` (tabla `notificaciones`)

- **`id_notificacion`** (PK), **`id_usuario_destino`** (FK), **`id_usuario_origen`** (FK nullable), **`tipo`** (varchar 50), **`mensaje`** (text), **`id_practica`** (FK nullable), **`leida`** (boolean default false), **`created_at`**

### 3.3. Convención BigInt

- **`bigintTransformer`** (**`src/config/bigint-transformer.ts`**): **`to: value => value`** (pasa número), **`from: value => parseInt(value, 10)`** (convierte texto pg → número JS)
- Aplicado en todas las PK/FK con **`@PrimaryColumn({ type: 'bigint', transformer: bigintTransformer })`** + **`@Generated('increment')`**
- Configuración global en **`main.ts`** línea 10: **`pg.types.setTypeParser(20, (value) => parseInt(value, 10))`** — el tipo OID 20 es bigint en PostgreSQL

---

## 4. Controladores (16) y Endpoints

### 4.1. `PracticaController` (282 líneas)

- **Ruta base**: **`/api/fase-practica`**
- **Guards**: **`@UseGuards(JwtGuard, RolesGuard)`**
- **Roles clase**: **`@Roles('DOCENTE', 'ESTUDIANTE', 'TUTOR_EMPRESARIAL', 'COORDINADOR')`**
- **Inyección**: **`PracticaService`** (facade)

#### Prácticas y catálogos

| **MétodoRuta\@RolesDescripción** |                              |                 |                                                                                                                                                                                                                                     |
| -------------------------------- | ---------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST                             | **`/practicas`**             | clase (4 roles) | Crea práctica; **`id_docente`** tomado del JWT, ignora el DTO. Defaults: **`total_horas_requeridas=400`**, **`estado='EN_CURSO'`**                                                                                                  |
| GET                              | **`/practicas`**             | clase           | Lista con paginación (skip?, take?). Filtra por rol: COORDINADOR ve todas; DOCENTE solo las asignadas; TUTOR_EMPRESARIAL solo las de su empresa; ESTUDIANTE solo las suyas. Enriquece con join batch a matricula_detalle/estudiante |
| GET                              | **`/practicas/:id`**         | clase           | Obtiene por ID con **`verificarAccesoPractica`**                                                                                                                                                                                    |
| PATCH                            | **`/practicas/:id`**         | **COORDINADOR** | Actualiza; solo coordinador puede reasignar docente/tutor                                                                                                                                                                           |
| GET                              | **`/docentes`**              | **COORDINADOR** | Catálogo de docentes activos (id, nombres, apellidos, cedula)                                                                                                                                                                       |
| GET                              | **`/tutores-empresariales`** | **COORDINADOR** | Catálogo de tutores activos con empresa                                                                                                                                                                                             |
| DELETE                           | **`/practicas/:id`**         | clase           | Elimina; valida acceso primero                                                                                                                                                                                                      |

#### Registro Diario

| **MétodoRuta\@RolesDescripción** |                                     |                |                                                                                 |
| -------------------------------- | ----------------------------------- | -------------- | ------------------------------------------------------------------------------- |
| POST                             | **`/registro-diario`**              | **ESTUDIANTE** | Crea + recalcula **`total_horas_cumplidas`** via **`createWithRecalculoHoras`** |
| GET                              | **`/registro-diario/practica/:id`** | clase          | Lista registros por práctica (skip?, take?)                                     |
| PATCH                            | **`/registro-diario/:id`**          | **ESTUDIANTE** | Actualiza + recalcula via **`updateWithRecalculoHoras`**                        |
| DELETE                           | **`/registro-diario/:id`**          | **ESTUDIANTE** | Elimina + recalcula via **`removeWithRecalculoHoras`**                          |

#### Plan de Rotación

| **MétodoRuta\@RolesDescripción** |                                               |                                  |                                                                                                   |
| -------------------------------- | --------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------- |
| POST                             | **`/plan-rotacion`**                          | **ESTUDIANTE**                   | Crea; valida que **`id_item_pm`** existe, hereda **`puesto_aprendizaje`** del item si no se envía |
| GET                              | **`/plan-rotacion/practica/:id`**             | ESTUDIANTE, DOCENTE, COORDINADOR | Lista por práctica                                                                                |
| GET                              | **`/plan-rotacion/:id`**                      | ESTUDIANTE, DOCENTE, COORDINADOR | Obtiene por ID (internamente llama a **`findPlanRotacionByPractica`**)                            |
| PATCH                            | **`/plan-rotacion/:id`**                      | **ESTUDIANTE**                   | Actualiza                                                                                         |
| DELETE                           | **`/plan-rotacion/:id`**                      | **ESTUDIANTE**                   | Elimina                                                                                           |
| GET                              | **`/plan-rotacion/competencias/:idPractica`** | ESTUDIANTE, DOCENTE, COORDINADOR | Obtiene competencias (tabla 1:1 **`plan_rotacion_competencias`**)                                 |
| PATCH                            | **`/plan-rotacion/competencias/:idPractica`** | **ESTUDIANTE**                   | Upsert via **`INSERT ... ON CONFLICT`**                                                           |

#### Informe de Aprendizaje

| **MétodoRuta\@RolesDescripción** |                                         |                               |                    |
| -------------------------------- | --------------------------------------- | ----------------------------- | ------------------ |
| POST                             | **`/informe-aprendizaje`**              | ESTUDIANTE, TUTOR_EMPRESARIAL | Crea informe       |
| GET                              | **`/informe-aprendizaje/practica/:id`** | clase                         | Lista por práctica |
| PATCH                            | **`/informe-aprendizaje/:id`**          | ESTUDIANTE, TUTOR_EMPRESARIAL | Actualiza          |
| DELETE                           | **`/informe-aprendizaje/:id`**          | ESTUDIANTE, TUTOR_EMPRESARIAL | Elimina            |

#### Evaluación de Práctica

| **MétodoRuta\@RolesDescripción** |                                |                                         |                                                |
| -------------------------------- | ------------------------------ | --------------------------------------- | ---------------------------------------------- |
| POST                             | **`/evaluacion`**              | DOCENTE, COORDINADOR, TUTOR_EMPRESARIAL | Crea evaluación con **`tipo_evaluador`** libre |
| GET                              | **`/evaluacion/practica/:id`** | clase                                   | Lista                                          |
| PATCH                            | **`/evaluacion/:id`**          | DOCENTE, COORDINADOR, TUTOR_EMPRESARIAL | Actualiza                                      |
| DELETE                           | **`/evaluacion/:id`**          | DOCENTE, COORDINADOR, TUTOR_EMPRESARIAL | Elimina                                        |

#### Bitácora Semanal

| **MétodoRuta\@RolesDescripción** |                                     |                               |                   |
| -------------------------------- | ----------------------------------- | ----------------------------- | ----------------- |
| POST                             | **`/bitacora-semanal`**             | ESTUDIANTE, TUTOR_EMPRESARIAL | Crea              |
| GET                              | **`/bitacora-semanal/informe/:id`** | clase                         | Lista por informe |
| PATCH                            | **`/bitacora-semanal/:id`**         | ESTUDIANTE, TUTOR_EMPRESARIAL | Actualiza         |
| DELETE                           | **`/bitacora-semanal/:id`**         | ESTUDIANTE, TUTOR_EMPRESARIAL | Elimina           |

#### Rúbricas

| **MétodoRuta\@RolesDescripción** |                    |             |                  |
| -------------------------------- | ------------------ | ----------- | ---------------- |
| POST                             | **`/rubrica`**     | **DOCENTE** | Crea             |
| GET                              | **`/rubrica`**     | clase       | Lista (paginado) |
| PATCH                            | **`/rubrica/:id`** | **DOCENTE** | Actualiza        |
| DELETE                           | **`/rubrica/:id`** | **DOCENTE** | Elimina          |

### 4.2. `EmpresaController` (50 líneas)

- Ruta: **`/api/fase-practica/empresas`**
- CRUD completo (POST, GET, GET/\:id, PATCH/\:id, DELETE/\:id)
- El controlador y servicio capturan **`error.code === '23505'`** (unique violation en RUC) → **`ConflictException('El RUC ya está registrado')`**

### 4.3. `DocumentoController` (169 líneas)

- Ruta base: **`/api/fase-practica/documentos`**
- Método helper: **`parseIdPractica()`** valida y parsea ID (entero positivo)
- 9 formatos: F01 (Carta Compromiso), F02 (Currículum), F05 (Registro Asistencia), F06 (Informe Aprendizaje), F07 (Evaluación Empresarial), F08 (Evaluación Instituto), F10 (Acta Inducción Seguridad), F11 (Acta Entorno Laboral)
- GET generadores: **`/datos`**, **`/carta-compromiso`**, **`/curriculum`**, **`/registro-asistencia`**, **`/informe-aprendizaje`**, **`/evaluacion-empresarial`**, **`/evaluacion-instituto`**, **`/acta-induccion-seguridad`**, **`/acta-entorno-laboral`**, **`/todos`**, **`/buscar`**, **`/:id`**
- PATCH estado: **`/:id/estado`** — **`@Roles('DOCENTE', 'ESTUDIANTE', 'COORDINADOR', 'TUTOR_EMPRESARIAL')`**
- POST guardado: **`/carta-compromiso`**, **`/curriculum`**, **`/registro-asistencia`**, **`/informe-aprendizaje`**, **`/evaluacion-empresarial`**, **`/evaluacion-instituto`**, **`/acta-induccion-seguridad`**, **`/acta-entorno-laboral`**

**Matriz de permisos POST por formato:**

| **FormatoDOCENTEESTUDIANTETUTOR_EMPRESARIALCOORDINADOR** |     |     |     |     |
| -------------------------------------------------------- | --- | --- | --- | --- |
| F01 Carta Compromiso                                     | ✅  | ✅  | ❌  | ✅  |
| F02 Curriculum                                           | ✅  | ✅  | ❌  | ✅  |
| F05 Registro Asistencia                                  | ✅  | ✅  | ❌  | ✅  |
| F06 Informe Aprendizaje                                  | ✅  | ✅  | ❌  | ✅  |
| F07 Evaluación Empresarial                               | ✅  | ❌  | ✅  | ✅  |
| F08 Evaluación Instituto                                 | ✅  | ❌  | ✅  | ✅  |
| F10 Acta Inducción                                       | ✅  | ✅  | ❌  | ✅  |
| F11 Acta Entorno Laboral                                 | ✅  | ✅  | ❌  | ✅  |

### 4.4. `InformeFasePracticaController` (17 líneas)

- GET **`/api/fase-practica/informes/:idPractica`** — Reporte consolidado vía SQL nativo (**`jsonb_build_object`**)
- Inyecta **`InformeFasePracticaService`** → **`InformeFasePracticaPg`** (usa **`DataSource.query`**)
- NO tiene guards de roles (posible issue de seguridad)

### 4.5–4.16. Otros controladores

**`CvController`** (117 líneas): CRUD de CV (datos académicos, experiencia laboral, prácticas duales). ESTUDIANTE ve/edita solo su CV. Usa **`resolverIdEstudianteLectura()`** y **`resolverIdEstudiantePropio()`**.

**`DetalleEvaluacionController`** (51 líneas): CRUD de items de evaluación. TUTOR_EMPRESARIAL solo puede calificar F07.

**`EvaluacionEmpresaController`** (51 líneas): CRUD + **`/calcular`**. Crea evaluaciones tipo 'EMPRESA'.

**`EvaluacionInstitutoController`** (54 líneas): CRUD + **`/calcular`**. Solo DOCENTE crea/edita/elimina/calcular. COORDINADOR solo consulta.

**`RubricaController`** (43 líneas): CRUD. Crea/edita/elimina DOCENTE/COORDINADOR.

**`ItemRubricaController`** (43 líneas): CRUD de items de rúbrica.

**`PlanMarcoController`** (51 líneas): CRUD + **`/sincronizar-rotacion`**. Solo ESTUDIANTE gestiona.

**`ItemPlanMarcoController`** (48 líneas): CRUD de resultados de aprendizaje.

**`PlanRotacionSemanaController`** (50 líneas): CRUD + **`guardarMatriz`** (bulk replace en transacción, máximo 8 semanas).

**`EvaluacionPlanMarcoController`** (45 líneas): CRUD de "nivel real alcanzado". Upsert por item_pm.

**`NotificacionController`** (30 líneas): GET lista, GET count no leídas, POST marcar leída. Usa **`req.user.sub`**.

**`PerfilEstudianteController`** (138 líneas): GET **`/perfil`**, GET **`/mi-practica`**, PATCH **`/perfil`** (actualiza estudiante + campos override + regenera documentos).

---

## 5. Sistema de Autorización y Seguridad (RBAC)

### 5.1. Roles

| **RolDescripciónÁmbito** |                            |                                    |
| ------------------------ | -------------------------- | ---------------------------------- |
| **`DOCENTE`**            | Docente académico asignado | Solo sus prácticas asignadas       |
| **`ESTUDIANTE`**         | Estudiante en práctica     | Solo su práctica                   |
| **`TUTOR_EMPRESARIAL`**  | Tutor de la empresa        | Prácticas de su empresa            |
| **`COORDINADOR`**        | Coordinador general        | Todas las prácticas (acceso total) |

### 5.2. Mecanismo de Verificación

Cada servicio implementa métodos **`private async verificarAcceso*()`** que ejecutan queries SQL nativas. Patrón recurrente en 5 servicios:

```
const roles = usuario?.roles ?? [];
if (roles.includes('COORDINADOR')) return;  // 1. Coordinador: acceso total

// 2. DOCENTE / TUTOR_EMPRESARIAL
const practica = await dataSource.query(
  `SELECT id_docente, id_empresa FROM practica_estudiante WHERE id_practica = $1 LIMIT 1`,
  [idPractica],
);
if (roles.includes('DOCENTE') && practica[0].id_docente === usuario.idDocente) return;
if (roles.includes('TUTOR_EMPRESARIAL') && practica[0].id_empresa === usuario.idEmpresa) return;
throw new ForbiddenException('...');

// 3. ESTUDIANTE
const esDueno = await dataSource.query(
  `SELECT 1 FROM matricula_detalle md
   JOIN matricula m ON m.id_matricula = md.id_matricula
   JOIN practica_estudiante pe ON pe.id_matricula_detalle = md.id_matricula_detalle
   WHERE pe.id_practica = $1 AND m.id_estudiante = $2`,
  [idPractica, usuario.idEstudiante],
);
if (!esDueno || esDueno.length === 0) throw new ForbiddenException('...');
```

### 5.3. Verificaciones Especiales

- **TUTOR_EMPRESARIAL solo F07**: **`DetalleEvaluacionService.verificarPermisoTutor()`** valida que **`tipo_evaluador === 'EMPRESA'`**
- **COORDINADOR solo consulta F08**: **`verificarPermisoCoordinador()`**
- **ESTUDIANTE dueño de práctica**: múltiples servicios validan propiedad antes de crear/editar
- **`DocumentoPlantillaService.obtenerIdPractica()`**: 4 ramas de resolución con validación de propiedad

### 5.4. JWT Claims

**`req.user`**: **`sub`** (id_usuario), **`idDocente`**, **`idEmpresa`**, **`idEstudiante`**, **`roles`** (array de strings)

---

## 6. Sistema de Documentos (F01–F11)

### 6.1. Arquitectura

- **`DocumentoService`** (357 líneas): orquesta guardado, acceso, estado y notificaciones
- **`DocumentoPlantillaService`** (1,349 líneas — archivo más grande del módulo): inyecta 11 repositorios TypeORM, 15+ queries SQL nativas

### 6.2. Tipos TypeScript (documentos.types.ts — 315 líneas)

15 interfaces: **`DatosEstudiante`**, **`DatosCarrera`**, **`DatosProyectoEmpresarial`**, **`DatosEmpresaBeneficiaria`**, **`PeriodoAcademico`**, **`CronogramaFecha`**, **`DatosMaestra`**, **`CartaCompromiso`**, **`Curriculum`**, **`RegistroAsistenciaDia`**, **`RegistroAsistencia`**, **`InformeAprendizajeEncabezado`**, **`InformeSemana`**, **`InformeAprendizaje`**, **`CriterioEmpresarial`**, **`DefensaProyectoItem`**, **`EvaluacionEmpresarial`**, **`CriterioInstituto`**, **`EvaluacionInstituto`**, **`ActaInduccionSeguridad`**, **`EstudianteActaEntorno`**, **`FirmasActaEntorno`**, **`ActaEntornoLaboral`**

### 6.3. State Machine

```
borrador → pendiente_revision → aprobado
                        ↘ rechazado → pendiente_revision
```

- ESTUDIANTE/TUTOR_EMPRESARIAL: solo pueden mover a **`pendiente_revision`**
- DOCENTE/COORDINADOR: pueden aprobar o rechazar

### 6.4. Notificaciones Automáticas

**`DocumentoService.notificarCambioEstado()`**:

- **pendiente_revision**: notifica al DOCENTE/TUTOR
- **aprobado/rechazado**: notifica al ESTUDIANTE; para F07/F08 también al TUTOR_EMPRESARIAL
- 3 métodos: **`notificarDocenteOTutor()`**, **`notificarEstudiante()`**, **`notificarTutorEmpresarial()`**

---

## 7. Sistema de Evaluaciones

### 7.1. `EvaluacionCalculoService` (165 líneas)

Servicio especializado. Inyecta directamente **`@InjectRepository`** de 3 entidades (EvaluacionPractica, DetalleEvaluacion, ItemRubrica).

**F07 — Evaluación Empresarial:**

- 10 criterios de desempeño (0-10, ponderación 0.10 c/u) → **`promedioDesempeno × 7/10`**
- 5 criterios de defensa (1-4, SIN ponderación) → **`suma × 1/2`** → **`notaFinalDefensa × 3/10`**
- **`notaFinalEmpresa = notaPonderadaDesempeno(70%) + notaPonderadaDefensa(30%)`**

**F08 — Evaluación Instituto:**

- 7 criterios de proyecto (0-10) → **`promedioProyecto × 7/10`**
- 5 criterios de defensa (1-4, suma × 1/2) × 3/10
- **`notaFinalInstituto = notaPonderadaDefensa + notaPonderadaProyecto`**

**Clasificación de ítems** (basada en keywords en **`descripcion_criterio`**):

- Defensa: "defensa", "presentación", "dominio", "claridad", "satisfacción"
- Resto: considerados de proyecto/desempeño

**Corrección QA crítica:** La defensa usa SUMA (no promedio) de 5 criterios (máximo 20) dividido entre 2 → máximo 10/10. Con promedio, la nota máxima sería 4/10.

### 7.2. `DetalleEvaluacionService` (145 líneas)

- Valida que **`puntaje_asignado <= puntaje_maximo`** del ítem (query a **`item_rubrica`**)
- TUTOR_EMPRESARIAL solo puede calificar F07
- COORDINADOR solo consultar F08

---

## 8. Transacciones y Consistencia

### 8.1. Horas acumuladas (`RegistroDiarioPg` — líneas 42-64)

Tres métodos transaccionales:

- **`createWithRecalculoHoras()`**: crea registro → recalcula **`total_horas_cumplidas`**
- **`updateWithRecalculoHoras()`**: actualiza registro → recalcula
- **`removeWithRecalculoHoras()`**: elimina registro → recalcula

**`recalcularHorasCumplidas()`**: suma minutos de todos los registros (hora_ingreso → hora_salida, restando almuerzo), divide por 60 y redondea. Usa **`manager.update('practica_estudiante', ...)`**.

### 8.2. Documentos

**`DocumentoService.actualizarDocumentosPorPractica()`**: transacción que regenera 8 documentos (F01-F11) en una sola transacción. Si falla, se revierte todo.

### 8.3. Matriz de semanas

**`PlanRotacionSemanaService.guardarMatrizSemanas()`**: transacción que borra todas las semanas y recrea desde array recibido. Máximo 8 semanas.

---

## 9. Migraciones (11 archivos)

| **#ArchivoPropósito** |                     |                                                                              |
| --------------------- | ------------------- | ---------------------------------------------------------------------------- |
| 1                     | **`1784092341224`** | Crea 11 tablas base + sequences + PKs + FKs                                  |
| 2                     | **`1784092361098`** | Crea **`documento_fase_practica`** (jsonb)                                   |
| 3                     | **`1784218089962`** | Datos de prueba                                                              |
| 4                     | **`1785275600000`** | CASCADE en 9 FKs                                                             |
| 5                     | **`1785300000000`** | Siembra 2 rúbricas + 20 ítems                                                |
| 6                     | **`1784966000000`** | 9 columnas extras en **`evaluacion_practica`**                               |
| 7                     | **`1784968000000`** | FK **`plan_marco_formacion → practica_estudiante`**; **`id_nivel`** nullable |
| 8                     | **`1784969000000`** | 7 campos en **`practica_estudiante`** (fechas, nombre_proyecto, etc.)        |
| 9                     | **`1789100000000`** | 8 campos override (nombres denormalizados)                                   |
| 10                    | **`1789200000000`** | **`hornada`**, **`paralelo`**                                                |
| 11                    | **`1788000000000`** | 7 campos en **`documento_fase_practica`** + índice                           |

---

## 10. Paginación

Todos los endpoints GET de listado aceptan **`skip`** (string → number) y **`take`** (string → number) como query params. Si no se envían, el adaptador usa **`take ?? 200`** o devuelve todo. Retrocompatible.

---

## 11. Validaciones DTO

### Empresas (`CreateEmpresaDto`)

- **`ruc`**: string, obligatorio, max 20
- **`razon_social`**: string, obligatorio, max 200
- **`direccion`**: string, opcional, max 300
- **`estado`**: string, opcional, max 20

### Prácticas (`CreatePracticaDto`)

- **`id_periodo`**, **`id_matricula_detalle`**, **`id_empresa`**, **`id_tutor_empresarial`**, **`id_docente`**: number, min 1, obligatorios
- **`total_horas_requeridas`**: number, min 0, opcional (default 400)
- **`total_horas_cumplidas`**: number, min 0, opcional (default 0)
- **`estado`**: string, opcional

### Registro Diario (`CreateRegistroDiarioDto`)

- **`id_practica`**: number, min 1, obligatorio
- **`fecha`**: date (IsDateString), obligatorio
- **`hora_*`**: string, opcionales (time format)
- **`observaciones`**: string, opcional
- **`firma_estudiante`**: boolean, opcional

### Evaluación (`CreateEvaluacionPracticaDto`)

- **`id_practica`**, **`id_rubrica`**: number, min 1, obligatorios
- **`tipo_evaluador`**: string, max 50, obligatorio
- **`nota_final_calculada`**: number, min 0, max 10, opcional
- **`fecha_evaluacion`**: date, opcional

### Estado Documento (`ActualizarEstadoDocumentoDto`)

- Enum **`EstadoDocumento`**: BORRADOR, PENDIENTE_REVISION, APROBADO, RECHAZADO
- **`comentarios`**: string, max 1000, opcional

---

## 12. Configuración de la Aplicación

### `main.ts` (30 líneas)

- Global prefix: **`api`**
- **`ValidationPipe`**: **`whitelist: true`**, **`transform: true`**, **`forbidNonWhitelisted: false`**
- CORS configurable via **`CORS_ORIGIN`** (default [**`http://localhost:4200`**](http://localhost:4200/))
- Parser bigint global (línea 10)
- Puerto: **`PORT`** (default 3000)

### `data-source.ts` (54 líneas)

- PostgreSQL, **`synchronize: false`**, **`migrationsRun: false`**
- Auto-discovery entidades y migraciones vía glob
- Valida env vars: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME

### Dependencias Principales (`package.json`)

- **`@nestjs/typeorm ^11.0.3`**, **`typeorm ^0.3.21`**, **`pg ^8.22.0`**
- **`@nestjs/jwt ^11.0.0`**, **`passport-jwt ^4.0.0`**, \`bcryptjs ^2.4
- `class-validator ^0.15.1`, `class-transformer ^0.5.1`

---

## 13. Funcionamiento (Flujos Operativos)

### 13.1. Flujo de una petición HTTP (request lifecycle)

1. **Entrada**: La petición llega a `main.ts`, donde `NestFactory.create(AppModule)` inicializa la aplicación. El `ValidationPipe` global con `whitelist: true` y `transform: true` procesa automáticamente todos los DTOs de entrada (valida y transforma tipos).

2. **Rutas globales**: `app.setGlobalPrefix('api')` asegura que todas las rutas comiencen con `/api/`.

3. **Guards**: `JwtGuard` extrae y verifica el token JWT (via `passport-jwt`). `RolesGuard` valida el `@Roles()` del endpoint contra `req.user.roles`.

4. **Controller**: Recibe la petición, inyecta el servicio correspondiente, pasa `req.user` (JWT claims) y el DTO validado.

5. **Service (Lógica de negocio)**:
   - Ejecuta verificaciones de acceso (`verificarAcceso*()`)
   - Orquesta múltiples operaciones si es un servicio facade
   - Inyecta puertos (`@Inject(TOKEN)`) para operaciones de persistencia
   - Usa `DataSource` para queries SQL nativas cuando TypeORM no alcanza

6. **Port (Interface)**: Define el contrato. Servicio no conoce la implementación.

7. **Adapter (TypeORM)**: Implementa el puerto usando `@InjectRepository` y `Repository.save/create/findOne/find/remove`. Convierte entre BigQuery y número JS.

8. **Base de datos**: PostgreSQL ejecuta la operación. Las migraciones garantizan el esquema.

9. **Respuesta**: El servicio devuelve la entidad, el controlador la serializa a JSON. TypeORM ejecuta el `bigintTransformer` en lectura.

### 13.2. Flujo: Creación de una práctica

```
POST /api/fase-practica/practicas
```

1. `PracticaController.createPractica()` recibe `req.user` y `CreatePracticaDto`
2. `id_docente` se sobrescribe con `usuario.idDocente` del JWT (ignora el valor del cliente)
3. Defaults: `total_horas_requeridas=400`, `total_horas_cumplidas=0`, `estado='EN_CURSO'`
4. `PracticaService.createPractica()` delega a `IPracticaRepository.createPractica()`
5. `PracticaPg` (adaptador) inyecta `PracticaEntity` → `repository.create(dto)` + `repository.save()`
6. Retorna `PracticaEntity` con `id_practica` generado
7. La FK `id_matricula_detalle` (UNIQUE) previene duplicados

### 13.3. Flujo: Registro diario con cálculo de horas

```
POST /api/fase-practica/registro-diario
```

1. `PracticaController.createRegistroDiario()` verifica acceso (solo ESTUDIANTE)
2. `PracticaService.createRegistroDiario()` valida que el estudiante sea dueño de la práctica
3. Delega a `IRegistroDiarioRepository.createWithRecalculoHoras()`
4. `RegistroDiarioPg`:
   a. Crea el registro (`repository.create` + `

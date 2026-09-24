# Módulo Fase Práctica — Frontend

Documentación del módulo **Fase Práctica** en el frontend (Angular) del Sistema Académico Yavirac.

Ruta base en el código: `sistema-academico-frontend/src/app/modules/fase-practica/`

---

## 1. Descripción general

"Fase Práctica" digitaliza el proceso de **prácticas preprofesionales / formación dual** del instituto: un estudiante realiza una pasantía en una empresa formadora, trabajando en un proyecto específico, bajo la supervisión conjunta de un tutor académico (docente) y un tutor empresarial, con un coordinador supervisando el proceso completo.

Cada documento del módulo corresponde a un **formato institucional en papel** (Formato 01 a Formato 11), con encabezado, código y título oficiales. La mayoría de los documentos reutiliza la misma fuente de datos base (estudiante, carrera, proyecto empresarial, empresa, período académico) para autocompletar su encabezado.

## 2. Roles

| Rol | Descripción |
|---|---|
| **ESTUDIANTE** | El pasante. Llena la mayoría de los documentos sobre sí mismo y su práctica. |
| **DOCENTE** | Tutor académico asignado a la práctica. Revisa/aprueba documentos y califica el Formato de Evaluación del Instituto. |
| **TUTOR_EMPRESARIAL** | Supervisor dentro de la empresa. Llena la evaluación de desempeño empresarial y observaciones puntuales. |
| **COORDINADOR** | Supervisa el proceso a nivel de carrera/período. Acceso de solo lectura sobre los documentos de este módulo. |

## 3. Estructura de carpetas

```
fase-practica/
├── pages/                  # una carpeta por pantalla (.ts, .html, .scss)
│   ├── datos-maestra/
│   ├── carta-compromiso/
│   ├── registro-asistencia/
│   ├── curriculum/
│   ├── informe-aprendizaje/
│   ├── evaluacion-empresarial/
│   ├── evaluacion-instituto/
│   ├── acta-induccion-seguridad/
│   ├── acta-entorno-laboral/
│   ├── plan-marco/
│   ├── plan-rotacion/
│   └── plan-formacion-lista/    # selector de práctica
├── services/
│   ├── documentos.ts             # cliente central: datos maestros + get/save por documento + estado (borrador/revisión/aprobado)
│   ├── cv.ts                     # CRUD real de datos académicos/experiencia/prácticas duales (Currículo)
│   ├── evaluacion.ts             # CRUD de evaluaciones y detalle-evaluación (F07/F08)
│   ├── plan-formacion.ts         # Plan Marco, Plan de Rotación, listado de prácticas
│   ├── rubricas-fase-practica.ts # criterios fijos de las rúbricas de evaluación
│   ├── informe-aprendizaje-real.ts
│   └── notificaciones.service.ts
├── interfaces/                   # tipos TS por documento
├── components/
│   ├── document-header/          # encabezado institucional reutilizable
│   └── student-presentation/     # bloque de presentación del estudiante (Carta Compromiso)
└── utils/
    └── exportar-word.ts          # exporta el documento visible en pantalla a un .docx real
```

> Nota: la carpeta también contiene `pages/asignaciones` y `services/asignaciones.ts`, pero esa pantalla (asignar docente/tutor empresarial por práctica) **no pertenece funcionalmente a este módulo** — quedó ahí por organización de código, pero su responsable es otro equipo. No se documenta aquí.

## 4. Navegación y control de acceso

Cada documento existe en dos rutas:

- `fase-practica/<documento>` — la usa **ESTUDIANTE**. El backend resuelve automáticamente cuál es la práctica del estudiante logueado (vía JWT/matrícula), así que entra directo a su propio documento. Ruta protegida por rol.
- `fase-practica/<documento>/:idPractica` — la usan **DOCENTE / COORDINADOR / TUTOR_EMPRESARIAL**. Como necesitan indicar de qué estudiante quieren ver el documento, primero pasan por el **selector de práctica**.

**Selector de práctica** (`plan-formacion-lista`, ruta `fase-practica/plan-formacion?modo=<documento>`): lista de tarjetas de prácticas con buscador (nombre/cédula/empresa) y filtros (semestre, paralelo, jornada), calculados dinámicamente sobre los datos cargados. Al hacer clic en una tarjeta navega al documento elegido (`modo`) para esa práctica.

En el menú lateral, "Plan de Rotación" no se muestra para TUTOR_EMPRESARIAL (ese rol no participa en ese documento; la ruta también está bloqueada a nivel de guard).

## 5. Pantallas del módulo

### 5.1 Mis Datos (`datos-maestra`)
Ficha de perfil del estudiante. Dos secciones: **Datos Personales** (nombres, apellidos, cédula, teléfono, correo, estado civil, tipo de sangre, domicilio, contacto de emergencia) e **Información Académica y Práctica** (carrera, nivel, período, núcleo estructurante, tutor académico, coordinador, hornada, paralelo, empresa formadora, tutor empresarial, proyecto empresarial, cobertura/localización, plazo de ejecución, fechas de inicio/fin).

- Solo **ESTUDIANTE** tiene acceso.
- Los campos que asigna coordinación (carrera, período, tutor académico, coordinador, empresa, tutor empresarial) quedan bloqueados incluso para el estudiante.
- Guardado directo, sin flujo de revisión.

### 5.2 Carta Compromiso — Formato 01 (`carta-compromiso`)
"Carta de Presentación y Acta Compromiso Estudiantes". Texto legal generado automáticamente a partir de los datos del estudiante: presentación, prohibiciones y compromisos de confidencialidad durante la práctica.

- **100% de solo lectura para todos los roles** — no tiene campos editables ni botón de guardar.
- Sin flujo de revisión. Acciones disponibles: "Volver", "Descargar Word".

### 5.3 Registro de Asistencia — Formato 05 (`registro-asistencia`)
"Acta de Asistencia". Registro diario de horas: Fecha, Hora Ingreso, Almuerzo, Hora Salida, Horas al día, Firma estudiante, Observaciones; fila de "Horas Autónomas" y total de horas de la fase práctica.

- **ESTUDIANTE** agrega/edita/elimina filas y guarda.
- DOCENTE/COORDINADOR/TUTOR_EMPRESARIAL: solo lectura; DOCENTE además aprueba/rechaza.
- Flujo de revisión completo (ver sección 6).

### 5.4 Currículo — Formato 02 (`curriculum`)
"Currículo Estandarizado". CV armado para la práctica: Datos Personales, Datos Académicos, Experiencia Laboral, Prácticas Duales previas e Información Adicional (logros, idiomas, habilidades) — las 4 últimas secciones con filas repetibles persistidas en tablas reales (vía `services/cv.ts`), no solo en el snapshot del documento.

- **ESTUDIANTE** edita todo, agrega/quita filas en las 4 tablas.
- DOCENTE/COORDINADOR/TUTOR_EMPRESARIAL: solo lectura; DOCENTE aprueba/rechaza.
- Flujo de revisión completo.

### 5.5 Informe de Aprendizaje / Bitácora — Formato 06 (`informe-aprendizaje`)
"Bitácora de Aprendizaje de Fase Práctica". Diario semanal: fecha inicio/fin, puesto de aprendizaje, actividades realizadas, actividades autónomas; más "Reflexión sobre el aprendizaje alcanzado" y "Observaciones de la empresa formadora sobre el desempeño".

- **ESTUDIANTE** agrega/quita semanas y escribe su reflexión.
- **TUTOR_EMPRESARIAL** solo puede editar el campo de observaciones de la empresa.
- DOCENTE/COORDINADOR: solo lectura; DOCENTE aprueba/rechaza.
- Flujo de revisión completo.

### 5.6 Evaluación Empresarial — Formato 07 (`evaluacion-empresarial`)
"Informe de Evaluación por parte de la Entidad Formadora". Tabla "Evaluación de Desempeño" (notas 0–10 por criterio, ponderadas sobre 7 puntos) y tabla "Defensa Proyecto Tutor Empresarial" (rúbrica de 4 niveles, ponderada sobre 3 puntos). Calcula automáticamente la Nota Final Empresa.

- **Solo TUTOR_EMPRESARIAL** califica. ESTUDIANTE/COORDINADOR/DOCENTE: solo lectura (DOCENTE aprueba).
- El tutor empresarial envía a revisión; DOCENTE aprueba/rechaza.
- Campos de nota con validación en tiempo real (bloqueo de teclas inválidas, recorte a 0–10 al escribir o pegar).

### 5.7 Evaluación Instituto — Formato 08 (`evaluacion-instituto`)
"Informe de Evaluación por parte del Instituto". Rúbrica "Defensa Proyecto Tutor Académico" (4 niveles), tabla "Parámetros Proyecto Empresarial" (notas 0–10, con campo de "Tema"), y resumen consolidado: Evaluación Empresa (del F07 ya guardado) + Evaluación Instituto = Promedio Final de Fase Práctica.

- **Solo DOCENTE** califica. TUTOR_EMPRESARIAL/COORDINADOR/ESTUDIANTE: solo lectura.
- Misma validación en tiempo real de notas que F07.

### 5.8 Acta Inducción Seguridad — Formato 10 (`acta-induccion-seguridad`)
"Acta de Inducción de Seguridad y Medios de Protección". Texto legal fijo (7 puntos) donde el estudiante reconoce haber recibido inducción de seguridad y acepta los riesgos laborales de la empresa.

- **100% de solo lectura para todos los roles**, sin flujo de revisión. Acciones: "Volver", "Descargar Word".

### 5.9 Acta Entorno Laboral — Formato 11 (`acta-entorno-laboral`)
"Acta de Formación Práctica en el Entorno Laboral Real". A diferencia de los demás documentos, puede incluir a **varios estudiantes** (los que comparten empresa/tutor empresarial/docente). Incluye anexos, tabla "Listado de Estudiantes" y 3 firmas (Tutor Empresarial, Coordinador, Tutor Académico).

- **DOCENTE y COORDINADOR** arman el documento: buscan candidatos y los agregan/quitan de la lista.
- ESTUDIANTE y TUTOR_EMPRESARIAL: solo consultan.
- Flujo de revisión completo.

### 5.10 Plan Marco de Formación — Formato 03 (`plan-marco`)
Define cada resultado de aprendizaje que el estudiante debe alcanzar, con nivel esperado (1–4, seleccionable por clic) y nivel real alcanzado (numérico, editable), tareas laborales, puesto de aprendizaje, número de semanas (1–20) y responsable. Incluye referencia de los 4 niveles de competencia.

- **Solo ESTUDIANTE** edita; los demás roles solo consultan.
- Sin flujo de revisión — guardado directo (es un plan vivo, no un documento que se aprueba).

### 5.11 Plan de Rotación — Formato 04 (`plan-rotacion`)
Cronograma semana a semana que distribuye cada resultado de aprendizaje del Plan Marco, más bloque de "Competencias Necesarias" (teóricas, procedimentales, actitudinales). Requiere un Plan Marco previo con al menos un resultado de aprendizaje.

- **TUTOR_EMPRESARIAL no tiene acceso** a este documento.
- **Solo ESTUDIANTE** edita (marca semanas por resultado, mínimo 8, ampliable). DOCENTE/COORDINADOR: solo lectura.
- Sin flujo de revisión.

### 5.12 Selector de práctica (`plan-formacion-lista`)
Pantalla de navegación (no es un documento) — ver sección 4.

## 6. Patrones comunes

**Flujo de estado de documento** (borrador → pendiente_revision → aprobado / rechazado): aplica a Registro de Asistencia, Currículo, Informe de Aprendizaje, Evaluación Empresarial, Evaluación Instituto y Acta Entorno Laboral. Se gestiona con 3 llamadas genéricas del servicio `documentos.ts`:
- `obtenerIdDocumento(idPractica, codigoFormato)` — resuelve el id del documento guardado.
- `obtenerDocumentoPorId(idDocumento)` — trae estado y comentarios actuales.
- `actualizarEstadoDocumento(idDocumento, estado, comentarios?)` — cambia el estado (usado por "Enviar a revisión", "Aprobar", "Solicitar correcciones").

La barra de herramientas muestra una etiqueta de color con el estado actual, y una solicitud de corrección exige un comentario obligatorio que se le muestra después al autor.

**Sin flujo de revisión**: Mis Datos, Carta Compromiso, Acta Inducción Seguridad, Plan Marco, Plan de Rotación (guardado directo).

**Exportar a Word** (`utils/exportar-word.ts`): convierte el documento visible en pantalla (por id de elemento) a un `.docx` real usando `html-docx-js-typescript`, reconstruyendo layouts flex como tablas (Word no soporta flexbox), fijando tamaños de imagen y encabezado, e inlineando imágenes en base64. Disponible en todos los documentos formales.

**Validación de notas**: los campos numéricos de calificación (0–10) bloquean teclas inválidas, sanean texto pegado y recortan el valor en tiempo real para evitar datos fuera de rango.

## 7. Quién llena qué (resumen)

- **ESTUDIANTE**: Mis Datos, Registro de Asistencia, Currículo, Informe de Aprendizaje (bitácora + reflexión), Plan Marco, Plan de Rotación.
- **TUTOR_EMPRESARIAL**: Evaluación Empresarial (notas), y solo el campo de observaciones en Informe de Aprendizaje.
- **DOCENTE**: Evaluación Instituto (notas); aprueba/rechaza todos los documentos con flujo de revisión.
- **DOCENTE + COORDINADOR**: Acta Entorno Laboral (lista de estudiantes).
- **Nadie llena, todos consultan**: Carta Compromiso, Acta Inducción Seguridad (textos legales generados).

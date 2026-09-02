# Documentación del Módulo Frontend - Sistema de Vinculación con la Sociedad

## 1. Descripción General del Módulo

El **módulo de Vinculación con la Sociedad** es un subsistema dentro del Sistema Académico del Instituto Superior Tecnológico de Turismo y Patrimonio "Yavirac" (ISTY). Este módulo permite gestionar todo el proceso de vinculación de los estudiantes con entidades beneficiarias, incluyendo la generación, visualización, edición y exportación de **ocho documentos oficiales** requeridos por la institución.

### 1.1 Propósito

- Facilitar a estudiantes, docentes, tutores empresariales y coordinadores el acceso a los documentos de vinculación.
- Permitir la edición controlada de datos según el rol del usuario.
- Exportar los documentos a formatos oficiales (Excel) con el logo y formato institucional.

### 1.2 Usuarios y Roles

| **RolPermisos Principales** |                                                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **ESTUDIANTE**              | Ver documentos, registrar actividades, editar objetivos, reflexiones y observaciones                               |
| **DOCENTE**                 | Ver todos los documentos de sus estudiantes asignados, editar evaluación final, observaciones y datos del proyecto |
| **TUTOR\_EMPRESARIAL**      | Ver documentos, editar observaciones del registro de asistencia del tutor                                          |
| **COORDINADOR**             | Ver documentos en modo lectura (sin edición)                                                                       |

---

## 2. Arquitectura del Frontend

### 2.1 Tecnologías Utilizadas

- **Angular 22** (framework principal)
- **TypeScript 6.0** (lenguaje de programación)
- **Bootstrap 5** (estilos base y componentes UI)
- **SCSS** (preprocesador de CSS con variables y mixins)
- **RxJS** (manejo de flujos asíncronos)
- **xlsx-js-style** (generación de archivos Excel con estilos)
- **JSZip** (manipulación de archivos ZIP para incrustar imágenes)
- **file-saver** (descarga de archivos generados)
- **SweetAlert2** (alertas personalizadas, aunque se reemplazó por un componente modal propio)

### 2.2 Estructura de Carpetas (Módulo Vinculación)

text

```
src/app/modules/vinculacion/
├── components/
│   └── volver-archivos/          → Botón reutilizable para volver a la lista de documentos
├── models/                       → Definición de tipos de datos
│   ├── carta-compromiso.model.ts
│   ├── certificado.model.ts
│   ├── control-asistencia.model.ts
│   ├── informe-final.model.ts
│   ├── inicio-actividades.model.ts
│   ├── plan-aprendizaje.model.ts
│   ├── registro-asistencia-tutor.model.ts
│   └── vinculacion.model.ts
├── pages/
│   ├── compartidas/              → Componentes usados por múltiples roles
│   │   ├── carta-compromiso/
│   │   ├── certificado/
│   │   ├── control-asistencia/
│   │   ├── informe-final/
│   │   ├── inicio-actividades/
│   │   ├── plan-aprendizaje/
│   │   └── registro-asistencia-tutor/
│   └── docente/
│       └── seleccionar-estudiante/ → Selector de estudiantes para docentes
└── services/                     → Comunicación con backend + lógica de negocio
    ├── carta-compromiso.service.ts
    ├── certificado.service.ts
    ├── control-asistencia.service.ts
    ├── excel-export.service.ts   → ⭐ Servicio principal de exportación
    ├── informe-final.service.ts
    ├── inicio-actividades.service.ts
    ├── plan-aprendizaje.service.ts
    ├── registro-asistencia-tutor.service.ts
    └── vinculacion.service.ts
```

svgsvg

### 2.3 Estructura de Rutas (app.routes.ts)

El módulo se integra dentro de la ruta `/vinculacion` del sistema principal:

text

```
/vinculacion
├── /estudiante → (rol: ESTUDIANTE)
│   ├── /inicio-actividades → Componente: InicioActividades
│   ├── /carta-compromiso → Componente: CartaCompromiso
│   ├── /control-asistencia → Componente: ControlAsistencia
│   ├── /registro-asistencia-tutor → Componente: RegistroAsistenciaTutor
│   ├── /plan-aprendizaje → Componente: PlanAprendizaje
│   ├── /certificado → Componente: Certificado
│   └── /informe-final → Componente: InformeFinal
└── /docente → (rol: DOCENTE)
    ├── /seleccionar → Selector de estudiantes
    └── /estudiante/:id/
        ├── /inicio-actividades
        ├── /control-asistencia
        ├── /registro-asistencia-tutor
        └── /informe-final
```

svgsvg

---

## 3. Documentos del Módulo

### 3.1 Inicio de Actividades (Formato 05 - Código: DS-040105)

**Propósito**: Documento oficial donde el docente tutor informa el inicio de las actividades del proyecto de vinculación.

#### Datos que muestra:

- Coordinador de carrera
- Tutor del proyecto (nombre y cédula)
- Nombre del proyecto
- Fecha de inicio
- Descripción de actividades
- Carrera, entidad beneficiaria, tutor de la entidad

#### Funcionalidades:

- **Estudiante**: Solo visualización.
- **Docente**: Puede **editar una sola vez** el nombre del proyecto, fecha de inicio y fecha de finalización. Después de guardar, el campo `editado` cambia a `true` y ya no se permiten más modificaciones.

#### Flujo de edición:

1. El docente ve el botón "✏️ Editar Proyecto" solo si `!data.editado`.
2. Hace clic y se muestran los campos editables.
3. Se validan: campos obligatorios y fecha fin > fecha inicio.
4. Se envía PATCH al backend.
5. Al recargar, `editado = true` y el botón desaparece.

---

### 3.2 Carta Compromiso (Formato 04 - Código: DS-040104)

**Propósito**: Documento legal donde el estudiante se compromete a cumplir las obligaciones establecidas en el Art. 22 y se compromete a evitar las prohibiciones del Art. 23 del reglamento.

#### Datos que muestra:

- Título del documento
- Nombre del instituto
- Estudiante (nombre y cédula)
- Carrera y nivel
- Entidad beneficiaria
- Docente tutor
- Texto completo del Art. 22 (Obligaciones)
- Texto completo del Art. 23 (Prohibiciones)
- Firma del estudiante
- Firma del docente tutor

#### Funcionalidades:

- **Estudiante**: Solo visualización.
- **Docente**: Visualización + botón "Volver a archivos".
- No es editable, solo informativo.

---

### 3.3 Control de Asistencia (Formato 06 - Código: DS-040106)

**Propósito**: Registro de las actividades diarias realizadas por el estudiante durante la vinculación.

#### Datos que muestra:

- Cabecera con: carrera, estudiante, entidad beneficiaria, proyecto, docente tutor, tutor entidad, período académico
- Rango de fechas del proyecto (para validación)
- Tabla de actividades con: fecha, hora entrada, hora salida, total horas, actividad realizada

#### Funcionalidades del Estudiante:

- **Agregar actividad**: formulario con fecha, hora entrada, hora salida y descripción.
- **Editar fila individual**: cambia fecha u horas de una actividad específica.
- **Editar descripción del grupo**: cambia la descripción de TODAS las actividades que comparten esa descripción (agrupación inteligente).
- **Duplicar actividad**: añade otra fecha para la misma actividad (ej. "Reunión" en dos días diferentes).
- **Eliminar actividad**: elimina una fecha específica de un grupo.
- **Validación**: la fecha debe estar dentro del rango del proyecto.

#### Funcionalidades del Docente:

- **Solo lectura** de las actividades.
- **Editar observaciones**: con auto-guardado (debounce de 1.5 segundos).
- No puede agregar, editar ni eliminar actividades.

#### Agrupación Inteligente:

Las actividades con la misma descripción (case-insensitive, con trim) se agrupan en la tabla:

- La columna "ACTIVIDAD REALIZADA" se muestra una sola vez con **rowspan** (celda fusionada verticalmente).
- El total de horas se suma para el grupo.
- Si hay varias fechas con la misma actividad, se muestra "fecha1 al fecha2 (X días)".

---

### 3.4 Registro de Asistencia del Tutor (Formato 07 - Código: DS-040107)

**Propósito**: Registro de las visitas realizadas por el docente tutor a la entidad receptora.

#### Datos que muestra:

- Carrera, institución, docente tutor, período académico
- Rango de fechas del proyecto
- Tabla de visitas: fecha, hora entrada, hora salida, total horas, actividad realizada
- Observaciones y coordinador de carrera

#### Funcionalidades del Docente:

- **CRUD completo** de visitas:
  - Agregar nueva visita
  - Editar visita existente (fecha, horas, actividad)
  - Eliminar visita
- **Editar observaciones** con auto-guardado.
- **Validación**: fecha dentro del rango del proyecto, hora salida > hora entrada.

#### Funcionalidades del Tutor Empresarial:

- **Solo lectura** de actividades.
- **Editar observaciones** con auto-guardado.

#### Funcionalidades del Estudiante:

- **Solo visualización** completa (sin edición).

---

### 3.5 Plan de Aprendizaje y Seguimiento (Formato 08 - Código: DS-040108)

**Propósito**: Plan de actividades de aprendizaje con resultados esperados y reflexión del estudiante.

#### Datos que muestra:

- Fundación, nivel, estudiante, cédula
- Asignatura 1, asignatura 2, ciclo académico
- Fechas de inicio y fin
- Docente tutor
- Título del proyecto
- Tabla de semanas: semana, fecha, actividades, resultados del aprendizaje
- Reflexión del estudiante
- Tabla de "Secciones del Proyecto" con avance porcentual

#### Funcionalidades del Estudiante:

- **Editar resultado de aprendizaje** de cada semana (por actividad agrupada).
- **Editar reflexión**: con auto-guardado (debounce 1.5s).
- No puede agregar ni eliminar semanas (vienen del backend).

#### Agrupación por Actividad:

- Actividades con el mismo texto se agrupan en "Semanas" (Semana 1, Semana 2, etc.).
- Cada grupo muestra la primera fecha y su resultado de aprendizaje.
- Si la misma actividad se repite, solo se muestra una vez.

#### Secciones del Proyecto:

- Lista fija de 9 secciones (Título, Antecedentes, Marco Teórico, Metodología, Resultados, Conclusiones, Referencias, Anexos, Entrega final).
- El avance porcentual se carga desde `localStorage` si existe (clave: `secciones_avance_{idVinculacion}`).

---

### 3.6 Certificado de Vinculación (Formato 10)

**Propósito**: Certificado oficial que acredita las horas de vinculación realizadas por el estudiante.

#### Datos que muestra:

- Fecha de emisión (formateada como "Quito, 13 de agosto de 2026" desde el backend)
- Estudiante (nombre y cédula)
- Carrera
- Nombre del proyecto
- Fecha inicio y fecha fin
- Total de horas
- Institución/entidad
- Representante (Coordinador de Vinculación)

#### Funcionalidades:

- **Estudiante**: Solo visualización.
- **Docente**: No tiene acceso (el certificado es solo para estudiantes).

#### Datos Combinados:

El componente carga datos de **tres servicios en paralelo**:

1. `certificadoService` → datos base del certificado
2. `inicioActividadesService` → nombre del proyecto y fechas
3. `controlAsistenciaService` → total de horas

---

### 3.7 Informe Final del Proyecto (Formato 09 - Código: DS-040109)

**Propósito**: Informe completo del proyecto de vinculación con evaluación final del docente.

#### Datos que muestra:

**1. Datos Generales:**

- Carrera, fecha del informe
- Estudiante (nombre, cédula, email, teléfono)
- Nombre del proyecto, fechas
- Entidad beneficiaria, dirección, teléfono, email
- Tutor entidad, docente tutor

**2. Resumen de Actividades (agrupadas por descripción):**

- Nro., fecha (puede ser rango), actividades, horas, observaciones
- Total de horas cumplidas

**3. Objetivos del Proyecto:**

- Objetivo, actividades, avance %, resultados
- El estudiante puede **editar, agregar y eliminar** objetivos.
- Los cambios se guardan en `localStorage` (no en backend).

**4. Reflexión del Estudiante:**

- Texto libre (solo lectura)

**5. Evaluación Final del Tutor Académico:**

- **11 parámetros** con calificación sobre 10:
  1. Puntualidad
  2. Trabajo autónomo
  3. Asistencia
  4. Ética profesional
  5. Cumple a satisfacción sus tareas
  6. Actitud proactiva
  7. Coopera permanentemente
  8. Respeto a la autoridad y compañeros
  9. Constancia y predisposición
  10. Responsabilidad, esmero y orden
  11. Habilidad para poner en práctica ideas
- Promedio automático
- Nota en letras (ej. "Ocho con 50/100")
- Observaciones y coordinador

#### Funcionalidades del Estudiante:

- **Editar observaciones** de actividades (guardado en localStorage).
- **Editar objetivos** del proyecto (guardado en localStorage).
- No puede editar la evaluación final.

#### Funcionalidades del Docente:

- **Editar evaluación final**: los 11 parámetros, observaciones y nota.
- Guardar en el backend (PATCH `/api/vinculacion/informe-final/:id/evaluacion`).
- No puede editar objetivos.

#### Nota en Letras:

El sistema convierte automáticamente la nota numérica a texto:

- 10 → "Diez"
- 8.5 → "Ocho con 50/100"
- 0 → "Cero"

---

### 3.8 Selector de Estudiantes (Solo Docente)

**Propósito**: Pantalla de entrada para docentes donde seleccionan a qué estudiante ver.

#### Funcionalidades:

1. **Carga de estudiantes** asignados al docente desde el backend.
2. **Búsqueda** por nombre, cédula, carrera o entidad beneficiaria.
3. **Verificación de estado**: consulta el informe final de cada estudiante para saber si ya fue calificado (mostrando badge "✅ Calificado" o "❌ Sin calificar").
4. **Selección**: al hacer clic, guarda el ID en `localStorage` y muestra los documentos disponibles.
5. **Navegación**: botones para ir a cada documento (`/vinculacion/docente/estudiante/:id/inicio-actividades`, etc.).

#### Documentos visibles para el docente:

- 📋 Inicio de Actividades
- 📋 Control de Asistencia
- 📝 Registro Asistencia Tutor
- 📄 Informe Final

---

## 4. Servicios del Módulo

### 4.1 Comunicación con el Backend

Todos los servicios usan `HttpClient` de Angular y se comunican con la API REST del backend.

| **ServicioEndpoints**            |                                                                                                                                                                                                                                                                                    |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `InicioActividadesService`       | GET `/api/vinculacion/inicio-actividades/:id`<br>PATCH `/api/vinculacion/inicio-actividades/:id`                                                                                                                                                                                   |
| `CartaCompromisoService`         | GET `/api/vinculacion/acta-compromiso/:id`                                                                                                                                                                                                                                         |
| `ControlAsistenciaService`       | GET `/api/vinculacion/asistencia-estudiante/:id`<br>POST `/api/vinculacion/asistencia-estudiante`<br>PATCH `/api/vinculacion/asistencia-estudiante/:id`<br>DELETE `/api/vinculacion/asistencia-estudiante/:id`<br>PATCH `/api/vinculacion/asistencia-estudiante/:id/observaciones` |
| `RegistroAsistenciaTutorService` | GET `/api/vinculacion/asistencia-tutor/:id`<br>POST `/api/vinculacion/asistencia-tutor`<br>PATCH `/api/vinculacion/asistencia-tutor/:id`<br>DELETE `/api/vinculacion/asistencia-tutor/:id`<br>PATCH `/api/vinculacion/asistencia-tutor/:id/observaciones`                          |
| `PlanAprendizajeService`         | GET `/api/vinculacion/informe-actividades/:id`<br>PATCH `/api/vinculacion/informe-actividades/actividad/:id`<br>PATCH `/api/vinculacion/informe-actividades/:id/reflexion`                                                                                                         |
| `CertificadoService`             | GET `/api/vinculacion/certificado/:id`                                                                                                                                                                                                                                             |
| `InformeFinalService`            | GET `/api/vinculacion/informe-final/:id`<br>PATCH `/api/vinculacion/informe-final/:id/evaluacion`<br>GET `/api/vinculacion/informe-final`                                                                                                                                          |
| `VinculacionService`             | GET `/api/vinculacion/informe-final` (lista estudiantes docentes)<br>GET `/api/vinculacion/estudiante/vinculacion-activa`<br>GET `/api/vinculacion/:id`                                                                                                                            |

### 4.2 Servicio de Exportación a Excel (`ExcelExportService`)

Este es el **servicio más complejo** del módulo. Genera archivos `.xlsx` con formato institucional exacto.

#### Archivos que puede exportar:

1. **Exportación individual**: una sola hoja.
2. **Exportación completa**: las 7 hojas en un solo archivo (Portafolio de Vinculación).

#### Formatos implementados:

| **HojaFormatoCódigoColor Cabecera** |            |           |                |
| ----------------------------------- | ---------- | --------- | -------------- |
| "Inicio Act."                       | FORMATO 05 | DS-040105 | Azul + Naranja |
| "1 C.C."                            | FORMATO 04 | DS-040104 | Azul + Naranja |
| "2 C.A."                            | FORMATO 06 | DS-040106 | Azul + Naranja |
| "3 R.A.T"                           | FORMATO 07 | DS-040107 | Azul + Naranja |
| "4 P.A."                            | FORMATO 08 | DS-040108 | Azul + Naranja |
| "7 Cert."                           | FORMATO 10 | -         | Sin logo       |
| "Informe final"                     | FORMATO 09 | DS-040109 | Azul + Naranja |

#### Estilos implementados:

- **Paleta institucional**:
  - Azul: `#0070C0` (franja "INSTITUTO...")
  - Naranja: `#ED7D31` (franja "PROCESO 01...")
  - Gris: `#D8D8D8` (encabezados de tabla)
  - Azul oscuro: `#1F4E78` (secciones)
  - Fila alterna: `#F2F2F2` (rayado cebra)
- **Tipografías**: Calibri para todo, con tamaños específicos.
- **Bordes**: thin (delgados) en todas las celdas.
- **Alineación**: centrada horizontal/vertical para títulos, izquierda para contenido.
- **Wrap Text**: activado en celdas con texto largo.

#### Inserción de Logo (Hack Ingenioso):

La librería `xlsx-js-style` **no soporta imágenes** por API. Para solucionarlo:

1. El servicio genera el Excel con `XLSX.write()`.
2. Abre el archivo resultante como ZIP usando `JSZip`.
3. **Inyecta manualmente** los archivos XML necesarios:
   - `xl/media/image_logo.png` → La imagen del logo
   - `xl/drawings/drawing1.xml` → Define dónde se ancla la imagen
   - `xl/drawings/_rels/drawing1.xml.rels` → Relación drawing → imagen
   - `xl/worksheets/_rels/sheet1.xml.rels` → Relación hoja → drawing
   - `<drawing>` dentro del XML de la hoja
   - MIME type en `[Content_Types].xml`
4. Regenera el ZIP y lo devuelve.

Esto permite que Excel muestre el logo institucional en las primeras filas de cada hoja (A1\:A4 o A1\:B4 según la hoja).

#### Texto Legal Incluido:

- **Art. 22** (Obligaciones): 15 literales
- **Art. 23** (Prohibiciones): 12 literales
- **Cierre del acta**: compromiso del estudiante

#### Lógica de Agrupación en Excel:

- **Control de Asistencia**: agrupa por descripción y fusiona celdas.
- **Informe Final**: agrupa actividades por descripción con rango de fechas.
- **Plan de Aprendizaje**: agrupa por actividad única (no por fecha).

---

## 5. Manejo de Estado y Persistencia Local

### 5.1 Datos guardados en `localStorage`

| **ClavePropósitoCuándo se usa**  |                                                   |                                                               |
| -------------------------------- | ------------------------------------------------- | ------------------------------------------------------------- |
| `estudiante_seleccionado_id`     | ID de vinculación del estudiante seleccionado     | Para navegar entre documentos como docente                    |
| `objetivos_editados_{id}`        | Objetivos del proyecto editados por el estudiante | Informe Final - se leen/escriben al cargar/guardar            |
| `actividades_observaciones_{id}` | Observaciones de actividades del informe          | Informe Final - se guardan por estudiante                     |
| `secciones_avance_{id}`          | Avance de secciones del proyecto                  | Plan de Aprendizaje - si el docente personalizó               |
| `estado_cambiado_{id}`           | Flag de cambio de estado                          | Al calificar un informe, marca que la lista debe actualizarse |
| `actualizar_estado_{id}`         | Flag de actualización pendiente                   | Selector de estudiantes - al volver, actualiza badges         |
| `estudiante_calificado_{id}`     | Si el estudiante fue calificado                   | Para actualizar el badge                                      |

### 5.2 Auto-Guardado (Debounce)

En observaciones y reflexiones:

- El usuario escribe → se espera **1.5 segundos** sin escribir.
- Si no escribe más, se envía automáticamente al backend.
- Se muestra el estado: "⏳ Guardando..." → "✅ Guardado" o "⚠️ Sin guardar".

---

## 6. Validaciones Implementadas

### 6.1 Validación de Fechas

- La actividad debe estar dentro del rango del proyecto (`fecha_inicio_proyecto ≤ fecha_actividad ≤ fecha_fin_proyecto`).
- Si no hay fechas de proyecto cargadas, se omite la validación.
- Se formatea la fecha para comparación (`setHours(0,0,0,0)`).

### 6.2 Validación de Horas

- `hora_fin` debe ser mayor que `hora_inicio`.
- Error visual: mensaje en rojo con fondo claro.

### 6.3 Validación de Campos Obligatorios

- Fecha, hora entrada, hora salida y actividad: obligatorios.
- Nombre del proyecto: obligatorio.

### 6.4 Validación de Edición Única (Inicio de Actividades)

- El docente solo puede editar **una vez** (campo `editado`).
- Si intenta editar de nuevo, se muestra mensaje de advertencia.

---

## 7. Roles y Permisos

### 7.1 En el Frontend

Cada componente verifica los roles del usuario usando `AuthService.roles()`:

typescript

```
const roles = this.authService.roles();
this.isEstudiante = roles.includes('ESTUDIANTE');
this.isDocente = roles.includes('DOCENTE');
this.isCoordinador = roles.includes('COORDINADOR');
this.isTutorEmpresarial = roles.includes('TUTOR_EMPRESARIAL');
```

svgsvg

### 7.2 Resumen de Permisos por Documento

| **DocumentoEstudianteDocenteTutor EmpresarialCoordinador** |                               |                     |                  |                  |
| ---------------------------------------------------------- | ----------------------------- | ------------------- | ---------------- | ---------------- |
| **Inicio Actividades**                                     | Ver                           | Ver + Editar 1 vez  | -                | -                |
| **Carta Compromiso**                                       | Ver                           | Ver                 | -                | -                |
| **Control Asistencia**                                     | CRUD completo                 | Ver + Editar obs    | -                | Ver + Editar obs |
| **Registro Asistencia Tutor**                              | Ver                           | CRUD completo + obs | Ver + Editar obs | -                |
| **Plan de Aprendizaje**                                    | Editar resultados + reflexión | -                   | -                | -                |
| **Certificado**                                            | Ver                           | -                   | -                | -                |
| **Informe Final**                                          | Editar objetivos + obs        | Editar evaluación   | -                | -                |
| **Selector Estudiantes**                                   | -                             | Acceso completo     | -                | -                |

---

## 8. Componente Reutilizable: `VolverArchivosComponent`

Botón que aparece en las vistas de los docentes para volver a la lista de documentos del estudiante.

**Comportamiento**:

1. Lee `estudiante_seleccionado_id` de `localStorage`.
2. Si existe, navega a `/vinculacion/docente/seleccionar` con el ID como query param.
3. Si no existe, navega a la lista sin ID (fallback).

---

## 9. Manejo de Modales

Se usa un **componente modal compartido** (`app-modal`) para:

- Mensajes de éxito
- Mensajes de error
- Confirmaciones de eliminación (con botones "Confirmar" y "Cancelar")
- Advertencias de permisos

**Tipos de modal**:

- `success` → Verde
- `error` → Rojo
- `warning` → Amarillo
- `info` → Azul

---

## 10. Consideraciones de Seguridad

1. **Autenticación**: Todas las llamadas HTTP pasan por un interceptor que agrega el token JWT.
2. **Autorización**: Los guards de rutas (`authGuard`, `roleGuard`) protegen las rutas del módulo.
3. **Backend como autoridad final**: Aunque el frontend oculta/deshabilita botones según el rol, el backend valida cada petición con `@Roles()`.
4. **Validación de datos**: El frontend valida fechas, horas y campos obligatorios antes de enviar al backend.
5. **Control de edición única**: El campo `editado` impide ediciones múltiples del proyecto.

---

## 11. Manejo de Errores

### 11.1 Errores HTTP

- Se capturan en los `subscribe` de cada servicio.
- Se muestran usando el componente modal o se asignan a variables `error`.
- Ejemplo: si el backend devuelve `{ message: "Ya existe una actividad en esta fecha" }`, se muestra ese mensaje al usuario.

### 11.2 Errores de Validación

- Los mensajes de error se muestran junto al campo (ej. "❌ La hora de salida debe ser posterior a la hora de entrada").
- El error se limpia cuando el usuario cambia el valor.

### 11.3 Errores de localStorage

- Se intenta parsear JSON de `localStorage` con `try/catch`.
- Si hay error, se usa el valor por defecto (ej. objetivos del backend).

---

## 12. Rendimiento y Optimización

### 12.1 Carga de Datos

- **Carga en paralelo**: En `InformeFinal` y `Certificado`, se usan `forkJoin` o `Promise.all` para cargar datos de múltiples servicios simultáneamente.
- **Lazy Loading**: Los componentes se cargan bajo demanda mediante `loadComponent` en las rutas.

### 12.2 Cache de Logo

- El servicio de exportación **cachea el logo institucional** en memoria (`logoBytesCache`).
- Solo se descarga una vez por sesión.
- Si falla la descarga, se continúa sin logo (no rompe la exportación).

### 12.3 Agrupación en Memoria

- La agrupación de actividades se realiza en el cliente (no en el servidor).
- Los datos se procesan una vez al cargar y se reutilizan.

---

## 13. Diseño y UX

### 13.1 Estilos Visuales

- **Colores institucionales**: Azul (#163d8c), Naranja (#ff7b22), Gris (#f0f2f5).
- **Tipografías**: Times New Roman para documentos, Roboto para UI.
- **Tarjetas con sombra**: documentos en cajas blancas con sombra suave.
- **Borde superior degradado**: línea azul-naranja-azul en la parte superior de los contenedores.

### 13.2 Responsive Design

- **Breakpoints**:
  -
  > 1024px: escritorio (multi-columna)
  1. 768px - 1024px: tablet (2 columnas)
  2. < 767px: móvil (1 columna, botones a ancho completo)
  3. < 480px: móvil pequeño (tipografías reducidas)

### 13.3 Estados de la UI

- **Loading**: spinner + texto "Cargando..."
- **Error**: mensaje con icono ⚠️ y botón "Reintentar" (en selector)
- **Sin datos**: mensaje "No hay datos disponibles"
- **Guardado**: badge "✅ Guardado" / "⏳ Guardando..." / "⚠️ Sin guardar"

---

## 14. Flujos de Usuario (Casos de Uso)

### 14.1 Flujo del Estudiante

1. **Inicia sesión** con sus credenciales.
2. **Entra al módulo de Vinculación** desde el menú lateral.
3. **Ve sus documentos** disponibles:
   - Inicio de Actividades → ver información
   - Carta Compromiso → ver y leer
   - Control de Asistencia → agregar/editar/eliminar actividades
   - Registro Asistencia Tutor → solo ver
   - Plan de Aprendizaje → editar resultados y reflexión
   - Certificado → ver
   - Informe Final → editar objetivos y observaciones
4. **Exporta** cualquier documento a Excel con formato institucional.

### 14.2 Flujo del Docente

1. **Inicia sesión** con sus credenciales de docente.
2. **Entra al módulo de Vinculación** → "Seleccionar Estudiante".
3. **Ve la lista** de estudiantes asignados, con búsqueda y estado (calificado/sin calificar).
4. **Selecciona un estudiante** → ve 4 documentos.
5. **Navega a cada documento**:
   - Inicio de Actividades → puede editar 1 vez (proyecto/fechas)
   - Control de Asistencia → solo observaciones (auto-guardado)
   - Registro Asistencia Tutor → CRUD completo + observaciones
   - Informe Final → editar evaluación (11 parámetros + observaciones)
6. **Exporta** cualquier documento a Excel.

### 14.3 Flujo del Tutor Empresarial

1. **Inicia sesión** con sus credenciales de tutor empresarial.
2. **Entra al módulo de Vinculación**.
3. **Selecciona un estudiante** (si se le da acceso).
4. **Ve los documentos** en modo lectura/edición parcial:
   - Registro Asistencia Tutor → editar observaciones
   - Otros documentos → solo lectura

---

## 15. Detalles de Implementación del Excel Export

### 15.1 Funciones Principales

**`exportarHojaIndividual(id, tipoHoja, data)`**:

- Recibe el ID de vinculación, el tipo de hoja y los datos.
- Genera una hoja individual basada en el tipo.
- Descarga el archivo con `saveAs`.

**`exportarExcelCompleto(id)`**:

- Carga los datos de los **7 servicios en paralelo** usando `Promise.all`.
- Genera las 7 hojas y las agrega a un libro.
- Inserta el logo en todas excepto Certificado.
- Descarga "PORTAFOLIO VINCULACIÓN.xlsx".

### 15.2 Funciones de Construcción de Hojas

| **FunciónHojaDatos que usa**     |               |                              |
| -------------------------------- | ------------- | ---------------------------- |
| `construirHojaInicioActividades` | Inicio Act.   | InicioActividadesResponse    |
| `construirHojaCartaCompromiso`   | 1 C.C.        | CartaCompromiso              |
| `construirHojaControlAsistencia` | 2 C.A.        | AsistenciaEstudianteResponse |
| `construirHojaRegistroTutor`     | 3 R.A.T       | AsistenciaTutorResponse      |
| `construirHojaPlanAprendizaje`   | 4 P.A.        | PlanAprendizaje              |
| `construirHojaCertificado`       | 7 Cert.       | Certificado                  |
| `construirHojaInformeFinal`      | Informe final | InformeFinalResponse         |

### 15.3 Estructura de la Cabecera Institucional

Todas las hojas (excepto Certificado) tienen esta estructura:

text

```
Fila 1: [LOGO] | INSTITUTO SUPERIOR TECNOLÓGICO... (azul) | CÓDIGO |
Fila 2: [LOGO] | MACROPROCESO 04 VINCULACIÓN (blanco)      |       |
Fila 3: [LOGO] | PROCESO 01 VINCULACIÓN (naranja)          |       |
Fila 4: [LOGO] | FORMATO XX ... (blanco)                   |       |
```

svgsvg

- Columnas A\:A o A\:B reservadas para el logo.
- Columnas siguientes para los títulos.
- Últimas columnas para el código del documento.

### 15.4 Detalles de Cada Hoja Excel

#### Inicio Actividades:

- "A:" → Coordinador
- "De:" → Tutor
- "Asunto:" → Proyecto
- "Fecha:" → Fecha inicio
- Texto legal + descripción
- Espacios para figuras (imágenes no embebidas)

#### Carta Compromiso:

- "Yo, [estudiante] con C.I. [cédula]..."
- Art. 22 completo
- Art. 23 completo
- Cierre del acta
- Tabla de firma (estudiante, cédula, nivel, firma)

#### Control de Asistencia:

- Cabecera con todos los datos
- Tabla con fechas/horas/actividad (agrupada)
- Total horas
- Observaciones
- Firmas (estudiante + docente)

#### Registro Tutor:

- Cabecera simple
- Tabla de visitas
- Total horas
- Observaciones + coordinador
- Firma del coordinador

#### Plan de Aprendizaje:

- Cabecera con campos
- Tabla de semanas (agrupadas por actividad)
- Reflexión
- Tabla de secciones con avance %

#### Certificado:

- **Sin logo** (formato distinto)
- Fecha emisión
- Texto legal completo
- Proyecto destacado
- Firma del coordinador

#### Informe Final:

- Datos generales
- Tabla de actividades (agrupadas)
- Total horas
- Objetivos (con avance %)
- Reflexión
- Evaluación (11 parámetros + promedio)
- Nota en letras
- Observaciones
- Firmas

---

## 16. Consideraciones y Limitaciones

### 16.1 Limitaciones Conocidas

1. **Dependencia de localStorage**: Los objetivos y observaciones se guardan localmente, no en el backend. Si el usuario limpia el navegador, pierde los datos.
2. **URL hardcoded**: El servicio de informe final usa `http://localhost:3000/api` directamente (debería usar `environment`).
3. **`.toPromise()`**** obsoleto**: Se usa un método deprecado en RxJS 7+.
4. **Sin paginación**: Las tablas pueden volverse muy largas si hay muchos registros.

### 16.2 Mejoras Sugeridas

1. **Backend para objetivos**: Guardar los objetivos editados en el backend para persistencia real.
2. **URLs dinámicas**: Usar `environment.apiUrl` en todos los servicios.
3. **Refactorizar agrupación**: Extraer la lógica de agrupación a funciones compartidas.
4. **Manejo de errores centralizado**: Usar interceptores para manejar errores HTTP de forma uniforme.

---

## 17. Conclusiones

Este módulo de **Vinculación con la Sociedad** implementa:

✅ **8 documentos oficiales** con formato institucional exacto
✅ **CRUD completo** de actividades y visitas con validaciones
✅ **Agrupación inteligente** de actividades por descripción
✅ **Exportación a Excel** con logo institucional incrustado
✅ **Control de roles** por funcionalidad
✅ **Auto-guardado** con debounce para observaciones
✅ **Validación de fechas** dentro del rango del proyecto
✅ **Diseño responsive** con estilo profesional
✅ **Persistencia local** para datos en edición temporal
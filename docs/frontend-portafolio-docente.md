# 🗂️ Frontend — Módulo Portafolio Docente

Sistema Académico Yavirac — `sistema-academico-frontend` (Angular 22).
Extracto del README de frontend correspondiente a **Portafolio Docente**. Documentos hermanos:
[`frontend-auth.md`](./frontend-auth.md), [`frontend-dashboard.md`](./frontend-dashboard.md).

---

# 🗂️ 1. Portafolio Docente

El **Portafolio Docente** permite gestionar la labor académica mediante tres documentos principales:

1. **Informe Final — Formato 04**
2. **Seguimiento PEA — Formato 02**
3. **Aceptación de Notas — Formato 07**

## 📚 Modos de visualización

| Modo | Función |
|---|---|
| **Informe Final** | Crear y gestionar el informe final de una materia |
| **Seguimiento PEA** | Registrar las actividades semana a semana |
| **Aceptación de Notas** | Registrar notas y generar reportes |

El modo se determina mediante un parámetro en la URL, por ejemplo:

```text
?modo=informe-final
?modo=aceptacion-notas
```

---

# 📝 2. Informe Final — Formato 04

Documento que resume el proceso docente desarrollado durante el semestre.

### Contenido

1. Antecedentes.
2. Datos de la asignatura.
3. Desarrollo de actividades.
4. Infraestructura y recomendaciones.
5. Plan de estudios y recomendaciones.
6. Firmas del docente y coordinador.

### Creación

1. Entrar a **Informe Final**.
2. Seleccionar una materia pendiente.
3. Ingresar el horario.
4. Crear el informe.
5. Completar sus secciones.

### Edición

Cuando el informe existe, el docente puede:

- Editar las secciones.
- Cambiar el horario.
- Guardar cambios.

Actualmente los textos manuales se almacenan en `localStorage`.

---

# 📅 3. Seguimiento PEA — Formato 02

Es un registro del desarrollo de la materia semana a semana.

### Contenido

- Carrera.
- Asignatura.
- Paralelo.
- Período.
- Docente.
- Representante estudiantil.
- Semanas de seguimiento.
- Observaciones finales.
- Firmas.

Por defecto se generan **10 semanas**.

Cada semana contiene:

- Fecha.
- Temas tratados.
- Observaciones.

### Funcionalidades

El docente puede:

- ➕ Agregar semanas.
- ➖ Eliminar semanas.
- ✏️ Editar semanas.
- 🔄 Cambiar representante.

Las semanas y observaciones se almacenan actualmente en `localStorage`, mientras que el representante se actualiza en el backend mediante `PATCH`.

---

# 🧾 4. Aceptación de Notas — Formato 07

Permite generar reportes donde los estudiantes aceptan sus notas mediante firma.

### Tipos de reporte

- `APORTE_1` — Primer parcial.
- `APORTE_2` — Segundo parcial.
- `SUPLETORIO` — Examen supletorio.

### Flujo

1. Seleccionar materia.
2. Seleccionar tipo de nota.
3. Generar el reporte si todavía no existe.
4. Ingresar las notas.
5. Guardarlas en el backend.
6. Exportar el documento.

### Reglas de negocio

- No se puede generar `SUPLETORIO` sin `APORTE_2`.
- Los estudiantes deben existir en la oferta académica.
- Las notas deben estar entre **0 y 10**.
- Se manejan **2 decimales**.

### Reporte generado

Incluye:

- Datos de la materia.
- Número del estudiante.
- Nombre.
- Cédula.
- Nota.
- Firma.
- Observación.
- Firmas del docente y coordinador.

---

# 💾 5. Persistencia con localStorage

Existe una limitación temporal en el backend: no dispone de columnas para determinados textos largos introducidos por los docentes.

Por este motivo se utiliza `localStorage` como **workaround temporal**.

### Claves utilizadas

```text
informe_final_manual_{idOferta}
seguimiento_pea_manual_{idOferta}
```

### Informe Final

Se almacenan:

- `antecedentes`
- `desarrolloActividades`
- `infraestructura`
- `recomendacionesInfraestructura`
- `planEstudios`
- `recomendacionesPlanEstudios`
- `fechaElaboracion`

### Seguimiento PEA

Se almacenan:

- `semanas`
- `observacionesRepresentante`
- `observacionesDocente`
- `observacionesCoordinador`

### ⚠️ Limitaciones

Los datos pueden perderse si:

- El usuario cambia de navegador.
- Cambia de dispositivo.
- Limpia el `localStorage`.

Además, estos datos no cuentan actualmente con respaldo en el backend.

### 🚀 Solución futura

La solución ideal consiste en:

1. Crear endpoints en el backend.
2. Incorporar los campos faltantes.
3. Actualizar el frontend para guardar directamente en el backend.

---

# 📄 6. Exportación a Word

El sistema permite exportar los documentos institucionales a **`.docx`**.

### Proceso

```text
Formulario
    ↓
Generación de HTML
    ↓
html-docx-js-typescript
    ↓
Blob
    ↓
FileSaver
    ↓
Documento .docx
```

### Documentos exportables

- Informe Final — Formato 04
- Seguimiento PEA — Formato 02
- Aceptación de Notas — Formato 07

El documento incluye:

- Membrete institucional.
- Logo.
- Código y nombre institucional.
- Datos del formulario.
- Tablas.
- Textos formateados.
- Espacios para firmas.

---

# 👁️ 7. Control de Edición

El sistema utiliza el flag:

```text
esSoloLectura
```

### Modo solo lectura

Se activa cuando el documento ya fue generado, con una excepción inmediatamente después de su creación (`recienCreado = true`).

### Modo editable

Se permite editar cuando:

- El documento todavía no existe.
- El docente está en proceso de creación.
- El documento acaba de ser creado.

Este mecanismo busca evitar modificaciones sobre documentos ya aprobados o firmados y permite consultar la información sin alterar su contenido.

---

# 🔎 8. Filtros Excluyentes — Aceptación de Notas

Para evitar que una misma materia aparezca en varias secciones, se utiliza un sistema de filtros excluyentes.

| Sección | Condición |
|---|---|
| **1er Parcial** | Tiene `APORTE_1` y no tiene `APORTE_2` |
| **2do Parcial** | Tiene `APORTE_1` + `APORTE_2` y no tiene `SUPLETORIO` |
| **Supletorio** | Tiene `APORTE_1` + `APORTE_2` + `SUPLETORIO` |

Esto mantiene el flujo:

```text
1er Parcial
     ↓
2do Parcial
     ↓
Supletorio
```

---

# 🔗 9. Comunicación Frontend ↔ Backend

Las peticiones siguen el patrón:

```http
[MÉTODO HTTP] [URL BASE] + [ENDPOINT]

Headers:
Authorization: Bearer [token]

Body:
JSON
```

## 🔐 Login

```http
POST /api/auth/login
```

Ejemplo de body:

```json
{
  "correo": "docente@yavirac.edu.ec",
  "password": "123456"
}
```

## 📚 Obtener materias

```http
GET /api/portafolio/mis-ofertas
```

Con:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## ✅ Respuesta exitosa

```json
{
  "data": {}
}
```

## ❌ Respuesta con error

```json
{
  "message": "Mensaje de error descriptivo",
  "errors": []
}
```

---

# 🚦 10. Manejo de códigos HTTP

## 404 — No encontrado

En determinados procesos, un `404` es un comportamiento esperado.

| Situación | Interpretación | Acción del frontend |
|---|---|---|
| Informe Final | Todavía no existe | Mostrar creación |
| Seguimiento PEA | Todavía no existe | Mostrar creación |
| Reporte de notas | Todavía no existe | Mostrar generación |

## 401 — No autorizado

Indica que el token es inválido o expiró.

El interceptor:

1. Elimina el token.
2. Elimina los datos del usuario.
3. Redirige al login.

**Excepción:** `/cambiar-password`.

---

# 🔄 11. Flujos Principales

## 👨‍🏫 Docente crea Informe Final

```text
Login
 ↓
Dashboard
 ↓
Portafolio Docente
 ↓
Informe Final
 ↓
Seleccionar materia
 ↓
Ingresar horario
 ↓
Crear informe
 ↓
Completar formulario
 ↓
Guardar
 ↓
Exportar Word
```

## 📅 Docente completa Seguimiento PEA

```text
Login
 ↓
Portafolio Docente
 ↓
Seguimiento PEA
 ↓
Seleccionar materia
 ↓
Elegir representante
 ↓
Crear seguimiento
 ↓
Completar semanas
 ↓
Registrar observaciones
 ↓
Exportar Word
```

## 🧾 Docente registra notas

```text
Login
 ↓
Portafolio Docente
 ↓
Aceptación de Notas
 ↓
Seleccionar materia
 ↓
Seleccionar parcial
 ↓
Generar reporte
 ↓
Ingresar notas
 ↓
Guardar
 ↓
Exportar Word
```

---

# ❓ 12. Preguntas Frecuentes

### ¿Por qué los datos manuales se guardan en localStorage?

Porque el backend actualmente no dispone de campos para almacenar esos textos largos. Es una solución temporal.

### ¿Puedo editar un informe ya generado?

Sí, siempre que no esté en modo **solo lectura**. El modo solo lectura se utiliza cuando el documento ya fue aprobado.

### ¿Qué pasa si cierro el navegador sin guardar?

Los datos no guardados pueden perderse. Los datos que ya fueron almacenados en `localStorage` pueden recuperarse posteriormente.

### ¿Cómo sé si un documento está guardado en el backend?

El backend devuelve un **ID**. Si el documento posee ID, se encuentra registrado en el backend; si no, la información manual permanece en `localStorage`.

### ¿Puedo utilizar el sistema sin Internet?

No completamente. La mayoría de la información depende del backend. Únicamente los datos manuales almacenados localmente pueden permanecer disponibles.

---

# 🚀 13. Mejoras Futuras

### 🔄 Migración de `localStorage`

Trasladar los datos manuales al backend para garantizar:

- Persistencia.
- Respaldo.
- Acceso desde diferentes dispositivos.
- Mayor confiabilidad.

---

## 📁 Estructura resumida

```text
🗂️ Portafolio Docente
    ├── Informe Final — Formato 04
    ├── Seguimiento PEA — Formato 02
    └── Aceptación de Notas — Formato 07
```

---

**Documentación basada en la información técnica proporcionada para el frontend del Sistema Académico Yavirac.**

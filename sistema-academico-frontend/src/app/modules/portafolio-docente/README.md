export const placeholder = true;
# Módulo Portafolio Docente — Frontend

Documentación del trabajo realizado en el módulo **Portafolio Docente** del frontend, dentro del proyecto de tesis **Sistema Académico Yavirac**. Cubre las dos features implementadas: **Informe Final** y **Aceptación de Notas**.

## Índice

- [Contexto y restricciones del proyecto](#contexto-y-restricciones-del-proyecto)
- [Stack técnico](#stack-técnico)
- [Puesta en marcha del proyecto (de 0 a funcional)](#puesta-en-marcha-del-proyecto-de-0-a-funcional)
- [Estructura de carpetas del módulo](#estructura-de-carpetas-del-módulo)
- [Conexión con el backend](#conexión-con-el-backend)
- [Feature: Informe Final](#feature-informe-final)
- [Feature: Aceptación de Notas](#feature-aceptación-de-notas)
- [El flag `USE_MOCK`](#el-flag-use_mock)
- [Problemas encontrados y solución](#problemas-encontrados-y-solución)
- [Pendientes / bloqueado por el backend](#pendientes--bloqueado-por-el-backend)
- [Cómo probar todo](#cómo-probar-todo)

---

## Contexto y restricciones del proyecto

- El equipo trabaja con **arquitectura hexagonal** tanto en frontend como backend.
- Cada desarrollador **solo modifica su propia carpeta de módulo** (en este caso, `modules/portafolio-docente/`). No se toca el backend ni otros módulos del frontend sin avisar al equipo.
- Los cambios van por **rama propia + Pull Request hacia `main`**, integrados por Ronny.
- El backend (`sistema-academico-backend`) es de solo lectura para este rol: se puede leer su código para entender contratos de API, pero no se edita.

---

## Stack técnico

| Capa | Tecnología |
|---|---|
| Frontend | Angular 22 (standalone components, Reactive Forms, `@angular/build:application`) |
| Backend | NestJS 11 + TypeORM 1.0 + PostgreSQL |
| Estilos | SCSS por componente |
| HTTP | `HttpClient` de Angular + proxy de desarrollo (sin CORS) |

---

## Puesta en marcha del proyecto (de 0 a funcional)

El frontend partía de una carpeta con estructura vacía (solo archivos `index.ts` placeholder) y un `package.json` en Angular 18 sin dependencias completas. Pasos realizados:

### 1. Actualización de dependencias — `package.json`

Se corrigió para Angular 22, agregando paquetes que faltaban (`@angular/forms`, `@angular/compiler`, `rxjs`, `tslib`, `zone.js`) y reemplazando el builder viejo:

```json
{
  "dependencies": {
    "@angular/common": "^22.0.0",
    "@angular/compiler": "^22.0.0",
    "@angular/core": "^22.0.0",
    "@angular/forms": "^22.0.0",
    "@angular/platform-browser": "^22.0.0",
    "@angular/router": "^22.0.0",
    "rxjs": "^7.8.0",
    "tslib": "^2.8.0",
    "zone.js": "^0.15.0"
  },
  "devDependencies": {
    "@angular/build": "^22.0.0",
    "@angular/cli": "^22.0.0",
    "@angular/compiler-cli": "^22.0.0",
    "typescript": "^6.0.0"
  }
}
```

> ⚠️ **Nota de equipo:** este `package.json` es compartido por todos los módulos del frontend. Cualquier actualización aquí debe avisarse al equipo antes de hacer merge, ya que afecta a todos.

### 2. `angular.json` — builder nuevo + proxy

```json
{
  "architect": {
    "build": {
      "builder": "@angular/build:application",
      "options": {
        "outputPath": "dist",
        "index": "src/index.html",
        "browser": "src/main.ts",
        "polyfills": ["zone.js"],
        "tsConfig": "tsconfig.json",
        "outputHashing": "all",
        "inlineStyleLanguage": "scss",
        "assets": ["src/assets"]
      }
    },
    "serve": {
      "builder": "@angular/build:dev-server",
      "options": {
        "buildTarget": "sistema-academico-frontend:build",
        "proxyConfig": "proxy.conf.json"
      }
    }
  }
}
```

### 3. `tsconfig.json` — opciones obligatorias para Angular

Se agregaron `experimentalDecorators`, `emitDecoratorMetadata`, `importHelpers` y `lib: ["ES2022", "dom"]`, necesarias para que compilen los decoradores (`@Component`, `@Injectable`).

### 4. Bootstrap standalone (reemplaza el viejo `NgModule`)

- `src/main.ts` → usa `bootstrapApplication` en vez de `platformBrowserDynamic().bootstrapModule(...)`
- `src/app/app.config.ts` → registra `provideRouter(routes)` y `provideHttpClient()`
- `src/app/app.routes.ts` → rutas de la app (incluye `portafolio-docente` y `aceptacion-notas`)
- `src/app/app.component.ts` → componente raíz standalone con `<router-outlet>`

### 5. `proxy.conf.json` — para hablar con el backend sin CORS

Como no se puede tocar el backend (y no se sabía si tenía CORS habilitado), se optó por el proxy de desarrollo de Angular en vez de depender de configuración del lado del backend:

```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true
  }
}
```

> El prefijo es `/api` (no `/portafolio`) porque el backend registra un `setGlobalPrefix('api')` — se descubrió al revisar el log de arranque de NestJS.

### 6. Logo institucional

Se movió a `src/assets/images/logo.png` (única carpeta que Angular garantiza copiar al build), referenciado como `assets/images/logo.png`.

---

## Estructura de carpetas del módulo

```
src/app/modules/portafolio-docente/
├── models/
│   ├── informe-final.model.ts
│   └── aceptacion-notas.model.ts
├── services/
│   ├── informe-final.service.ts
│   └── aceptacion-notas.service.ts
└── pages/
    ├── detalle-portafolio/
    │   ├── informe-final.component.ts
    │   ├── informe-final.component.html
    │   └── informe-final.component.scss
    └── aceptacion-notas/
        ├── aceptacion-notas.component.ts
        ├── aceptacion-notas.component.html
        └── aceptacion-notas.component.scss
```

Se respetó la estructura ya definida por el equipo (`models/`, `pages/`, `services/`), sin reinterpretar la arquitectura hexagonal a nivel de frontend.

---

## Conexión con el backend

Los dos endpoints consumidos, expuestos por el módulo `portafolio-docente` del backend (arquitectura hexagonal: `controller → service → port/repository → adapter Postgres`):

| Feature | Método | Ruta |
|---|---|---|
| Informe Final | `GET` | `/api/portafolio/informe-final/:id_docente/:id_periodo` |
| Informe Final | `POST` | `/api/portafolio/informe-final` |
| Aceptación de Notas | `GET` | `/api/portafolio/aceptacion-notas/:id_oferta_asignatura/:tipo_reporte` |
| Aceptación de Notas | `POST` | `/api/portafolio/aceptacion-notas` |

La conexión real (Angular → proxy → NestJS → PostgreSQL) fue **probada y confirmada funcionando** en ambos casos: las peticiones llegan correctamente hasta la base de datos. Los errores que se reciben hoy (`500`, tabla no existe) son de infraestructura de BD, no de la integración frontend-backend (ver [Pendientes](#pendientes--bloqueado-por-el-backend)).

---

## Feature: Informe Final

Réplica funcional del **Formato 04 — Informe Final Proceso Docente** (PDF institucional), con 5 secciones + firmas:

1. **Antecedentes** — textarea con plantilla precargada
2. **Datos de la asignatura** — docente/periodo de solo lectura (vienen del backend), asignatura y paralelo en `<select>`, horario editable, fecha actual automática
3. **Desarrollo general de actividades** — textarea libre
4. **Resultados cualitativos obtenidos** — 2 sub-bloques (infraestructura y ambiente pedagógico / desarrollo del plan de estudios), cada uno con resultado + recomendación
5. **Resultados cuantitativos obtenidos** — tabla de estudiantes con notas (mock), + 2 tablas de resumen calculadas automáticamente (equivalencia de calificaciones y estado de promoción) + recomendaciones finales
6. **Firmas** de docente y coordinador

### Detalle importante: el backend solo persiste 5 campos

El `CreateInformeFinalDto` real del backend solo acepta:
```typescript
{ id_docente, id_periodo, id_asignatura, id_paralelo, horario }
```
Las secciones de antecedentes, desarrollo, cualitativos, cuantitativos y recomendaciones **se muestran y editan en pantalla, pero no viajan al backend todavía** — no hay columnas para ellas en la base de datos. Quedan en el estado local del componente (`FormGroup` + array de estudiantes), listas para conectar el día que el backend las soporte.

### Guardado con confirmación

Al hacer clic en "Guardar informe": se valida el formulario → aparece un modal de confirmación ("¿Guardar informe? / Cancelar / Sí, guardar") → solo al confirmar se dispara el `POST` real.

---

## Feature: Aceptación de Notas

Réplica funcional del **Formato 07 — Aceptación de Nota**, con selector de tipo de nota y tabla de estudiantes.

### Dropdown de tipo de nota (mapeo de alias)

El backend acepta 6 alias que se agrupan en solo 3 valores canónicos. El `POST` acepta cualquiera de los 6; el `GET` **solo acepta el valor canónico**:

| Dropdown muestra | Se envía en el POST | Valor canónico (usado en el GET) |
|---|---|---|
| Parcial Uno | `PARCIAL UNO` | `APORTE_1` |
| Aporte 1 | `APORTE_1` | `APORTE_1` |
| Parcial Dos | `PARCIAL DOS` | `APORTE_2` |
| Aporte 2 | `APORTE_2` | `APORTE_2` |
| Supletorio | `SUPLETORIO` | `SUPLETORIO` |
| Examen Supletorio | `EXAMEN SUPLETORIO` | `SUPLETORIO` |

Al cambiar el dropdown, se recarga automáticamente la tabla de estudiantes y sus notas correspondientes a ese tipo de reporte (mock con 3 datasets distintos: Aporte 1, Aporte 2, Supletorio — este último con solo 3 estudiantes, igual que en el PDF real, ya que no todos rinden supletorio).

### Columnas referenciales (no persistidas por el backend)

El PDF muestra **Asistencia, Firma y Observación** por estudiante. El README del módulo backend confirma que esto es una decisión de diseño: el PDF firmado en papel es el respaldo físico, la base de datos solo guarda nota + estado de aceptación. Estas columnas se muestran en el frontend con datos mock y una nota visible: *"Asistencia, Firma y Observación son referenciales — el sistema aún no las guarda en la base de datos."*

### Guardado con confirmación

Mismo patrón que Informe Final: botón "Generar reporte" → modal de confirmación mencionando el tipo de reporte elegido → `POST` real al confirmar. El backend responde `409 Conflict` con mensaje descriptivo si ya existe un reporte de ese tipo para la misma oferta de asignatura.

---

## El flag `USE_MOCK`

Ambos servicios (`informe-final.service.ts` y `aceptacion-notas.service.ts`) tienen una constante:

```typescript
const USE_MOCK = true; // <-- cambiar a false cuando la BD esté lista
```

Con `true`, el `GET` y el `POST` devuelven datos simulados (`of(...)` de RxJS) sin tocar el backend — permite seguir construyendo y demostrando la pantalla sin depender de que la base de datos esté lista. Con `false`, ambos métodos llaman al backend real vía `HttpClient`.

**Se probó explícitamente con `USE_MOCK = false`** en ambas features para confirmar que la conexión real funciona de punta a punta (ver siguiente sección).

---

## Problemas encontrados y solución

| # | Problema | Causa | Solución |
|---|---|---|---|
| 1 | `npm install` fallaba con `ERESOLVE` | `@angular/build@22` exige TypeScript `>=6.0 <6.1`, se había puesto `^5.9.0` | Subir TypeScript a `^6.0.0` |
| 2 | `ng: command not found` | `@angular/cli` instalado solo local, no global | Usar `npx ng serve` en vez de `ng serve` |
| 3 | `404 Cannot GET /portafolio-docente` | El proxy no estaba tomando efecto (no se reinició `ng serve` tras crearlo) | Reiniciar `ng serve` después de crear/editar `proxy.conf.json` |
| 4 | `500 Internal Server Error` en el `GET` | El backend usa prefijo global `/api` (visible en su log de arranque) que no se estaba incluyendo en las rutas del frontend | Agregar `/api` al `proxy.conf.json` y a la `baseUrl` de los services |
| 5 | Imagen del logo con 404 | La ruta apuntaba dentro de `src/app/...`, carpeta que Angular no copia al build | Mover el logo a `src/assets/images/` y declarar `"assets": ["src/assets"]` en `angular.json` |
| 6 | `POST` devolvía `400 Bad Request` | El `<select>` de Angular siempre devuelve `string`, y el DTO del backend exige `@IsNumber()` en `id_asignatura`/`id_paralelo` | Convertir con `Number(...)` antes de armar el DTO |
| 7 | `QueryFailedError: no existe la relación «portafolio_informe_final» / «portafolio_reporte_notas»` | Las tablas del módulo no están creadas en la base de datos (`synchronize: false`, falta correr migración/seed) | **No es responsabilidad del frontend** — confirma que la conexión real funciona (ver Pendientes) |
| 8 | Errores TS2307 "Cannot find module" en varios archivos recién creados | Caché desactualizada del TS Language Server de VS Code, no reflejaba archivos nuevos | `Ctrl+Shift+P` → "TypeScript: Restart TS Server" |
| 9 | El botón "Guardar" no mostraba ninguna advertencia visual si el formulario era inválido | `solicitarGuardar()` retornaba silenciosamente si `form.invalid`, sin feedback | Agregar mensajes de error (`<small>`) visibles por campo obligatorio |
| 10 | Al cambiar el `<select>` de tipo de reporte, a veces no actualizaba la tabla en la primera transición | El `<select>` vive dentro de un `*ngIf` que se re-renderiza; la suscripción a `valueChanges` quedaba desincronizada | Disparar la recarga directo desde `(change)` en el elemento HTML, en vez de depender solo de `valueChanges` |

---

## Pendientes / bloqueado por el backend

Estos puntos **no dependen del frontend** y requieren acción del equipo de backend/BD:

- [ ] Crear las tablas `portafolio_informe_final`, `portafolio_reporte_notas` y `portafolio_aceptacion_estudiante` en la base de datos (hoy no existen — `synchronize: false`, sin migraciones corridas).
- [ ] Poblar datos base (`docente`, `asignatura`, `paralelo`, `periodo_academico`, `oferta_asignatura`, `periodo_docente`, `estudiante`, `matricula`, `matricula_detalle`) para poder probar los `POST` reales sin errores de FK.
- [ ] Definir si/cómo se van a persistir las secciones adicionales de Informe Final (antecedentes, desarrollo, cualitativos, cuantitativos, recomendaciones) — hoy el DTO del backend no las contempla.
- [ ] Evaluar si se necesita un endpoint de catálogo para asignaturas/paralelos (hoy son mock fijos en el frontend).
- [ ] Endpoint de **Aceptación de Notas** pendiente de revisión (ya visto en este documento, pero fuera del alcance inicial): no existe endpoint de historial, ni para que un estudiante acepte individualmente su nota.

---

## Cómo probar todo

**Requiere 2 terminales simultáneas:**

```bash
# Terminal 1 — backend
cd sistema-academico-backend
npm run dev
```

```bash
# Terminal 2 — frontend
cd sistema-academico-frontend
npx ng serve
```

Luego, en el navegador:

| Pantalla | URL |
|---|---|
| Informe Final | `http://localhost:4200/portafolio-docente` |
| Aceptación de Notas | `http://localhost:4200/aceptacion-notas` |

Con `USE_MOCK = true` (valor por defecto actual en ambos services), todo funciona con datos simulados, sin necesidad de que la base de datos esté lista. Cambiar a `false` para probar la conexión real contra el backend.
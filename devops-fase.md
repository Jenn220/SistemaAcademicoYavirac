
# Fase 4 — Health check y preparación para despliegue

**Duración:** días 13 y 14.

### Tus actividades

Coordinar la creación de:

```http
GET /api/health
```

Debe responder algo similar:

```json
{
  "status": "ok",
  "database": "connected",
  "environment": "staging",
  "timestamp": "2026-07-15T00:00:00.000Z",
  "version": "commit-sha"
}
```

Ante fallo de PostgreSQL debe responder:

```text
HTTP 503
```

También debes:

* Eliminar o restringir `/api/health/tables`.
* Evitar mensajes internos de PostgreSQL.
* Incluir commit o versión desplegada.
* Añadir health check en Docker Compose.

### Resultado esperado

El pipeline podrá saber automáticamente si el despliegue funcionó.

---

# Fase 5 — Integración continua: CI

**Duración:** días 15 al 17.

### Workflow del backend

Crear:

```text
.github/workflows/backend-ci.yml
```

Debe ejecutarse en Pull Requests y pushes autorizados.

Pasos:

```text
Checkout
Node exacto
npm ci
Lint
Pruebas unitarias
Build
PostgreSQL temporal
Migraciones
Pruebas de integración
Docker build
```

### Workflow del frontend

Crear, si está en repositorio separado:

```text
.github/workflows/frontend-ci.yml
```

Pasos:

```text
Checkout
Node exacto
npm ci
Lint
Pruebas
Build Angular
Docker build
```

### Tu responsabilidad

* No agregar `npm run lint` si el script todavía no existe.
* Crear primero los scripts necesarios con el equipo backend/frontend.
* Configurar protección para `develop` y `main`.
* Impedir merge cuando falle CI.
* Configurar PostgreSQL temporal para probar migraciones.
* Validar que las imágenes Docker se construyen.

### Resultado esperado

Ningún código que no compile o rompa migraciones podrá integrarse en `develop`.

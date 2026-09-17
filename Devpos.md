# Cronograma interno — Base de Datos y DevOps

Tu cronograma debe centrarse únicamente en tus responsabilidades. El objetivo principal será que los cambios aprobados del backend y frontend se desplieguen automáticamente en:

```text
https://test.devlayerstudio.com
```

Esto no será “tiempo real” en el sentido de copiar cada cambio inmediatamente. El flujo correcto será:

```text
Desarrollador sube cambios
→ Pull Request
→ CI valida
→ Merge a develop
→ CD construye y despliega
→ Migraciones
→ Health check
→ Staging actualizado
```

## Duración propuesta: 4 semanas

---

## Fase 1 — Consolidación y diagnóstico

**Duración:** días 1 al 3.

### Tus actividades

* Definir cuál repositorio será la fuente oficial.
* Confirmar si Angular y NestJS están:

  * En el mismo repositorio.
  * En repositorios separados.
* Crear o confirmar la rama de integración:

```text
develop
```

* Mantener:

```text
feature-fase-practica
feature-vinculacion
feature-portafolio-docente
```

como ramas de trabajo, no como ramas de despliegue.

* Revisar:

  * `package.json`.
  * `package-lock.json`.
  * `main.ts`.
  * `app.module.ts`.
  * Configuración PostgreSQL.
  * Variables de entorno.
  * Scripts disponibles.
* Confirmar la versión exacta de Node compatible.
* Crear `.nvmrc`.
* Documentar los problemas actuales de compilación.
* Crear una lista de archivos globales que solo pueden existir una vez.

### Resultado esperado

```text
Rama develop definida
Repositorio de integración definido
Versiones técnicas confirmadas
Listado de conflictos y archivos pendientes
```

### Coordinación necesaria

Debes pedir a Backend y Frontend que no suban directamente a `develop` ni `main`. Deben trabajar mediante ramas y Pull Requests.

---

# Fase 2 — Base de datos y migraciones

**Duración:** días 4 al 8.

### Tus actividades

* Ejecutar el script estructural en una PostgreSQL vacía.
* Verificar que cree:

  * 41 tablas.
  * 41 secuencias.
  * 41 claves primarias.
  * 18 restricciones únicas.
  * 48 claves foráneas.
  * 7 índices.
  * La vista `vw_reporte_notas`.
* Comparar el SQL con las entidades NestJS.
* Documentar las desalineaciones:

  * `practica_estudiante`.
  * `empresa`.
  * Consulta de Portafolio.
  * `portafolio_informe_final`.
  * `documento_fase_practica`.
  * Claves foráneas faltantes de Vinculación.
* Definir la convención de `BIGINT`.
* Definir el tratamiento de `NUMERIC`.
* Crear:

```text
src/database/data-source.ts
src/database/migrations/
src/database/seeds/
```

* Crear scripts reales en `package.json`:

```text
migration:create
migration:generate
migration:run
migration:revert
migration:show
seed:run
```

* Convertir la estructura SQL en migraciones ordenadas.
* Probar las migraciones en una base vacía.
* Probar al menos un `migration:revert`.
* Definir el procedimiento de baseline para la base existente.

### Resultado esperado

```text
PostgreSQL se crea desde cero
Migraciones versionadas funcionan
DataSource disponible para CLI
Backend y base tienen un mapa de diferencias confirmado
```

### Regla

No habilitar:

```ts
synchronize: true
```

Tampoco conviene dejar:

```ts
migrationsRun: true
```

en el arranque normal. Las migraciones se ejecutarán explícitamente antes del despliegue.

---

# Fase 3 — Docker local reproducible

**Duración:** días 9 al 12.

### Tus actividades

Crear:

```text
Dockerfile
Dockerfile.dev
docker-compose.yml
.dockerignore
.env.example
```

Primera composición:

```text
backend
postgres
```

Cuando el frontend esté disponible y estable:

```text
frontend
backend
postgres
```

Configurar:

* Red privada.
* Volumen PostgreSQL.
* Health check de PostgreSQL.
* Health check del backend.
* Variables de entorno.
* Usuario PostgreSQL de aplicación.
* Persistencia entre reinicios.
* Ejecución de migraciones controlada.
* Usuario no root dentro del backend.

### Pruebas obligatorias

```bash
docker compose build
docker compose up -d
docker compose ps
docker compose logs backend
docker compose down
docker compose up -d
```

Verificar:

* La información persiste.
* NestJS se conecta.
* Las migraciones funcionan.
* Angular puede consumir `/api`.
* El backend responde en `/api/health`.

### Resultado esperado

Cualquier integrante debe poder levantar el sistema con:

```bash
docker compose up -d
```

sin instalar PostgreSQL manualmente.

---

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

---

# Fase 6 — Preparación del VPS

**Duración:** días 18 y 19.

Infraestructura disponible:

```text
Ubuntu 24.04
IP: 74.208.49.11
Subdominio: test.devlayerstudio.com
```

### Tus actividades

* Crear usuario de despliegue no root.
* Configurar autenticación SSH por clave.
* Desactivar acceso inseguro cuando se confirme que la clave funciona.
* Instalar Docker y Docker Compose.
* Configurar firewall:

```text
22 o puerto SSH configurado
80
443
```

* No abrir:

```text
5432
```

* Crear directorio de despliegue, por ejemplo:

```text
/opt/sistema-academico
```

* Crear `.env.production` en el VPS.
* Asignar permisos restringidos.
* Instalar o preparar Nginx.
* Confirmar que el DNS resuelve:

```text
test.devlayerstudio.com → 74.208.49.11
```

### Resultado esperado

El VPS debe estar listo para recibir imágenes sin contener el código fuente ni secretos en Git.

---

# Fase 7 — Nginx y HTTPS

**Duración:** día 20.

### Arquitectura objetivo

```text
Internet
→ test.devlayerstudio.com
→ Nginx
→ Angular
→ /api hacia NestJS
→ PostgreSQL privado
```

### Tus actividades

* Configurar Nginx.
* Redirigir HTTP a HTTPS.
* Obtener certificado SSL.
* Configurar proxy de:

```text
/api
```

hacia el contenedor del backend.

* Configurar los headers `X-Forwarded-*`.
* Definir tamaño máximo de cargas para futuros Excel.
* Validar:

```text
https://test.devlayerstudio.com
https://test.devlayerstudio.com/api/health
```

### Resultado esperado

Frontend y backend deben estar disponibles mediante HTTPS sin publicar directamente los puertos internos.

---

# Fase 8 — Despliegue continuo: CD

**Duración:** días 21 al 23.

### Flujo principal

```text
Merge a develop
→ CI
→ Crear imágenes
→ Publicar en GHCR
→ SSH al VPS
→ Backup
→ Pull de imágenes
→ Migraciones
→ Levantar servicios
→ Health check
→ Rollback si falla
```

### Workflow

Crear:

```text
.github/workflows/deploy-staging.yml
```

### Secretos de GitHub

```text
VPS_HOST
VPS_PORT
VPS_USER
VPS_SSH_KEY
DEPLOY_PATH
STAGING_URL
GHCR_TOKEN
```

El host confirmado será:

```text
74.208.49.11
```

La URL confirmada será:

```text
https://test.devlayerstudio.com
```

No debes inventar todavía:

* Puerto SSH.
* Usuario.
* Ruta final.

### Reglas del despliegue

* Solo `develop` despliega a staging.
* Las ramas `feature/*` no despliegan.
* Usar imágenes etiquetadas con el SHA del commit.
* No depender solamente de `latest`.
* Guardar el tag anterior.
* Ejecutar migraciones en un contenedor temporal.
* Detener el despliegue si la migración falla.
* Verificar `/api/health`.
* Restaurar el tag anterior si el servicio no inicia.
* Usar `concurrency` para impedir dos despliegues simultáneos.

### Resultado esperado

Después de un merge exitoso a `develop`, staging se actualiza automáticamente sin realizar despliegues manuales.

---

# Fase 9 — Backups y rollback

**Duración:** días 24 y 25.

### Archivos que debes crear

```text
scripts/backup.sh
scripts/restore.sh
scripts/verify-backup.sh
```

### Política inicial

```text
Diario: 7 días
Semanal: 4 semanas
Mensual: 12 meses
Antes de migraciones
Antes de importaciones masivas
```

### Pruebas

* Crear un backup.
* Calcular checksum.
* Revisar su contenido.
* Restaurarlo en una base limpia.
* Comparar conteos.
* Probar recuperación.
* Guardar evidencia.

### Rollback de aplicación

Debe permitir volver al tag Docker anterior.

### Rollback de base

No se debe confiar solamente en `migration:revert`. Cuando una migración pueda destruir información, el rollback real dependerá del backup previo.

### Resultado esperado

Debes demostrar que tanto el sistema como la base pueden recuperarse.

---

# Fase 10 — Documentación y evidencias

**Duración:** días 26 al 28.

### Documentos

* README técnico.
* Instalación local.
* Docker.
* Migraciones.
* CI/CD.
* Variables.
* VPS.
* Nginx.
* HTTPS.
* Backups.
* Restauración.
* Rollback.
* Plan DevOps.
* Guía de ejecución con checks.

### Evidencias

* CI exitoso.
* CI fallido por error intencional.
* Docker levantado.
* Migraciones aplicadas.
* Base creada desde cero.
* Imagen publicada.
* Despliegue automático.
* HTTPS.
* Health check.
* Backup.
* Restauración.
* Rollback.

---

# Resumen por semana

| Semana | Objetivo                                          |
| ------ | ------------------------------------------------- |
| 1      | Consolidación, SQL, entidades y migraciones       |
| 2      | Docker local, health check y entorno reproducible |
| 3      | CI, preparación del VPS, Nginx y HTTPS            |
| 4      | CD automático, backups, rollback y documentación  |

# Ruta crítica

El orden que no debes romper es:

```text
Base y migraciones
→ Docker local
→ Health check
→ CI
→ VPS
→ Nginx/HTTPS
→ CD
→ Backup y rollback
```

El **primer gran hito** será:

```text
Merge a develop
→ despliegue automático exitoso
→ test.devlayerstudio.com actualizado
```

La otra duda quedó incompleta en tu mensaje. Escríbela y la incorporamos al cronograma o a la arquitectura.

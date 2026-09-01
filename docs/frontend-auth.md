# 🔐 Frontend — Módulo de Autenticación

Sistema Académico Yavirac — `sistema-academico-frontend` (Angular 22).
Extracto del README de frontend correspondiente a **Authentication**. Documentos hermanos:
[`frontend-dashboard.md`](./frontend-dashboard.md), [`frontend-portafolio-docente.md`](./frontend-portafolio-docente.md).

---

## Arquitectura del Frontend

El proyecto utiliza una arquitectura modular basada en **Angular 22** y componentes independientes.

```text
src/app/
├── core/                         → Funcionalidades utilizadas por todo el sistema
├── modules/                      → Funcionalidades principales
│   ├── auth/                     → Login, seguridad y usuarios
│   ├── dashboard/                → Pantalla de inicio
│   └── portafolio-docente/       → Documentos del docente
└── shared/                       → Componentes y servicios compartidos
```

### 🛠️ Tecnologías

| Tecnología | Uso |
|---|---|
| **Angular 22** | Framework principal |
| **Standalone Components** | Componentes independientes |
| **Signals** | Manejo reactivo del estado |
| **TypeScript** | JavaScript tipado y seguro |
| **RxJS** | Datos asíncronos, peticiones HTTP y eventos |
| **Bootstrap 5** | Diseño responsive |
| **SCSS** | Estilos, variables, anidación y mixins |

---

# 🔐 1. Módulo de Autenticación

El módulo **Auth** funciona como el guardián del sistema.

### Responsabilidades

1. Permitir acceso únicamente con credenciales válidas.
2. Controlar permisos según el rol.
3. Gestionar inicio, cierre y persistencia de sesión.
4. Administrar cambio, recuperación y desbloqueo de contraseñas.
5. Permitir la generación masiva de usuarios para coordinadores.

## 👤 Roles

| Rol | Funciones principales |
|---|---|
| **ESTUDIANTE** | Consultar información y llenar documentos de fase práctica |
| **DOCENTE** | Gestionar el portafolio docente y consultar estudiantes |
| **COORDINADOR** | Administrar usuarios, generar accesos y desbloquear cuentas |
| **TUTOR_EMPRESARIAL** | Evaluar estudiantes durante la fase práctica |

## 🔑 Flujo de Login

```text
Usuario
   ↓
Correo + contraseña
   ↓
POST /api/auth/login
   ↓
Backend valida credenciales
   ↓
JWT + datos del usuario
   ↓
Frontend guarda información en localStorage
   ↓
¿Debe cambiar contraseña?
   ├── Sí → Cambio de contraseña
   └── No → Dashboard
```

El backend devuelve un **JWT**, los datos del usuario y un indicador que determina si debe cambiar su contraseña en el primer ingreso.

### 💾 Persistencia de sesión

Al iniciar nuevamente el navegador:

- El frontend busca el token en `localStorage`.
- Si existe, se utiliza para autenticar al usuario.
- Si no existe, se redirige al login.

## 🛡️ Control de acceso por roles

El control se realiza en dos capas:

### Frontend — UX

`roleGuard` permite ocultar opciones del menú y evitar que usuarios sin permisos accedan a determinadas pantallas.

> ⚠️ Los guards del frontend **no representan la seguridad real**.

### Backend — Seguridad

El backend valida los roles en cada endpoint mediante mecanismos como:

```text
@Roles('COORDINADOR')
```

Esto evita que un usuario pueda acceder a información protegida aunque manipule el frontend.

---

# 🎫 2. JWT e Interceptor HTTP

El **JSON Web Token (JWT)** funciona como una llave digital para identificar al usuario.

### Contenido del token

- ID del usuario
- Correo electrónico
- Roles
- Fecha de expiración

### Uso del JWT

Cada petición HTTP autenticada incluye:

```http
Authorization: Bearer {token}
```

### Token expirado

Cuando el backend responde con `401`:

1. El interceptor HTTP detecta el error.
2. Elimina el token.
3. Elimina los datos del usuario.
4. Redirige al login.

### Excepción: cambio de contraseña

La ruta `/cambiar-password` posee un tratamiento especial. Si responde `401`, el interceptor **no cierra la sesión**, permitiendo que el usuario pueda actualizar su contraseña aunque la anterior haya vencido.

---

# 👥 3. Generación de Accesos Masivos

Esta herramienta permite al **Coordinador** crear múltiples usuarios en una sola operación.

### Flujo

1. Seleccionar el tipo de usuario:
   - Estudiantes
   - Docentes
   - Empresas
2. Seleccionar el período académico.
3. El backend busca personas sin usuario.
4. Crea las cuentas.
5. Utiliza cédula/RUC como contraseña temporal.
6. Genera correos institucionales.
7. El frontend presenta un reporte.

### Reporte

El resultado muestra:

- Cantidad de usuarios creados.
- Correos generados.
- Errores encontrados.

---

# 🔓 4. Desbloqueo de Cuentas

Cuando un usuario se bloquea por múltiples intentos fallidos, el Coordinador puede restablecer su acceso.

### Proceso

```text
Correo / cédula
      ↓
Backend busca usuario
      ↓
Restablece contraseña temporal
      ↓
Marca cambio obligatorio
      ↓
Frontend muestra nueva contraseña
```

La contraseña temporal corresponde a la **cédula/RUC**.

---

# 🚦 Manejo de código HTTP `401` — No autorizado

Indica que el token es inválido o expiró.

El interceptor:

1. Elimina el token.
2. Elimina los datos del usuario.
3. Redirige al login.

**Excepción:** `/cambiar-password`.

---

# 🛡️ Seguridad

El sistema contempla varias capas de protección.

| Capa | Ubicación | Propósito |
|---|---|---|
| **JWT** | Frontend + Backend | Autenticar al usuario |
| **Roles** | Backend | Controlar permisos |
| **Validación** | Backend + Frontend | Garantizar datos correctos |
| **HTTPS** | Infraestructura | Cifrar comunicación |

### 1. Autenticación

Todo usuario necesita un token válido para realizar peticiones protegidas.

### 2. Autorización

Cada endpoint verifica el rol correspondiente.

### 3. Validación

El frontend valida para mejorar la experiencia, pero la validación principal debe realizarse en el backend.

### 4. CSRF

La protección CSRF no está implementada en el frontend según la documentación actual; se recomienda que sea gestionada por el backend.

---

# ✅ Buenas Prácticas de Angular

El proyecto sigue prácticas recomendadas de Angular 22, incluyendo:

- **Standalone Components**
- **Signals**
- **Lazy Loading**
- **HTTP Interceptors**
- **Route Guards**
- Arquitectura modular
- Separación entre funcionalidades principales y elementos compartidos

---

**Documentación basada en la información técnica proporcionada para el frontend del Sistema Académico Yavirac.**

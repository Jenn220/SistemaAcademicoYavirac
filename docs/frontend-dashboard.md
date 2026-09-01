# 📊 Frontend — Módulo Dashboard

Sistema Académico Yavirac — `sistema-academico-frontend` (Angular 22).
Extracto del README de frontend correspondiente a **Dashboard**. Documentos hermanos:
[`frontend-auth.md`](./frontend-auth.md), [`frontend-portafolio-docente.md`](./frontend-portafolio-docente.md).

---

# 📊 Dashboard

El Dashboard es la pantalla inicial después del inicio de sesión.

### Incluye

- 👋 Saludo personalizado.
- 📈 Estadísticas según el rol.
- 🏫 Información institucional.
- 🎯 Visión y valores.

## 📦 Datos Mock

Actualmente las estadísticas del Dashboard son **datos de ejemplo generados desde el frontend**.

Esto se debe a que el Dashboard está concebido principalmente como una pantalla de bienvenida y no como una herramienta de análisis profundo.

### Ejemplo — Coordinador

- 1248 estudiantes
- 86 docentes
- 12 carreras
- 256 materias

### Ejemplo — Docente

- 45 estudiantes
- 1 docente
- 3 carreras
- 4 materias

Las estadísticas se seleccionan según el rol obtenido mediante `AuthService`.

## 🎨 Diseño visual

El Dashboard utiliza:

- **Glassmorphism** en las tarjetas.
- Animaciones **fade up**.
- Efectos **hover**.
- Diseño responsive.

### Responsive

| Dispositivo | Distribución |
|---|---|
| 🖥️ Desktop | 4 columnas |
| 💻 Tablet | 2 columnas |
| 📱 Móvil | 1 columna |

---

## ❓ Preguntas frecuentes relacionadas

### ¿Por qué el Dashboard tiene datos falsos?

Porque funciona como pantalla de bienvenida y utiliza estadísticas de ejemplo para proporcionar contexto.

---

## 🚀 Mejoras futuras relacionadas

### 🖼️ Optimización de imágenes

Convertir imágenes a **WebP** para reducir el peso y mejorar el rendimiento.

### 🧪 Pruebas unitarias

Implementar y ampliar las pruebas unitarias aprovechando que **Vitest ya está configurado**.

---

**Documentación basada en la información técnica proporcionada para el frontend del Sistema Académico Yavirac.**

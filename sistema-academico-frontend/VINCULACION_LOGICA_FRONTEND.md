# Lógica del frontend de Vinculación

## 1. Objetivo del módulo
El módulo de Vinculación permite mostrar proyectos, registrar nuevos proyectos y gestionar los registros relacionados con el backend:
- proyectos de vinculación
- actividades del estudiante
- asistencia del tutor
- informes

## 2. Arquitectura utilizada
- Angular standalone components
- Servicios para encapsular llamadas HTTP
- Modelos TypeScript para tipar los datos
- Layout compartido para navbar, sidebar y hero

## 3. Flujo general
1. El usuario entra a la ruta /vinculacion.
2. El componente de lista consume el endpoint GET /vinculacion/estudiantes.
3. Cada proyecto se muestra en una tabla con su estado y botón de detalle.
4. Al hacer clic en Ver, se navega a /vinculacion/:id y el detalle consume /vinculacion/reporte/:id.
5. Desde la pantalla de nuevo proyecto, se envía un POST a /vinculacion/vinculacion-estudiante.
6. En las pantallas de actividades, asistencia e informes, el frontend consume los endpoints GET y POST correspondientes del backend.

## 4. Endpoints utilizados
### Proyectos
- GET /vinculacion/estudiantes -> lista de proyectos.
- POST /vinculacion/vinculacion-estudiante -> crear proyecto.
- GET /vinculacion/reporte/:id -> detalle del proyecto.

### Actividades
- GET /vinculacion/actividades-estudiante -> listar actividades.
- POST /vinculacion/actividad-estudiante -> registrar actividad.

### Asistencia tutor
- GET /vinculacion/asistencia-tutor -> listar asistencias.
- POST /vinculacion/asistencia-tutor -> registrar asistencia.

### Informes
- GET /vinculacion/informes -> listar informes.
- POST /vinculacion/informe -> registrar informe.

## 5. Lógica de negocio en el frontend
- El servicio VinculacionService centraliza todas las peticiones al backend.
- Los componentes se encargan de mostrar estados de carga y mensajes de éxito/error.
- El layout compartido evita repetir el navbar y sidebar en cada pantalla.
- Los datos del backend se transforman en objetos amigables para Angular antes de mostrarlos en la UI.

## 6. Puntos clave para la explicación
- La app depende de endpoints reales del backend de vinculación.
- El frontend no guarda datos de forma local; todo se obtiene o envía por HTTP.
- Cada pantalla tiene una responsabilidad específica:
  - lista: mostrar proyectos
  - detalle: mostrar información consolidada del proyecto
  - nuevo: registrar un proyecto
  - actividades: registrar actividad estudiantil
  - asistencia: registrar horas del tutor
  - informes: registrar informes de seguimiento

## 7. Nota de demo
Este frontend ya está preparado para demostrar:
- consulta de proyectos desde la base
- creación de un proyecto desde la interfaz
- registro de actividades, asistencia e informes

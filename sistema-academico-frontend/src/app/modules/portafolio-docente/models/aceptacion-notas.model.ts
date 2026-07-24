// ============================================================
// Aceptación de Notas — Formato 07
// Contrato REAL del backend (NestJS). No modificar estos tipos
// sin que el backend cambie primero (ver
// aceptacion-notas.controller.ts / dto/*.ts del backend).
// ============================================================

export type TipoReporteCanonico = 'APORTE_1' | 'APORTE_2' | 'SUPLETORIO';

// Alias válidos que acepta el POST (el backend los normaliza en
// tipo-reporte.util.ts). Usamos directamente estos valores en el <select>.
export type TipoReporteAlias =
  | 'PARCIAL UNO'
  | 'PARCIAL DOS'
  | 'EXAMEN SUPLETORIO';

export interface CreateReporteNotasDto {
  id_periodo: number;
  id_oferta_asignatura: number;
  tipo_reporte: TipoReporteAlias;
}

export interface NotaEstudianteDto {
  id_aceptacion: number;
  nota: number; // 0-10
}

export interface UpdateNotasAceptacionDto {
  estudiantes: NotaEstudianteDto[];
}

export interface ReporteDto {
  id_reporte_notas: number;
  carrera: string;
  nivel: string;
  asignatura: string;
  paralelo: string;
  jornada: string;
  docente: string;
  periodo: string;
  tipo_reporte: string;
  fecha_generacion: string;
}

export interface EstudianteAceptacionDto {
  id_aceptacion: number;
  cedula: string;
  // El backend concatena nombres + apellidos en un solo string.
  // El PDF los separa en dos columnas, pero no hay forma confiable
  // de partir este string sin arriesgar errores de parseo, así que
  // en el front se muestra como una sola columna "Nombre y Apellido".
  estudiante: string;
  nota_registrada: number | null;
  estado_aceptacion: string;
  fecha_aceptacion: string | null;
}

export interface ReporteNotasResponseDto {
  reporte: ReporteDto;
  estudiantes: EstudianteAceptacionDto[];
}

// ============================================================
// Campos que aparecen en el PDF pero NO existen en el contrato
// del backend (asistencia, observación, nombre del coordinador).
// Se guardan SOLO en el navegador (localStorage), atados al
// id_reporte_notas real, y jamás se envían al servidor.
// Cuando el backend agregue estos campos, esto se elimina.
// ============================================================
export interface CamposLocalesEstudiante {
  asistencia: number | null; // %
  observacion: string;
}

export interface CamposLocalesReporte {
  nombreCoordinador: string;
  estudiantes: Record<number, CamposLocalesEstudiante>; // key = id_aceptacion
}

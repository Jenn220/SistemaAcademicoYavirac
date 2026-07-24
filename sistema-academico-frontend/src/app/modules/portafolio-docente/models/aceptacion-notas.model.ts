export const TIPOS_REPORTE = [
  { valor: 'APORTE_1', etiqueta: 'PARCIAL UNO' },
  { valor: 'APORTE_2', etiqueta: 'PARCIAL DOS' },
  { valor: 'SUPLETORIO', etiqueta: 'EXAMEN SUPLETORIO' },
] as const;

export type TipoReporte = (typeof TIPOS_REPORTE)[number]['valor'];

export interface ReporteDto {
  id_reporte_notas: number;
  carrera: string;
  nivel: string;
  asignatura: string;
  paralelo: string;
  jornada: string;
  docente: string;
  coordinador: string | null;
  periodo: string;
  tipo_reporte: string;
  fecha_generacion: string;
}

export interface EstudianteAceptacionDto {
  id_aceptacion: number;
  cedula: string;
  estudiante: string;
  nota_registrada: number | null;
  estado_aceptacion: string;
  fecha_aceptacion: string | null;
}

export interface ReporteNotasResponseDto {
  reporte: ReporteDto;
  estudiantes: EstudianteAceptacionDto[];
}

export interface CreateReporteNotasDto {
  id_periodo: number;
  id_oferta_asignatura: number;
  tipo_reporte: string;
}

export interface NotaEstudianteDto {
  id_aceptacion: number;
  nota: number;
}

export interface UpdateNotasAceptacionDto {
  estudiantes: NotaEstudianteDto[];
}

/**
 * Campos que el PDF (Formato 07) pide pero que el backend NO expone
 * ni persiste (asistencia, firma, observación). Se manejan solo en el
 * frontend para completar la vista/impresión; no se envían al backend
 * porque no existe ningún endpoint/columna para ellos.
 */
export interface CamposManualesEstudiante {
  id_aceptacion: number;
  asistencia: number | null;
  observacion: string;
}

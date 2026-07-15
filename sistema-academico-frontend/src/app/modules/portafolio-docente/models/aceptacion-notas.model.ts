export type TipoReporteCanonico = 'APORTE_1' | 'APORTE_2' | 'SUPLETORIO';
export type TipoReporteAlias =
  | 'PARCIAL UNO' | 'APORTE_1'
  | 'PARCIAL DOS' | 'APORTE_2'
  | 'SUPLETORIO' | 'EXAMEN SUPLETORIO';

export interface CreateReporteNotasDto {
  id_periodo: number;
  id_oferta_asignatura: number;
  tipo_reporte: TipoReporteAlias;
}

// Tal cual lo devuelve el backend real (contrato oficial, no tocar)
export interface EstudianteAceptacion {
  id_aceptacion: number;
  cedula: string;
  estudiante: string; // "NOMBRES APELLIDOS" concatenado por el backend
  nota_registrada: number | null;
  estado_aceptacion: string;
  fecha_aceptacion: string | null;
}

export interface ReporteNotasResponse {
  reporte: {
    carrera: string;
    nivel: string;
    asignatura: string;
    paralelo: string;
    jornada: string;
    docente: string;
    periodo: string;
    tipo_reporte: string;
    fecha_generacion: string;
  };
  estudiantes: EstudianteAceptacion[];
}

// Extensión SOLO de frontend — el PDF muestra Asistencia/Firma/Observación,
// pero el backend NO las persiste (ver README del módulo). Se muestran con
// datos mock hasta que se decida agregarlas a la BD.
export interface EstudianteAceptacionVista extends EstudianteAceptacion {
  nombre: string;
  apellido: string;
  asistencia: number;
  observacion: string;
}
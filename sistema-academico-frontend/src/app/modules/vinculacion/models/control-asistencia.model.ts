// modules/vinculacion/models/control-asistencia.model.ts
export interface ActividadEstudiante {
  id: number;
  fecha: string;
  hora_entrada: string;
  hora_salida: string;
  total_horas: number;
  descripcion: string;
}

export interface CabeceraAsistencia {
  carrera: string;
  entidad_beneficiaria: string;
  estudiante: string;
  nombre_proyecto: string;
  docente_tutor: string;
  tutor_entidad_receptora: string;
  periodo_academico: string;
}

export interface AsistenciaEstudianteResponse {
  cabecera: CabeceraAsistencia;
  actividades: ActividadEstudiante[];
  totales: {
    total_horas: number;
    observaciones: string;
  };
}
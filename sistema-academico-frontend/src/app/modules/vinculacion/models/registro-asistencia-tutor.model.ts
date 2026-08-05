// modules/vinculacion/models/registro-asistencia-tutor.model.ts
export interface AsistenciaTutor {
  id: number;
  fecha: string;
  hora_entrada: string;
  hora_salida: string;
  total_horas: number;
  actividad_realizada: string;
}

export interface AsistenciaTutorResponse {
  cabecera: {
    carrera: string;
    institucion: string;
    docente_tutor: string;
    periodo_academico: string;
  };
  actividades: AsistenciaTutor[];
  totales: {
    suma_total_horas: number;
    observaciones: string;
    coordinador_carrera: string;
  };
}
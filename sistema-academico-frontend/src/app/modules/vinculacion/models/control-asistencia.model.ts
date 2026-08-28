export interface ActividadEstudiante {
  id: number;
  fecha: string;
  hora_entrada: string;
  hora_salida: string;
  total_horas: number;
  descripcion: string;
}
export interface ActividadAgrupada {
  ids: number[];
  fechas: string[];
  textoFechas: string;
  hora_entrada: string;
  hora_salida: string;
  total_horas: number;
  descripcion: string;
 actividadRepresentativa: ActividadEstudiante;
   actividadesDetalle: ActividadEstudiante[]; // 👈 Asegúrate de que esta línea esté aquí
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

export interface CreateActividadEstudianteDto {
  id_vinculacion?: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  actividades_realizadas: string;
  observacion?: string;
  resultado_aprendizaje?: string;
}

export interface UpdateActividadEstudianteDto {
  fecha?: string;
  hora_inicio?: string;
  hora_fin?: string;
  actividades_realizadas?: string;
  resultado_aprendizaje?: string;

  
}
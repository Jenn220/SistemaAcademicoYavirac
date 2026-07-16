export interface VinculacionActividad {
  fecha: string;
  hora_entrada: string;
  hora_salida: string;
  total_horas: number;
  actividad_realizada: string;
}

export interface ProyectoVinculacion {
  id: number;
  nombre: string;
  tutor: string;
  estado: 'Activo' | 'En ejecución' | 'Finalizado' | 'N/A' | string;
  estudiantes: number;
  descripcion?: string;
  carrera?: string;
  entidad_beneficiaria?: string;
  estudiante?: string;
  docente_tutor?: string;
  tutor_entidad_receptora?: string;
  periodo_academico?: string;
  actividades?: VinculacionActividad[];
  total_horas?: number;
  observaciones?: string;
}

export interface CrearProyectoVinculacionPayload {
  id_periodo: number;
  id_matricula_detalle: number;
  id_empresa: number;
  id_docente: number;
  nombre_proyecto: string;
  fecha_inicio: string;
  fecha_fin: string;
  total_horas_estudiante?: number;
  total_horas_docente?: number;
  estado?: string;
}

export interface ActividadEstudiantePayload {
  id_vinculacion: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  horas_total: number;
  actividades_realizadas: string;
}

export interface AsistenciaTutorPayload {
  id_vinculacion: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  horas_total: number;
  observaciones?: string;
}

export interface InformePayload {
  id_vinculacion: number;
  fecha_informe: string;
  actividad_macro: string;
  resultado_aprendizaje: string;
}

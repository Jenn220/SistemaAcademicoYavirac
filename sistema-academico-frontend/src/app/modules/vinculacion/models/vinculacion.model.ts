export interface VinculacionEstudiante {
  id_vinculacion: string;
  id_periodo: string;
  id_matricula_detalle: string;
  id_empresa: string;
  id_docente: string;
  id_entidad_receptora: string | null;
  nombre_proyecto: string;
  fecha_inicio: string;
  fecha_fin: string;
  total_horas_estudiante: number;
  total_horas_docente: number;
  estado: string;
}

export interface EstudianteDocente {
  id_vinculacion: number;
  estudiante: string;
  cedula: string;
  carrera: string;
  nombre_proyecto: string;
  entidad_beneficiaria: string;
  periodo_academico?: string; 
  nota_final: number | null;
  estado_informe: string;
}
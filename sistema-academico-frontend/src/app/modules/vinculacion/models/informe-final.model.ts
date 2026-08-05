export interface ActividadInforme {
  fecha: string;
  actividades: string;
  horas_cumplidas: number;
  observaciones: string;
}

export interface ObjetivoInforme {
  objetivo: string;
  actividades: string;
  avance: string;
  resultados: string;
}

export interface InformeFinal {
  datos_generales: {
    carrera: string;
    fecha_informe: string;
    estudiante: string;
    cedula: string;
    email: string;
    telefono: string;
    nombre_proyecto: string;
    fecha_inicio: string;
    fecha_final: string;
    entidad_beneficiaria: string;
    direccion_entidad: string;
    telefono_entidad: string;
    email_entidad: string;
    tutor_entidad: string;
    docente_tutor: string;
  };
  resumen_actividades: ActividadInforme[];
  total_horas_cumplidas: number;
  objetivos_proyecto: ObjetivoInforme[];
  reflexion_estudiante: string;
  evaluacion_final: {
    nota_final: string;
    nota_letras: string;
    observaciones: string;
    coordinador: string;
  };
}
export interface InformeFinalResponse {
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
  resumen_actividades: Array<{
    fecha: string;
    actividades: string;
    horas_cumplidas: number;
    observaciones: string;
  }>;
  total_horas_cumplidas: number;
  objetivos_proyecto: Array<{
    objetivo: string;
    actividades: string;
    avance: string;
    resultados: string;
  }>;
  reflexion_estudiante: string;
  evaluacion_final: {
    nota_final: number | string;
    nota_letras: string;
    observaciones: string;
    coordinador: string;
    // ✅ PARÁMETROS DE EVALUACIÓN
    parametros?: {
      puntualidad: number;
      trabajo_autonomo: number;
      asistencia: number;
      etica_profesional: number;
      cumple_tareas: number;
      actitud_proactiva: number;
      coopera_permanentemente: number;
      respeto_autoridad: number;
      constancia_predisposicion: number;
      responsabilidad_esmero: number;
      habilidad_practica: number;
    };
  };
}
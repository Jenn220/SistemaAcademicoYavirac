export interface ActividadPlan {
  id: number;
  fecha: string;
  actividad: string;
  resultado_aprendizaje: string;
}

export interface PlanAprendizaje {
  cabecera: {
    fundacion: string;
    nivel: string;
    estudiante: string;
    cedula: string;
    ciclo_academico: string;
    asignatura_1: string;
    asignatura_2: string;
    inicia: string;
    finaliza: string;
    docente_tutor: string;
    titulo_proyecto: string;
  };
  informe_actividades: ActividadPlan[];
  reflexion_estudiante?: string;  
}
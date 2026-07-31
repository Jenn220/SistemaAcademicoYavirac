// ============================================================
// Plan Marco de Formación (Formato 03) y Plan de Rotación
// (Formato 04). Los edita el ESTUDIANTE (autoservicio, resuelve
// su práctica vía /mi-practica); DOCENTE/COORDINADOR/
// TUTOR_EMPRESARIAL solo consultan en modo lectura — necesitan
// elegir de una lista qué estudiante ver, por eso las páginas
// siguen recibiendo idPractica por ruta en vez de autocargar
// igual que el resto de documentos del módulo.
// ============================================================

export interface PracticaSelector {
  id_practica: number;
  estado?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  /** id_docente asignado en crudo — para preseleccionarlo en Asignaciones. */
  id_docente?: number;
  empresa?: {
    id_empresa: number;
    razon_social: string;
    direccion?: string;
  };
  tutor_empresarial?: {
    id_tutor_empresarial: number;
    nombres: string;
    apellidos: string;
  };
  /** A qué estudiante pertenece la práctica — para buscar/filtrar en el selector. */
  estudiante?: {
    id_estudiante: number;
    nombre: string;
    cedula: string;
  } | null;
}

export interface PlanMarcoFormacion {
  id_plan_marco?: number;
  id_practica: number;
  id_nivel?: number;
  horas_formacion?: number;
  objetivos_fase_practica?: string;
  id_nucleo_estructurante?: number;
  estado?: string;
}

export interface ItemPlanMarco {
  id_item_pm?: number;
  id_plan_marco?: number;
  resultado_aprendizaje: string;
  nivel_logro_esperado: number;
  tareas_laborales?: string;
  puesto_aprendizaje?: string;
  semanas?: number;
  responsable_puesto?: string;
  /** Nivel real alcanzado, cargado desde evaluacion_plan_marco. */
  nivel_real_alcanzado?: number;
  /** id_evaluacion_pm si ya existe una evaluación guardada para este ítem. */
  id_evaluacion_pm?: number;
}

export interface EvaluacionPlanMarco {
  id_evaluacion_pm?: number;
  id_practica: number;
  id_item_pm: number;
  nivel_real_alcanzado?: number;
}

export interface PlanRotacion {
  id_plan_rotacion?: number;
  id_practica: number;
  id_item_pm: number;
  puesto_aprendizaje?: string;
}

export interface PlanRotacionSemana {
  id_rotacion_semana?: number;
  id_plan_rotacion: number;
  semana: number;
}

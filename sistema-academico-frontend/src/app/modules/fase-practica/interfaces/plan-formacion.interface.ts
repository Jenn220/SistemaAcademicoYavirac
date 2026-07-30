// ============================================================
// Plan Marco de Formación (Formato 03) y Plan de Rotación
// (Formato 04). A diferencia del resto de documentos de este
// módulo, estos dos NO se autocargan desde el JWT del usuario:
// el back los expone como CRUD puro sobre id_practica /
// id_plan_marco, restringido a DOCENTE y COORDINADOR
// (ver PlanMarcoController / ItemPlanMarcoController /
// PlanRotacionSemanaController en el back). Por eso la vista
// necesita un selector de práctica en vez de autocargar.
// ============================================================

export interface PracticaSelector {
  id_practica: number;
  estado?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
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
  /**
   * Nivel real alcanzado (columna del PDF). El back tiene la entidad
   * evaluacion_plan_marco creada pero SIN controller/service todavía,
   * así que este campo vive solo en el front por ahora: se muestra
   * pero no se envía al guardar. Quitar el disabled del input en
   * plan-marco.html en cuanto exista el endpoint.
   */
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

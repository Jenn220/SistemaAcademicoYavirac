export class EvaluacionEmpresaResponseDto {
  id_evaluacion_empresa!: number;
  id_practica!: number;
  id_evaluacion_plan_marco!: number;
  observaciones?: string;
  calificacion?: number;
  fortalezas?: string;
  oportunidades_mejora?: string;
  recomendaciones?: string;
}

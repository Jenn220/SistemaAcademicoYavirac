export class PracticaResponseDto {
  id_practica!: number;
  id_periodo!: number;
  id_matricula_detalle!: number;
  id_empresa!: number;
  id_tutor_empresarial!: number;
  id_docente!: number;
  total_horas_requeridas!: number;
  total_horas_cumplidas!: number;
  estado!: string;
  id_periodo_carrera?: number;
  id_carrera?: number;
  codigo_periodo?: string;
  estado_periodo_carrera?: string;
  carrera?: string;
}

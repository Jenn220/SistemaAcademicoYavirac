export class PlanRotacionResponseDto {
  id_plan_rotacion!: number;
  id_practica!: number;
  fecha_inicio!: string;
  fecha_fin!: string;
  actividades?: string;
}

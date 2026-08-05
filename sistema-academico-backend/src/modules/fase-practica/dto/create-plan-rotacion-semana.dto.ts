import { IsBoolean, IsNumber, Min, IsOptional } from 'class-validator';

export class CreatePlanRotacionSemanaDto {
  @IsNumber()
  id_plan_rotacion: number;

  @IsNumber()
  @Min(1)
  semana!: number;

  @IsOptional()
  @IsNumber()
  id_item_pm?: number;

  @IsOptional()
  @IsBoolean()
  es_defensa_proyecto?: boolean;
}

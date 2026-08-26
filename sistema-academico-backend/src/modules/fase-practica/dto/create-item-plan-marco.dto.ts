import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateItemPlanMarcoDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  id_plan_marco?: number;

  @IsString()
  resultado_aprendizaje: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  nivel_logro_esperado?: number;

  @IsOptional()
  @IsString()
  tareas_laborales?: string;

  @IsOptional()
  @IsString()
  puesto_aprendizaje?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  semanas?: number;

  @IsOptional()
  @IsString()
  responsable_puesto?: string;
}

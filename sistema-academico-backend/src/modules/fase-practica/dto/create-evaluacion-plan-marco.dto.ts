import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class CreateEvaluacionPlanMarcoDto {
  @IsInt()
  id_practica: number;

  @IsInt()
  id_item_pm: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  nivel_real_alcanzado?: number;
}

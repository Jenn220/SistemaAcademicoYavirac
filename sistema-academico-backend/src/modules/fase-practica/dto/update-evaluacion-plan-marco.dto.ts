import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdateEvaluacionPlanMarcoDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  nivel_real_alcanzado?: number;
}

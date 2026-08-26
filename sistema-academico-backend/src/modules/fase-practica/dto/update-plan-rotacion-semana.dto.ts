import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdatePlanRotacionSemanaDto {
  @IsOptional()
  @IsNumber()
  id_plan_rotacion?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  semana?: number;
}

import { IsNumber, Min, IsOptional } from 'class-validator';

export class CreatePlanRotacionSemanaDto {
  @IsOptional()
  @IsNumber()
  id_plan_rotacion?: number;

  @IsNumber()
  @Min(1)
  semana!: number;
}

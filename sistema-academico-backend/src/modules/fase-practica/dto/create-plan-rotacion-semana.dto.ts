import { IsNumber, Min } from 'class-validator';

export class CreatePlanRotacionSemanaDto {
  @IsNumber()
  id_plan_rotacion: number;

  @IsNumber()
  @Min(1)
  semana!: number;
}

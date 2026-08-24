import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreateEvaluacionInstitutoDto {
  @IsNumber()
  @Min(1)
  id_practica!: number;

  @IsNumber()
  @Min(1)
  id_evaluacion_plan_marco!: number;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  calificacion?: number;
}

export class UpdateEvaluacionInstitutoDto {
  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  calificacion?: number;
}

export class EvaluacionInstitutoResponseDto {
  id_evaluacion_instituto!: number;
  id_practica!: number;
  id_evaluacion_plan_marco!: number;
  observaciones?: string;
  calificacion?: number;
}

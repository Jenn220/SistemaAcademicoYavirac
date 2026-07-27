import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateEvaluacionInstitutoDto {
  @IsNumber()
  id_practica!: number;

  @IsNumber()
  id_evaluacion_plan_marco!: number;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsNumber()
  calificacion?: number;
}

export class UpdateEvaluacionInstitutoDto {
  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsNumber()
  calificacion?: number;
}

export class EvaluacionInstitutoResponseDto {
  id_evaluacion_instituto!: number;
  id_practica!: number;
  id_evaluacion_plan_marco!: number;
  observaciones?: string;
  calificacion?: number;
}

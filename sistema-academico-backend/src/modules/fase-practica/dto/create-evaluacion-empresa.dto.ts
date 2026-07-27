import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateEvaluacionEmpresaDto {
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

  @IsOptional()
  @IsString()
  fortalezas?: string;

  @IsOptional()
  @IsString()
  oportunidades_mejora?: string;

  @IsOptional()
  @IsString()
  recomendaciones?: string;
}

export class UpdateEvaluacionEmpresaDto {
  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsNumber()
  calificacion?: number;

  @IsOptional()
  @IsString()
  fortalezas?: string;

  @IsOptional()
  @IsString()
  oportunidades_mejora?: string;

  @IsOptional()
  @IsString()
  recomendaciones?: string;
}

export class EvaluacionEmpresaResponseDto {
  id_evaluacion_empresa!: number;
  id_practica!: number;
  id_evaluacion_plan_marco!: number;
  observaciones?: string;
  calificacion?: number;
  fortalezas?: string;
  oportunidades_mejora?: string;
  recomendaciones?: string;
}

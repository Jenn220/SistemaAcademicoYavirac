import { IsOptional, IsNumber, IsString } from 'class-validator';

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

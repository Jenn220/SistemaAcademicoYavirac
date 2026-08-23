import { IsNumber, IsOptional, IsString, Max, MaxLength } from 'class-validator';

export class UpdateDetalleEvaluacionDto {
  @IsOptional()
  @IsNumber()
  id_evaluacion?: number;

  @IsOptional()
  @IsNumber()
  id_item?: number;

  @IsOptional()
  @IsNumber()
  @Max(10)
  puntaje_asignado?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  tipo_criterio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  nivel_calificacion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacion?: string;
}

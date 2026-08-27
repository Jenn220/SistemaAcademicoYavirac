import { IsNumber, IsOptional, IsString, MaxLength, Max, Min } from 'class-validator';

export class CreateDetalleEvaluacionDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  id_evaluacion?: number;

  @IsNumber()
  @Min(1)
  id_item!: number;

  @IsNumber()
  @Max(10)
  puntaje_asignado!: number;

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

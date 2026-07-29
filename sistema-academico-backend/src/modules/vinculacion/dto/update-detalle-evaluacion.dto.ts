import { IsNumber, IsOptional } from 'class-validator';

export class UpdateDetalleEvaluacionDto {
  @IsOptional()
  @IsNumber()
  idEvaluacionVinc?: number;

  @IsOptional()
  @IsNumber()
  idItem?: number;

  @IsOptional()
  @IsNumber()
  puntajeAsignado?: number;
}
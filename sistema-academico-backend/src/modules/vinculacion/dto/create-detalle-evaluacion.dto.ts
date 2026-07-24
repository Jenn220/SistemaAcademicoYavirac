import { IsNumber } from 'class-validator';

export class CreateDetalleEvaluacionDto {
  @IsNumber()
  idEvaluacionVinc: number;

  @IsNumber()
  idItem: number;

  @IsNumber()
  puntajeAsignado: number;
}
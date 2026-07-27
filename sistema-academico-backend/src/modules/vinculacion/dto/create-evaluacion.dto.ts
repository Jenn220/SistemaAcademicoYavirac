import { IsNumber, IsDateString } from 'class-validator';

export class CreateEvaluacionDto {
  @IsNumber()
  idVinculacion: number;

  @IsNumber()
  idRubrica: number;

  @IsNumber()
  notaFinal: number;

  @IsDateString()
  fechaEvaluacion: string; // Recibe formato 'YYYY-MM-DD'
}
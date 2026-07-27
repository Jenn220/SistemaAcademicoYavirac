import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class UpdateEvaluacionDto {
  @IsOptional()
  @IsString()
  idVinculacion?: string;

  @IsOptional()
  @IsString()
  idRubrica?: string;

  @IsOptional()
  @IsNumber()
  notaFinal?: number;

  @IsOptional()
  @IsDateString()
  fechaEvaluacion?: string;
}
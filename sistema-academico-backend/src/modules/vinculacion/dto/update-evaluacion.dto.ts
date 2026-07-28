import { IsString, IsOptional, IsNumber, IsDateString, IsInt } from 'class-validator';

export class UpdateEvaluacionDto {
  @IsOptional()
  @IsString()
  idVinculacion?: string;

  @IsInt()
  @IsOptional()
  id_entidad_receptora?: number;
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
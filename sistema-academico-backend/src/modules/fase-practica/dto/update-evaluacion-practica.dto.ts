import { IsDateString, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateEvaluacionPracticaDto {
  @IsOptional()
  @IsNumber()
  id_practica?: number;

  @IsOptional()
  @IsNumber()
  id_rubrica?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  tipo_evaluador?: string;

  @IsOptional()
  @IsNumber()
  nota_final_calculada?: number;

  @IsOptional()
  @IsDateString()
  fecha_evaluacion?: string;
}

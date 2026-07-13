import { IsDateString, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateEvaluacionPracticaDto {
  @IsNumber()
  id_practica!: number;

  @IsNumber()
  id_rubrica!: number;

  @IsString()
  @MaxLength(50)
  tipo_evaluador!: string;

  @IsOptional()
  @IsNumber()
  nota_final_calculada?: number;

  @IsOptional()
  @IsDateString()
  fecha_evaluacion?: string;
}

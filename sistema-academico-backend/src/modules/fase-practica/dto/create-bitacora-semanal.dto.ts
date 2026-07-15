import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBitacoraSemanalDto {
  @IsNumber()
  id_informe!: number;

  @IsNumber()
  semana!: number;

  @IsOptional()
  @IsDateString()
  fecha_inicio_semana?: string;

  @IsOptional()
  @IsDateString()
  fecha_fin_semana?: string;

  @IsOptional()
  @IsString()
  puesto_aprendizaje?: string;

  @IsOptional()
  @IsString()
  actividades_realizadas?: string;

  @IsOptional()
  @IsString()
  actividades_autonomas?: string;
}

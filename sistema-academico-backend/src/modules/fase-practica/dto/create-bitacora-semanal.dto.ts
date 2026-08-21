import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBitacoraSemanalDto {
  @IsNumber()
  id_informe!: number;

  @IsNumber()
  semana!: number;

  @IsOptional()
  @IsString()
  fecha_inicio_semana?: string;

  @IsOptional()
  @IsString()
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

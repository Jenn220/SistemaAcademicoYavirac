import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateBitacoraSemanalDto {
  @IsNumber()
  @Min(1)
  id_informe!: number;

  @IsNumber()
  @Min(1)
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

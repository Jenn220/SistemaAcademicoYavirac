import { IsOptional, IsString, Min } from 'class-validator';

export class UpdatePlanMarcoDto {
  @IsOptional()
  @IsInt()
  horas_formacion?: number;

  @IsOptional()
  @IsString()
  objetivos_fase_practica?: string;

  @IsOptional()
  @IsInt()
  id_nucleo_estructurante?: number;

  @IsOptional()
  @IsString()
  estado?: string;
}

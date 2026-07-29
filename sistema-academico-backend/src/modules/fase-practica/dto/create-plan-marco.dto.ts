import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreatePlanMarcoDto {
  @IsInt()
  id_practica: number;

  @IsOptional()
  @IsInt()
  horas_formacion?: number;

  @IsOptional()
  @IsString()
  objetivos_fase_practica?: string;

  @IsOptional()
  @IsInt()
  id_nucleo_estructurante?: number;
}

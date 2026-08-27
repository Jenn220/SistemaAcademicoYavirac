import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePlanMarcoDto {
  @IsNumber()
  @Min(1)
  id_practica!: number;

  @IsOptional()
  @IsInt()
  horas_formacion?: number;

  @IsOptional()
  @IsString()
  objetivos_fase_practica?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  id_nucleo_estructurante?: number;

  @IsOptional()
  @IsString()
  estado?: string;
}

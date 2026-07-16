import { IsInt, IsString, IsDateString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateVinculacionDto {
  @IsInt()
  @IsNotEmpty()
  id_periodo: number;

  @IsInt()
  @IsNotEmpty()
  id_matricula_detalle: number;

  @IsInt()
  @IsNotEmpty()
  id_empresa: number;

  @IsInt()
  @IsNotEmpty()
  id_docente: number;

  @IsString()
  @IsNotEmpty()
  nombre_proyecto: string;

  @IsDateString()
  @IsNotEmpty()
  fecha_inicio: string;

  @IsDateString()
  @IsNotEmpty()
  fecha_fin: string;

  @IsNumber()
  @IsOptional()
  total_horas_estudiante?: number;

  @IsNumber()
  @IsOptional()
  total_horas_docente?: number;

  @IsString()
  @IsOptional()
  estado?: string;
}

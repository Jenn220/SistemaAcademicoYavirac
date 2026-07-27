import { IsString, IsOptional, IsDateString, IsNumber } from 'class-validator';

export class UpdateVinculacionEstudianteDto {
  @IsOptional()
  @IsString()
  id_periodo?: string;

  @IsOptional()
  @IsString()
  id_matricula_detalle?: string;

  @IsOptional()
  @IsString()
  id_empresa?: string;

  @IsOptional()
  @IsString()
  id_docente?: string;

  @IsOptional()
  @IsString()
  nombre_proyecto?: string;

  @IsOptional()
  @IsDateString()
  fecha_inicio?: string;

  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  @IsOptional()
  @IsNumber()
  total_horas_estudiante?: number;

  @IsOptional()
  @IsNumber()
  total_horas_docente?: number;

  @IsOptional()
  @IsString()
  estado?: string;
}
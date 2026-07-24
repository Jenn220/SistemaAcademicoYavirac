export class UpdateVinculacionDto {}
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateActividadEstudianteDto {
  @IsOptional()
  @IsString()
  fecha?: string;

  @IsOptional()
  @IsString()
  hora_inicio?: string;

  @IsOptional()
  @IsString()
  hora_fin?: string;

  @IsOptional()
  @IsNumber()
  horas_total?: number;

  @IsOptional()
  @IsString()
  actividades_realizadas?: string;

  @IsOptional()
  @IsString()
  resultado_aprendizaje?: string;
}
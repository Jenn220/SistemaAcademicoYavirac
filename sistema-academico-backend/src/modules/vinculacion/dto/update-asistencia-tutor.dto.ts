import { IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateAsistenciaTutorDto {
  @IsOptional()
  @IsNumber()
  id_vinculacion?: number;

  @IsOptional()
  @IsDateString()
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

  // 🔴 AGREGAR ESTE CAMPO FALTANTE
  @IsOptional()
  @IsString()
  actividad_realizada?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
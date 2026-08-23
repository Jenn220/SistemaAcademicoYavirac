import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateRegistroDiarioDto {
  @IsOptional()
  @IsNumber()
  id_practica?: number;

  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsOptional()
  @IsString()
  hora_ingreso?: string;

  @IsOptional()
  @IsString()
  hora_salida_almuerzo?: string;

  @IsOptional()
  @IsString()
  hora_regreso_almuerzo?: string;

  @IsOptional()
  @IsString()
  hora_salida?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsBoolean()
  firma_estudiante?: boolean;
}

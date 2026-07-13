import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRegistroDiarioDto {
  @IsNumber()
  id_practica!: number;

  @IsDateString()
  fecha!: string;

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

import { IsInt, IsString, IsDateString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateAsistenciaTutorDto {
  @IsInt()
  @IsNotEmpty()
  id_vinculacion: number;

  @IsDateString()
  @IsNotEmpty()
  fecha: string; // Formato esperado por Postgres: 'YYYY-MM-DD'

  @IsString()
  @IsNotEmpty()
  hora_inicio: string; // Formato esperado: 'HH:MM:SS' o 'HH:MM'

  @IsString()
  @IsNotEmpty()
  hora_fin: string; // Formato esperado: 'HH:MM:SS' o 'HH:MM'

  @IsNumber()
  @IsNotEmpty()
  horas_total: number; // Acepta decimales, ej: 2.50

  @IsString()
  @IsOptional()
  observaciones?: string;
}
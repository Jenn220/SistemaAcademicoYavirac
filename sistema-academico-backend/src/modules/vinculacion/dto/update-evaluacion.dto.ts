import { IsString, IsOptional, IsNumber, IsDateString, IsInt } from 'class-validator';

export class UpdateEvaluacionDto {
  @IsOptional()
  @IsString()
  idVinculacion?: string;

  @IsInt()
  @IsOptional()
  id_entidad_receptora?: number;

  @IsOptional()
  @IsString()
  idRubrica?: string;

  @IsOptional()
  @IsNumber()
  notaFinal?: number;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsDateString()
  fechaEvaluacion?: string;

  // ✅ PARÁMETROS DE EVALUACIÓN DEL TUTOR (11 PARÁMETROS)
  @IsOptional()
  @IsNumber()
  puntualidad?: number;

  @IsOptional()
  @IsNumber()
  trabajo_autonomo?: number;

  @IsOptional()
  @IsNumber()
  asistencia?: number;

  @IsOptional()
  @IsNumber()
  etica_profesional?: number;

  @IsOptional()
  @IsNumber()
  cumple_tareas?: number;

  @IsOptional()
  @IsNumber()
  actitud_proactiva?: number;

  @IsOptional()
  @IsNumber()
  coopera_permanentemente?: number;

  @IsOptional()
  @IsNumber()
  respeto_autoridad?: number;

  @IsOptional()
  @IsNumber()
  constancia_predisposicion?: number;

  @IsOptional()
  @IsNumber()
  responsabilidad_esmero?: number;

  @IsOptional()
  @IsNumber()
  habilidad_practica?: number;
}
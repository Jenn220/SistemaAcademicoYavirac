import { IsNumber, IsOptional, IsString, MaxLength, Max } from 'class-validator';

export class CreateDetalleEvaluacionDto {
  // El controller siempre toma id_evaluacion de la URL (POST
  // evaluaciones/:idEvaluacion/detalles) y lo sobrescribe en el body antes
  // de llamar al service; exigirlo aquí solo rompía las creaciones que no
  // lo mandan en el body (p.ej. evaluacion-instituto.ts, cuyo servicio no
  // siembra detalle_evaluacion al crear la evaluación) con un 400.
  @IsOptional()
  @IsNumber()
  id_evaluacion?: number;

  @IsNumber()
  id_item!: number;

  @IsNumber()
  @Max(10)
  puntaje_asignado!: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  tipo_criterio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  nivel_calificacion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacion?: string;
}

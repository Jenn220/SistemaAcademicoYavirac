import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum EstadoDocumento {
  BORRADOR = 'borrador',
  PENDIENTE_REVISION = 'pendiente_revision',
  APROBADO = 'aprobado',
  RECHAZADO = 'rechazado',
}

export class ActualizarEstadoDocumentoDto {
  @IsEnum(EstadoDocumento)
  estado: EstadoDocumento;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comentarios?: string;
}

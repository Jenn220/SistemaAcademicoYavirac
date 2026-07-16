import { IsIn, IsNotEmpty, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { normalizarTipoReporte, TIPOS_REPORTE_VALIDOS } from './tipo-reporte.util';

export class CreateReporteNotasDto {
  @IsNotEmpty()
  @IsNumber()
  id_periodo: number;

  @IsNotEmpty()
  @IsNumber()
  id_oferta_asignatura: number;

  @IsNotEmpty()
  @Transform(({ value }) => normalizarTipoReporte(value))
  @IsIn(TIPOS_REPORTE_VALIDOS)
  tipo_reporte: string;
}

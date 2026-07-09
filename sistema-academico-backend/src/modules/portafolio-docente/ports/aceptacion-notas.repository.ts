import { CreateReporteNotasDto } from '../dto/create-reporte-notas.dto';
import { ReporteNotasResponseDto } from '../dto/reporte-notas-response.dto';
import { PortafolioReporteNotas } from '../domain/reporte-notas.entity';

export interface IAceptacionNotasRepository {
  existsByOfertaAndTipo(idOfertaAsignatura: number, tipoReporte: string): Promise<boolean>;
  generarReporte(dto: CreateReporteNotasDto): Promise<PortafolioReporteNotas>;
  findByOfertaAndTipo(
    idOfertaAsignatura: number,
    tipoReporte: string,
  ): Promise<ReporteNotasResponseDto | null>;
}

export const ACEPTACION_NOTAS_REPOSITORY = 'ACEPTACION_NOTAS_REPOSITORY';

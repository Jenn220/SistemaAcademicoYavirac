import { CreateReporteNotasDto } from '../dto/create-reporte-notas.dto';
import { ReporteNotasResponseDto } from '../dto/reporte-notas-response.dto';
import { NotaEstudianteDto } from '../dto/update-notas-aceptacion.dto';

export interface IAceptacionNotasRepository {
  existsByOfertaAndTipo(idOfertaAsignatura: number, tipoReporte: string): Promise<boolean>;
  generarReporte(dto: CreateReporteNotasDto, idDocente: number): Promise<ReporteNotasResponseDto>;
  findByOfertaAndTipo(
    idOfertaAsignatura: number,
    tipoReporte: string,
    idDocente: number,
  ): Promise<ReporteNotasResponseDto | null>;
  actualizarNotas(idReporteNotas: number, idDocente: number, estudiantes: NotaEstudianteDto[]): Promise<void>;
}

export const ACEPTACION_NOTAS_REPOSITORY = 'ACEPTACION_NOTAS_REPOSITORY';

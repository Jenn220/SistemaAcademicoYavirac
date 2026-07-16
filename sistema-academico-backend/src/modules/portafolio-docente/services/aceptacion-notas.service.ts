import { Injectable, Inject, ConflictException, NotFoundException } from '@nestjs/common';
import {
  IAceptacionNotasRepository,
  ACEPTACION_NOTAS_REPOSITORY,
} from '../ports/aceptacion-notas.repository';
import { CreateReporteNotasDto } from '../dto/create-reporte-notas.dto';
import { ReporteNotasResponseDto } from '../dto/reporte-notas-response.dto';
import { PortafolioReporteNotas } from '../domain/reporte-notas.entity';

@Injectable()
export class AceptacionNotasService {
  constructor(
    @Inject(ACEPTACION_NOTAS_REPOSITORY)
    private readonly aceptacionNotasRepo: IAceptacionNotasRepository,
  ) {}

  async generarReporte(dto: CreateReporteNotasDto): Promise<PortafolioReporteNotas> {
    const yaExiste = await this.aceptacionNotasRepo.existsByOfertaAndTipo(
      dto.id_oferta_asignatura,
      dto.tipo_reporte,
    );
    if (yaExiste) {
      throw new ConflictException(
        `Ya existe un reporte de ${dto.tipo_reporte} generado para esta materia`,
      );
    }
    return this.aceptacionNotasRepo.generarReporte(dto);
  }

  async getReporte(idOfertaAsignatura: number, tipoReporte: string): Promise<ReporteNotasResponseDto> {
    const reporte = await this.aceptacionNotasRepo.findByOfertaAndTipo(idOfertaAsignatura, tipoReporte);
    if (!reporte) {
      throw new NotFoundException('Reporte de notas no encontrado para esta materia y tipo');
    }
    return reporte;
  }
}

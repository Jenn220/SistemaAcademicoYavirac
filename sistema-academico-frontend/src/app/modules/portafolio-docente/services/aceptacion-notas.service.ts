import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreateReporteNotasDto,
  ReporteNotasResponseDto,
  TipoReporteCanonico,
  UpdateNotasAceptacionDto,
} from '../models/aceptacion-notas.model';

@Injectable({ providedIn: 'root' })
export class AceptacionNotasService {
  // Ruta relativa: el proxy de desarrollo (proxy.conf.local.json /
  // proxy.conf.docker.json) es responsable de reenviarla al backend real.
  private readonly baseUrl = '/api/portafolio/aceptacion-notas';

  constructor(private readonly http: HttpClient) {}

  /** GET /portafolio/aceptacion-notas/:id_oferta_asignatura/:tipo_reporte */
  getReporte(
    idOfertaAsignatura: number,
    tipoReporte: TipoReporteCanonico,
  ): Observable<ReporteNotasResponseDto> {
    return this.http.get<ReporteNotasResponseDto>(
      `${this.baseUrl}/${idOfertaAsignatura}/${tipoReporte}`,
    );
  }

  /** POST /portafolio/aceptacion-notas */
  generarReporte(dto: CreateReporteNotasDto): Observable<unknown> {
    return this.http.post(this.baseUrl, dto);
  }

  /** PATCH /portafolio/aceptacion-notas/:id_reporte_notas/notas */
  actualizarNotas(
    idReporteNotas: number,
    dto: UpdateNotasAceptacionDto,
  ): Observable<unknown> {
    return this.http.patch(`${this.baseUrl}/${idReporteNotas}/notas`, dto);
  }
}

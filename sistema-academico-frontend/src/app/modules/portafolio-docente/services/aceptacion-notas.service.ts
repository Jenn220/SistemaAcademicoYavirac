import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateReporteNotasDto,
  ReporteNotasResponseDto,
  UpdateNotasAceptacionDto,
} from '../models/aceptacion-notas.model';

@Injectable({ providedIn: 'root' })
export class AceptacionNotasService {
  private readonly apiUrl = `${environment.apiUrl}/api/portafolio/aceptacion-notas`;

  constructor(private readonly http: HttpClient) {}

  /** Trae el reporte ya generado. El backend responde 404 si no existe todavía. */
  getReporte(idOfertaAsignatura: number, tipoReporte: string): Observable<ReporteNotasResponseDto> {
    return this.http.get<ReporteNotasResponseDto>(
      `${this.apiUrl}/${idOfertaAsignatura}/${tipoReporte}`,
    );
  }

  /** Genera el reporte por primera vez (crea el "borrador" con todos los matriculados). */
  generarReporte(dto: CreateReporteNotasDto): Observable<ReporteNotasResponseDto> {
    return this.http.post<ReporteNotasResponseDto>(this.apiUrl, dto);
  }

  actualizarNotas(idReporteNotas: number, dto: UpdateNotasAceptacionDto): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${idReporteNotas}/notas`, dto);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateSeguimientoPeaDto,
  SeguimientoPeaManualData,
  SeguimientoPeaResponseDto,
  UpdateRepresentanteSeguimientoPeaDto,
} from '../models/seguimiento-pea.model';

const STORAGE_PREFIX = 'seguimiento_pea_manual_';
const TOTAL_SEMANAS_DEFECTO = 10;

@Injectable({ providedIn: 'root' })
export class SeguimientoPeaService {
  private readonly apiUrl = `${environment.apiUrl}/api/portafolio/seguimiento-pea`;

  constructor(private readonly http: HttpClient) {}

  /** El backend responde 404 si el docente aún no generó el seguimiento para esta oferta. */
  getSeguimientoPea(idOfertaAsignatura: number): Observable<SeguimientoPeaResponseDto> {
    return this.http.get<SeguimientoPeaResponseDto>(`${this.apiUrl}/${idOfertaAsignatura}`);
  }

  crearSeguimientoPea(dto: CreateSeguimientoPeaDto): Observable<SeguimientoPeaResponseDto> {
    return this.http.post<SeguimientoPeaResponseDto>(this.apiUrl, dto);
  }

  actualizarRepresentante(
    idSeguimientoPea: number,
    dto: UpdateRepresentanteSeguimientoPeaDto,
  ): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${idSeguimientoPea}/representante`, dto);
  }

  // --------------------------------------------------------------------
  // Secciones manuales (semanas, observaciones finales). El backend no
  // tiene columnas para esto, se guardan en localStorage por oferta
  // académica. Workaround temporal, igual que InformeFinalManualData.
  // --------------------------------------------------------------------
  guardarDatosManuales(idOfertaAsignatura: number, datos: SeguimientoPeaManualData): void {
    localStorage.setItem(STORAGE_PREFIX + idOfertaAsignatura, JSON.stringify(datos));
  }

  obtenerDatosManuales(idOfertaAsignatura: number): SeguimientoPeaManualData | null {
    const raw = localStorage.getItem(STORAGE_PREFIX + idOfertaAsignatura);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as SeguimientoPeaManualData;
    } catch {
      return null;
    }
  }

  datosManualesVacios(): SeguimientoPeaManualData {
    return {
      semanas: Array.from({ length: TOTAL_SEMANAS_DEFECTO }, (_, i) => ({
        semana: i + 1,
        fecha: '',
        temas: '',
        observaciones: '',
      })),
      observacionesRepresentante: '',
      observacionesDocente: '',
      observacionesCoordinador: '',
    };
  }
}
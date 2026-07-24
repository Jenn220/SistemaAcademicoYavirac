import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateInformeFinalDto,
  InformeFinalManualData,
  InformeFinalResponseDto,
} from '../models/informe-final.model';

const STORAGE_PREFIX = 'informe_final_manual_';

@Injectable({ providedIn: 'root' })
export class InformeFinalService {
  private readonly apiUrl = `${environment.apiUrl}/api/portafolio/informe-final`;

  constructor(private readonly http: HttpClient) {}

  /** El backend responde 404 si el docente aún no tiene informe para esta oferta. */
  getInformeFinal(idOfertaAsignatura: number): Observable<InformeFinalResponseDto> {
    return this.http.get<InformeFinalResponseDto>(`${this.apiUrl}/${idOfertaAsignatura}`);
  }

  crearInformeFinal(dto: CreateInformeFinalDto): Observable<unknown> {
    return this.http.post(this.apiUrl, dto);
  }

  // --------------------------------------------------------------------
  // Secciones manuales (antecedentes, desarrollo, resultados, etc.)
  // El backend no tiene columnas para esto, así que se guardan en
  // localStorage por oferta académica. Workaround temporal mientras
  // no exista soporte real en la base de datos.
  // --------------------------------------------------------------------
  guardarDatosManuales(idOfertaAsignatura: number, datos: InformeFinalManualData): void {
    localStorage.setItem(STORAGE_PREFIX + idOfertaAsignatura, JSON.stringify(datos));
  }

  obtenerDatosManuales(idOfertaAsignatura: number): InformeFinalManualData | null {
    const raw = localStorage.getItem(STORAGE_PREFIX + idOfertaAsignatura);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as InformeFinalManualData;
    } catch {
      return null;
    }
  }

  datosManualesVacios(): InformeFinalManualData {
    return {
      antecedentes: '',
      desarrolloActividades: '',
      infraestructura: '',
      recomendacionesInfraestructura: '',
      planEstudios: '',
      recomendacionesPlanEstudios: '',
      fechaElaboracion: new Date().toISOString(),
    };
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateInformeFinalDto, InformeFinalResponseDto } from '../models/informe-final.model';

@Injectable({ providedIn: 'root' })
export class InformeFinalService {
  private readonly baseUrl = '/api/portafolio/informe-final';

  constructor(private readonly http: HttpClient) {}

  /**
   * GET /portafolio/informe-final/:id_oferta_asignatura
   * NOTA: el backend obtiene el id_docente directamente del JWT
   * (req.user.idDocente), no se manda por parámetro.
   */
  getInformeFinal(idOfertaAsignatura: number): Observable<InformeFinalResponseDto> {
    return this.http.get<InformeFinalResponseDto>(`${this.baseUrl}/${idOfertaAsignatura}`);
  }

  /** POST /portafolio/informe-final */
  createInformeFinal(dto: CreateInformeFinalDto): Observable<InformeFinalResponseDto> {
    return this.http.post<InformeFinalResponseDto>(this.baseUrl, dto);
  }
}

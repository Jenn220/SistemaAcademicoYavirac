import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OfertaDocenteDto } from '../models/oferta-docente.model';

@Injectable({ providedIn: 'root' })
export class PortafolioService {
  private readonly baseUrl = '/api/portafolio';

  constructor(private readonly http: HttpClient) {}

  /** GET /portafolio/mis-ofertas (usa req.user.idDocente del JWT) */
  getMisOfertas(): Observable<OfertaDocenteDto[]> {
    return this.http.get<OfertaDocenteDto[]>(`${this.baseUrl}/mis-ofertas`);
  }
}

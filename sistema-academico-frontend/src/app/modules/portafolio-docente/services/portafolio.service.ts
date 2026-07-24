import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { OfertaDocenteDto } from '../models/oferta-docente.model';

@Injectable({ providedIn: 'root' })
export class PortafolioService {
  private readonly apiUrl = `${environment.apiUrl}/api/portafolio`;

  constructor(private readonly http: HttpClient) {}

  getMisOfertas(): Observable<OfertaDocenteDto[]> {
    return this.http.get<OfertaDocenteDto[]>(`${this.apiUrl}/mis-ofertas`);
  }
}

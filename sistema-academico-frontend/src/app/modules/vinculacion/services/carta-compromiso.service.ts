import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CartaCompromiso } from '../models/carta-compromiso.model';

@Injectable({
  providedIn: 'root'
})
export class CartaCompromisoService {
  private apiUrl = environment.apiUrl + '/api/vinculacion/acta-compromiso';  // 👈 AGREGAR /api

  constructor(private http: HttpClient) {}

  obtenerCartaCompromiso(idVinculacion: number): Observable<CartaCompromiso> {
    return this.http.get<CartaCompromiso>(`${this.apiUrl}/${idVinculacion}`);
  }
}
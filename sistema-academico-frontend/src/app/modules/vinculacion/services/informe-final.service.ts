import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { InformeFinal } from '../models/informe-final.model';

@Injectable({
  providedIn: 'root'
})
export class InformeFinalService {
  private apiUrl = environment.apiUrl + '/api/vinculacion/informe-final';  // 👈 AGREGAR /api

  constructor(private http: HttpClient) {}

  obtenerInforme(idVinculacion: number): Observable<InformeFinal> {
    return this.http.get<InformeFinal>(`${this.apiUrl}/${idVinculacion}`);
  }
}
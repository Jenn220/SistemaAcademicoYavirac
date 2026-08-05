import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Certificado } from '../models/certificado.model';

@Injectable({
  providedIn: 'root'
})
export class CertificadoService {
  private apiUrl = environment.apiUrl + '/api/vinculacion/certificado';  // 👈 AGREGAR /api

  constructor(private http: HttpClient) {}

  obtenerCertificado(idVinculacion: number): Observable<Certificado> {
    return this.http.get<Certificado>(`${this.apiUrl}/${idVinculacion}`);
  }
}
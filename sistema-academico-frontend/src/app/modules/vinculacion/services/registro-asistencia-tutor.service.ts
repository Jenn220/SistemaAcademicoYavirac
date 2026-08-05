// modules/vinculacion/services/registro-asistencia-tutor.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AsistenciaTutorResponse, AsistenciaTutor } from '../models/registro-asistencia-tutor.model';

@Injectable({
  providedIn: 'root'
})
export class RegistroAsistenciaTutorService {
  private apiUrl = environment.apiUrl + '/vinculacion/asistencia-tutor';

  constructor(private http: HttpClient) {}

  obtenerReporte(idVinculacion: number): Observable<AsistenciaTutorResponse> {
    return this.http.get<AsistenciaTutorResponse>(`${this.apiUrl}/${idVinculacion}`);
  }

  crearAsistencia(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, datos);
  }

  actualizarAsistencia(id: number, datos: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, datos);
  }

  eliminarAsistencia(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { 
  AsistenciaTutorResponse, 
  CreateAsistenciaTutorDto,
  UpdateAsistenciaTutorDto
} from '../models/registro-asistencia-tutor.model';

@Injectable({
  providedIn: 'root'
})
export class RegistroAsistenciaTutorService {
  private apiUrl = environment.apiUrl + '/api/vinculacion/asistencia-tutor';

  constructor(private http: HttpClient) {}

  obtenerReporte(idVinculacion: number): Observable<AsistenciaTutorResponse> {
    return this.http.get<AsistenciaTutorResponse>(`${this.apiUrl}/${idVinculacion}`);
  }

  crearAsistencia(datos: CreateAsistenciaTutorDto): Observable<any> {
    return this.http.post(`${this.apiUrl}`, datos);
  }

  actualizarAsistencia(id: number, datos: UpdateAsistenciaTutorDto): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, datos);
  }

  eliminarAsistencia(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  actualizarObservacion(idVinculacion: number, observaciones: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${idVinculacion}/observaciones`, { observaciones });
  }
}
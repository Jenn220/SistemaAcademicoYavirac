import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { 
  AsistenciaEstudianteResponse, 
  CreateActividadEstudianteDto,
  UpdateActividadEstudianteDto
} from '../models/control-asistencia.model';

@Injectable({
  providedIn: 'root'
})
export class ControlAsistenciaService {
  private apiUrl = environment.apiUrl + '/api/vinculacion/asistencia-estudiante';

  constructor(private http: HttpClient) {}

  obtenerAsistencia(idVinculacion: number): Observable<AsistenciaEstudianteResponse> {
    return this.http.get<AsistenciaEstudianteResponse>(`${this.apiUrl}/${idVinculacion}`);
  }

  crearActividad(datos: CreateActividadEstudianteDto): Observable<any> {
    return this.http.post(`${this.apiUrl}`, datos);
  }

  actualizarActividad(id: number, datos: UpdateActividadEstudianteDto): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, datos);
  }

  eliminarActividad(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // ✅ NUEVO: Actualizar observación
  actualizarObservacion(idVinculacion: number, observaciones: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${idVinculacion}/observaciones`, { observaciones });
  }
}
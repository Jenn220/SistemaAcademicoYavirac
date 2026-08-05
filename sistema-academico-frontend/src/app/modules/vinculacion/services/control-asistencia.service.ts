// modules/vinculacion/services/control-asistencia.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ActividadEstudiante, AsistenciaEstudianteResponse } from '../models/control-asistencia.model';

@Injectable({
  providedIn: 'root'
})
export class ControlAsistenciaService {
  private apiUrl = environment.apiUrl + '/vinculacion/asistencia-estudiante';

  constructor(private http: HttpClient) {}

  // Obtener el reporte completo (cabecera + actividades)
  obtenerAsistencia(idVinculacion: number): Observable<AsistenciaEstudianteResponse> {
    return this.http.get<AsistenciaEstudianteResponse>(`${this.apiUrl}/${idVinculacion}`);
  }

  // Crear una nueva actividad
  crearActividad(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, datos);
  }

  // Actualizar una actividad existente
  actualizarActividad(id: number, datos: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, datos);
  }

  // Eliminar una actividad
  eliminarActividad(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PlanAprendizaje } from '../models/plan-aprendizaje.model';

@Injectable({
  providedIn: 'root'
})
export class PlanAprendizajeService {
  private apiUrl = environment.apiUrl + '/api/vinculacion';

  constructor(private http: HttpClient) {}

  obtenerPlan(idVinculacion: number): Observable<PlanAprendizaje> {
    return this.http.get<PlanAprendizaje>(`${this.apiUrl}/informe-actividades/${idVinculacion}`);
  }

  actualizarResultadoAprendizaje(idActividad: number, resultado: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/informe-actividades/actividad/${idActividad}`, { 
      resultado_aprendizaje: resultado 
    });
  }

  // Actualizar reflexión del estudiante
  actualizarReflexion(idVinculacion: number, reflexion: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/informe-actividades/${idVinculacion}/reflexion`, { 
      reflexion: reflexion 
    });
  }
}
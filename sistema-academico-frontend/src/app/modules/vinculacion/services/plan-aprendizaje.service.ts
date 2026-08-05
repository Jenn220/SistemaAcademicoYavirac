// modules/vinculacion/services/plan-aprendizaje.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PlanAprendizaje } from '../models/plan-aprendizaje.model';

@Injectable({
  providedIn: 'root'
})
export class PlanAprendizajeService {
  private apiUrl = environment.apiUrl + '/vinculacion';

  constructor(private http: HttpClient) {}

  // Obtener datos del plan (usamos informe-actividades para obtener las filas)
  obtenerPlan(idVinculacion: number): Observable<PlanAprendizaje> {
    return this.http.get<PlanAprendizaje>(`${this.apiUrl}/informe-actividades/${idVinculacion}`);
  }

  // Actualizar resultado de aprendizaje de una actividad
actualizarResultadoAprendizaje(idActividad: number, resultado: string): Observable<any> {
  return this.http.patch(`${this.apiUrl}/informe-actividades/actividad/${idActividad}`, { resultado_aprendizaje: resultado });
}
}
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EvaluacionParams {
  notaFinal?: number;
  observaciones?: string;
  puntualidad?: number;
  trabajo_autonomo?: number;
  asistencia?: number;
  etica_profesional?: number;
  cumple_tareas?: number;
  actitud_proactiva?: number;
  coopera_permanentemente?: number;
  respeto_autoridad?: number;
  constancia_predisposicion?: number;
  responsabilidad_esmero?: number;
  habilidad_practica?: number;
}

@Injectable({ providedIn: 'root' })
export class InformeFinalService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';  // ← Aquí está la corrección

  obtenerInformeFinal(idVinculacion: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/vinculacion/informe-final/${idVinculacion}`);
  }

  guardarEvaluacion(idVinculacion: number, datos: EvaluacionParams): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/vinculacion/informe-final/${idVinculacion}/evaluacion`,
      datos
    );
  }

  listarInformesDocente(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/vinculacion/informe-final`);
  }
}
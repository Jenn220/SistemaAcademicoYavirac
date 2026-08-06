import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { EstudianteDocente } from '../models/vinculacion.model';

@Injectable({
  providedIn: 'root'
})
export class VinculacionService {
  private apiUrl = environment.apiUrl + '/api/vinculacion';

  constructor(private http: HttpClient) {}

  obtenerEstudiantesAsignados(): Observable<EstudianteDocente[]> {
    return this.http.get<EstudianteDocente[]>(`${this.apiUrl}/informe-final`);
  }

  /**
   * ✅ Obtener vinculación activa del estudiante autenticado
   * Endpoint: GET /api/vinculacion/estudiante/vinculacion-activa
   */
  obtenerVinculacionActiva(): Observable<any> {
    return this.http.get(`${this.apiUrl}/estudiante/vinculacion-activa`);
  }

  /**
   * ✅ Obtener vinculación por ID (con validación de roles)
   * Endpoint: GET /api/vinculacion/:id
   */
  obtenerVinculacionPorId(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
}
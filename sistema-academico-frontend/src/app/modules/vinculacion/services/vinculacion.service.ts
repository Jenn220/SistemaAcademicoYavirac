// modules/vinculacion/services/vinculacion.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VinculacionService {
  private apiUrl = environment.apiUrl + '/vinculacion';

  constructor(private http: HttpClient) {}

  // Buscar estudiantes por nombre, cédula o empresa (docente)
  buscarEstudiantes(termino: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/docente/buscar?q=${termino}`);
  }

  // Obtener lista de estudiantes asignados al docente
  obtenerEstudiantesAsignados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/informe-final`);
  }
}
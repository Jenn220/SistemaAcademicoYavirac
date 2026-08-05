import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { EstudianteDocente } from '../models/vinculacion.model';

@Injectable({
  providedIn: 'root'
})
export class VinculacionService {
  private apiUrl = environment.apiUrl + '/api/vinculacion';  // 👈 AGREGAR /api

  constructor(private http: HttpClient) {}

  obtenerEstudiantesAsignados(): Observable<EstudianteDocente[]> {
    return this.http.get<EstudianteDocente[]>(`${this.apiUrl}/informe-final`);
  }
}
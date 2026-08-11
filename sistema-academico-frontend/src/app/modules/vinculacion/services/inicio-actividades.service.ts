// inicio-actividades.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InicioActividadesResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class InicioActividadesService {
  // ✅ AGREGAR /api/ a la URL
  private apiUrl = '/api/vinculacion/inicio-actividades';

  constructor(private http: HttpClient) {}

  obtenerInicioActividades(idVinculacion: number): Observable<InicioActividadesResponse> {
    console.log(`📡 Solicitando: ${this.apiUrl}/${idVinculacion}`);
    return this.http.get<InicioActividadesResponse>(`${this.apiUrl}/${idVinculacion}`);
  }

  actualizarInicioActividades(
    idVinculacion: number, 
    data: { 
      nombre_proyecto: string; 
      fecha_inicio: string;
      fecha_fin: string 
    }
  ): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${idVinculacion}`, data);
  }
}
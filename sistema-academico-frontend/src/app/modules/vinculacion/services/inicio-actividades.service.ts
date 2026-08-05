import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { InicioActividadesResponse, UpdateInicioActividadesDto } from '../models';

@Injectable({
  providedIn: 'root'
})
export class InicioActividadesService {
  private apiUrl = environment.apiUrl + '/api/vinculacion';  // 👈 AGREGAR /api

  constructor(private http: HttpClient) {}

  obtenerInicioActividades(idVinculacion: number): Observable<InicioActividadesResponse> {
    return this.http.get<InicioActividadesResponse>(
      `${this.apiUrl}/inicio-actividades/${idVinculacion}`
    );
  }

  actualizarInicioActividades(idVinculacion: number, data: UpdateInicioActividadesDto): Observable<any> {
    return this.http.patch(`${this.apiUrl}/inicio-actividades/${idVinculacion}`, data);
  }
}
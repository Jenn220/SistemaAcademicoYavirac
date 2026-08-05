import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { InicioActividadesResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class InicioActividadesService {
  private apiUrl = environment.apiUrl + '/vinculacion';

  constructor(private http: HttpClient) {}

  // Obtener inicio de actividades (GET)
  obtenerInicioActividades(idVinculacion: number): Observable<InicioActividadesResponse> {
    return this.http.get<InicioActividadesResponse>(
      `${this.apiUrl}/inicio-actividades/${idVinculacion}`
    );
  }

  // Añadir al final de la clase
actualizarInicioActividades(idVinculacion: number, data: any): Observable<any> {
  return this.http.patch(`${this.apiUrl}/inicio-actividades/${idVinculacion}`, data);
}
}
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface InformeAprendizajeReal {
  id_informe?: number;
  id_practica: number;
  reflexion_aprendizaje?: string;
  observaciones_empresa?: string;
}

export interface BitacoraSemanalReal {
  id_bitacora?: number;
  id_informe: number;
  semana: number;
  fecha_inicio_semana?: string;
  fecha_fin_semana?: string;
  puesto_aprendizaje?: string;
  actividades_realizadas?: string;
  actividades_autonomas?: string;
}

/**
 * CRUD real sobre informe_aprendizaje / bitacora_semanal, reemplaza el
 * snapshot JSON aislado que usaba antes informe-aprendizaje.ts (guardar
 * insertaba en documento_fase_practica, que nunca vinculaba con
 * id_practica ni con las tablas que el GET realmente lee — bug IA-02/03/04
 * de la matriz QA).
 */
@Injectable({
  providedIn: 'root'
})
export class InformeAprendizajeApi {

  private http = inject(HttpClient);

  private readonly API = `${environment.apiUrl}/api/fase-practica`;

  listarPorPractica(idPractica: number): Observable<InformeAprendizajeReal[]> {
    return this.http.get<InformeAprendizajeReal[]>(`${this.API}/informe-aprendizaje/practica/${idPractica}`);
  }

  crear(dto: InformeAprendizajeReal): Observable<InformeAprendizajeReal> {
    return this.http.post<InformeAprendizajeReal>(`${this.API}/informe-aprendizaje`, dto);
  }

  actualizar(id: number, dto: Partial<InformeAprendizajeReal>): Observable<InformeAprendizajeReal> {
    return this.http.patch<InformeAprendizajeReal>(`${this.API}/informe-aprendizaje/${id}`, dto);
  }

  listarBitacoras(idInforme: number): Observable<BitacoraSemanalReal[]> {
    return this.http.get<BitacoraSemanalReal[]>(`${this.API}/bitacora-semanal/informe/${idInforme}`);
  }

  crearBitacora(dto: BitacoraSemanalReal): Observable<BitacoraSemanalReal> {
    return this.http.post<BitacoraSemanalReal>(`${this.API}/bitacora-semanal`, dto);
  }

  actualizarBitacora(id: number, dto: Partial<BitacoraSemanalReal>): Observable<BitacoraSemanalReal> {
    return this.http.patch<BitacoraSemanalReal>(`${this.API}/bitacora-semanal/${id}`, dto);
  }

  eliminarBitacora(id: number): Observable<{ deleted: boolean; id_bitacora: number }> {
    return this.http.delete<{ deleted: boolean; id_bitacora: number }>(`${this.API}/bitacora-semanal/${id}`);
  }

}

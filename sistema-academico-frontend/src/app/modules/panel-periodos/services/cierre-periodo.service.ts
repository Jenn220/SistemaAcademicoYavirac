import {
  Injectable,
} from '@angular/core';

import {
  HttpClient,
  HttpParams,
} from '@angular/common/http';

import {
  Observable,
} from 'rxjs';

import {
  CatalogosCreacionPeriodo,
  CerrarPeriodoRequest,
  CerrarPeriodoResponse,
  CoordinadorDisponible,
  CrearPeriodoCarreraRequest,
  CrearPeriodoCarreraResponse,
  HistorialPeriodoCarrera,
  PeriodoCarrera,
  ReasignarCoordinadorRequest,
  ReasignarCoordinadorResponse,
  ResumenCierrePeriodo,
} from '../models/periodo-carrera.model';

@Injectable({
  providedIn: 'root',
})
export class CierrePeriodoService {
  private readonly baseUrl =
    '/api/periodo-carrera';

  constructor(
    private readonly http:
      HttpClient,
  ) {}

  /*
   * ============================================================
   * LISTADO
   * ============================================================
   */

  obtenerPeriodosDelCoordinador(
    filtros?: {
      idPeriodo?: number;
      idCarrera?: number;
      estado?: string;
    },
  ): Observable<PeriodoCarrera[]> {
    let params =
      new HttpParams();

    if (
      filtros?.idPeriodo
    ) {
      params = params.set(
        'idPeriodo',
        String(
          filtros.idPeriodo,
        ),
      );
    }

    if (
      filtros?.idCarrera
    ) {
      params = params.set(
        'idCarrera',
        String(
          filtros.idCarrera,
        ),
      );
    }

    if (
      filtros?.estado
    ) {
      params = params.set(
        'estado',
        filtros.estado,
      );
    }

    return this.http.get<
      PeriodoCarrera[]
    >(
      this.baseUrl,
      {
        params,
      },
    );
  }

  /*
   * ============================================================
   * CREACIÓN
   * ============================================================
   */

  obtenerCatalogosCreacion():
    Observable<CatalogosCreacionPeriodo> {
    return this.http.get<
      CatalogosCreacionPeriodo
    >(
      `${this.baseUrl}/catalogos`,
    );
  }

  crearPeriodoCarrera(
    dto:
      CrearPeriodoCarreraRequest,
  ): Observable<CrearPeriodoCarreraResponse> {
    return this.http.post<
      CrearPeriodoCarreraResponse
    >(
      this.baseUrl,
      dto,
    );
  }

  /*
   * ============================================================
   * RESUMEN
   * ============================================================
   */

  obtenerResumenCierre(
    idPeriodoCarrera: number,
  ): Observable<ResumenCierrePeriodo> {
    return this.http.get<
      ResumenCierrePeriodo
    >(
      `${this.baseUrl}/${idPeriodoCarrera}/resumen-cierre`,
    );
  }

  /*
   * ============================================================
   * HISTORIAL
   * ============================================================
   */

  obtenerHistorial(
    idPeriodoCarrera: number,
  ): Observable<
    HistorialPeriodoCarrera[]
  > {
    return this.http.get<
      HistorialPeriodoCarrera[]
    >(
      `${this.baseUrl}/${idPeriodoCarrera}/historial`,
    );
  }

  /*
   * ============================================================
   * COORDINADORES
   * ============================================================
   */

  obtenerCoordinadoresDisponibles(
    idPeriodoCarrera: number,
  ): Observable<
    CoordinadorDisponible[]
  > {
    return this.http.get<
      CoordinadorDisponible[]
    >(
      `${this.baseUrl}/${idPeriodoCarrera}/coordinadores-disponibles`,
    );
  }

  /*
   * ============================================================
   * CIERRE
   * ============================================================
   */

  cerrarPeriodo(
    idPeriodoCarrera: number,
    dto:
      CerrarPeriodoRequest,
  ): Observable<CerrarPeriodoResponse> {
    return this.http.post<
      CerrarPeriodoResponse
    >(
      `${this.baseUrl}/${idPeriodoCarrera}/cerrar`,
      dto,
    );
  }

  /*
   * ============================================================
   * REASIGNACIÓN
   * ============================================================
   */

  reasignarCoordinador(
    idPeriodoCarrera: number,
    dto:
      ReasignarCoordinadorRequest,
  ): Observable<
    ReasignarCoordinadorResponse
  > {
    return this.http.patch<
      ReasignarCoordinadorResponse
    >(
      `${this.baseUrl}/${idPeriodoCarrera}/coordinador`,
      dto,
    );
  }
}
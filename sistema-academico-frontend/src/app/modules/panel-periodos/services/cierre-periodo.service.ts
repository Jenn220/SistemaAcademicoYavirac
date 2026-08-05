import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { PeriodoCarrera, ResumenCierrePeriodo } from '../models/periodo-carrera.model';
import { ESTADOS_PERIODO_CARRERA } from '../models/estados.constants';

// PROTOTIPO — el backend (Mateo, RF1/RF4 del informe) todavia no expone estos
// endpoints. Los 3 metodos de abajo devuelven datos simulados con delay() para que
// el front se comporte como si fuera una llamada HTTP real.
// Cuando el endpoint exista, reemplazar el cuerpo por this.http.get/post(...) y
// borrar los mocks - la firma (Observable<T>) no deberia cambiar.

@Injectable({ providedIn: 'root' })
export class CierrePeriodoService {
  private readonly baseUrl = '/api/periodo-carrera';

  constructor(private http: HttpClient) {}

  // TODO backend: GET /api/periodo-carrera?idCoordinador=...
  obtenerPeriodosDelCoordinador(idCoordinador: number): Observable<PeriodoCarrera[]> {
    const mock: PeriodoCarrera[] = [
      {
        idPeriodoCarrera: 1,
        idPeriodo: 3,
        idCarrera: 5,
        nombreCarrera: 'Desarrollo de Software',
        codigoPeriodo: '2026-1P',
        fechaInicio: '2026-03-01',
        fechaFin: '2026-07-31',
        fechaFinSupletorio: '2026-08-10',
        estado: ESTADOS_PERIODO_CARRERA.ACTIVO,
        idCoordinador,
        nombreCoordinador: 'Maria Jose Villa',
      },
    ];
    return of(mock).pipe(delay(300));
  }

  // TODO backend: GET /api/periodo-carrera/:id/resumen-cierre
  obtenerResumenCierre(idPeriodoCarrera: number): Observable<ResumenCierrePeriodo> {
    const mock: ResumenCierrePeriodo = {
      idPeriodoCarrera,
      totalOfertas: 12,
      totalMatriculasDetalle: 248,
      totalVinculaciones: 34,
      totalPracticas: 41,
    };
    return of(mock).pipe(delay(300));
  }

  // TODO backend: POST /api/periodo-carrera/:id/cerrar  (RF1)
  cerrarPeriodo(idPeriodoCarrera: number): Observable<{ ok: boolean; mensaje: string }> {
    return of({ ok: true, mensaje: 'Periodo cerrado correctamente (simulado).' }).pipe(delay(500));
  }
}

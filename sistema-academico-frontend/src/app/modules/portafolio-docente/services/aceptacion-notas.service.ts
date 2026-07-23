import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {
  CreateReporteNotasDto,
  ReporteNotasResponse,
  TipoReporteCanonico,
  EstudianteAceptacion,
  EstudianteAceptacionVista,
} from '../models/aceptacion-notas.model';

const USE_MOCK = true; // <-- cambiar a false cuando la BD esté lista

// Opciones del dropdown -> lo que se manda en el POST, y su equivalente canónico para el GET
export const OPCIONES_TIPO_REPORTE = [
  { label: 'Parcial Uno', valorPost: 'PARCIAL UNO', canonico: 'APORTE_1' as TipoReporteCanonico },
  { label: 'Aporte 1', valorPost: 'APORTE_1', canonico: 'APORTE_1' as TipoReporteCanonico },
  { label: 'Parcial Dos', valorPost: 'PARCIAL DOS', canonico: 'APORTE_2' as TipoReporteCanonico },
  { label: 'Aporte 2', valorPost: 'APORTE_2', canonico: 'APORTE_2' as TipoReporteCanonico },
  { label: 'Supletorio', valorPost: 'SUPLETORIO', canonico: 'SUPLETORIO' as TipoReporteCanonico },
  { label: 'Examen Supletorio', valorPost: 'EXAMEN SUPLETORIO', canonico: 'SUPLETORIO' as TipoReporteCanonico },
];

const ESTUDIANTES_BASE = [
  { cedula: '0850939067', nombre: 'MATIAS RAMON', apellido: 'ALCIVAR MAGALLANES' },
  { cedula: '1724307879', nombre: 'SANTIAGO ISMAEL', apellido: 'ALOMOTO CARRIEL' },
  { cedula: '1753746963', nombre: 'JENIFER NATALIA', apellido: 'ALVAREZ GONZALEZ' },
  { cedula: '1754347704', nombre: 'MAYTE ANAHI', apellido: 'ANCHAPANTA VINUEZA' },
  { cedula: '1752003507', nombre: 'RICARDO ESTEBAN', apellido: 'ASTUDILLO RODRIGUEZ' },
  { cedula: '1756309249', nombre: 'CRISTIAN STEVEN', apellido: 'CALLE CUZCO' },
  { cedula: '1726214396', nombre: 'DAMIAN ALEXANDER', apellido: 'CARRILLO MUÑOZ' },
  { cedula: '1753963592', nombre: 'MATEOUS ALEXANDER', apellido: 'CASTILLO PIBAQUE' },
  { cedula: '1724984172', nombre: 'JULIAN FERNANDO', apellido: 'CHAVEZ DIAZ' },
  { cedula: '1726414632', nombre: 'ALEXIS SANTIAGO', apellido: 'COELLO LLUMIPANTA' },
  { cedula: '1729150415', nombre: 'JUAN FERNANDO', apellido: 'CUASPUD VELASCO' },
  { cedula: '1750712489', nombre: 'LUIS MATEO', apellido: 'GUERRON CADENA' },
  { cedula: '1720504040', nombre: 'DIEGO ESTEBAN', apellido: 'LEMA MOLINA' },
  { cedula: '0606492775', nombre: 'LIZ IRINA', apellido: 'LLININ MOROCHO' },
  { cedula: '1725507907', nombre: 'DYLAN JOEL', apellido: 'MOLINA GUERRA' },
  { cedula: '1753995164', nombre: 'JEAN PIERRE', apellido: 'MORA VERDEZOTO' },
  { cedula: '1104115926', nombre: 'ANDRES ISRAEL', apellido: 'PUGLLA ROJAS' },
  { cedula: '1725992844', nombre: 'RONNY ANTONIO', apellido: 'VILLA VILLA' },
];

const CABECERA_BASE = {
  carrera: 'DESARROLLO DE SOFTWARE',
  nivel: '5TO',
  asignatura: 'DEVOPS',
  paralelo: '5TO C_INTENSIVA',
  jornada: 'INTENSIVA',
  docente: 'ING. BYRON RODRIGO MORENO MORENO',
  periodo: '2025-II',
};

function armarMock(
  tipo: string,
  notas: number[],
  asistencias: number[],
  fecha: string,
): ReporteNotasResponse {
  return {
    reporte: { ...CABECERA_BASE, tipo_reporte: tipo, fecha_generacion: fecha },
    estudiantes: ESTUDIANTES_BASE.slice(0, notas.length).map((est, i) => ({
      id_aceptacion: i + 1,
      cedula: est.cedula,
      estudiante: `${est.nombre} ${est.apellido}`,
      nota_registrada: notas[i],
      estado_aceptacion: 'PENDIENTE',
      fecha_aceptacion: null,
      // extendido solo-frontend:
      nombre: est.nombre,
      apellido: est.apellido,
      asistencia: asistencias[i],
      observacion: 'S/N',
    } as EstudianteAceptacionVista & EstudianteAceptacion)),
  };
}

const MOCK_REPORTES: Record<string, ReporteNotasResponse> = {
  APORTE_1: armarMock(
    'APORTE_1',
    [8.73, 8.53, 9.13, 8.82, 8.23, 8.36, 8.35, 7.78, 8.57, 8.18, 8.55, 8.25, 7.99, 7.91, 8.87, 7.77, 6.23, 7.78],
    [90.0, 94.0, 96.0, 94.0, 94.0, 96.0, 90.0, 100.0, 80.0, 94.0, 88.0, 80.0, 94.0, 80.0, 100.0, 100.0, 100.0, 94.0],
    '2025-10-27T00:00:00.000Z',
  ),
  APORTE_2: armarMock(
    'APORTE_2',
    [8.94, 9.25, 9.93, 5.93, 8.40, 5.00, 6.90, 7.70, 7.35, 6.48, 7.45, 9.10, 8.83, 3.35, 9.78, 9.25, 7.01, 7.75],
    [80.0, 94.0, 96.0, 94.0, 88.0, 90.0, 84.0, 100.0, 70.0, 90.0, 84.0, 74.0, 82.0, 70.0, 100.0, 100.0, 100.0, 88.0],
    '2025-11-27T00:00:00.000Z',
  ),
  SUPLETORIO: (() => {
    const idx = [5, 13, 16]; // Cristian Steven, Liz Irina, Andres Israel
    const notas = [7.0, 7.0, 7.0];
    const asist = [90.0, 70.0, 100.0];
    return {
      reporte: { ...CABECERA_BASE, tipo_reporte: 'SUPLETORIO', fecha_generacion: '2025-11-28T00:00:00.000Z' },
      estudiantes: idx.map((base, i) => {
        const est = ESTUDIANTES_BASE[base];
        return {
          id_aceptacion: i + 1,
          cedula: est.cedula,
          estudiante: `${est.nombre} ${est.apellido}`,
          nota_registrada: notas[i],
          estado_aceptacion: 'PENDIENTE',
          fecha_aceptacion: null,
          nombre: est.nombre,
          apellido: est.apellido,
          asistencia: asist[i],
          observacion: 'S/N',
        } as EstudianteAceptacionVista & EstudianteAceptacion;
      }),
    };
  })(),
};

@Injectable({ providedIn: 'root' })
export class AceptacionNotasService {
  private baseUrl = '/api/portafolio/aceptacion-notas';

  constructor(private http: HttpClient) {}

  getReporte(idOfertaAsignatura: number, tipoCanonico: TipoReporteCanonico): Observable<ReporteNotasResponse> {
    if (USE_MOCK) return of(MOCK_REPORTES[tipoCanonico]);
    return this.http.get<ReporteNotasResponse>(`${this.baseUrl}/${idOfertaAsignatura}/${tipoCanonico}`);
  }

  generarReporte(dto: CreateReporteNotasDto): Observable<any> {
    if (USE_MOCK) return of({ idReporteNotas: 1, ...dto });
    return this.http.post(this.baseUrl, dto);
  }
}
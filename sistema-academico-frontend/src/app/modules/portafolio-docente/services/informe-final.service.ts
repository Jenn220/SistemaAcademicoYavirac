import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { CreateInformeFinalDto, InformeFinalResponse, EstudianteNota } from '../models/informe-final.model';

const USE_MOCK = true; // <-- cambiar a false cuando la BD esté lista

const MOCK_INFORME: InformeFinalResponse = {
  informe: {
    nombre_docente: 'ING. MORENO MORENO BYRON RODRIGO',
    nombre_asignatura: 'DEVOPS',
    paralelo: '5TO C_INTENSIVA',
    horario: 'JUEVES 13:00 A 15:00 y VIERNES 14:00 A 17:00',
    periodo: '2025-II',
  },
  firmas: {
    docente: 'ING. MORENO MORENO BYRON RODRIGO',
    fecha_firma_docente: '2025-11-28',
    fecha_firma_coordinador: '2025-11-28',
  },
};

// Mock temporal para los <select> — reemplazar por un GET real cuando exista el endpoint de catálogo
export const MOCK_ASIGNATURAS = [
  { id: 1, nombre: 'DEVOPS' },
  { id: 2, nombre: 'BASES DE DATOS' },
];

export const MOCK_PARALELOS = [
  { id: 1, nombre: '5TO C_INTENSIVA' },
  { id: 2, nombre: '5TO A' },
];

export const MOCK_ESTUDIANTES: EstudianteNota[] = [
  { cedula: '0850939067', apellidos: 'ALCIVAR MAGALLANES', nombres: 'MATIAS RAMON', asistencia: 80.0, p1: 8.73, p2: 8.94, rc: null, nf: 8.84, evaluacion: 'MUY BUENO', promocion: 'PROMOVIDO' },
  { cedula: '1724307879', apellidos: 'ALOMOTO CARRIEL', nombres: 'SANTIAGO ISMAEL', asistencia: 94.0, p1: 8.53, p2: 9.25, rc: null, nf: 8.89, evaluacion: 'MUY BUENO', promocion: 'PROMOVIDO' },
  { cedula: '1753746963', apellidos: 'ALVAREZ GONZALEZ', nombres: 'JENIFER NATALIA', asistencia: 96.0, p1: 9.13, p2: 9.93, rc: null, nf: 9.53, evaluacion: 'EXCELENTE', promocion: 'PROMOVIDO' },
  { cedula: '1754347704', apellidos: 'ANCHAPANTA VINUEZA', nombres: 'MAYTE ANAHI', asistencia: 94.0, p1: 8.82, p2: 5.93, rc: null, nf: 7.38, evaluacion: 'BUENO', promocion: 'PROMOVIDO' },
  { cedula: '1752003507', apellidos: 'ASTUDILLO RODRIGUEZ', nombres: 'RICARDO ESTEBAN', asistencia: 88.0, p1: 8.23, p2: 8.40, rc: null, nf: 8.32, evaluacion: 'MUY BUENO', promocion: 'PROMOVIDO' },
  { cedula: '1756309249', apellidos: 'CALLE CUZCO', nombres: 'CRISTIAN STEVEN', asistencia: 90.0, p1: 8.36, p2: 5.00, rc: 7.00, nf: 8.00, evaluacion: 'BUENO', promocion: 'PROMOVIDO' },
];

@Injectable({ providedIn: 'root' })
export class InformeFinalService {
  private baseUrl = '/api/portafolio/informe-final';

  constructor(private http: HttpClient) {}

  getInformeFinal(idDocente: number, idPeriodo: number): Observable<InformeFinalResponse> {
    if (USE_MOCK) return of(MOCK_INFORME);
    return this.http.get<InformeFinalResponse>(`${this.baseUrl}/${idDocente}/${idPeriodo}`);
  }

  createInformeFinal(dto: CreateInformeFinalDto): Observable<InformeFinalResponse> {
    return this.http.post<InformeFinalResponse>(this.baseUrl, dto);
  }
}
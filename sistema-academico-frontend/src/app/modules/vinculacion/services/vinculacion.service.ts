import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, catchError, of } from 'rxjs';
import { utils, writeFile } from 'xlsx';
import {
  ActividadEstudiantePayload,
  AsistenciaTutorPayload,
  CrearProyectoVinculacionPayload,
  InformePayload,
  ProyectoVinculacion
} from '../models/proyecto-vinculacion.model';

const BASE_URL = 'http://localhost:3000/vinculacion';

@Injectable({ providedIn: 'root' })
export class VinculacionService {
  constructor(private readonly http: HttpClient) {}

  private mapEstado(estado?: string): string {
    if (!estado) return 'Desconocido';
    const normalized = estado.toUpperCase();
    if (normalized === 'EN_CURSO' || normalized === 'EN CURSO') return 'En ejecución';
    if (normalized === 'ACTIVO') return 'Activo';
    if (normalized === 'FINALIZADO') return 'Finalizado';
    return estado;
  }

  getProyectos(): Observable<ProyectoVinculacion[]> {
    return this.http.get<any[]>(`${BASE_URL}/estudiantes`).pipe(
      map(items => items.map(item => ({
        id: Number(item.id_vinculacion),
        nombre: item.nombre_proyecto ?? item.nombre,
        tutor: item.id_docente ? `Docente ${item.id_docente}` : 'Sin tutor',
        estado: this.mapEstado(item.estado),
        estudiantes: Number(item.estudiantes ?? 0),
        descripcion: item.descripcion ?? ''
      })))
    );
  }

  createProyecto(payload: CrearProyectoVinculacionPayload): Observable<any> {
    return this.http.post(`${BASE_URL}/vinculacion-estudiante`, payload);
  }

  getActividadesEstudiante(): Observable<any[]> {
    return this.http.get<any[]>(`${BASE_URL}/actividades-estudiante`);
  }

  createActividad(payload: ActividadEstudiantePayload): Observable<any> {
    return this.http.post(`${BASE_URL}/actividad-estudiante`, payload);
  }

  getAsistenciasTutor(): Observable<any[]> {
    return this.http.get<any[]>(`${BASE_URL}/asistencia-tutor`);
  }

  createAsistenciaTutor(payload: AsistenciaTutorPayload): Observable<any> {
    return this.http.post(`${BASE_URL}/asistencia-tutor`, payload);
  }

  getInformes(): Observable<any[]> {
    return this.http.get<any[]>(`${BASE_URL}/informes`);
  }

  createInforme(payload: InformePayload): Observable<any> {
    return this.http.post(`${BASE_URL}/informe`, payload);
  }

  getReporteById(id: number): Observable<any> {
    return this.http.get<any>(`${BASE_URL}/reporte/${id}`);
  }

  getActaCompromiso(id: number): Observable<any> {
    return this.http.get<any>(`${BASE_URL}/acta-compromiso/${id}`);
  }

  getReporteAsistenciaTutor(id: number): Observable<any> {
    return this.http.get<any>(`${BASE_URL}/asistencia-tutor/${id}`);
  }

  getInformeActividades(id: number): Observable<any> {
    return this.http.get<any>(`${BASE_URL}/informe-actividades/${id}`);
  }

  getCertificado(id: number): Observable<any> {
    return this.http.get<any>(`${BASE_URL}/certificado/${id}`);
  }

  getProyectoById(id: number): Observable<ProyectoVinculacion | undefined> {
    return this.getReporteById(id).pipe(
      map(response => {
        console.log('RESPUESTA BACKEND REPORTE:', response);
        if (!response || !response.cabecera) {
          return undefined;
        }

        const cabecera = response.cabecera ?? {};
        const totales = response.totales ?? {};

        return {
          id,
          nombre: cabecera.nombre_proyecto ?? 'Proyecto desconocido',
          tutor: cabecera.docente_tutor ?? 'Sin tutor',
          estado: 'N/A',
          estudiantes: 0,
          descripcion: `Periodo: ${cabecera.periodo_academico ?? 'N/A'}`,
          carrera: cabecera.carrera,
          entidad_beneficiaria: cabecera.entidad_beneficiaria,
          estudiante: cabecera.estudiante,
          docente_tutor: cabecera.docente_tutor,
          tutor_entidad_receptora: cabecera.tutor_entidad_receptora,
          periodo_academico: cabecera.periodo_academico,
          actividades: Array.isArray(response.actividades)
            ? response.actividades.map((row: any) => ({
                fecha: row.fecha,
                hora_entrada: row.hora_entrada ?? row.hora_inicio,
                hora_salida: row.hora_salida ?? row.hora_fin,
                total_horas: Number(row.total_horas ?? row.horas_total ?? 0),
                actividad_realizada: row.actividad_realizada ?? row.actividades_realizadas ?? ''
              }))
            : [],
          total_horas: Number(totales.total_horas ?? 0),
          observaciones: totales.observaciones ?? 'Ninguna'
        };
      }),
      catchError(error => {
        console.error('ERROR AL OBTENER REPORTE:', error);
        return of(undefined);
      })
    );
  }

  exportarReporteExcel(id: number, proyecto: ProyectoVinculacion | undefined): void {
    if (!proyecto) {
      return;
    }

    const filas: Array<Array<string | number | null>> = [
      ['REPORTE DE VINCULACIÓN'],
      [],
      ['ID', id],
      ['Nombre del proyecto', proyecto.nombre ?? ''],
      ['Carrera', proyecto.carrera ?? ''],
      ['Entidad beneficiaria', proyecto.entidad_beneficiaria ?? ''],
      ['Estudiante', proyecto.estudiante ?? ''],
      ['Docente tutor', proyecto.docente_tutor ?? ''],
      ['Tutor entidad receptora', proyecto.tutor_entidad_receptora ?? ''],
      ['Periodo académico', proyecto.periodo_academico ?? ''],
      ['Horas totales', proyecto.total_horas ?? 0],
      ['Observaciones', proyecto.observaciones ?? ''],
      [],
      ['Fecha', 'Hora de entrada', 'Hora de salida', 'Horas', 'Actividad realizada']
    ];

    (proyecto.actividades ?? []).forEach(actividad => {
      filas.push([
        actividad.fecha ?? '',
        actividad.hora_entrada ?? '',
        actividad.hora_salida ?? '',
        actividad.total_horas ?? 0,
        actividad.actividad_realizada ?? ''
      ]);
    });

    const sheet = utils.aoa_to_sheet(filas);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, sheet, 'Reporte');
    writeFile(workbook, `reporte-vinculacion-${id}.xlsx`);
  }
}

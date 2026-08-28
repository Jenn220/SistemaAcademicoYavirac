import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface CvDatoAcademico {
  id_cv_dato_academico?: number;
  id_estudiante?: number;
  anio: string;
  institucion: string;
  titulo_mencion: string;
  /** El back exige number al crear (POST) y string al actualizar (PATCH). */
  nota_final?: number | string;
}

export interface CvExperienciaLaboral {
  id_cv_experiencia_laboral?: number;
  id_estudiante?: number;
  anio: string;
  institucion: string;
  cargo: string;
  actividades: string;
}

export interface CvPracticaDual {
  id_cv_practica_dual?: number;
  id_estudiante?: number;
  anio_periodo: string;
  institucion: string;
  cargo: string;
  actividades_realizadas: string;
}

/**
 * CRUD real sobre las 3 tablas del CV del estudiante. El :idEstudiante de la
 * URL solo importa para DOCENTE/COORDINADOR revisando a otro estudiante — para
 * ESTUDIANTE el backend siempre usa su propio id del JWT e ignora este param.
 */
@Injectable({
  providedIn: 'root'
})
export class Cv {

  private http = inject(HttpClient);

  private readonly API = `${environment.apiUrl}/api/fase-practica`;

  // ==========================================================
  // Datos académicos
  // ==========================================================

  listarDatosAcademicos(idEstudiante: number): Observable<CvDatoAcademico[]> {
    return this.http.get<CvDatoAcademico[]>(`${this.API}/estudiantes/${idEstudiante}/cv/datos-academicos`);
  }

  crearDatoAcademico(idEstudiante: number, dto: Partial<CvDatoAcademico>): Observable<CvDatoAcademico> {
    return this.http.post<CvDatoAcademico>(`${this.API}/estudiantes/${idEstudiante}/cv/datos-academicos`, dto);
  }

  actualizarDatoAcademico(id: number, dto: Partial<CvDatoAcademico>): Observable<CvDatoAcademico> {
    return this.http.patch<CvDatoAcademico>(`${this.API}/cv/datos-academicos/${id}`, dto);
  }

  eliminarDatoAcademico(id: number): Observable<{ deleted: boolean; id: number }> {
    return this.http.delete<{ deleted: boolean; id: number }>(`${this.API}/cv/datos-academicos/${id}`);
  }

  // ==========================================================
  // Experiencia laboral
  // ==========================================================

  listarExperienciaLaboral(idEstudiante: number): Observable<CvExperienciaLaboral[]> {
    return this.http.get<CvExperienciaLaboral[]>(`${this.API}/estudiantes/${idEstudiante}/cv/experiencia-laboral`);
  }

  crearExperienciaLaboral(idEstudiante: number, dto: Partial<CvExperienciaLaboral>): Observable<CvExperienciaLaboral> {
    return this.http.post<CvExperienciaLaboral>(`${this.API}/estudiantes/${idEstudiante}/cv/experiencia-laboral`, dto);
  }

  actualizarExperienciaLaboral(id: number, dto: Partial<CvExperienciaLaboral>): Observable<CvExperienciaLaboral> {
    return this.http.patch<CvExperienciaLaboral>(`${this.API}/cv/experiencia-laboral/${id}`, dto);
  }

  eliminarExperienciaLaboral(id: number): Observable<{ deleted: boolean; id: number }> {
    return this.http.delete<{ deleted: boolean; id: number }>(`${this.API}/cv/experiencia-laboral/${id}`);
  }

  // ==========================================================
  // Prácticas duales previas
  // ==========================================================

  listarPracticasDuales(idEstudiante: number): Observable<CvPracticaDual[]> {
    return this.http.get<CvPracticaDual[]>(`${this.API}/estudiantes/${idEstudiante}/cv/practicas-duales`);
  }

  crearPracticaDual(idEstudiante: number, dto: Partial<CvPracticaDual>): Observable<CvPracticaDual> {
    return this.http.post<CvPracticaDual>(`${this.API}/estudiantes/${idEstudiante}/cv/practicas-duales`, dto);
  }

  actualizarPracticaDual(id: number, dto: Partial<CvPracticaDual>): Observable<CvPracticaDual> {
    return this.http.patch<CvPracticaDual>(`${this.API}/cv/practicas-duales/${id}`, dto);
  }

  eliminarPracticaDual(id: number): Observable<{ deleted: boolean; id: number }> {
    return this.http.delete<{ deleted: boolean; id: number }>(`${this.API}/cv/practicas-duales/${id}`);
  }
}

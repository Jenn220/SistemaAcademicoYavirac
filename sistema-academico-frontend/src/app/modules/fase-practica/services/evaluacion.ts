import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Rubrica {
  id_rubrica: number;
  nombre: string;
  tipo: string;
  estado?: string;
}

export interface ItemRubrica {
  id_item: number;
  id_rubrica: number;
  descripcion_criterio: string;
  puntaje_maximo: number;
  ponderacion?: number;
}

export interface EvaluacionEmpresa {
  id_evaluacion_empresa?: number;
  id_practica: number;
  /** En realidad es el id_rubrica (EMPRESARIAL): así lo persiste EvaluacionEmpresaService.create() en el back. */
  id_evaluacion_plan_marco: number;
  observaciones?: string;
  calificacion?: number;
  fortalezas?: string;
  oportunidades_mejora?: string;
  recomendaciones?: string;
}

export interface EvaluacionInstituto {
  id_evaluacion_instituto?: number;
  id_practica: number;
  /** En realidad es el id_rubrica (INSTITUTO): así lo persiste EvaluacionInstitutoService.create() en el back. */
  id_evaluacion_plan_marco: number;
  observaciones?: string;
  calificacion?: number;
}

export interface DetalleEvaluacion {
  id_detalle_evaluacion?: number;
  id_evaluacion: number;
  id_item: number;
  puntaje_asignado: number;
  tipo_criterio?: string;
  nivel_calificacion?: string;
  observacion?: string;
}

export interface ResultadoCalculoEmpresa {
  evaluacion: any;
  promedioDesempeno: number;
  notaPonderadaDesempeno: number;
  notaParcialDefensa: number;
  notaFinalDefensa: number;
  notaPonderadaDefensa: number;
  notaFinalEmpresa: number;
}

export interface ResultadoCalculoInstituto {
  evaluacion: any;
  notaParcialDefensa: number;
  notaFinalDefensa: number;
  notaPonderadaDefensa: number;
  promedioProyecto: number;
  notaPonderadaProyecto: number;
  notaFinalInstituto: number;
}

/**
 * CRUD real sobre el sistema de evaluaciones F07/F08 (catalogo_rubrica,
 * item_rubrica, evaluacion_practica, detalle_evaluacion), reemplaza el
 * snapshot JSON aislado que usaban antes evaluacion-empresarial.ts y
 * evaluacion-instituto.ts.
 */
@Injectable({
  providedIn: 'root'
})
export class Evaluacion {

  private http = inject(HttpClient);

  private readonly API = `${environment.apiUrl}/api/fase-practica`;

  // ==========================================================
  // Rúbricas y criterios (catálogo)
  // ==========================================================

  listarRubricas(): Observable<Rubrica[]> {
    return this.http.get<Rubrica[]>(`${this.API}/rubricas`);
  }

  listarItemsRubrica(idRubrica: number): Observable<ItemRubrica[]> {
    return this.http.get<ItemRubrica[]>(`${this.API}/rubricas/${idRubrica}/items`);
  }

  // ==========================================================
  // Evaluación Empresarial (F07)
  // ==========================================================

  listarEvaluacionesEmpresaPorPractica(idPractica: number): Observable<EvaluacionEmpresa[]> {
    return this.http.get<EvaluacionEmpresa[]>(`${this.API}/evaluaciones-empresa/practica/${idPractica}`);
  }

  crearEvaluacionEmpresa(dto: EvaluacionEmpresa): Observable<EvaluacionEmpresa> {
    return this.http.post<EvaluacionEmpresa>(`${this.API}/evaluaciones-empresa`, dto);
  }

  actualizarEvaluacionEmpresa(id: number, dto: Partial<EvaluacionEmpresa>): Observable<EvaluacionEmpresa> {
    return this.http.patch<EvaluacionEmpresa>(`${this.API}/evaluaciones-empresa/${id}`, dto);
  }

  calcularEvaluacionEmpresa(id: number): Observable<ResultadoCalculoEmpresa> {
    return this.http.post<ResultadoCalculoEmpresa>(`${this.API}/evaluaciones-empresa/${id}/calcular`, {});
  }

  // ==========================================================
  // Evaluación del Instituto (F08)
  // ==========================================================

  listarEvaluacionesInstitutoPorPractica(idPractica: number): Observable<EvaluacionInstituto[]> {
    return this.http.get<EvaluacionInstituto[]>(`${this.API}/evaluaciones-instituto/practica/${idPractica}`);
  }

  crearEvaluacionInstituto(dto: EvaluacionInstituto): Observable<EvaluacionInstituto> {
    return this.http.post<EvaluacionInstituto>(`${this.API}/evaluaciones-instituto`, dto);
  }

  actualizarEvaluacionInstituto(id: number, dto: Partial<EvaluacionInstituto>): Observable<EvaluacionInstituto> {
    return this.http.patch<EvaluacionInstituto>(`${this.API}/evaluaciones-instituto/${id}`, dto);
  }

  calcularEvaluacionInstituto(id: number): Observable<ResultadoCalculoInstituto> {
    return this.http.post<ResultadoCalculoInstituto>(`${this.API}/evaluaciones-instituto/${id}/calcular`, {});
  }

  // ==========================================================
  // Detalle por criterio (notas individuales)
  // ==========================================================

  listarDetalles(idEvaluacion: number): Observable<DetalleEvaluacion[]> {
    return this.http.get<DetalleEvaluacion[]>(`${this.API}/evaluaciones/${idEvaluacion}/detalles`);
  }

  crearDetalle(idEvaluacion: number, dto: Partial<DetalleEvaluacion>): Observable<DetalleEvaluacion> {
    return this.http.post<DetalleEvaluacion>(`${this.API}/evaluaciones/${idEvaluacion}/detalles`, dto);
  }

  actualizarDetalle(id: number, dto: Partial<DetalleEvaluacion>): Observable<DetalleEvaluacion> {
    return this.http.patch<DetalleEvaluacion>(`${this.API}/detalles-evaluacion/${id}`, dto);
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

import {
  PracticaSelector,
  PlanMarcoFormacion,
  ItemPlanMarco,
  PlanRotacion,
  PlanRotacionSemana
} from '../interfaces';

/**
 * A diferencia de Documentos (fase-practica/services/documentos.ts), este
 * servicio NO habla con /fase-practica/documentos: Plan Marco y Plan de
 * Rotación son CRUD normales sobre id_practica / id_plan_marco, sin
 * resolución automática del usuario logueado en el back.
 */
@Injectable({
  providedIn: 'root'
})
export class PlanFormacion {

  private http = inject(HttpClient);

  private readonly API = `${environment.apiUrl}/api/fase-practica`;

  // ==========================================================
  // Prácticas (selector)
  // ==========================================================

  listarPracticas(): Observable<PracticaSelector[]> {
    return this.http.get<PracticaSelector[]>(`${this.API}/practicas`);
  }

  obtenerPractica(idPractica: number): Observable<PracticaSelector> {
    return this.http.get<PracticaSelector>(`${this.API}/practicas/${idPractica}`);
  }

  // ==========================================================
  // Plan Marco de Formación
  // ==========================================================

  obtenerPlanMarcoPorPractica(idPractica: number): Observable<PlanMarcoFormacion[]> {
    return this.http.get<PlanMarcoFormacion[]>(`${this.API}/plan-marco/practica/${idPractica}`);
  }

  crearPlanMarco(dto: Partial<PlanMarcoFormacion>): Observable<PlanMarcoFormacion> {
    return this.http.post<PlanMarcoFormacion>(`${this.API}/plan-marco`, dto);
  }

  actualizarPlanMarco(id: number, dto: Partial<PlanMarcoFormacion>): Observable<PlanMarcoFormacion> {
    return this.http.patch<PlanMarcoFormacion>(`${this.API}/plan-marco/${id}`, dto);
  }

  // ==========================================================
  // Items del Plan Marco (resultados de aprendizaje)
  // ==========================================================

  listarItemsPlanMarco(idPlanMarco: number): Observable<ItemPlanMarco[]> {
    return this.http.get<ItemPlanMarco[]>(`${this.API}/plan-marco/${idPlanMarco}/items`);
  }

  crearItemPlanMarco(idPlanMarco: number, dto: Partial<ItemPlanMarco>): Observable<ItemPlanMarco> {
    return this.http.post<ItemPlanMarco>(`${this.API}/plan-marco/${idPlanMarco}/items`, dto);
  }

  actualizarItemPlanMarco(id: number, dto: Partial<ItemPlanMarco>): Observable<ItemPlanMarco> {
    return this.http.patch<ItemPlanMarco>(`${this.API}/items-plan-marco/${id}`, dto);
  }

  eliminarItemPlanMarco(id: number): Observable<{ deleted: boolean; id_item_pm: number }> {
    return this.http.delete<{ deleted: boolean; id_item_pm: number }>(`${this.API}/items-plan-marco/${id}`);
  }

  // ==========================================================
  // Plan de Rotación (una fila por ítem del Plan Marco)
  // ==========================================================

  listarPlanRotacionPorPractica(idPractica: number): Observable<PlanRotacion[]> {
    return this.http.get<PlanRotacion[]>(`${this.API}/plan-rotacion/practica/${idPractica}`);
  }

  crearPlanRotacion(dto: PlanRotacion): Observable<PlanRotacion> {
    return this.http.post<PlanRotacion>(`${this.API}/plan-rotacion`, dto);
  }

  actualizarPlanRotacion(id: number, dto: Partial<PlanRotacion>): Observable<PlanRotacion> {
    return this.http.patch<PlanRotacion>(`${this.API}/plan-rotacion/${id}`, dto);
  }

  // ==========================================================
  // Semanas activas por fila del Plan de Rotación
  // ==========================================================

  listarSemanas(idPlanRotacion: number): Observable<PlanRotacionSemana[]> {
    return this.http.get<PlanRotacionSemana[]>(`${this.API}/plan-rotacion/${idPlanRotacion}/semanas`);
  }

  crearSemana(idPlanRotacion: number, semana: number): Observable<PlanRotacionSemana> {
    return this.http.post<PlanRotacionSemana>(`${this.API}/plan-rotacion/${idPlanRotacion}/semanas`, { semana });
  }

  eliminarSemana(id: number): Observable<{ deleted: boolean; id_rotacion_semana: number }> {
    return this.http.delete<{ deleted: boolean; id_rotacion_semana: number }>(`${this.API}/plan-rotacion-semanas/${id}`);
  }
}

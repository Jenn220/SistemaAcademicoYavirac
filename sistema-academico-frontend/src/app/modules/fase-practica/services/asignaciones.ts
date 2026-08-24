import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface DocenteOpcion {
  id_docente: number;
  nombres: string;
  apellidos: string;
  cedula?: string;
}

export interface TutorEmpresarialOpcion {
  id_tutor_empresarial: number;
  nombres: string;
  apellidos: string;
  id_empresa: number;
  razon_social: string;
}

export interface AsignarDocenteTutorDto {
  id_docente?: number;
  id_tutor_empresarial?: number;
  id_empresa?: number;
}

/**
 * Catálogos + acción de asignar docente académico / tutor empresarial a
 * una práctica. Exclusivo de COORDINADOR (el back ya lo restringe con
 * @Roles en PracticaController).
 */
@Injectable({
  providedIn: 'root'
})
export class Asignaciones {

  private http = inject(HttpClient);

  private readonly API = `${environment.apiUrl}/api/fase-practica`;

  listarDocentes(): Observable<DocenteOpcion[]> {
    return this.http.get<DocenteOpcion[]>(`${this.API}/docentes`);
  }

  listarTutoresEmpresariales(): Observable<TutorEmpresarialOpcion[]> {
    return this.http.get<TutorEmpresarialOpcion[]>(`${this.API}/tutores-empresariales`);
  }

  asignar(idPractica: number, dto: AsignarDocenteTutorDto): Observable<unknown> {
    return this.http.patch(`${this.API}/practicas/${idPractica}`, dto);
  }

}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

import {
  CartaCompromiso,
  RegistroAsistencia,
  DocumentoGuardado,
  Curriculum,
  InformeAprendizajeDocumento
} from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class Documentos {

  private http = inject(HttpClient);

  private readonly API = `${environment.apiUrl}/api/fase-practica/documentos`;

  obtenerCartaCompromiso(): Observable<CartaCompromiso> {
    return this.http.get<CartaCompromiso>(
      `${this.API}/carta-compromiso`
    );
  }

  obtenerRegistroAsistencia(): Observable<RegistroAsistencia> {
    return this.http.get<RegistroAsistencia>(
      `${this.API}/registro-asistencia`
    );
  }

  guardarCartaCompromiso(contenido: CartaCompromiso): Observable<DocumentoGuardado> {
    return this.http.post<DocumentoGuardado>(
     `${this.API}/carta-compromiso`,
    { contenido }
  );
  }

  guardarRegistroAsistencia(contenido: RegistroAsistencia): Observable<DocumentoGuardado> {
    return this.http.post<DocumentoGuardado>(
     `${this.API}/registro-asistencia`,
    { contenido }
  );
  }

  /**
   * El backend devuelve datos de ejemplo (no ligados a un estudiante real)
   * en una forma distinta a la del formato oficial F02. Se usa solo como
   * base para precargar el formulario.
   */
  obtenerCurriculumBase(): Observable<Record<string, any>> {
    return this.http.get<Record<string, any>>(
      `${this.API}/curriculum`
    );
  }

  guardarCurriculum(contenido: Curriculum): Observable<DocumentoGuardado> {
    return this.http.post<DocumentoGuardado>(
      `${this.API}/curriculum`,
      { contenido }
    );
  }

  /**
   * Igual que el currículo: forma de ejemplo del backend, solo para precargar.
   */
  obtenerInformeAprendizajeBase(): Observable<Record<string, any>> {
    return this.http.get<Record<string, any>>(
      `${this.API}/informe-aprendizaje`
    );
  }

  guardarInformeAprendizaje(contenido: InformeAprendizajeDocumento): Observable<DocumentoGuardado> {
    return this.http.post<DocumentoGuardado>(
      `${this.API}/informe-aprendizaje`,
      { contenido }
    );
  }
}

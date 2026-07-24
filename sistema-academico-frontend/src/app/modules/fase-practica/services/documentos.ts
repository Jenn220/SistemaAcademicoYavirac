import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

import {
  CartaCompromiso,
  RegistroAsistencia,
  DocumentoGuardado,
  Curriculum,
  InformeAprendizajeDocumento,
  EvaluacionEmpresarial,
  EvaluacionInstituto
} from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class Documentos {

  private http = inject(HttpClient);

  private readonly API = `${environment.apiUrl}/api/fase-practica/documentos`;

  /**
   * El backend exige JWT (@UseGuards JwtGuard). Todavía no existe login
   * en el frontend, así que hoy este token nunca está presente y las
   * peticiones responden 401 (de ahí que las páginas caigan al mock).
   * En cuanto el módulo de auth guarde el token con esta misma clave,
   * estas peticiones empiezan a autenticarse sin tocar nada más aquí.
   */
  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  obtenerCartaCompromiso(): Observable<CartaCompromiso> {
    return this.http.get<CartaCompromiso>(
      `${this.API}/carta-compromiso`,
      { headers: this.authHeaders() }
    );
  }

  obtenerRegistroAsistencia(): Observable<RegistroAsistencia> {
    return this.http.get<RegistroAsistencia>(
      `${this.API}/registro-asistencia`,
      { headers: this.authHeaders() }
    );
  }

  guardarCartaCompromiso(contenido: CartaCompromiso): Observable<DocumentoGuardado> {
    return this.http.post<DocumentoGuardado>(
     `${this.API}/carta-compromiso`,
    { contenido },
    { headers: this.authHeaders() }
  );
  }

  guardarRegistroAsistencia(contenido: RegistroAsistencia): Observable<DocumentoGuardado> {
    return this.http.post<DocumentoGuardado>(
     `${this.API}/registro-asistencia`,
    { contenido },
    { headers: this.authHeaders() }
  );
  }

  /**
   * El backend devuelve datos de ejemplo (no ligados a un estudiante real)
   * en una forma distinta a la del formato oficial F02. Se usa solo como
   * base para precargar el formulario.
   */
  obtenerCurriculumBase(): Observable<Record<string, any>> {
    return this.http.get<Record<string, any>>(
      `${this.API}/curriculum`,
      { headers: this.authHeaders() }
    );
  }

  guardarCurriculum(contenido: Curriculum): Observable<DocumentoGuardado> {
    return this.http.post<DocumentoGuardado>(
      `${this.API}/curriculum`,
      { contenido },
      { headers: this.authHeaders() }
    );
  }

  /**
   * Igual que el currículo: forma de ejemplo del backend, solo para precargar.
   */
  obtenerInformeAprendizajeBase(): Observable<Record<string, any>> {
    return this.http.get<Record<string, any>>(
      `${this.API}/informe-aprendizaje`,
      { headers: this.authHeaders() }
    );
  }

  guardarInformeAprendizaje(contenido: InformeAprendizajeDocumento): Observable<DocumentoGuardado> {
    return this.http.post<DocumentoGuardado>(
      `${this.API}/informe-aprendizaje`,
      { contenido },
      { headers: this.authHeaders() }
    );
  }

  /**
   * El backend devuelve una lista plana de criterios (id, criterio, puntaje,
   * maximo) sin el desglose por rúbrica (Excelente/Bueno/Regular/Deficiente)
   * ni los datos de encabezado (fechas, tutor, núcleo, etc.). Se usa solo
   * como base para precargar la evaluación; el resto se completa a mano.
   */
  obtenerEvaluacionEmpresarialBase(): Observable<Record<string, any>> {
    return this.http.get<Record<string, any>>(
      `${this.API}/evaluacion-empresarial`,
      { headers: this.authHeaders() }
    );
  }

  guardarEvaluacionEmpresarial(contenido: EvaluacionEmpresarial): Observable<DocumentoGuardado> {
    return this.http.post<DocumentoGuardado>(
      `${this.API}/evaluacion-empresarial`,
      { contenido },
      { headers: this.authHeaders() }
    );
  }

  /**
   * Igual que evaluación empresarial: el backend solo da una lista plana de
   * criterios y las notas finales consolidadas, sin encabezado ni desglose
   * por rúbrica. Se usa solo como base para precargar el formulario.
   */
  obtenerEvaluacionInstitutoBase(): Observable<Record<string, any>> {
    return this.http.get<Record<string, any>>(
      `${this.API}/evaluacion-instituto`,
      { headers: this.authHeaders() }
    );
  }

  guardarEvaluacionInstituto(contenido: EvaluacionInstituto): Observable<DocumentoGuardado> {
    return this.http.post<DocumentoGuardado>(
      `${this.API}/evaluacion-instituto`,
      { contenido },
      { headers: this.authHeaders() }
    );
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
   * ESTUDIANTE/TUTOR_EMPRESARIAL nunca necesitan mandar idPractica: el
   * backend resuelve la suya sola (por matrícula o por empresa). DOCENTE y
   * COORDINADOR sí deben indicar explícitamente qué práctica quieren ver
   * (lo trae el selector de fase-practica/plan-formacion) — si no se manda,
   * el backend responde 403.
   */
  private paramsIdPractica(idPractica?: number): HttpParams | undefined {
    return idPractica ? new HttpParams().set('idPractica', idPractica) : undefined;
  }

  /**
   * Plantilla maestra completa (estudiante, carrera, proyecto empresarial,
   * empresa beneficiaria, periodo académico, cronograma). Varios endpoints
   * de documentos (registro-asistencia, informe-aprendizaje, evaluaciones)
   * no incluyen todos estos campos en su propia respuesta aunque el backend
   * sí los tiene — cada página completa los que le faltan con esta fuente.
   */
  obtenerDatosMaestra(idPractica?: number): Observable<Record<string, any>> {
    return this.http.get<Record<string, any>>(
      `${this.API}/datos`,
      { params: this.paramsIdPractica(idPractica) }
    );
  }

  obtenerCartaCompromiso(idPractica?: number): Observable<CartaCompromiso> {
    return this.http.get<CartaCompromiso>(
      `${this.API}/carta-compromiso`,
      { params: this.paramsIdPractica(idPractica) }
    );
  }

  obtenerRegistroAsistencia(idPractica?: number): Observable<RegistroAsistencia> {
    return this.http.get<RegistroAsistencia>(
      `${this.API}/registro-asistencia`,
      { params: this.paramsIdPractica(idPractica) }
    );
  }

  guardarCartaCompromiso(contenido: CartaCompromiso, idPractica?: number): Observable<DocumentoGuardado> {
    return this.http.post<DocumentoGuardado>(
     `${this.API}/carta-compromiso`,
    { contenido },
    { params: this.paramsIdPractica(idPractica) }
  );
  }

  guardarRegistroAsistencia(contenido: RegistroAsistencia, idPractica?: number): Observable<DocumentoGuardado> {
    return this.http.post<DocumentoGuardado>(
     `${this.API}/registro-asistencia`,
    { contenido },
    { params: this.paramsIdPractica(idPractica) }
  );
  }

  /**
   * El backend devuelve datos de ejemplo (no ligados a un estudiante real)
   * en una forma distinta a la del formato oficial F02. Se usa solo como
   * base para precargar el formulario.
   */
  obtenerCurriculumBase(idPractica?: number): Observable<Record<string, any>> {
    return this.http.get<Record<string, any>>(
      `${this.API}/curriculum`,
      { params: this.paramsIdPractica(idPractica) }
    );
  }

  guardarCurriculum(contenido: Curriculum, idPractica?: number): Observable<DocumentoGuardado> {
    return this.http.post<DocumentoGuardado>(
      `${this.API}/curriculum`,
      { contenido },
      { params: this.paramsIdPractica(idPractica) }
    );
  }

  /**
   * Igual que el currículo: forma de ejemplo del backend, solo para precargar.
   */
  obtenerInformeAprendizajeBase(idPractica?: number): Observable<Record<string, any>> {
    return this.http.get<Record<string, any>>(
      `${this.API}/informe-aprendizaje`,
      { params: this.paramsIdPractica(idPractica) }
    );
  }

  guardarInformeAprendizaje(contenido: InformeAprendizajeDocumento, idPractica?: number): Observable<DocumentoGuardado> {
    return this.http.post<DocumentoGuardado>(
      `${this.API}/informe-aprendizaje`,
      { contenido },
      { params: this.paramsIdPractica(idPractica) }
    );
  }

  /**
   * El backend devuelve una lista plana de criterios (id, criterio, puntaje,
   * maximo) sin el desglose por rúbrica (Excelente/Bueno/Regular/Deficiente)
   * ni los datos de encabezado (fechas, tutor, núcleo, etc.). Se usa solo
   * como base para precargar la evaluación; el resto se completa a mano.
   */
  obtenerEvaluacionEmpresarialBase(idPractica?: number): Observable<Record<string, any>> {
    return this.http.get<Record<string, any>>(
      `${this.API}/evaluacion-empresarial`,
      { params: this.paramsIdPractica(idPractica) }
    );
  }

  guardarEvaluacionEmpresarial(contenido: EvaluacionEmpresarial, idPractica?: number): Observable<DocumentoGuardado> {
    return this.http.post<DocumentoGuardado>(
      `${this.API}/evaluacion-empresarial`,
      { contenido },
      { params: this.paramsIdPractica(idPractica) }
    );
  }

  /**
   * Igual que evaluación empresarial: el backend solo da una lista plana de
   * criterios y las notas finales consolidadas, sin encabezado ni desglose
   * por rúbrica. Se usa solo como base para precargar el formulario.
   */
  obtenerEvaluacionInstitutoBase(idPractica?: number): Observable<Record<string, any>> {
    return this.http.get<Record<string, any>>(
      `${this.API}/evaluacion-instituto`,
      { params: this.paramsIdPractica(idPractica) }
    );
  }

  guardarEvaluacionInstituto(contenido: EvaluacionInstituto, idPractica?: number): Observable<DocumentoGuardado> {
    return this.http.post<DocumentoGuardado>(
      `${this.API}/evaluacion-instituto`,
      { contenido },
      { params: this.paramsIdPractica(idPractica) }
    );
  }
}

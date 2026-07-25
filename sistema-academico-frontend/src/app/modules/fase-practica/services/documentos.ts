import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
   * Plantilla maestra completa (estudiante, carrera, proyecto empresarial,
   * empresa beneficiaria, periodo académico, cronograma). Varios endpoints
   * de documentos (registro-asistencia, informe-aprendizaje, evaluaciones)
   * no incluyen todos estos campos en su propia respuesta aunque el backend
   * sí los tiene — cada página completa los que le faltan con esta fuente.
   */
  obtenerDatosMaestra(): Observable<Record<string, any>> {
    return this.http.get<Record<string, any>>(
      `${this.API}/datos`
    );
  }

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

  /**
   * El backend devuelve una lista plana de criterios (id, criterio, puntaje,
   * maximo) sin el desglose por rúbrica (Excelente/Bueno/Regular/Deficiente)
   * ni los datos de encabezado (fechas, tutor, núcleo, etc.). Se usa solo
   * como base para precargar la evaluación; el resto se completa a mano.
   */
  obtenerEvaluacionEmpresarialBase(): Observable<Record<string, any>> {
    return this.http.get<Record<string, any>>(
      `${this.API}/evaluacion-empresarial`
    );
  }

  guardarEvaluacionEmpresarial(contenido: EvaluacionEmpresarial): Observable<DocumentoGuardado> {
    return this.http.post<DocumentoGuardado>(
      `${this.API}/evaluacion-empresarial`,
      { contenido }
    );
  }

  /**
   * Igual que evaluación empresarial: el backend solo da una lista plana de
   * criterios y las notas finales consolidadas, sin encabezado ni desglose
   * por rúbrica. Se usa solo como base para precargar el formulario.
   */
  obtenerEvaluacionInstitutoBase(): Observable<Record<string, any>> {
    return this.http.get<Record<string, any>>(
      `${this.API}/evaluacion-instituto`
    );
  }

  guardarEvaluacionInstituto(contenido: EvaluacionInstituto): Observable<DocumentoGuardado> {
    return this.http.post<DocumentoGuardado>(
      `${this.API}/evaluacion-instituto`,
      { contenido }
    );
  }
}

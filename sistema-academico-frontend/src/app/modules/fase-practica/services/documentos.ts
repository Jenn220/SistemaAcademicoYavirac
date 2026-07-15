import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

import {
  CartaCompromiso,
  RegistroAsistencia,
  DocumentoGuardado
} from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class Documentos {

  private http = inject(HttpClient);

  private readonly API = `${environment.apiUrl}/fase-practica/documentos`;

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
}
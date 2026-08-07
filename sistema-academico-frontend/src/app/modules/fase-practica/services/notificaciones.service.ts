import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, interval, switchMap, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Notificacion {
  id_notificacion: number;
  id_usuario_destino: number;
  id_usuario_origen?: number;
  tipo: string;
  mensaje: string;
  id_practica?: number;
  leida: boolean;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {
  private readonly API = `${environment.apiUrl}/api/fase-practica/notificaciones`;

  private notificacionesSignal = signal<Notificacion[]>([]);
  readonly notificaciones = this.notificacionesSignal.asReadonly();

  private polling = false;
  private intervaloMs = 30000;

  constructor(private readonly http: HttpClient) {}

  listar(soloNoLeidas = false): Observable<Notificacion[]> {
    const params = new HttpParams().set('soloNoLeidas', soloNoLeidas ? 'true' : 'false');
    return this.http.get<Notificacion[]>(this.API, { params }).pipe(
      tap((data) => this.notificacionesSignal.set(data)),
    );
  }

  contarNoLeidas(): Observable<number> {
    return this.http.get<number>(`${this.API}/no-leidas/count`);
  }

  marcarLeida(idNotificacion: number): Observable<void> {
    return this.http.post<void>(`${this.API}/marcar-leida/${idNotificacion}`, {});
  }

  cargarTodas(): void {
    this.listar(false).subscribe({
      next: (data) => this.notificacionesSignal.set(data),
      error: () => {}
    });
  }

  iniciarPolling(): void {
    if (this.polling) return;
    this.polling = true;
    this.cargarTodas();

    interval(this.intervaloMs).pipe(
      switchMap(() => this.listar(false)),
      tap((data) => this.notificacionesSignal.set(data))
    ).subscribe();
  }

  detenerPolling(): void {
    this.polling = false;
  }

  cantidadNoLeidas(): number {
    return this.notificacionesSignal().filter(n => !n.leida).length;
  }
}

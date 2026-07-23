import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  CambiarPasswordRequest,
  DesbloquearRequest,
  DesbloquearResponse,
  GenerarAccesosRequest,
  GenerarAccesosResponse,
  JwtPayload,
  LoginRequest,
  LoginResponse,
  MeResponse,
  UsuarioSesion,
} from '../models';

const STORAGE_KEY = 'academico_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Ajusta esta base si tu environment define otra convención
  // (por ejemplo environment.apiUrl + '/auth')

private readonly apiUrl = 'http://localhost:3000/api/auth';

  // ------------------------------------------------------------------
  // Estado de sesión reactivo (signals)
  // ------------------------------------------------------------------
  private readonly tokenSignal = signal<string | null>(this.leerTokenGuardado());
  private readonly usuarioSignal = signal<UsuarioSesion | null>(
    this.decodificarUsuarioDelToken(this.leerTokenGuardado()),
  );

  readonly token = this.tokenSignal.asReadonly();
  readonly usuario = this.usuarioSignal.asReadonly();
  readonly estaAutenticado = computed(() => this.tokenSignal() !== null);
  readonly roles = computed(() => this.usuarioSignal()?.roles ?? []);

  constructor(private readonly http: HttpClient) {}

  // ------------------------------------------------------------------
  // Endpoints
  // ------------------------------------------------------------------

  login(dto: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, dto).pipe(
      tap((respuesta) => this.guardarSesion(respuesta)),
    );
  }

  me(): Observable<MeResponse> {
    return this.http.get<MeResponse>(`${this.apiUrl}/me`);
  }

  cambiarPassword(dto: CambiarPasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/cambiar-password`, dto);
  }

  // Exclusivos de COORDINADOR — el backend ya los protege con
  // @Roles('COORDINADOR'); aquí solo evitamos mostrarlos en la UI
  // a quien no debería verlos (ver esModuloCoordinador()).
  generarAccesos(dto: GenerarAccesosRequest): Observable<GenerarAccesosResponse> {
    return this.http.post<GenerarAccesosResponse>(`${this.apiUrl}/generar-accesos`, dto);
  }

  desbloquear(dto: DesbloquearRequest): Observable<DesbloquearResponse> {
    return this.http.post<DesbloquearResponse>(`${this.apiUrl}/desbloquear`, dto);
  }

  // ------------------------------------------------------------------
  // Sesión local
  // ------------------------------------------------------------------

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.tokenSignal.set(null);
    this.usuarioSignal.set(null);
  }

  esCoordinador(): boolean {
    return this.roles().includes('COORDINADOR');
  }

  tieneAlgunRol(rolesPermitidos: string[]): boolean {
    const rolesUsuario = this.roles();
    return rolesPermitidos.some((r) => rolesUsuario.includes(r));
  }

  private guardarSesion(respuesta: LoginResponse): void {
    localStorage.setItem(STORAGE_KEY, respuesta.accessToken);
    this.tokenSignal.set(respuesta.accessToken);
    this.usuarioSignal.set(respuesta.usuario);
  }

  private leerTokenGuardado(): string | null {
    return localStorage.getItem(STORAGE_KEY);
  }

  // Decodifica el payload del JWT SOLO para hidratar el estado de la UI
  // al recargar la página (no reemplaza la validación real, que
  // siempre hace el backend en cada request vía JwtStrategy).
  private decodificarUsuarioDelToken(token: string | null): UsuarioSesion | null {
    if (!token) {
      return null;
    }
    try {
      const payloadBase64 = token.split('.')[1];
      const payload: JwtPayload = JSON.parse(atob(payloadBase64));
      return {
        id: payload.sub,
        correo: payload.correo,
        roles: payload.roles,
        idDocente: payload.idDocente,
        idEstudiante: payload.idEstudiante,
        idEmpresa: payload.idEmpresa,
      };
    } catch {
      // Token corrupto o ilegible: se descarta silenciosamente
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }
}

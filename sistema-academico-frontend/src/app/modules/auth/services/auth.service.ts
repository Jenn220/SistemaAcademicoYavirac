import { Injectable, computed, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, switchMap, of } from 'rxjs';
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
  UsuarioConNombre,
} from '../models';

const STORAGE_KEY = 'academico_token';
const USER_STORAGE_KEY = 'academico_usuario_display';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = '/api/auth';

  private readonly tokenSignal = signal<string | null>(this.leerTokenGuardado());
  private readonly usuarioSignal = signal<UsuarioConNombre | null>(
    this.cargarUsuarioConNombre()
  );

  readonly token = this.tokenSignal.asReadonly();
  readonly usuario = this.usuarioSignal.asReadonly();
  readonly estaAutenticado = computed(() => this.tokenSignal() !== null);
  readonly roles = computed(() => this.usuarioSignal()?.roles ?? []);

  readonly nombreUsuario = computed(() => {
    const usuario = this.usuarioSignal();
    if (!usuario) return 'Usuario';
    
    if (usuario.nombreMostrar) return usuario.nombreMostrar;
    
    if (usuario.correo) {
      const nombreFromEmail = usuario.correo.split('@')[0];
      return nombreFromEmail
        .replace(/[._-]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
    
    return 'Usuario';
  });

  constructor(private readonly http: HttpClient) {
    this.cargarUsuarioSiEsNecesario();
  }

  login(dto: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, dto).pipe(
      tap((respuesta) => this.guardarSesion(respuesta)),
      switchMap((respuesta) => {
        return this.cargarInformacionUsuario(respuesta.accessToken).pipe(
          tap(() => {
            const usuarioActualizado: UsuarioConNombre = {
              ...respuesta.usuario,
              nombreMostrar: this.extraerNombreDelCorreo(respuesta.usuario.correo)
            };
            this.usuarioSignal.set(usuarioActualizado);
            this.guardarUsuarioConNombre(usuarioActualizado);
          }),
          switchMap(() => of(respuesta))
        );
      })
    );
  }

  private cargarInformacionUsuario(token: string): Observable<MeResponse> {
    return this.http.get<MeResponse>(`${this.apiUrl}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  private cargarUsuarioSiEsNecesario(): void {
    const token = this.tokenSignal();
    if (token) {
      const usuarioGuardado = this.cargarUsuarioConNombre();
      if (!usuarioGuardado) {
        this.cargarInformacionUsuario(token).subscribe({
          next: () => {
            const usuarioBasico = this.decodificarUsuarioDelToken(token);
            if (usuarioBasico) {
              const usuarioActualizado: UsuarioConNombre = {
                ...usuarioBasico,
                nombreMostrar: this.extraerNombreDelCorreo(usuarioBasico.correo)
              };
              this.usuarioSignal.set(usuarioActualizado);
              this.guardarUsuarioConNombre(usuarioActualizado);
            }
          },
          error: () => {
            const usuarioBasico = this.decodificarUsuarioDelToken(token);
            if (usuarioBasico) {
              const usuarioActualizado: UsuarioConNombre = {
                ...usuarioBasico,
                nombreMostrar: this.extraerNombreDelCorreo(usuarioBasico.correo)
              };
              this.usuarioSignal.set(usuarioActualizado);
              this.guardarUsuarioConNombre(usuarioActualizado);
            }
          }
        });
      }
    }
  }

  private extraerNombreDelCorreo(correo: string): string {
    if (!correo) return 'Usuario';
    const nombre = correo.split('@')[0];
    return nombre
      .replace(/[._-]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private guardarUsuarioConNombre(usuario: UsuarioConNombre): void {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(usuario));
    } catch (e) {
      console.warn('No se pudo guardar el usuario:', e);
    }
  }

  private cargarUsuarioConNombre(): UsuarioConNombre | null {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('No se pudo cargar el usuario guardado:', e);
    }
    return null;
  }

  obtenerPeriodosActivos(): Observable<{ id_periodo: number; nombre: string; codigo: string }[]> {
    return this.http.get<{ id_periodo: number; nombre: string; codigo: string }[]>(
      `${this.apiUrl}/periodos-activos`
    );
  }

  me(): Observable<MeResponse> {
    return this.http.get<MeResponse>(`${this.apiUrl}/me`);
  }

  cambiarPassword(dto: CambiarPasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/cambiar-password`, dto);
  }

  generarAccesos(dto: GenerarAccesosRequest): Observable<GenerarAccesosResponse> {
    return this.http.post<GenerarAccesosResponse>(`${this.apiUrl}/generar-accesos`, dto);
  }

  desbloquear(dto: DesbloquearRequest): Observable<DesbloquearResponse> {
    return this.http.post<DesbloquearResponse>(`${this.apiUrl}/desbloquear`, dto);
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
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

  private decodificarUsuarioDelToken(token: string | null): UsuarioSesion | null {
    if (!token) return null;
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
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }
}
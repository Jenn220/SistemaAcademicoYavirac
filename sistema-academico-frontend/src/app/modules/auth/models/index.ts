// ============================================================
// Modelos del módulo auth — reflejan uno a uno los DTOs
// del backend (src/modules/auth/dto/*.ts)
// ============================================================

export interface LoginRequest {
  correo: string;
  password: string;
}

export interface UsuarioSesion {
  id: number;
  correo: string;
  roles: string[];
  idDocente: number | null;
  idEstudiante: number | null;
  idEmpresa: number | null;
}

export interface LoginResponse {
  accessToken: string;
  usuario: UsuarioSesion;
  debeCambiarPassword: boolean;
}

export type MeResponse = UsuarioSesion;

export interface CambiarPasswordRequest {
  passwordActual?: string;
  passwordNueva: string;
}

export type TipoGenerarAccesos = 'ESTUDIANTE' | 'DOCENTE' | 'EMPRESA';

export interface GenerarAccesosRequest {
  tipo: TipoGenerarAccesos;
  id_periodo?: number;
}

export interface GenerarAccesosError {
  correo?: string;
  motivo: string;
}

export interface GenerarAccesosResponse {
  tipo: string;
  creados: number;
  correos: string[];
  errores: GenerarAccesosError[];
}

export interface DesbloquearRequest {
  correo: string;
}

export interface DesbloquearResponse {
  mensaje: string;
  nuevaClaveTemporal: string;
}

export interface JwtPayload {
  sub: number;
  correo: string;
  roles: string[];
  idDocente: number | null;
  idEstudiante: number | null;
  idEmpresa: number | null;
  iat?: number;
  exp?: number;
}

// Roles conocidos del sistema (coinciden con la tabla `rol` sembrada
// en la migración AddAuthFieldsToUsuarioAndSeedRoles)
export const ROLES = {
  DOCENTE: 'DOCENTE',
  ESTUDIANTE: 'ESTUDIANTE',
  TUTOR_EMPRESARIAL: 'TUTOR_EMPRESARIAL',
  COORDINADOR: 'COORDINADOR',
} as const;

export type Rol = (typeof ROLES)[keyof typeof ROLES];

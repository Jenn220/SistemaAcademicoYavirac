import { UsuarioEntity } from '../domain/usuario.entity';

export interface UsuarioConRoles {
  id_usuario: number;
  correo: string;
  password_hash: string;
  estado: string;
  id_docente: number | null;
  id_estudiante: number | null;
  id_empresa: number | null;
  debe_cambiar_password: boolean;
  intentos_fallidos: number;
  bloqueado: boolean;
  roles: string[];
}

export interface PersonaSinUsuario {
  id: number;
  correo: string;
  claveTemporal: string;
}

export interface CrearUsuarioConRolInput {
  correo: string;
  passwordHash: string;
  idDocente?: number;
  idEstudiante?: number;
  idEmpresa?: number;
  rolNombre: string;
}

export interface ClaveTemporalUsuario {
  idUsuario: number;
  claveTemporal: string | null;
}

export interface IUsuarioRepository {
  findByCorreoConRoles(correo: string): Promise<UsuarioConRoles | null>;
  findByIdConRoles(idUsuario: number): Promise<UsuarioConRoles | null>;
  registrarIntentoFallido(idUsuario: number, maxIntentos: number): Promise<void>;
  resetearIntentos(idUsuario: number): Promise<void>;
  buscarClaveTemporalPorCorreo(correo: string): Promise<ClaveTemporalUsuario | null>;
  resetearPasswordYDesbloquear(idUsuario: number, passwordHash: string): Promise<void>;
  actualizarPassword(idUsuario: number, passwordHash: string): Promise<void>;
  findEstudiantesSinUsuarioPorPeriodo(idPeriodo: number): Promise<PersonaSinUsuario[]>;
  findDocentesSinUsuario(): Promise<PersonaSinUsuario[]>;
  findEmpresasSinUsuario(): Promise<PersonaSinUsuario[]>;
  crearUsuarioConRol(input: CrearUsuarioConRolInput): Promise<UsuarioEntity>;
}

export const USUARIO_REPOSITORY = 'USUARIO_REPOSITORY';

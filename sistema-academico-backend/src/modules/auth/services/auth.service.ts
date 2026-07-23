import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { IUsuarioRepository, USUARIO_REPOSITORY, UsuarioConRoles } from '../ports/usuario.repository';
import { LoginDto } from '../dto/login.dto';
import { CambiarPasswordDto } from '../dto/cambiar-password.dto';
import { GenerarAccesosDto } from '../dto/generar-accesos.dto';
import { DesbloquearDto } from '../dto/desbloquear.dto';
import { LoginResponseDto, UsuarioSesionDto } from '../dto/login-response.dto';
import { MeResponseDto } from '../dto/me-response.dto';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

const MAX_INTENTOS = 5;
const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepo: IUsuarioRepository,
    private readonly jwtService: JwtService,
  ) {}

  private aSesion(usuario: UsuarioConRoles): UsuarioSesionDto {
    return {
      id: usuario.id_usuario,
      correo: usuario.correo,
      roles: usuario.roles,
      idDocente: usuario.id_docente,
      idEstudiante: usuario.id_estudiante,
      idEmpresa: usuario.id_empresa,
    };
  }

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const usuario = await this.usuarioRepo.findByCorreoConRoles(dto.correo);
    if (!usuario || usuario.estado !== 'ACTIVO') {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (usuario.bloqueado) {
      throw new ForbiddenException(
        'Cuenta bloqueada por intentos fallidos. Solicite el desbloqueo al coordinador.',
      );
    }

    const passwordValida = await bcrypt.compare(dto.password, usuario.password_hash);
    if (!passwordValida) {
      await this.usuarioRepo.registrarIntentoFallido(usuario.id_usuario, MAX_INTENTOS);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    await this.usuarioRepo.resetearIntentos(usuario.id_usuario);

    const payload: JwtPayload = {
      sub: usuario.id_usuario,
      correo: usuario.correo,
      roles: usuario.roles,
      idDocente: usuario.id_docente,
      idEstudiante: usuario.id_estudiante,
      idEmpresa: usuario.id_empresa,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      usuario: this.aSesion(usuario),
      debeCambiarPassword: usuario.debe_cambiar_password,
    };
  }

  async cambiarPassword(idUsuario: number, dto: CambiarPasswordDto): Promise<void> {
    const usuario = await this.usuarioRepo.findByIdConRoles(idUsuario);
    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (dto.passwordActual) {
      const passwordValida = await bcrypt.compare(dto.passwordActual, usuario.password_hash);
      if (!passwordValida) {
        throw new UnauthorizedException('La contraseña actual no es correcta');
      }
    }

    const hash = await bcrypt.hash(dto.passwordNueva, SALT_ROUNDS);
    await this.usuarioRepo.actualizarPassword(idUsuario, hash);
  }

  async me(idUsuario: number): Promise<MeResponseDto> {
    const usuario = await this.usuarioRepo.findByIdConRoles(idUsuario);
    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    return this.aSesion(usuario);
  }

  async desbloquear(dto: DesbloquearDto): Promise<{ mensaje: string; nuevaClaveTemporal: string }> {
    const datos = await this.usuarioRepo.buscarClaveTemporalPorCorreo(dto.correo);
    if (!datos || !datos.claveTemporal) {
      throw new NotFoundException('No se encontró una cédula/ruc para resetear la contraseña de este usuario');
    }

    const hash = await bcrypt.hash(datos.claveTemporal, SALT_ROUNDS);
    await this.usuarioRepo.resetearPasswordYDesbloquear(datos.idUsuario, hash);

    return {
      mensaje: 'Cuenta desbloqueada. La contraseña se reseteó a la cédula/ruc; el usuario deberá cambiarla en su próximo login.',
      nuevaClaveTemporal: datos.claveTemporal,
    };
  }

  async generarAccesos(dto: GenerarAccesosDto): Promise<{
    tipo: string;
    creados: number;
    correos: string[];
    errores: { correo?: string; motivo: string }[];
  }> {
    const rolPorTipo: Record<string, string> = {
      ESTUDIANTE: 'ESTUDIANTE',
      DOCENTE: 'DOCENTE',
      EMPRESA: 'TUTOR_EMPRESARIAL',
    };

    let candidatos: { id: number; correo: string; claveTemporal: string }[];
    if (dto.tipo === 'ESTUDIANTE') {
      candidatos = await this.usuarioRepo.findEstudiantesSinUsuarioPorPeriodo(dto.id_periodo!);
    } else if (dto.tipo === 'DOCENTE') {
      candidatos = await this.usuarioRepo.findDocentesSinUsuario();
    } else {
      candidatos = await this.usuarioRepo.findEmpresasSinUsuario();
    }

    const correosCreados: string[] = [];
    const errores: { correo?: string; motivo: string }[] = [];

    for (const candidato of candidatos) {
      try {
        if (!candidato.correo) {
          errores.push({ motivo: `Registro id=${candidato.id} sin correo, se omitió` });
          continue;
        }

        const hash = await bcrypt.hash(candidato.claveTemporal, SALT_ROUNDS);
        await this.usuarioRepo.crearUsuarioConRol({
          correo: candidato.correo,
          passwordHash: hash,
          rolNombre: rolPorTipo[dto.tipo],
          idDocente: dto.tipo === 'DOCENTE' ? candidato.id : undefined,
          idEstudiante: dto.tipo === 'ESTUDIANTE' ? candidato.id : undefined,
          idEmpresa: dto.tipo === 'EMPRESA' ? candidato.id : undefined,
        });
        correosCreados.push(candidato.correo);
      } catch (error) {
        errores.push({
          correo: candidato.correo,
          motivo: error instanceof Error ? error.message : 'Error desconocido',
        });
      }
    }

    return {
      tipo: dto.tipo,
      creados: correosCreados.length,
      correos: correosCreados,
      errores,
    };
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UsuarioEntity } from '../domain/usuario.entity';
import {
  ClaveTemporalUsuario,
  CrearUsuarioConRolInput,
  IUsuarioRepository,
  PeriodoAcademicoResponse,
  PersonaSinUsuario,
  UsuarioConRoles,
} from '../ports/usuario.repository';

@Injectable()
export class UsuarioPg implements IUsuarioRepository {
  constructor(
    @InjectRepository(UsuarioEntity)
    private readonly repo: Repository<UsuarioEntity>,
    private readonly dataSource: DataSource,
  ) {}

  private async findConRoles(where: string, params: unknown[]): Promise<UsuarioConRoles | null> {
    const rows = await this.dataSource.query(
      `
      SELECT
        u.id_usuario, u.correo, u.password_hash, u.estado,
        u.id_docente, u.id_estudiante, u.id_empresa,
        u.debe_cambiar_password, u.intentos_fallidos, u.bloqueado,
        COALESCE(array_agg(r.nombre) FILTER (WHERE r.nombre IS NOT NULL), '{}') AS roles
      FROM usuario u
      LEFT JOIN usuario_rol ur ON ur.id_usuario = u.id_usuario
      LEFT JOIN rol r ON r.id_rol = ur.id_rol
      WHERE ${where}
      GROUP BY u.id_usuario
      `,
      params,
    );
    return rows[0] ?? null;
  }

  async findByCorreoConRoles(correo: string): Promise<UsuarioConRoles | null> {
    return this.findConRoles('u.correo = $1', [correo]);
  }

  async findByIdConRoles(idUsuario: number): Promise<UsuarioConRoles | null> {
    return this.findConRoles('u.id_usuario = $1', [idUsuario]);
  }

  async findPeriodosActivos(): Promise<PeriodoAcademicoResponse[]> {
    return this.dataSource.query(
      `
      SELECT id_periodo, nombre, codigo
      FROM periodo_academico
      WHERE estado = 'ACTIVO'
      ORDER BY id_periodo DESC
      `
    );
  }

  async registrarIntentoFallido(idUsuario: number, maxIntentos: number): Promise<void> {
    await this.dataSource.query(
      `
      UPDATE usuario
      SET intentos_fallidos = intentos_fallidos + 1,
          bloqueado = (intentos_fallidos + 1 >= $2)
      WHERE id_usuario = $1
      `,
      [idUsuario, maxIntentos],
    );
  }

  async resetearIntentos(idUsuario: number): Promise<void> {
    await this.repo.update(idUsuario, { intentos_fallidos: 0 });
  }

  async buscarClaveTemporalPorCorreo(correo: string): Promise<ClaveTemporalUsuario | null> {
    const rows = await this.dataSource.query(
      `
      SELECT
        u.id_usuario AS "idUsuario",
        COALESCE(d.cedula, e.cedula, emp.ruc) AS "claveTemporal"
      FROM usuario u
      LEFT JOIN docente d ON d.id_docente = u.id_docente
      LEFT JOIN estudiante e ON e.id_estudiante = u.id_estudiante
      LEFT JOIN empresa emp ON emp.id_empresa = u.id_empresa
      WHERE u.correo = $1
      `,
      [correo],
    );
    return rows[0] ?? null;
  }

  async resetearPasswordYDesbloquear(idUsuario: number, passwordHash: string): Promise<void> {
    await this.repo.update(idUsuario, {
      password_hash: passwordHash,
      debe_cambiar_password: true,
      bloqueado: false,
      intentos_fallidos: 0,
    });
  }

  async actualizarPassword(idUsuario: number, passwordHash: string): Promise<void> {
    await this.repo.update(idUsuario, {
      password_hash: passwordHash,
      debe_cambiar_password: false,
    });
  }

  async findEstudiantesSinUsuarioPorPeriodo(idPeriodo: number): Promise<PersonaSinUsuario[]> {
    return this.dataSource.query(
      `
      SELECT DISTINCT e.id_estudiante AS id, e.correo, e.cedula AS "claveTemporal"
      FROM estudiante e
      JOIN matricula m ON m.id_estudiante = e.id_estudiante
      WHERE m.id_periodo = $1
        AND NOT EXISTS (SELECT 1 FROM usuario u WHERE u.id_estudiante = e.id_estudiante)
      `,
      [idPeriodo],
    );
  }

  async findDocentesSinUsuarioPorPeriodo(idPeriodo: number): Promise<PersonaSinUsuario[]> {
    return this.dataSource.query(
      `
      SELECT DISTINCT d.id_docente AS id, d.correo, d.cedula AS "claveTemporal"
      FROM docente d
      JOIN oferta_asignatura oa ON oa.id_docente = d.id_docente
      JOIN periodo_carrera pc ON pc.id_periodo_carrera = oa.id_periodo_carrera
      WHERE pc.id_periodo = $1
        AND NOT EXISTS (SELECT 1 FROM usuario u WHERE u.id_docente = d.id_docente)
      `,
      [idPeriodo],
    );
  }

  async findEmpresasSinUsuarioPorPeriodo(idPeriodo: number): Promise<PersonaSinUsuario[]> {
    return this.dataSource.query(
      `
      SELECT DISTINCT emp.id_empresa AS id, emp.razon_social AS correo, emp.ruc AS "claveTemporal"
      FROM empresa emp
      JOIN practica_estudiante pe ON pe.id_empresa = emp.id_empresa
      WHERE pe.id_periodo = $1
        AND NOT EXISTS (SELECT 1 FROM usuario u WHERE u.id_empresa = emp.id_empresa)
      `,
      [idPeriodo],
    );
  }

  async crearUsuarioConRol(input: CrearUsuarioConRolInput): Promise<UsuarioEntity> {
    return this.dataSource.transaction(async (manager) => {
      const usuario = manager.create(UsuarioEntity, {
        correo: input.correo,
        password_hash: input.passwordHash,
        id_docente: input.idDocente ?? null,
        id_estudiante: input.idEstudiante ?? null,
        id_empresa: input.idEmpresa ?? null,
      });
      const usuarioGuardado = await manager.save(usuario);

      const rolRows = await manager.query('SELECT id_rol FROM rol WHERE nombre = $1', [input.rolNombre]);
      if (!rolRows.length) {
        throw new Error(`Rol no encontrado: ${input.rolNombre}`);
      }

      await manager.query('INSERT INTO usuario_rol (id_usuario, id_rol) VALUES ($1, $2)', [
        usuarioGuardado.id_usuario,
        rolRows[0].id_rol,
      ]);

      return usuarioGuardado;
    });
  }
}
import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { EstudianteEntity } from '../domain/estudiante.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ActualizarDatosEstudianteDto } from '../dto/actualizar-datos-estudiante.dto';

@UseGuards(JwtGuard, RolesGuard)
@Roles('ESTUDIANTE')
@Controller('fase-practica')
export class PerfilEstudianteController {
  constructor(
    @InjectRepository(EstudianteEntity) private readonly repo: Repository<EstudianteEntity>,
    private readonly dataSource: DataSource,
  ) {}

  @Get('perfil')
  async obtenerPerfil(@Req() req: any) {
    return this.repo.findOne({ where: { id_estudiante: req.user.idEstudiante } });
  }

  /**
   * Resuelve la práctica del estudiante logueado, para que el front pueda
   * navegar directo a Plan Marco/Plan Rotación sin selector (a diferencia
   * de DOCENTE/COORDINADOR/TUTOR_EMPRESARIAL, que sí necesitan elegir de
   * una lista qué estudiante quieren ver).
   */
  @Get('mi-practica')
  async obtenerMiPractica(@Req() req: any) {
    const rows = await this.dataSource.query(
      `SELECT p.id_practica
       FROM practica_estudiante p
       JOIN matricula_detalle md ON md.id_matricula_detalle = p.id_matricula_detalle
       JOIN matricula m ON m.id_matricula = md.id_matricula
       WHERE m.id_estudiante = $1
       ORDER BY p.id_practica DESC
       LIMIT 1`,
      [req.user.idEstudiante],
    );

    if (rows.length === 0) {
      throw new ForbiddenException('No tiene una práctica registrada.');
    }

    return { id_practica: rows[0].id_practica };
  }

  @Patch('perfil')
  async actualizarPerfil(@Req() req: any, @Body() dto: ActualizarDatosEstudianteDto) {
    const idEstudiante = req.user.idEstudiante;
    if (!idEstudiante) return null;

    const estudiante = await this.repo.findOne({ where: { id_estudiante: idEstudiante } });
    if (estudiante) {
      Object.assign(estudiante, dto);
      await this.repo.save(estudiante);
    }

    const mapeoPractica: Record<string, string> = {
      carrera: 'nombre_carrera',
      nivel: 'nombre_nivel',
      periodo: 'nombre_periodo',
      nucleo: 'nombre_nucleo',
      tutor_academico: 'nombre_tutor_academico',
      coordinador: 'nombre_coordinador',
      empresa: 'nombre_empresa',
      tutor_empresarial: 'nombre_tutor_empresarial',
      proyecto: 'nombre_proyecto',
      cobertura: 'cobertura_localizacion',
      plazo: 'plazo_ejecucion',
      fecha_inicio: 'fecha_inicio',
      fecha_fin: 'fecha_fin',
      hornada: 'hornada',
      paralelo: 'paralelo',
    };

    const dtoRecord = dto as Record<string, any>;
    const columnasPermitidas = Object.values(mapeoPractica);
    const valoresPractica: Record<string, any> = {};
    for (const [dtoKey, colName] of Object.entries(mapeoPractica)) {
      if (dtoRecord[dtoKey] !== undefined && dtoRecord[dtoKey] !== null && dtoRecord[dtoKey] !== '') {
        valoresPractica[colName] = dtoRecord[dtoKey];
      }
    }

    if (Object.keys(valoresPractica).length > 0) {
      const rows = await this.dataSource.query(
        `SELECT p.id_practica
         FROM practica_estudiante p
         JOIN matricula_detalle md ON md.id_matricula_detalle = p.id_matricula_detalle
         JOIN matricula m ON m.id_matricula = md.id_matricula
         WHERE m.id_estudiante = $1
         ORDER BY p.id_practica DESC
         LIMIT 1`,
        [idEstudiante],
      );

      if (rows.length > 0) {
        const idPractica = rows[0].id_practica;
        const setClauses = Object.keys(valoresPractica)
          .filter(col => columnasPermitidas.includes(col))
          .map((col, idx) => `${col} = $${idx + 1}`)
          .join(', ');

        if (setClauses) {
          const values = Object.keys(valoresPractica)
            .filter(col => columnasPermitidas.includes(col))
            .map(col => valoresPractica[col]);
          values.push(idPractica);

          await this.dataSource.query(
            `UPDATE practica_estudiante SET ${setClauses} WHERE id_practica = $${values.length}`,
            values,
          );
        }
      }
    }

    return { ok: true };
  }
}

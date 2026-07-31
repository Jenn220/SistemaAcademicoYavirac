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
    const estudiante = await this.repo.findOne({ where: { id_estudiante: req.user.idEstudiante } });
    if (!estudiante) return null;
    Object.assign(estudiante, dto);
    return this.repo.save(estudiante);
  }
}

import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  ParseIntPipe, 
  Req, 
  UseGuards,
  ForbiddenException,
  BadRequestException
} from '@nestjs/common';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

import { CreateAsistenciaTutorDto } from '../dto/create-asistencia-tutor.dto';
import { UpdateAsistenciaTutorDto } from '../dto/update-asistencia-tutor.dto';
import { AsistenciaTutorService } from '../services/asistencia-tutor.service';

@UseGuards(JwtGuard, RolesGuard)
@Controller('vinculacion/asistencia-tutor')
export class AsistenciaTutorController {
  constructor(
    private readonly reportesService: AsistenciaTutorService,
  ) {}

  /**
   * DOCENTE / TUTOR EMPRESARIAL / COORDINADOR:
   * Crea el registro de asistencia/supervisión del tutor.
   * Ruta: POST /vinculacion/asistencia-tutor
   */
  @Post()
  @Roles('DOCENTE', 'TUTOR_EMPRESARIAL', 'COORDINADOR')
  async crearAsistenciaTutor(@Body() createAsistenciaTutorDto: CreateAsistenciaTutorDto) {
    return await this.reportesService.crearAsistenciaTutor(createAsistenciaTutorDto);
  }

  /**
   * DOCENTE / COORDINADOR:
   * Obtiene todas las asistencias registradas por el tutor asignadas al docente autenticado.
   * Ruta: GET /vinculacion/asistencia-tutor
   */
  @Get()
  @Roles('DOCENTE', 'COORDINADOR')
  async obtenerTodas(@Req() req: any) {
    const idDocente = req.user?.id_docente || req.user?.idDocente;
    if (!idDocente) {
      throw new BadRequestException('No se pudo identificar el docente autenticado.');
    }
    return await this.reportesService.obtenerAsistenciasTutorPorDocente(idDocente);
  }

  
@Patch(':idVinculacion/observaciones')
  @Roles('DOCENTE', 'TUTOR_EMPRESARIAL', 'COORDINADOR')
  async actualizarObservacionControlador(
    @Param('idVinculacion', ParseIntPipe) idVinculacion: number,
    @Body() dto: { observaciones: string },
  ) {
    return await this.reportesService.actualizarObservacion(idVinculacion, dto.observaciones || '');
  }
  /**
   * ESTUDIANTE / DOCENTE / COORDINADOR / TUTOR EMPRESARIAL:
   * Obtiene el reporte de asistencia específico por ID.
   * Si el ID es 0 y el usuario es ESTUDIANTE, se resuelve su vinculación automáticamente.
   * Ruta: GET /vinculacion/asistencia-tutor/:id
   */
  @Get(':id')
  @Roles('ESTUDIANTE', 'DOCENTE', 'COORDINADOR', 'TUTOR_EMPRESARIAL')
  async obtenerPorId(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    // Obtener roles del usuario
    const roles = req.user?.roles || [];
    const esEstudiante = roles.includes('ESTUDIANTE');

    // Si es estudiante y el ID es 0, buscar su vinculación activa
    if (esEstudiante) {
      // Si es estudiante pero el ID es 0, resolver automáticamente
      if (id === 0) {
        const idEstudiante = req.user?.idEstudiante || req.user?.id_estudiante;
        if (!idEstudiante) {
          throw new BadRequestException('No se pudo identificar al estudiante autenticado.');
        }
        const vinculacion = await this.reportesService.obtenerVinculacionPorEstudiante(idEstudiante);
        if (!vinculacion) {
          throw new ForbiddenException('No tiene una vinculación activa asociada.');
        }
        id = Number(vinculacion.id_vinculacion);
      }
      // Si es estudiante y el ID no es 0, verificar que la vinculación le pertenece
      else {
        const idEstudiante = req.user?.idEstudiante || req.user?.id_estudiante;
        if (idEstudiante) {
          const vinculacion = await this.reportesService.obtenerVinculacionPorEstudiante(idEstudiante);
          if (!vinculacion || Number(vinculacion.id_vinculacion) !== id) {
            throw new ForbiddenException('No tiene acceso a esta vinculación.');
          }
        }
      }
    }

    // Si el ID sigue siendo 0, lanzar error
    if (id === 0) {
      throw new BadRequestException('ID de vinculación inválido.');
    }

    return await this.reportesService.obtenerReporteAsistenciaTutor(id);
  }

  /**
   * DOCENTE / TUTOR EMPRESARIAL / COORDINADOR:
   * Edita un registro de asistencia del tutor por ID.
   * Ruta: PATCH /vinculacion/asistencia-tutor/:id
   */
  @Patch(':id')
  @Roles('DOCENTE', 'TUTOR_EMPRESARIAL', 'COORDINADOR')
  async actualizarAsistenciaTutor(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateAsistenciaTutorDto,
  ) {
    return await this.reportesService.actualizarAsistenciaTutor(id, updateDto);
  }

  /**
   * DOCENTE / COORDINADOR:
   * Elimina un registro de asistencia del tutor por ID.
   * Ruta: DELETE /vinculacion/asistencia-tutor/:id
   */
  @Delete(':id')
  @Roles('DOCENTE', 'COORDINADOR')
  async eliminarAsistenciaTutor(@Param('id', ParseIntPipe) id: number) {
    return await this.reportesService.eliminarAsistenciaTutor(id);
  }
}
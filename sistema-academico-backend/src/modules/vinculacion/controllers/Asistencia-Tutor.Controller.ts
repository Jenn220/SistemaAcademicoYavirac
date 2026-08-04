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
  UseGuards 
} from '@nestjs/common';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

// DTOs
import { CreateAsistenciaTutorDto } from '../dto/create-asistencia-tutor.dto';
import { UpdateAsistenciaTutorDto } from '../dto/update-asistencia-tutor.dto';

// Servicio
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
    return await this.reportesService.obtenerAsistenciasTutorPorDocente(req.user.idDocente);
  }

  /**
   * DOCENTE / COORDINADOR / TUTOR EMPRESARIAL:
   * Obtiene el reporte de asistencia específico por ID.
   * Ruta: GET /vinculacion/asistencia-tutor/:id
   */
  @Get(':id')
  @Roles('DOCENTE', 'COORDINADOR', 'TUTOR_EMPRESARIAL')
  async obtenerPorId(@Param('id', ParseIntPipe) id: number) {
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
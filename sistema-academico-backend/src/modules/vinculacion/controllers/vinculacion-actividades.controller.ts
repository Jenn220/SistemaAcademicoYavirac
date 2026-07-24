import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Patch, Delete } from '@nestjs/common';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { VinculacionActividadesService } from '../services/vinculacion-actividades.service';
import { VinculacionAsistenciaService } from '../services/vinculacion-asistencia.service';
import { CreateActividadEstudianteDto } from '../dto/create-actividad-estudiante.dto';
import { CreateAsistenciaTutorDto } from '../dto/create-asistencia-tutor.dto';
import { UpdateActividadEstudianteDto } from '../dto/update-actividad-estudiante.dto';
import { UpdateAsistenciaTutorDto } from '../dto/update-asistencia-tutor.dto';
import { VinculacionActividadEstudiante } from '../domain/vinculacion_actividad_estudiante.entity';
import { VinculacionAsistenciaTutor } from '../domain/vinculacion-asistencia-tutor.entity';

@UseGuards(JwtGuard, RolesGuard)
@Roles('DOCENTE', 'ESTUDIANTE', 'TUTOR_EMPRESARIAL', 'COORDINADOR')
@Controller('vinculacion/actividades')
export class VinculacionActividadesController {
  constructor(
    private readonly actividadesService: VinculacionActividadesService,
    private readonly asistenciaService: VinculacionAsistenciaService,
  ) {}

  @Post('estudiante')
  async crearActividadEstudiante(@Body() createActividadEstudianteDto: CreateActividadEstudianteDto) {
    return await this.actividadesService.crearActividadEstudiante(createActividadEstudianteDto);
  }

  @Post('asistencia-tutor')
  async crearAsistenciaTutor(@Body() createAsistenciaTutorDto: CreateAsistenciaTutorDto) {
    return await this.asistenciaService.crearAsistenciaTutor(createAsistenciaTutorDto);
  }

  @Get('actividades')
async obtenerTodasLasActividades(): Promise<VinculacionActividadEstudiante[]> { ////
  const respuesta = await this.actividadesService.obtenerTodasLasActividades();
  return respuesta.data;
}

  @Get('asistencia-tutor')
async obtenerAsistenciasTutor(): Promise<VinculacionAsistenciaTutor[]> { //////
  const respuesta = await this.asistenciaService.obtenerAsistenciasTutor();
  return respuesta.data;
}

  @Patch('estudiante/:id')
  async actualizarActividadEstudiante(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateActividadEstudianteDto,
  ) {
    return await this.actividadesService.actualizarActividadEstudiante(id, updateDto);
  }

  @Patch('asistencia-tutor/:id')
  async actualizarAsistenciaTutor(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateAsistenciaTutorDto,
  ) {
    return await this.asistenciaService.actualizarAsistenciaTutor(id, updateDto);
  }

  @Delete('estudiante/:id')
  async eliminarActividadEstudiante(@Param('id', ParseIntPipe) id: number) {
    return await this.actividadesService.eliminarActividadEstudiante(id);
  }

  @Delete('asistencia-tutor/:id')
  async eliminarAsistenciaTutor(@Param('id', ParseIntPipe) id: number) {
    return await this.asistenciaService.eliminarAsistenciaTutor(id);
  }
}
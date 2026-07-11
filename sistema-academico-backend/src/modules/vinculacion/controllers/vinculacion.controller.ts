import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { VinculacionService } from '../services/vinculacion.service';

import { VinculacionActividadEstudiante } from '../domain/vinculacion_actividad_estudiante.entity';
import { VinculacionAsistenciaTutor } from '../domain/vinculacion-asistencia-tutor.entity';
import { VinculacionEstudianteEntity } from '../domain/vinculacion-estudiante.entity';
import { VinculacionInforme } from '../domain/vinculacion-informe.entity';
import { CreateAsistenciaTutorDto } from '../dto/create-asistencia-tutor.dto';
import { CreateActividadEstudianteDto } from '../dto/create-actividad-estudiante.dto';
import { CreateVinculacionDto } from '../dto/create-vinculacion.dto';
import { CreateInformeDto } from '../dto/create-informe.dto';

@Controller('vinculacion')
export class VinculacionController {
  constructor(private readonly vinculacionService: VinculacionService) {}

  @Get('actividades-estudiante')
  async obtenerTodasLasActividades(): Promise<VinculacionActividadEstudiante[]> {
    return await this.vinculacionService.obtenerTodasLasActividades();
  }

  @Get('asistencia-tutor')
  async obtenerAsistenciasTutor(): Promise<VinculacionAsistenciaTutor[]> {
    return await this.vinculacionService.obtenerAsistenciasTutor();
  }

  @Get('estudiantes')
  async obtenerVinculacionesEstudiantes(): Promise<VinculacionEstudianteEntity[]> {
    return await this.vinculacionService.obtenerVinculacionesEstudiantes();
  }

  @Get('informes')
  async obtenerInformes(): Promise<VinculacionInforme[]> {
    return await this.vinculacionService.obtenerInformes();
  }

  @Get('reporte/:id')
  async obtenerReporteConsolidado(@Param('id', ParseIntPipe) id: number) {
    return await this.vinculacionService.obtenerReporteConsolidado(id);
  }

@Post('actividad-estudiante')
  async crearActividadEstudiante(@Body() createActividadEstudianteDto: CreateActividadEstudianteDto) {
    return await this.vinculacionService.crearActividadEstudiante(createActividadEstudianteDto);
  }
  
 @Post('asistencia-tutor')
  async crearAsistenciaTutor(@Body() createAsistenciaTutorDto: CreateAsistenciaTutorDto) {
    // CORRECCIÓN: Llamamos al método y DTO específicos de la asistencia del tutor
    return await this.vinculacionService.crearAsistenciaTutor(createAsistenciaTutorDto);
  }

@Post('vinculacion-estudiante')
  async crearVinculacion(@Body() createVinculacionDto: CreateVinculacionDto) {
    return await this.vinculacionService.crearVinculacion(createVinculacionDto);
  }

  @Post('informe')
  async crearInforme(@Body() createInformeDto: CreateInformeDto) {
    return await this.vinculacionService.crearInforme(createInformeDto);
  }

 @Get('acta-compromiso/:id')
  async obtenerActaCompromiso(@Param('id', ParseIntPipe) id: number) {
    return await this.vinculacionService.obtenerActaCompromiso(id);
  }

  @Get('asistencia-tutor/:id')
  async obtenerReporteAsistenciaTutor(@Param('id', ParseIntPipe) id: number) {
    return await this.vinculacionService.obtenerReporteAsistenciaTutor(id);
  }
  @Get('informe-actividades/:id')
  async obtenerInformeActividades(@Param('id', ParseIntPipe) id: number) {
    return await this.vinculacionService.obtenerInformeActividades(id);
  }

  @Get('certificado/:id')
  async obtenerCertificadoVinculacion(@Param('id', ParseIntPipe) id: number) {
    return await this.vinculacionService.obtenerCertificadoVinculacion(id);
  }
}
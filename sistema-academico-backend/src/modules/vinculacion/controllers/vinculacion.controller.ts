import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { VinculacionService } from '../services/vinculacion.service';

import { VinculacionActividadEstudiante } from '../domain/vinculacion_actividad_estudiante.entity';
import { VinculacionAsistenciaTutor } from '../domain/vinculacion-asistencia-tutor.entity';
import { VinculacionEstudianteEntity } from '../domain/vinculacion-estudiante.entity';
import { VinculacionInforme } from '../domain/vinculacion-informe.entity';
import { CreateAsistenciaTutorDto } from '../dto/create-asistencia-tutor.dto';
import { CreateActividadEstudianteDto } from '../dto/create-actividad-estudiante.dto';
import { CreateVinculacionDto } from '../dto/create-vinculacion.dto';
import { CreateInformeDto } from '../dto/create-informe.dto';
import { VinculacionObjetivo } from '../domain/vinculacion-objetivo.entity';
import { CreateVinculacionObjetivoDto } from '../dto/create-objetivo.dto';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@UseGuards(JwtGuard, RolesGuard)
@Roles('DOCENTE', 'ESTUDIANTE', 'TUTOR_EMPRESARIAL', 'COORDINADOR')
@Controller('vinculacion')
export class VinculacionController {
  constructor(private readonly vinculacionService: VinculacionService) {}

  // ====================================================================
  // 1. ENDPOINTS DE CREACIÓN (POST)
  // Usados por el Frontend para enviar datos de formularios.
  // ====================================================================

  @Post('vinculacion-estudiante')
  async crearVinculacion(@Body() createVinculacionDto: CreateVinculacionDto) {
    return await this.vinculacionService.crearVinculacion(createVinculacionDto);
  }

  @Post('objetivos')
  async crearObjetiivoEstudiante(@Body() createObjetivoEstudianteDto: CreateVinculacionObjetivoDto) {
    return await this.vinculacionService.crearObjetivo(createObjetivoEstudianteDto);
  }
  
  @Post('actividad-estudiante')
  async crearActividadEstudiante(@Body() createActividadEstudianteDto: CreateActividadEstudianteDto) {
    return await this.vinculacionService.crearActividadEstudiante(createActividadEstudianteDto);
  }

  @Post('asistencia-tutor')
  async crearAsistenciaTutor(@Body() createAsistenciaTutorDto: CreateAsistenciaTutorDto) {
    // Llamamos al método y DTO específicos de la asistencia del tutor
    return await this.vinculacionService.crearAsistenciaTutor(createAsistenciaTutorDto);
  }

  @Post('informe')
  async crearInforme(@Body() createInformeDto: CreateInformeDto) {
    return await this.vinculacionService.crearInforme(createInformeDto);
  }


  // ====================================================================
  // 2. ENDPOINTS DE CONSULTA GENERAL (GET)
  // Usados por el Frontend para poblar tablas de datos generales.
  // ====================================================================

  @Get('estudiantes')
  async obtenerVinculacionesEstudiantes(): Promise<VinculacionEstudianteEntity[]> {
    return await this.vinculacionService.obtenerVinculacionesEstudiantes();
  }

  @Get('objetivos')
  async obtenerObjetivos(): Promise<VinculacionObjetivo[]> {
    return await this.vinculacionService.obtenerTodosLosObjetivos();
  }

  @Get('actividades-estudiante')
  async obtenerTodasLasActividades(): Promise<VinculacionActividadEstudiante[]> {
    return await this.vinculacionService.obtenerTodasLasActividades();
  }

  @Get('asistencia-tutor')
  async obtenerAsistenciasTutor(): Promise<VinculacionAsistenciaTutor[]> {
    return await this.vinculacionService.obtenerAsistenciasTutor();
  }

  @Get('informes')
  async obtenerInformes(): Promise<VinculacionInforme[]> {
    return await this.vinculacionService.obtenerInformes();
  }


  // ====================================================================
  // 3. ENDPOINTS DE REPORTES Y DOCUMENTOS (GET por ID)
  // Usados por el Frontend para generar vistas detalladas o PDFs.
  // Requieren el ID de la vinculación principal.
  // ====================================================================

  @Get('reporte/:id')
  async obtenerReporteConsolidado(@Param('id', ParseIntPipe) id: number) {
    return await this.vinculacionService.obtenerReporteConsolidado(id);
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


  @Get('inicio-tutor/:id')
  async obtenerInicioActividadesTutor(@Param('id', ParseIntPipe) id: number) {
    return await this.vinculacionService.obtenerInicioActividadesTutor(id);
  }

  @Get('informe-final/:id')
  async obtenerInformeFinal(@Param('id', ParseIntPipe) id: number) {
    return await this.vinculacionService.obtenerInformeFinal(id);
  }


  // ====================================================================
  // 4. ENDPOINTS DE VALIDACIÓN Y ACCESO (GET)
  // Usados por el Frontend para saber si deben mostrar u ocultar pantallas.
  // ====================================================================

  @Get('verificar-acceso/:idEstudiante')
  async verificarAcceso(@Param('idEstudiante', ParseIntPipe) idEstudiante: number) {
    return await this.vinculacionService.verificarAccesoVinculacion(idEstudiante);
  }
@Get(':id/verificar-cierre')
  async verificarCierre(@Param('id') idVinculacion: number) {
    return await this.vinculacionService.verificarRequisitosCierre(idVinculacion);
  }


}









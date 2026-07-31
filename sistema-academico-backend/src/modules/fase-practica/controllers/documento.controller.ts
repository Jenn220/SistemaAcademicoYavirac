import { Req, Controller, Get, Post, UseGuards, Body, Query } from '@nestjs/common';
import { DocumentoService } from '../services/documento.service';
import { CreateDocumentoDto } from '../dto/create-documento.dto';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@UseGuards(JwtGuard, RolesGuard)
@Roles('DOCENTE', 'ESTUDIANTE', 'TUTOR_EMPRESARIAL', 'COORDINADOR')
@Controller('fase-practica/documentos')
export class DocumentoController {
  constructor(private readonly documentoService: DocumentoService) {}

  private parseIdPractica(idPractica?: string): number | undefined {
    return idPractica ? Number(idPractica) : undefined;
  }

  @Get('datos')
  getDatos(@Req() req: any, @Query('idPractica') idPractica?: string) {
    return this.documentoService.getDatosMaestra(req.user, this.parseIdPractica(idPractica));
  }

  @Get('carta-compromiso')
  getCartaCompromiso(@Req() req: any, @Query('idPractica') idPractica?: string) {
    return this.documentoService.getCartaCompromiso(req.user, this.parseIdPractica(idPractica));
  }

  @Get('curriculum')
  getCurriculum(@Req() req: any, @Query('idPractica') idPractica?: string) {
    return this.documentoService.getCurriculum(req.user, this.parseIdPractica(idPractica));
  }

  @Get('registro-asistencia')
  getRegistroAsistencia(@Req() req: any, @Query('idPractica') idPractica?: string) {
    return this.documentoService.getRegistroAsistencia(req.user, this.parseIdPractica(idPractica));
  }

  @Get('informe-aprendizaje')
  getInformeAprendizaje(@Req() req: any, @Query('idPractica') idPractica?: string) {
    return this.documentoService.getInformeAprendizaje(req.user, this.parseIdPractica(idPractica));
  }

  @Get('evaluacion-empresarial')
  getEvaluacionEmpresarial(@Req() req: any, @Query('idPractica') idPractica?: string) {
    return this.documentoService.getEvaluacionEmpresarial(req.user, this.parseIdPractica(idPractica));
  }

  @Get('evaluacion-instituto')
  getEvaluacionInstituto(@Req() req: any, @Query('idPractica') idPractica?: string) {
    return this.documentoService.getEvaluacionInstituto(req.user, this.parseIdPractica(idPractica));
  }

  @Get('acta-induccion-seguridad')
  getActaInduccionSeguridad(@Req() req: any, @Query('idPractica') idPractica?: string) {
    return this.documentoService.getActaInduccionSeguridad(req.user, this.parseIdPractica(idPractica));
  }

  @Get('acta-entorno-laboral')
  getActaEntornoLaboral(@Req() req: any, @Query('idPractica') idPractica?: string) {
    return this.documentoService.getActaEntornoLaboral(req.user, this.parseIdPractica(idPractica));
  }

  @Get('todos')
  getTodos(@Req() req: any, @Query('idPractica') idPractica?: string) {
    return this.documentoService.getTodosLosDocumentos(req.user, this.parseIdPractica(idPractica));
  }

  // Los POST tienen su propio @Roles por formato (más restrictivo que el de
  // la clase): TUTOR_EMPRESARIAL nunca guarda F01/F02/F05/F06/F10/F11;
  // ESTUDIANTE nunca guarda F07/F08; F08 es exclusivo de DOCENTE/COORDINADOR.

  @Post('carta-compromiso')
  @Roles('DOCENTE', 'ESTUDIANTE', 'COORDINADOR')
  async createCartaCompromiso(@Body() dto: CreateDocumentoDto, @Req() req: any, @Query('idPractica') idPractica?: string) {
    const contenido = dto?.contenido ?? await this.documentoService.getCartaCompromiso(req.user, this.parseIdPractica(idPractica));
    return this.documentoService.guardarDocumento('F01', 'Carta Compromiso', contenido);
  }

  @Post('curriculum')
  @Roles('DOCENTE', 'ESTUDIANTE', 'COORDINADOR')
  async createCurriculum(@Body() dto: CreateDocumentoDto, @Req() req: any, @Query('idPractica') idPractica?: string) {
    const contenido = dto?.contenido ?? await this.documentoService.getCurriculum(req.user, this.parseIdPractica(idPractica));
    return this.documentoService.guardarDocumento('F02', 'Curriculum Estandarizado', contenido);
  }

  @Post('registro-asistencia')
  @Roles('DOCENTE', 'ESTUDIANTE', 'COORDINADOR')
  async createRegistroAsistencia(@Body() dto: CreateDocumentoDto, @Req() req: any, @Query('idPractica') idPractica?: string) {
    const contenido = dto?.contenido ?? await this.documentoService.getRegistroAsistencia(req.user, this.parseIdPractica(idPractica));
    return this.documentoService.guardarDocumento('F05', 'Registro de Asistencia', contenido);
  }

  @Post('informe-aprendizaje')
  @Roles('DOCENTE', 'ESTUDIANTE', 'COORDINADOR')
  async createInformeAprendizaje(@Body() dto: CreateDocumentoDto, @Req() req: any, @Query('idPractica') idPractica?: string) {
    const contenido = dto?.contenido ?? await this.documentoService.getInformeAprendizaje(req.user, this.parseIdPractica(idPractica));
    return this.documentoService.guardarDocumento('F06', 'Informe de Aprendizaje', contenido);
  }

  @Post('evaluacion-empresarial')
  @Roles('DOCENTE', 'COORDINADOR', 'TUTOR_EMPRESARIAL')
  async createEvaluacionEmpresarial(@Body() dto: CreateDocumentoDto, @Req() req: any, @Query('idPractica') idPractica?: string) {
    const contenido = dto?.contenido ?? await this.documentoService.getEvaluacionEmpresarial(req.user, this.parseIdPractica(idPractica));
    return this.documentoService.guardarDocumento('F07', 'Evaluación Empresarial', contenido);
  }

  @Post('evaluacion-instituto')
  @Roles('DOCENTE', 'COORDINADOR')
  async createEvaluacionInstituto(@Body() dto: CreateDocumentoDto, @Req() req: any, @Query('idPractica') idPractica?: string) {
    const contenido = dto?.contenido ?? await this.documentoService.getEvaluacionInstituto(req.user, this.parseIdPractica(idPractica));
    return this.documentoService.guardarDocumento('F08', 'Evaluación Instituto', contenido);
  }

  @Post('acta-induccion-seguridad')
  @Roles('DOCENTE', 'ESTUDIANTE', 'COORDINADOR')
  async createActaInduccionSeguridad(@Body() dto: CreateDocumentoDto, @Req() req: any, @Query('idPractica') idPractica?: string) {
    const contenido = dto?.contenido ?? await this.documentoService.getActaInduccionSeguridad(req.user, this.parseIdPractica(idPractica));
    return this.documentoService.guardarDocumento('F10', 'Acta de Inducción de Seguridad', contenido);
  }

  @Post('acta-entorno-laboral')
  @Roles('DOCENTE', 'ESTUDIANTE', 'COORDINADOR')
  async createActaEntornoLaboral(@Body() dto: CreateDocumentoDto, @Req() req: any, @Query('idPractica') idPractica?: string) {
    const contenido = dto?.contenido ?? await this.documentoService.getActaEntornoLaboral(req.user, this.parseIdPractica(idPractica));
    return this.documentoService.guardarDocumento('F11', 'Acta del Entorno Laboral Real', contenido);
  }
}

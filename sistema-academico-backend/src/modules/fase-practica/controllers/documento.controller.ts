import { Req, Controller, Get, Post, Patch, UseGuards, Body, Query, Param, BadRequestException } from '@nestjs/common';
import { DocumentoService } from '../services/documento.service';
import { CreateDocumentoDto } from '../dto/create-documento.dto';
import { ActualizarEstadoDocumentoDto } from '../dto/actualizar-estado-documento.dto';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@UseGuards(JwtGuard, RolesGuard)
@Roles('DOCENTE', 'ESTUDIANTE', 'TUTOR_EMPRESARIAL', 'COORDINADOR')
@Controller('fase-practica/documentos')
export class DocumentoController {
  constructor(private readonly documentoService: DocumentoService) {}

  private parseIdPractica(idPractica?: string): number | undefined {
    if (!idPractica) return undefined;
    const num = Number(idPractica);
    return Number.isInteger(num) && num > 0 ? num : undefined;
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

  @Get('buscar')
  buscarIdDocumento(@Query('idPractica') idPractica: string, @Query('codigoFormato') codigoFormato: string) {
    const idNum = Number(idPractica);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      throw new BadRequestException('Identificador de práctica inválido.');
    }
    return this.documentoService.buscarIdDocumento(idNum, codigoFormato);
  }

  @Patch(':id/estado')
  @Roles('DOCENTE', 'ESTUDIANTE', 'COORDINADOR', 'TUTOR_EMPRESARIAL')
  actualizarEstado(@Req() req: any, @Param('id') id: string, @Body() dto: ActualizarEstadoDocumentoDto) {
    const idNum = Number(id);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      throw new BadRequestException('Identificador de documento inválido.');
    }
    return this.documentoService.cambiarEstado(idNum, dto.estado, dto.comentarios, req.user);
  }

  @Get(':id')
  @Roles('DOCENTE', 'ESTUDIANTE', 'TUTOR_EMPRESARIAL', 'COORDINADOR')
  buscarPorId(@Param('id') id: string) {
    const idNum = Number(id);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      throw new BadRequestException('Identificador de documento inválido.');
    }
    return this.documentoService.buscarPorId(idNum);
  }

  // Los POST tienen su propio @Roles por formato (más restrictivo que el de
  // la clase): TUTOR_EMPRESARIAL nunca guarda F01/F02/F05/F06/F10/F11;
  // ESTUDIANTE nunca guarda F07/F08. F07/F08 ahora los crea TUTOR_EMPRESARIAL
  // y los aprueba el DOCENTE (tutor académico asignado).

  @Post('carta-compromiso')
  @Roles('DOCENTE', 'ESTUDIANTE', 'COORDINADOR')

  @Post('carta-compromiso')
  @Roles('DOCENTE', 'ESTUDIANTE', 'COORDINADOR')
  async createCartaCompromiso(@Body() dto: CreateDocumentoDto, @Req() req: any, @Query('idPractica') idPractica?: string) {
    const contenido = dto?.contenido ?? await this.documentoService.getCartaCompromiso(req.user, this.parseIdPractica(idPractica));
    return this.documentoService.guardarDocumento('F01', 'Carta Compromiso', contenido, this.parseIdPractica(idPractica), req.user.idEstudiante ?? undefined, req.user.sub);
  }

  @Post('curriculum')
  @Roles('DOCENTE', 'ESTUDIANTE', 'COORDINADOR')
  async createCurriculum(@Body() dto: CreateDocumentoDto, @Req() req: any, @Query('idPractica') idPractica?: string) {
    const contenido = dto?.contenido ?? await this.documentoService.getCurriculum(req.user, this.parseIdPractica(idPractica));
    return this.documentoService.guardarDocumento('F02', 'Curriculum Estandarizado', contenido, this.parseIdPractica(idPractica), req.user.idEstudiante ?? undefined, req.user.sub);
  }

  @Post('registro-asistencia')
  @Roles('DOCENTE', 'ESTUDIANTE', 'COORDINADOR')
  async createRegistroAsistencia(@Body() dto: CreateDocumentoDto, @Req() req: any, @Query('idPractica') idPractica?: string) {
    const contenido = dto?.contenido ?? await this.documentoService.getRegistroAsistencia(req.user, this.parseIdPractica(idPractica));
    console.log('Guardando registro de asistencia', { idPractica: this.parseIdPractica(idPractica), userId: req.user.sub, contenidoKeys: Object.keys(contenido || {}) });
    const resultado = await this.documentoService.guardarDocumento('F05', 'Registro de Asistencia', contenido, this.parseIdPractica(idPractica), req.user.idEstudiante ?? undefined, req.user.sub);
    console.log('Registro de asistencia guardado', { idDocumento: resultado.id_documento });
    return resultado;
  }

  @Post('informe-aprendizaje')
  @Roles('DOCENTE', 'ESTUDIANTE', 'COORDINADOR')
  async createInformeAprendizaje(@Body() dto: CreateDocumentoDto, @Req() req: any, @Query('idPractica') idPractica?: string) {
    const contenido = dto?.contenido ?? await this.documentoService.getInformeAprendizaje(req.user, this.parseIdPractica(idPractica));
    return this.documentoService.guardarDocumento('F06', 'Informe de Aprendizaje', contenido, this.parseIdPractica(idPractica), req.user.idEstudiante ?? undefined, req.user.sub);
  }

  @Post('evaluacion-empresarial')
  @Roles('DOCENTE', 'COORDINADOR', 'TUTOR_EMPRESARIAL')
  async createEvaluacionEmpresarial(@Body() dto: CreateDocumentoDto, @Req() req: any, @Query('idPractica') idPractica?: string) {
    const contenido = dto?.contenido ?? await this.documentoService.getEvaluacionEmpresarial(req.user, this.parseIdPractica(idPractica));
    return this.documentoService.guardarDocumento('F07', 'Evaluación Empresarial', contenido, this.parseIdPractica(idPractica), req.user.idEstudiante ?? undefined, req.user.sub);
  }

  @Post('evaluacion-instituto')
  @Roles('DOCENTE', 'COORDINADOR', 'TUTOR_EMPRESARIAL')
  async createEvaluacionInstituto(@Body() dto: CreateDocumentoDto, @Req() req: any, @Query('idPractica') idPractica?: string) {
    const contenido = dto?.contenido ?? await this.documentoService.getEvaluacionInstituto(req.user, this.parseIdPractica(idPractica));
    return this.documentoService.guardarDocumento('F08', 'Evaluación Instituto', contenido, this.parseIdPractica(idPractica), req.user.idEstudiante ?? undefined, req.user.sub);
  }

  @Post('acta-induccion-seguridad')
  @Roles('DOCENTE', 'ESTUDIANTE', 'COORDINADOR')
  async createActaInduccionSeguridad(@Body() dto: CreateDocumentoDto, @Req() req: any, @Query('idPractica') idPractica?: string) {
    const contenido = dto?.contenido ?? await this.documentoService.getActaInduccionSeguridad(req.user, this.parseIdPractica(idPractica));
    return this.documentoService.guardarDocumento('F10', 'Acta de Inducción de Seguridad', contenido, this.parseIdPractica(idPractica), req.user.idEstudiante ?? undefined, req.user.sub);
  }

  @Post('acta-entorno-laboral')
  @Roles('DOCENTE', 'ESTUDIANTE', 'COORDINADOR')
  async createActaEntornoLaboral(@Body() dto: CreateDocumentoDto, @Req() req: any, @Query('idPractica') idPractica?: string) {
    const contenido = dto?.contenido ?? await this.documentoService.getActaEntornoLaboral(req.user, this.parseIdPractica(idPractica));
    return this.documentoService.guardarDocumento('F11', 'Acta del Entorno Laboral Real', contenido, this.parseIdPractica(idPractica), req.user.idEstudiante ?? undefined, req.user.sub);
  }
}

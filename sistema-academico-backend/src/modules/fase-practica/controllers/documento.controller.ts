import { Req, Controller, Get, Post, UseGuards, Body } from '@nestjs/common';
import { DocumentoService } from '../services/documento.service';
import { CreateDocumentoDto } from '../dto/create-documento.dto';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@UseGuards(JwtGuard, RolesGuard)
@Controller('fase-practica/documentos')
export class DocumentoController {
  constructor(private readonly documentoService: DocumentoService) {}

  @Get('datos')
  @Roles('DOCENTE', 'ESTUDIANTE', 'TUTOR_EMPRESARIAL', 'COORDINADOR')
  getDatos(@Req() req: any) {
    const usuario = req.user;
    return this.documentoService.getDatosMaestra(usuario);
  }

  @Get('carta-compromiso')
  @Roles('DOCENTE', 'ESTUDIANTE', 'TUTOR_EMPRESARIAL', 'COORDINADOR')
  getCartaCompromiso(@Req() req: any) {
    const usuario = req.user;
    return this.documentoService.getCartaCompromiso(usuario);
  }

  @Get('curriculum')
  @Roles('DOCENTE', 'ESTUDIANTE', 'TUTOR_EMPRESARIAL', 'COORDINADOR')
  getCurriculum(@Req() req: any) {
    const usuario = req.user;
    return this.documentoService.getCurriculum(usuario);
  }

  @Get('registro-asistencia')
  @Roles('DOCENTE', 'ESTUDIANTE', 'TUTOR_EMPRESARIAL', 'COORDINADOR')
  getRegistroAsistencia(@Req() req: any) {
    const usuario = req.user;
    return this.documentoService.getRegistroAsistencia(usuario);
  }

  @Get('informe-aprendizaje')
  @Roles('DOCENTE', 'ESTUDIANTE', 'TUTOR_EMPRESARIAL', 'COORDINADOR')
  getInformeAprendizaje(@Req() req: any) {
    const usuario = req.user;
    return this.documentoService.getInformeAprendizaje(usuario);
  }

  @Get('evaluacion-empresarial')
  @Roles('DOCENTE', 'ESTUDIANTE', 'TUTOR_EMPRESARIAL', 'COORDINADOR')
  getEvaluacionEmpresarial(@Req() req: any) {
    const usuario = req.user;
    return this.documentoService.getEvaluacionEmpresarial(usuario);
  }

  @Get('evaluacion-instituto')
  @Roles('DOCENTE', 'ESTUDIANTE', 'TUTOR_EMPRESARIAL', 'COORDINADOR')
  getEvaluacionInstituto(@Req() req: any) {
    const usuario = req.user;
    return this.documentoService.getEvaluacionInstituto(usuario);
  }

  @Get('acta-induccion-seguridad')
  @Roles('DOCENTE', 'ESTUDIANTE', 'TUTOR_EMPRESARIAL', 'COORDINADOR')
  getActaInduccionSeguridad(@Req() req: any) {
    const usuario = req.user;
    return this.documentoService.getActaInduccionSeguridad(usuario);
  }

  @Get('acta-entorno-laboral')
  @Roles('DOCENTE', 'ESTUDIANTE', 'TUTOR_EMPRESARIAL', 'COORDINADOR')
  getActaEntornoLaboral(@Req() req: any) {
    const usuario = req.user;
    return this.documentoService.getActaEntornoLaboral(usuario);
  }

  @Get('todos')
  @Roles('DOCENTE', 'ESTUDIANTE', 'TUTOR_EMPRESARIAL', 'COORDINADOR')
  getTodos(@Req() req: any) {
    const usuario = req.user;
    return this.documentoService.getTodosLosDocumentos(usuario);
  }

  @Post('carta-compromiso')
  @Roles('DOCENTE', 'ESTUDIANTE', 'COORDINADOR')
  createCartaCompromiso(@Body() dto: CreateDocumentoDto, @Req() req: any) {
    const usuario = req.user;
    const contenido = dto?.contenido ?? this.documentoService.getCartaCompromiso(usuario);
    return this.documentoService.guardarDocumento('F01', 'Carta Compromiso', contenido);
  }

  @Post('curriculum')
  @Roles('DOCENTE', 'ESTUDIANTE', 'COORDINADOR')
  createCurriculum(@Body() dto: CreateDocumentoDto, @Req() req: any) {
    const usuario = req.user;
    const contenido = dto?.contenido ?? this.documentoService.getCurriculum(usuario);
    return this.documentoService.guardarDocumento('F02', 'Curriculum Estandarizado', contenido);
  }

  @Post('registro-asistencia')
  @Roles('DOCENTE', 'ESTUDIANTE', 'COORDINADOR')
  createRegistroAsistencia(@Body() dto: CreateDocumentoDto, @Req() req: any) {
    const usuario = req.user;
    const contenido = dto?.contenido ?? this.documentoService.getRegistroAsistencia(usuario);
    return this.documentoService.guardarDocumento('F05', 'Registro de Asistencia', contenido);
  }

  @Post('informe-aprendizaje')
  @Roles('DOCENTE', 'ESTUDIANTE', 'COORDINADOR')
  createInformeAprendizaje(@Body() dto: CreateDocumentoDto, @Req() req: any) {
    const usuario = req.user;
    const contenido = dto?.contenido ?? this.documentoService.getInformeAprendizaje(usuario);
    return this.documentoService.guardarDocumento('F06', 'Informe de Aprendizaje', contenido);
  }

  @Post('evaluacion-empresarial')
  @Roles('DOCENTE', 'COORDINADOR', 'TUTOR_EMPRESARIAL')
  createEvaluacionEmpresarial(@Body() dto: CreateDocumentoDto, @Req() req: any) {
    const usuario = req.user;
    const contenido = dto?.contenido ?? this.documentoService.getEvaluacionEmpresarial(usuario);
    return this.documentoService.guardarDocumento('F07', 'Evaluación Empresarial', contenido);
  }

  @Post('evaluacion-instituto')
  @Roles('DOCENTE', 'COORDINADOR')
  createEvaluacionInstituto(@Body() dto: CreateDocumentoDto, @Req() req: any) {
    const usuario = req.user;
    const contenido = dto?.contenido ?? this.documentoService.getEvaluacionInstituto(usuario);
    return this.documentoService.guardarDocumento('F08', 'Evaluación Instituto', contenido);
  }

  @Post('acta-induccion-seguridad')
  @Roles('DOCENTE', 'ESTUDIANTE', 'COORDINADOR')
  createActaInduccionSeguridad(@Body() dto: CreateDocumentoDto, @Req() req: any) {
    const usuario = req.user;
    const contenido = dto?.contenido ?? this.documentoService.getActaInduccionSeguridad(usuario);
    return this.documentoService.guardarDocumento('F10', 'Acta de Inducción de Seguridad', contenido);
  }

  @Post('acta-entorno-laboral')
  @Roles('DOCENTE', 'ESTUDIANTE', 'COORDINADOR')
  createActaEntornoLaboral(@Body() dto: CreateDocumentoDto, @Req() req: any) {
    const usuario = req.user;
    const contenido = dto?.contenido ?? this.documentoService.getActaEntornoLaboral(usuario);
    return this.documentoService.guardarDocumento('F11', 'Acta del Entorno Laboral Real', contenido);
  }
}

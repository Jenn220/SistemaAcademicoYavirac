import { Req, Controller, Get, Post, UseGuards, Body } from '@nestjs/common';
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

  @Get('datos')
  getDatos(@Req() req: any) {
    const usuario = req.user;
    return this.documentoService.getDatosMaestra(usuario);
  }

  @Get('carta-compromiso')
  getCartaCompromiso(@Req() req: any) {
    const usuario = req.user;
    return this.documentoService.getCartaCompromiso(usuario);
  }

  @Get('curriculum')
  getCurriculum(@Req() req: any) {
    const usuario = req.user;
    return this.documentoService.getCurriculum(usuario);
  }

  @Get('registro-asistencia')
  getRegistroAsistencia(@Req() req: any) {
    const usuario = req.user;
    return this.documentoService.getRegistroAsistencia(usuario);
  }

  @Get('informe-aprendizaje')
  getInformeAprendizaje(@Req() req: any) {
    const usuario = req.user;
    return this.documentoService.getInformeAprendizaje(usuario);
  }

  @Get('evaluacion-empresarial')
  getEvaluacionEmpresarial(@Req() req: any) {
    const usuario = req.user;
    return this.documentoService.getEvaluacionEmpresarial(usuario);
  }

  @Get('evaluacion-instituto')
  getEvaluacionInstituto(@Req() req: any) {
    const usuario = req.user;
    return this.documentoService.getEvaluacionInstituto(usuario);
  }

  @Get('todos')
  getTodos(@Req() req: any) {
    const usuario = req.user;
    return this.documentoService.getTodosLosDocumentos(usuario);
  }

  @Post('carta-compromiso')
  createCartaCompromiso(@Body() dto: CreateDocumentoDto, @Req() req: any) {
    const usuario = req.user;
    const contenido = dto?.contenido ?? this.documentoService.getCartaCompromiso(usuario);
    return this.documentoService.guardarDocumento('F01', 'Carta Compromiso', contenido);
  }

  @Post('curriculum')
  createCurriculum(@Body() dto: CreateDocumentoDto, @Req() req: any) {
    const usuario = req.user;
    const contenido = dto?.contenido ?? this.documentoService.getCurriculum(usuario);
    return this.documentoService.guardarDocumento('F02', 'Curriculum Estandarizado', contenido);
  }

  @Post('registro-asistencia')
  createRegistroAsistencia(@Body() dto: CreateDocumentoDto, @Req() req: any) {
    const usuario = req.user;
    const contenido = dto?.contenido ?? this.documentoService.getRegistroAsistencia(usuario);
    return this.documentoService.guardarDocumento('F05', 'Registro de Asistencia', contenido);
  }

  @Post('informe-aprendizaje')
  createInformeAprendizaje(@Body() dto: CreateDocumentoDto, @Req() req: any) {
    const usuario = req.user;
    const contenido = dto?.contenido ?? this.documentoService.getInformeAprendizaje(usuario);
    return this.documentoService.guardarDocumento('F06', 'Informe de Aprendizaje', contenido);
  }

  @Post('evaluacion-empresarial')
  createEvaluacionEmpresarial(@Body() dto: CreateDocumentoDto, @Req() req: any) {
    const usuario = req.user;
    const contenido = dto?.contenido ?? this.documentoService.getEvaluacionEmpresarial(usuario);
    return this.documentoService.guardarDocumento('F07', 'Evaluación Empresarial', contenido);
  }

  @Post('evaluacion-instituto')
  createEvaluacionInstituto(@Body() dto: CreateDocumentoDto, @Req() req: any) {
    const usuario = req.user;
    const contenido = dto?.contenido ?? this.documentoService.getEvaluacionInstituto(usuario);
    return this.documentoService.guardarDocumento('F08', 'Evaluación Instituto', contenido);
  }
}

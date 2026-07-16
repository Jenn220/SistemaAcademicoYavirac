import { Body, Controller, Get, Post } from '@nestjs/common';
import { DocumentoService } from '../services/documento.service';
import { CreateDocumentoDto } from '../dto/create-documento.dto';

@Controller('fase-practica/documentos')
export class DocumentoController {
  constructor(private readonly documentoService: DocumentoService) {}

  @Get('datos')
  getDatos() {
    return this.documentoService.getDatosMaestra();
  }

  @Get('carta-compromiso')
  getCartaCompromiso() {
    return this.documentoService.getCartaCompromiso();
  }

  @Get('curriculum')
  getCurriculum() {
    return this.documentoService.getCurriculum();
  }

  @Get('registro-asistencia')
  getRegistroAsistencia() {
    return this.documentoService.getRegistroAsistencia();
  }

  @Get('informe-aprendizaje')
  getInformeAprendizaje() {
    return this.documentoService.getInformeAprendizaje();
  }

  @Get('evaluacion-empresarial')
  getEvaluacionEmpresarial() {
    return this.documentoService.getEvaluacionEmpresarial();
  }

  @Get('evaluacion-instituto')
  getEvaluacionInstituto() {
    return this.documentoService.getEvaluacionInstituto();
  }

  @Get('todos')
  getTodos() {
    return this.documentoService.getTodosLosDocumentos();
  }

  @Post('carta-compromiso')
  createCartaCompromiso(@Body() dto: CreateDocumentoDto) {
    const contenido = dto?.contenido ?? this.documentoService.getCartaCompromiso();
    return this.documentoService.guardarDocumento('F01', 'Carta Compromiso', contenido);
  }

  @Post('curriculum')
  createCurriculum(@Body() dto: CreateDocumentoDto) {
    const contenido = dto?.contenido ?? this.documentoService.getCurriculum();
    return this.documentoService.guardarDocumento('F02', 'Curriculum Estandarizado', contenido);
  }

  @Post('registro-asistencia')
  createRegistroAsistencia(@Body() dto: CreateDocumentoDto) {
    const contenido = dto?.contenido ?? this.documentoService.getRegistroAsistencia();
    return this.documentoService.guardarDocumento('F05', 'Registro de Asistencia', contenido);
  }

  @Post('informe-aprendizaje')
  createInformeAprendizaje(@Body() dto: CreateDocumentoDto) {
    const contenido = dto?.contenido ?? this.documentoService.getInformeAprendizaje();
    return this.documentoService.guardarDocumento('F06', 'Informe de Aprendizaje', contenido);
  }

  @Post('evaluacion-empresarial')
  createEvaluacionEmpresarial(@Body() dto: CreateDocumentoDto) {
    const contenido = dto?.contenido ?? this.documentoService.getEvaluacionEmpresarial();
    return this.documentoService.guardarDocumento('F07', 'Evaluación Empresarial', contenido);
  }

  @Post('evaluacion-instituto')
  createEvaluacionInstituto(@Body() dto: CreateDocumentoDto) {
    const contenido = dto?.contenido ?? this.documentoService.getEvaluacionInstituto();
    return this.documentoService.guardarDocumento('F08', 'Evaluación Instituto', contenido);
  }
}

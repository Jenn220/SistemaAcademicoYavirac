import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { DOCUMENTO_REPOSITORY, IDocumentoRepository } from '../ports/documento.repository.port';
import { DocumentoEntity } from '../domain/documento.entity';
import { DocumentoPlantillaService } from './documento-plantilla.service';

@Injectable()
export class DocumentoService {
  constructor(
    @Inject(DOCUMENTO_REPOSITORY)
    private readonly documentoRepository: IDocumentoRepository,
    private readonly plantillaService: DocumentoPlantillaService,
  ) {}

  async guardarDocumento(
    codigo: string,
    titulo: string,
    contenido: Record<string, any>,
  ): Promise<DocumentoEntity> {
    return this.documentoRepository.guardarDocumento(codigo, titulo, contenido);
  }

  getDatosMaestra() {
    return this.plantillaService.getDatosMaestra();
  }

  getCartaCompromiso() {
    return this.plantillaService.getCartaCompromiso();
  }

  getCurriculum() {
    return this.plantillaService.getCurriculum();
  }

  getRegistroAsistencia() {
    return this.plantillaService.getRegistroAsistencia();
  }

  getInformeAprendizaje() {
    return this.plantillaService.getInformeAprendizaje();
  }

  getEvaluacionEmpresarial() {
    return this.plantillaService.getEvaluacionEmpresarial();
  }

  getEvaluacionInstituto() {
    return this.plantillaService.getEvaluacionInstituto();
  }

  getTodosLosDocumentos() {
    return this.plantillaService.getTodosLosDocumentos();
  }
}

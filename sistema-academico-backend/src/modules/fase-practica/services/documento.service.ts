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
    contenido: any,
  ): Promise<DocumentoEntity> {
    return this.documentoRepository.guardarDocumento(codigo, titulo, contenido);
  }

  getDatosMaestra(usuario: any) {
    return this.plantillaService.getDatosMaestra(usuario);
  }

  getCartaCompromiso(usuario: any) {
    return this.plantillaService.getCartaCompromiso(usuario);
  }

  getCurriculum(usuario: any) {
    return this.plantillaService.getCurriculum(usuario);
  }

  getRegistroAsistencia(usuario: any) {
    return this.plantillaService.getRegistroAsistencia(usuario);
  }

  getInformeAprendizaje(usuario: any) {
    return this.plantillaService.getInformeAprendizaje(usuario);
  }

  getEvaluacionEmpresarial(usuario: any) {
    return this.plantillaService.getEvaluacionEmpresarial(usuario);
  }

  getEvaluacionInstituto(usuario: any) {
    return this.plantillaService.getEvaluacionInstituto(usuario);
  }

  getActaInduccionSeguridad(usuario: any) {
    return this.plantillaService.getActaInduccionSeguridad(usuario);
  }

  getActaEntornoLaboral(usuario: any) {
    return this.plantillaService.getActaEntornoLaboral(usuario);
  }

  getTodosLosDocumentos(usuario: any) {
    return this.plantillaService.getTodosLosDocumentos(usuario);
  }
}

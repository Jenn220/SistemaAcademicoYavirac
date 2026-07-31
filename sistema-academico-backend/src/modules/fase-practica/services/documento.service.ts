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

  getDatosMaestra(usuario: any, idPractica?: number) {
    return this.plantillaService.getDatosMaestra(usuario, idPractica);
  }

  getCartaCompromiso(usuario: any, idPractica?: number) {
    return this.plantillaService.getCartaCompromiso(usuario, idPractica);
  }

  getCurriculum(usuario: any, idPractica?: number) {
    return this.plantillaService.getCurriculum(usuario, idPractica);
  }

  getRegistroAsistencia(usuario: any, idPractica?: number) {
    return this.plantillaService.getRegistroAsistencia(usuario, idPractica);
  }

  getInformeAprendizaje(usuario: any, idPractica?: number) {
    return this.plantillaService.getInformeAprendizaje(usuario, idPractica);
  }

  getEvaluacionEmpresarial(usuario: any, idPractica?: number) {
    return this.plantillaService.getEvaluacionEmpresarial(usuario, idPractica);
  }

  getEvaluacionInstituto(usuario: any, idPractica?: number) {
    return this.plantillaService.getEvaluacionInstituto(usuario, idPractica);
  }

  getActaInduccionSeguridad(usuario: any, idPractica?: number) {
    return this.plantillaService.getActaInduccionSeguridad(usuario, idPractica);
  }

  getActaEntornoLaboral(usuario: any, idPractica?: number) {
    return this.plantillaService.getActaEntornoLaboral(usuario, idPractica);
  }

  getTodosLosDocumentos(usuario: any, idPractica?: number) {
    return this.plantillaService.getTodosLosDocumentos(usuario, idPractica);
  }
}

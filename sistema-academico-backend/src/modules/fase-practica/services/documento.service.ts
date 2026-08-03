import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { DOCUMENTO_REPOSITORY, IDocumentoRepository } from '../ports/documento.repository.port';
import { DocumentoEntity } from '../domain/documento.entity';
import { DocumentoPlantillaService } from './documento-plantilla.service';
import { NotificacionService } from './notificacion.service';

@Injectable()
export class DocumentoService {
  constructor(
    @Inject(DOCUMENTO_REPOSITORY)
    private readonly documentoRepository: IDocumentoRepository,
    private readonly plantillaService: DocumentoPlantillaService,
    private readonly notificacionService: NotificacionService,
  ) {}

  async guardarDocumento(
    codigo: string,
    titulo: string,
    contenido: any,
    idPractica?: number,
    idEstudiante?: number,
    idUsuario?: number,
    estado?: string,
  ): Promise<DocumentoEntity> {
    try {
      const documento = await this.documentoRepository.guardarDocumento(codigo, titulo, contenido, idPractica, idEstudiante, idUsuario, estado);
      console.log('Documento guardado', { codigo, idPractica, idDocumento: documento.id_documento });
      return documento;
    } catch (error: any) {
      console.error('Error guardando documento', { codigo, idPractica, error: error?.message || error });
      throw error;
    }
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

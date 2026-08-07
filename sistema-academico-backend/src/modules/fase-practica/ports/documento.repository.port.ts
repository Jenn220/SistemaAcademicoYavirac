import { DocumentoEntity } from '../domain/documento.entity';

export const DOCUMENTO_REPOSITORY = 'DocumentoRepository';

export interface IDocumentoRepository {
  guardarDocumento(
    codigo: string,
    titulo: string,
    contenido: Record<string, any>,
    idPractica?: number,
    idEstudiante?: number,
    idUsuario?: number,
    estado?: string,
  ): Promise<DocumentoEntity>;

  buscarPorPracticaYCodigo(idPractica: number, codigoFormato: string): Promise<DocumentoEntity | null>;

  listarPorPractica(idPractica: number): Promise<DocumentoEntity[]>;

  findOne(options: any): Promise<DocumentoEntity | null>;

  actualizarEstado(idDocumento: number, estado: string, comentarios?: string): Promise<DocumentoEntity | null>;

  buscarPorId(idDocumento: number): Promise<DocumentoEntity | null>;
}

import { DocumentoEntity } from '../domain/documento.entity';

export const DOCUMENTO_REPOSITORY = 'DocumentoRepository';

export interface IDocumentoRepository {
  guardarDocumento(codigo: string, titulo: string, contenido: Record<string, any>): Promise<DocumentoEntity>;
}

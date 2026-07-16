import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentoEntity } from '../domain/documento.entity';
import { DOCUMENTO_REPOSITORY, IDocumentoRepository } from '../ports/documento.repository.port';

@Injectable()
export class DocumentoPg implements IDocumentoRepository {
  constructor(
    @InjectRepository(DocumentoEntity)
    private readonly documentoRepository: Repository<DocumentoEntity>,
  ) {}

  async guardarDocumento(codigo: string, titulo: string, contenido: Record<string, any>): Promise<DocumentoEntity> {
    const documento = this.documentoRepository.create({
      codigo_formato: codigo,
      titulo,
      contenido,
    });
    return this.documentoRepository.save(documento);
  }
}

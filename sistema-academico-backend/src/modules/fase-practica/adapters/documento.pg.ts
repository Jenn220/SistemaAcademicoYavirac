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

  async guardarDocumento(
    codigo: string,
    titulo: string,
    contenido: Record<string, any>,
    idPractica?: number,
    idEstudiante?: number,
    idUsuario?: number,
    estado?: string,
  ): Promise<DocumentoEntity> {
    if (idPractica) {
      const existente = await this.buscarPorPracticaYCodigo(idPractica, codigo);

      if (existente) {
        existente.contenido = contenido;
        existente.updated_at = new Date();
        if (idEstudiante) existente.id_estudiante = idEstudiante;
        if (idUsuario) existente.id_usuario = idUsuario;
        if (estado !== undefined) existente.estado = estado;
        existente.version = (existente.version ?? 1) + 1;
        console.log('Actualizando documento existente', { idPractica, codigo, idDocumento: existente.id_documento });
        return this.documentoRepository.save(existente);
      }
    }

    console.log('Creando nuevo documento', { codigo, idPractica, idEstudiante });
    const estadoFinal = estado ?? 'borrador';
    const documento = this.documentoRepository.create({
      codigo_formato: codigo,
      titulo,
      contenido,
      id_practica: idPractica,
      id_estudiante: idEstudiante,
      id_usuario: idUsuario,
      estado: estadoFinal,
      version: 1,
    });
    return this.documentoRepository.save(documento);
  }

  async buscarPorPracticaYCodigo(idPractica: number, codigoFormato: string): Promise<DocumentoEntity | null> {
    const resultado = await this.documentoRepository.findOne({
      where: [
        { id_practica: idPractica, codigo_formato: codigoFormato },
      ],
      order: { id_documento: 'DESC' },
    });
    return resultado ?? null;
  }

  async listarPorPractica(idPractica: number): Promise<DocumentoEntity[]> {
    return this.documentoRepository.find({
      where: { id_practica: idPractica },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(options: any): Promise<DocumentoEntity | null> {
    return this.documentoRepository.findOne(options);
  }

  async actualizarEstado(idDocumento: number, estado: string, comentarios?: string): Promise<DocumentoEntity | null> {
    const documento = await this.documentoRepository.findOne({
      where: { id_documento: idDocumento },
    });

    if (!documento) {
      return null;
    }

    documento.estado = estado;
    documento.updated_at = new Date();

    if (comentarios !== undefined) {
      documento.comentarios = comentarios;
    }

    return this.documentoRepository.save(documento);
  }

  async buscarPorId(idDocumento: number): Promise<DocumentoEntity | null> {
    return this.documentoRepository.findOne({
      where: { id_documento: idDocumento },
    });
  }
}

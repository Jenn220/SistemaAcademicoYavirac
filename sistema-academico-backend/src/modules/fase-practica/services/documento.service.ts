import { ForbiddenException, Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { DOCUMENTO_REPOSITORY, IDocumentoRepository } from '../ports/documento.repository.port';
import { DocumentoEntity } from '../domain/documento.entity';
import { DocumentoPlantillaService } from './documento-plantilla.service';
import { NotificacionService } from './notificacion.service';
import { EstadoDocumento } from '../dto/actualizar-estado-documento.dto';
import { DataSource } from 'typeorm';

@Injectable()
export class DocumentoService {
  constructor(
    @Inject(DOCUMENTO_REPOSITORY)
    private readonly documentoRepository: IDocumentoRepository,
    private readonly plantillaService: DocumentoPlantillaService,
    private readonly notificacionService: NotificacionService,
    private readonly dataSource: DataSource,
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

  async buscarIdDocumento(idPractica: number, codigoFormato: string): Promise<{ id_documento: number } | null> {
    const documento = await this.documentoRepository.buscarPorPracticaYCodigo(idPractica, codigoFormato);
    return documento ? { id_documento: documento.id_documento } : null;
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

  async actualizarDocumentosPorPractica(usuario: any, idPractica: number): Promise<void> {
    const documentos = await this.documentoRepository.listarPorPractica(idPractica);

    const generadores: Record<string, (usuario: any, idPractica?: number) => Promise<any>> = {
      F01: (u, id) => this.plantillaService.getCartaCompromiso(u, id, true),
      F02: (u, id) => this.plantillaService.getCurriculum(u, id, true),
      F05: (u, id) => this.plantillaService.getRegistroAsistencia(u, id, true),
      F06: (u, id) => this.plantillaService.getInformeAprendizaje(u, id, true),
      F07: (u, id) => this.plantillaService.getEvaluacionEmpresarial(u, id, true),
      F08: (u, id) => this.plantillaService.getEvaluacionInstituto(u, id, true),
      F10: (u, id) => this.plantillaService.getActaInduccionSeguridad(u, id, true),
      F11: (u, id) => this.plantillaService.getActaEntornoLaboral(u, id, true),
    };

    for (const documento of documentos) {
      const generador = generadores[documento.codigo_formato];
      if (!generador) continue;

      try {
        const contenidoActualizado = await generador(usuario, idPractica);
        documento.contenido = contenidoActualizado;
        documento.updated_at = new Date();
        await this.documentoRepository.guardarDocumento(
          documento.codigo_formato,
          documento.titulo ?? '',
          contenidoActualizado,
          idPractica,
          documento.id_estudiante,
          documento.id_usuario,
          documento.estado,
        );
      } catch (error) {
        console.error(`Error actualizando documento ${documento.codigo_formato} para práctica ${idPractica}`, error);
      }
    }
  }

  async cambiarEstado(idDocumento: number, estado: string, comentarios?: string, usuarioOrigen?: any): Promise<DocumentoEntity | null> {
    if (!usuarioOrigen?.roles) {
      throw new Error('No autorizado');
    }

    const roles = usuarioOrigen.roles;
    const esEstudiante = roles.includes('ESTUDIANTE');
    const esDocente = roles.includes('DOCENTE');
    const esTutorEmpresarial = roles.includes('TUTOR_EMPRESARIAL');
    const esCoordinador = roles.includes('COORDINADOR');

    if (!esEstudiante && !esDocente && !esTutorEmpresarial && !esCoordinador) {
      throw new ForbiddenException('No autorizado para cambiar el estado del documento');
    }

    // ESTUDIANTE y TUTOR_EMPRESARIAL solo pueden enviar a revisión;
    // el resto (DOCENTE, COORDINADOR) pueden aprobar/rechazar.
    if ((esEstudiante || esTutorEmpresarial) && estado !== EstadoDocumento.PENDIENTE_REVISION) {
      throw new ForbiddenException('El estudiante o tutor empresarial solo puede enviar documentos a revisión');
    }

    const documento = await this.documentoRepository.actualizarEstado(idDocumento, estado, comentarios);

    if (!documento) {
      return null;
    }

    await this.notificarCambioEstado(documento, estado, comentarios, usuarioOrigen);

    return documento;
  }

  async buscarPorId(idDocumento: number): Promise<DocumentoEntity | null> {
    return this.documentoRepository.buscarPorId(idDocumento);
  }

  private async notificarCambioEstado(documento: DocumentoEntity, estado: string, comentarios?: string, usuarioOrigen?: any): Promise<void> {
    if (!documento.id_practica || !documento.id_estudiante) {
      return;
    }

    const tipoMap: Record<string, string> = {
      [EstadoDocumento.PENDIENTE_REVISION]: 'documento_enviado_revision',
      [EstadoDocumento.APROBADO]: 'documento_aprobado',
      [EstadoDocumento.RECHAZADO]: 'documento_rechazado',
    };

    const tipo = tipoMap[estado];
    if (!tipo) {
      return;
    }

    const mensaje = this.construirMensajeNotificacion(documento.codigo_formato, estado, comentarios);
    const idUsuarioOrigen = usuarioOrigen?.sub ? Number(usuarioOrigen.sub) : undefined;

    switch (estado) {
      case EstadoDocumento.PENDIENTE_REVISION:
        await this.notificarDocenteOTutor(documento, mensaje, idUsuarioOrigen);
        // F07/F08: el COORDINADOR también debe revisar (no el DOCENTE ni el TUTOR)
        if (['F07', 'F08'].includes(documento.codigo_formato)) {
          await this.notificarCoordinador(documento, mensaje, idUsuarioOrigen);
        }
        break;
      case EstadoDocumento.APROBADO:
        await this.notificarEstudiante(documento, mensaje, idUsuarioOrigen);
        // F07/F08: también notificar al TUTOR_EMPRESARIAL (quien creó el documento)
        if (['F07', 'F08'].includes(documento.codigo_formato)) {
          await this.notificarTutorEmpresarial(documento, mensaje, idUsuarioOrigen);
        }
        break;
      case EstadoDocumento.RECHAZADO:
        await this.notificarEstudiante(documento, mensaje, idUsuarioOrigen);
        if (['F07', 'F08'].includes(documento.codigo_formato)) {
          await this.notificarTutorEmpresarial(documento, mensaje, idUsuarioOrigen);
        }
        break;
    }
  }

  private construirMensajeNotificacion(codigoFormato: string, estado: string, comentarios?: string): string {
    const nombreDocumento = this.obtenerNombreDocumento(codigoFormato);
    const estadoTexto = this.obtenerTextoEstado(estado);

    let mensaje = `El documento ${nombreDocumento} cambió a estado: ${estadoTexto}.`;

    if (comentarios && estado === EstadoDocumento.RECHAZADO) {
      mensaje += ` Comentarios: ${comentarios}`;
    }

    return mensaje;
  }

  private obtenerNombreDocumento(codigo: string): string {
    const nombres: Record<string, string> = {
      F01: 'Carta Compromiso',
      F02: 'Currículo',
      F05: 'Registro de Asistencia',
      F06: 'Informe de Aprendizaje',
      F07: 'Evaluación Empresarial',
      F08: 'Evaluación Instituto',
      F10: 'Acta de Inducción de Seguridad',
      F11: 'Acta del Entorno Laboral',
    };
    return nombres[codigo] || codigo;
  }

  private obtenerTextoEstado(estado: string): string {
    const textos: Record<string, string> = {
      [EstadoDocumento.PENDIENTE_REVISION]: 'Pendiente de revisión',
      [EstadoDocumento.APROBADO]: 'Aprobado',
      [EstadoDocumento.RECHAZADO]: 'Rechazado',
    };
    return textos[estado] || estado;
  }

  private async notificarDocenteOTutor(documento: DocumentoEntity, mensaje: string, idUsuarioOrigen?: number): Promise<void> {
    if (!documento.id_practica) return;

    try {
      const practicaRows = await this.dataSource.query(
        `SELECT id_docente FROM practica_estudiante WHERE id_practica = $1 LIMIT 1`,
        [documento.id_practica],
      );

      if (practicaRows.length === 0) return;

      const idDocente = practicaRows[0].id_docente;

      if (idDocente) {
        const docenteUsuario = await this.dataSource.query(
          `SELECT id_usuario FROM usuario WHERE id_docente = $1 AND estado = 'ACTIVO' LIMIT 1`,
          [idDocente],
        );

        if (docenteUsuario.length > 0) {
          await this.notificacionService.crearNotificacion(
            Number(docenteUsuario[0].id_usuario),
            'documento_enviado_revision',
            mensaje,
            idUsuarioOrigen,
            documento.id_practica,
          );
        }
      }
    } catch (error) {
      console.error('Error notificando docente', error);
    }
  }

  private async notificarEstudiante(documento: DocumentoEntity, mensaje: string, idUsuarioOrigen?: number): Promise<void> {
    if (!documento.id_estudiante) return;

    await this.notificacionService.crearNotificacion(
      documento.id_estudiante,
      'documento_estado_cambiado',
      mensaje,
      idUsuarioOrigen,
      documento.id_practica,
    );
  }

  /** Notifica al COORDINADOR de la carrera/periodo de la práctica (para F07/F08). */
  private async notificarCoordinador(documento: DocumentoEntity, mensaje: string, idUsuarioOrigen?: number): Promise<void> {
    if (!documento.id_practica) return;

    try {
      const rows = await this.dataSource.query(
        `SELECT u.id_usuario
         FROM usuario u
         JOIN usuario_rol ur ON ur.id_usuario = u.id_usuario
         JOIN rol r ON r.id_rol = ur.id_rol
         WHERE r.nombre = 'COORDINADOR' AND u.estado = 'ACTIVO'
         LIMIT 1`,
      );

      if (rows.length > 0) {
        await this.notificacionService.crearNotificacion(
          Number(rows[0].id_usuario),
          'documento_enviado_revision',
          mensaje,
          idUsuarioOrigen,
          documento.id_practica,
        );
      }
    } catch (error) {
      console.error('Error notificando coordinador', error);
    }
  }

  /** Notifica al TUTOR_EMPRESARIAL de la práctica (para F07/F08 aprobados/rechazados). */
  private async notificarTutorEmpresarial(documento: DocumentoEntity, mensaje: string, idUsuarioOrigen?: number): Promise<void> {
    if (!documento.id_practica) return;

    try {
      const rows = await this.dataSource.query(
        `SELECT u.id_usuario
         FROM usuario u
         JOIN usuario_rol ur ON ur.id_usuario = u.id_usuario
         JOIN rol r ON r.id_rol = ur.id_rol
         WHERE r.nombre = 'TUTOR_EMPRESARIAL' AND u.estado = 'ACTIVO'
         AND u.id_empresa = (SELECT id_empresa FROM practica_estudiante WHERE id_practica = $1 LIMIT 1)
         LIMIT 1`,
        [documento.id_practica],
      );

      if (rows.length > 0) {
        await this.notificacionService.crearNotificacion(
          Number(rows[0].id_usuario),
          'documento_estado_cambiado',
          mensaje,
          idUsuarioOrigen,
          documento.id_practica,
        );
      }
    } catch (error) {
      console.error('Error notificando tutor empresarial', error);
    }
  }
}

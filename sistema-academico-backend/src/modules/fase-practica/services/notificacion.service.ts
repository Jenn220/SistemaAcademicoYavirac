import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { NOTIFICACION_REPOSITORY, INotificacionRepository } from '../ports/notificacion.repository.port';
import { NotificacionEntity } from '../domain/notificacion.entity';

@Injectable()
export class NotificacionService {
  constructor(
    @Inject(NOTIFICACION_REPOSITORY)
    private readonly notificacionRepository: INotificacionRepository,
  ) {}

  async crearNotificacion(
    idUsuarioDestino: number,
    tipo: string,
    mensaje: string,
    idUsuarioOrigen?: number,
    idPractica?: number,
  ): Promise<NotificacionEntity> {
    return this.notificacionRepository.crear({
      id_usuario_destino: idUsuarioDestino,
      id_usuario_origen: idUsuarioOrigen,
      tipo,
      mensaje,
      id_practica: idPractica,
      leida: false,
    });
  }

  async listarNotificaciones(idUsuarioDestino: number, soloNoLeidas = false): Promise<NotificacionEntity[]> {
    return this.notificacionRepository.listarPorDestinatario(idUsuarioDestino, soloNoLeidas);
  }

  async marcarComoLeida(idNotificacion: number, idUsuarioDestino: number): Promise<void> {
    return this.notificacionRepository.marcarComoLeida(idNotificacion, idUsuarioDestino);
  }

  async contarNoLeidas(idUsuarioDestino: number): Promise<number> {
    return this.notificacionRepository.contarNoLeidas(idUsuarioDestino);
  }

  async notificarGuardadoDocumento(
    idEstudiante: number,
    codigoFormato: string,
    idUsuarioOrigen: number,
    idPractica?: number,
  ): Promise<void> {
    const mensaje = `El estudiante ha guardado el documento ${codigoFormato}.`;
    await this.crearNotificacion(idEstudiante, 'documento_guardado', mensaje, idUsuarioOrigen, idPractica);
  }
}

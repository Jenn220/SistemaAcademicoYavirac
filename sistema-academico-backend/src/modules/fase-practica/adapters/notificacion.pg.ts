import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificacionEntity } from '../domain/notificacion.entity';
import { NOTIFICACION_REPOSITORY, INotificacionRepository } from '../ports/notificacion.repository.port';

@Injectable()
export class NotificacionPg implements INotificacionRepository {
  constructor(
    @InjectRepository(NotificacionEntity)
    private readonly notificacionRepository: Repository<NotificacionEntity>,
  ) {}

  async crear(notificacion: Partial<NotificacionEntity>): Promise<NotificacionEntity> {
    const nueva = this.notificacionRepository.create(notificacion);
    return this.notificacionRepository.save(nueva);
  }

  async listarPorDestinatario(idUsuarioDestino: number, soloNoLeidas = false): Promise<NotificacionEntity[]> {
    const where = soloNoLeidas
      ? { id_usuario_destino: idUsuarioDestino, leida: false }
      : { id_usuario_destino: idUsuarioDestino };

    return this.notificacionRepository.find({
      where,
      order: { created_at: 'DESC' },
      take: 50,
    });
  }

  async marcarComoLeida(idNotificacion: number, idUsuarioDestino: number): Promise<void> {
    await this.notificacionRepository.update(
      { id_notificacion: idNotificacion, id_usuario_destino: idUsuarioDestino },
      { leida: true },
    );
  }

  async contarNoLeidas(idUsuarioDestino: number): Promise<number> {
    return this.notificacionRepository.count({
      where: { id_usuario_destino: idUsuarioDestino, leida: false },
    });
  }
}

import { NotificacionEntity } from '../domain/notificacion.entity';

export const NOTIFICACION_REPOSITORY = 'NotificacionRepository';

export interface INotificacionRepository {
  crear(notificacion: Partial<NotificacionEntity>): Promise<NotificacionEntity>;
  listarPorDestinatario(idUsuarioDestino: number, soloNoLeidas?: boolean): Promise<NotificacionEntity[]>;
  marcarComoLeida(idNotificacion: number, idUsuarioDestino: number): Promise<void>;
  contarNoLeidas(idUsuarioDestino: number): Promise<number>;
}

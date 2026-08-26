import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';
import { bigintTransformer } from '../../../config/bigint-transformer';

@Entity({ name: 'notificaciones' })
export class NotificacionEntity {
  @PrimaryColumn({ name: 'id_notificacion', type: 'bigint', transformer: bigintTransformer })
  @Generated('increment')
  id_notificacion!: number;

  @Column({ name: 'id_usuario_destino', type: 'bigint' })
  id_usuario_destino!: number;

  @Column({ name: 'id_usuario_origen', type: 'bigint', nullable: true })
  id_usuario_origen?: number;

  @Column({ name: 'tipo', type: 'varchar', length: 50 })
  tipo!: string;

  @Column({ name: 'mensaje', type: 'text' })
  mensaje!: string;

  @Column({ name: 'id_practica', type: 'bigint', nullable: true })
  id_practica?: number;

  @Column({ name: 'leida', type: 'boolean', default: false })
  leida!: boolean;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at?: Date;
}

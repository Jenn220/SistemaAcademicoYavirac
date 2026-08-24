import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';
import { bigintTransformer } from '../../../config/bigint-transformer';

@Entity({ name: 'usuario' })
export class UsuarioEntity {
  @PrimaryColumn({ name: 'id_usuario', type: 'bigint', transformer: bigintTransformer })
  @Generated('increment')
  id_usuario!: number;

  @Column({ name: 'correo', type: 'varchar', length: 150 })
  correo!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  password_hash!: string;

  @Column({ name: 'estado', type: 'varchar', length: 20, default: 'ACTIVO' })
  estado!: string;

  @Column({ name: 'id_docente', type: 'bigint', transformer: bigintTransformer, nullable: true })
  id_docente?: number | null;

  @Column({ name: 'id_estudiante', type: 'bigint', transformer: bigintTransformer, nullable: true })
  id_estudiante?: number | null;

  @Column({ name: 'id_empresa', type: 'bigint', transformer: bigintTransformer, nullable: true })
  id_empresa?: number | null;

  @Column({ name: 'debe_cambiar_password', type: 'boolean', default: true })
  debe_cambiar_password!: boolean;

  @Column({ name: 'intentos_fallidos', type: 'int', default: 0 })
  intentos_fallidos!: number;

  @Column({ name: 'bloqueado', type: 'boolean', default: false })
  bloqueado!: boolean;
}

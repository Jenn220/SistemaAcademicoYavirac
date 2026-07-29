import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';
import { bigintTransformer } from '../../../config/bigint-transformer';

@Entity({ name: 'usuario_rol' })
export class UsuarioRolEntity {
  @PrimaryColumn({ name: 'id_usuario_rol', type: 'bigint', transformer: bigintTransformer })
  @Generated('increment')
  id_usuario_rol!: number;

  @Column({ name: 'id_usuario', type: 'bigint', transformer: bigintTransformer })
  id_usuario!: number;

  @Column({ name: 'id_rol', type: 'bigint', transformer: bigintTransformer })
  id_rol!: number;
}

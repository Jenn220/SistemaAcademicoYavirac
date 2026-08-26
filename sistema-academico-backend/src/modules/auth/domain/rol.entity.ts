import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';
import { bigintTransformer } from '../../../config/bigint-transformer';

@Entity({ name: 'rol' })
export class RolEntity {
  @PrimaryColumn({ name: 'id_rol', type: 'bigint', transformer: bigintTransformer })
  @Generated('increment')
  id_rol!: number;

  @Column({ name: 'nombre', type: 'varchar', length: 50 })
  nombre!: string;
}

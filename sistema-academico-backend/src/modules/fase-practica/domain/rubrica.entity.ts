import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';
import { bigintTransformer } from '../../../config/bigint-transformer';

@Entity({ name: 'catalogo_rubrica' })
export class RubricaEntity {
  @PrimaryColumn({ name: 'id_rubrica', type: 'bigint', transformer: bigintTransformer })
  @Generated('increment')
  id_rubrica!: number;

  @Column({ name: 'nombre', type: 'varchar', length: 200 })
  nombre!: string;

  @Column({ name: 'tipo', type: 'varchar', length: 100 })
  tipo!: string;

  @Column({ name: 'estado', type: 'varchar', length: 50, default: 'ACTIVO' })
  estado?: string;
}

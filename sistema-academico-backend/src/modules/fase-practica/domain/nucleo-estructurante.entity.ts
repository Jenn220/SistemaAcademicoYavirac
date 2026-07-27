import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';
import { bigintTransformer } from '../../../config/bigint-transformer';

@Entity({ name: 'nucleo_estructurante' })
export class NucleoEstructuranteEntity {
  @PrimaryColumn({ name: 'id_nucleo', type: 'bigint', transformer: bigintTransformer })
  @Generated('increment')
  id_nucleo!: number;

  @Column({ name: 'id_carrera', type: 'bigint' })
  id_carrera!: number;

  @Column({ name: 'nombre', type: 'varchar', length: 150 })
  nombre!: string;

  @Column({ name: 'objetivo', type: 'text' })
  objetivo!: string;

  @Column({ name: 'estado', type: 'varchar', length: 20, nullable: true, default: 'ACTIVO' })
  estado?: string;
}

import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';
import { bigintTransformer } from '../../../config/bigint-transformer';

@Entity({ name: 'empresa' })
export class EmpresaEntity {
  @PrimaryColumn({ name: 'id_empresa', type: 'bigint', transformer: bigintTransformer })
  @Generated('increment')
  id_empresa!: number;

  @Column({ name: 'ruc', type: 'varchar', length: 20 })
  ruc!: string;

  @Column({ name: 'razon_social', type: 'varchar', length: 200 })
  razon_social!: string;

  @Column({ name: 'nombre', type: 'varchar', length: 200, default: '' })
  nombre?: string;

  @Column({ name: 'direccion', type: 'text', nullable: true })
  direccion?: string;

  @Column({ name: 'telefono', type: 'varchar', length: 50, nullable: true })
  telefono?: string;

  @Column({ name: 'email', type: 'varchar', length: 150, nullable: true })
  email?: string;

  @Column({ name: 'estado', type: 'varchar', length: 50, default: 'ACTIVO' })
  estado?: string;
}

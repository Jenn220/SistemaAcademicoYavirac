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

  @Column({ name: 'direccion', type: 'text', nullable: true })
  direccion?: string;

  @Column({ name: 'estado', type: 'varchar', length: 20, nullable: true })
  estado?: string;

  @Column({ name: 'telefono', type: 'varchar', length: 50, nullable: true })
  telefono?: string;

  @Column({ name: 'correo', type: 'varchar', length: 150, nullable: true })
  correo?: string;

  @Column({ name: 'representante_legal', type: 'varchar', length: 200, nullable: true })
  representante_legal?: string;
}

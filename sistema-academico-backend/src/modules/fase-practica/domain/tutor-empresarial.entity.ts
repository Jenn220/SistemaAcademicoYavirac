import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';
import { bigintTransformer } from '../../../config/bigint-transformer';

@Entity({ name: 'tutor_empresarial' })
export class TutorEmpresarialEntity {
  @PrimaryColumn({ name: 'id_tutor_empresarial', type: 'bigint', transformer: bigintTransformer })
  @Generated('increment')
  id_tutor_empresarial!: number;

  @Column({ name: 'id_empresa', type: 'bigint' })
  id_empresa!: number;

  @Column({ name: 'cedula', type: 'varchar', length: 20, nullable: true })
  cedula?: string;

  @Column({ name: 'nombres', type: 'varchar', length: 100 })
  nombres!: string;

  @Column({ name: 'apellidos', type: 'varchar', length: 100 })
  apellidos!: string;

  @Column({ name: 'cargo', type: 'varchar', length: 100, nullable: true })
  cargo?: string;

  @Column({ name: 'correo', type: 'varchar', length: 150, nullable: true })
  correo?: string;

  @Column({ name: 'estado', type: 'varchar', length: 20, nullable: true, default: 'ACTIVO' })
  estado?: string;
}

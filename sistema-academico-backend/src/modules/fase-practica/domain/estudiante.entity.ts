import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';
import { bigintTransformer } from '../../../config/bigint-transformer';

@Entity({ name: 'estudiante' })
export class EstudianteEntity {
  @PrimaryColumn({ name: 'id_estudiante', type: 'bigint', transformer: bigintTransformer })
  @Generated('increment')
  id_estudiante!: number;

  @Column({ name: 'cedula', type: 'varchar', length: 20 })
  cedula!: string;

  @Column({ name: 'nombres', type: 'varchar', length: 150 })
  nombres!: string;

  @Column({ name: 'apellidos', type: 'varchar', length: 150 })
  apellidos!: string;

  @Column({ name: 'correo', type: 'varchar', length: 200, nullable: true })
  correo?: string;

  @Column({ name: 'telefono', type: 'varchar', length: 50, nullable: true })
  telefono?: string;

  @Column({ name: 'estado', type: 'varchar', length: 20, nullable: true })
  estado?: string;
}

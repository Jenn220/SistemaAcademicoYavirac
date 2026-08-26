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

  @Column({ name: 'estado_civil', type: 'varchar', length: 20, nullable: true })
  estado_civil?: string;

  @Column({ name: 'tipo_sangre', type: 'varchar', length: 10, nullable: true })
  tipo_sangre?: string;

  @Column({ name: 'domicilio', type: 'text', nullable: true })
  domicilio?: string;

  @Column({ name: 'contacto_emergencia_nombre', type: 'varchar', length: 200, nullable: true })
  contacto_emergencia_nombre?: string;

  @Column({ name: 'contacto_emergencia_telefono', type: 'varchar', length: 50, nullable: true })
  contacto_emergencia_telefono?: string;
}

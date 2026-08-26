import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('vinculacion_entidad_receptora')
export class EntidadReceptoraEntity {
  // En tu imagen se ve que es [PK] bigint
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id_entidad: number;

  @Column({ type: 'varchar', length: 255 })
  nombre_entidad: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  direccion: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  telefono: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  correo: string;

  @Column({ type: 'varchar', length: 200 })
  tutor_entidad_receptora: string;
}
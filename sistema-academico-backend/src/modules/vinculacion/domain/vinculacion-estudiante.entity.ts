import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('vinculacion_estudiante')
@Unique(['id_matricula_detalle'])
export class VinculacionEstudianteEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id_vinculacion: number;

  @Column({ type: 'bigint' })
  id_periodo: number;

  @Column({ type: 'bigint', unique: true })
  id_matricula_detalle: number;

  @Column({ type: 'bigint' })
  id_empresa: number;

  @Column({ type: 'bigint' })
  id_docente: number;

  @Column({ type: 'bigint', nullable: true })
  id_entidad_receptora: number | null;

  @Column({ type: 'varchar', length: 255 })
  nombre_proyecto: string;

  @Column({ type: 'date' })
  fecha_inicio: Date;

  @Column({ type: 'date' })
  fecha_fin: Date;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
  total_horas_estudiante: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
  total_horas_docente: number;

  @Column({ type: 'varchar', length: 30, default: 'EN_CURSO' })
  estado: string;

  // 🔥 NUEVO CAMPO
  @Column({ type: 'boolean', default: false })
  editado: boolean;
}
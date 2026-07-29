import { Column, Entity, Generated, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { bigintTransformer } from '../../../config/bigint-transformer';
import { EmpresaEntity } from './empresa.entity';
import { TutorEmpresarialEntity } from './tutor-empresarial.entity';

@Entity({ name: 'practica_estudiante' })
export class PracticaEntity {
  @PrimaryColumn({ name: 'id_practica', type: 'bigint', transformer: bigintTransformer })
  @Generated('increment')
  id_practica!: number;

  @Column({ name: 'id_periodo', type: 'bigint' })
  id_periodo!: number;

  @Column({ name: 'id_matricula_detalle', type: 'bigint' })
  id_matricula_detalle!: number;

  @Column({ name: 'id_empresa', type: 'bigint' })
  id_empresa!: number;

  @Column({ name: 'id_tutor_empresarial', type: 'bigint' })
  id_tutor_empresarial!: number;

  @Column({ name: 'id_docente', type: 'bigint' })
  id_docente!: number;

  @Column({ name: 'total_horas_requeridas', type: 'int', nullable: true, default: 400 })
  total_horas_requeridas?: number;

  @Column({ name: 'total_horas_cumplidas', type: 'int', nullable: true, default: 0 })
  total_horas_cumplidas?: number;

  @Column({ name: 'estado', type: 'varchar', length: 30, nullable: true, default: 'EN_CURSO' })
  estado?: string;

  @Column({ name: 'fecha_inicio', type: 'date', nullable: true })
  fecha_inicio?: string;

  @Column({ name: 'fecha_fin', type: 'date', nullable: true })
  fecha_fin?: string;

  @Column({ name: 'nombre_proyecto', type: 'varchar', length: 255, nullable: true })
  nombre_proyecto?: string;

  @Column({ name: 'cobertura_localizacion', type: 'varchar', length: 255, nullable: true })
  cobertura_localizacion?: string;

  @Column({ name: 'plazo_ejecucion', type: 'varchar', length: 100, nullable: true })
  plazo_ejecucion?: string;

  @Column({ name: 'tipo_sangre', type: 'varchar', length: 5, nullable: true })
  tipo_sangre?: string;

  @Column({ name: 'contacto_emergencia_nombre', type: 'varchar', length: 150, nullable: true })
  contacto_emergencia_nombre?: string;

  @Column({ name: 'contacto_emergencia_telefono', type: 'varchar', length: 20, nullable: true })
  contacto_emergencia_telefono?: string;

  @ManyToOne(() => EmpresaEntity, { eager: true })
  @JoinColumn({ name: 'id_empresa' })
  empresa?: EmpresaEntity;

  @ManyToOne(() => TutorEmpresarialEntity, { eager: true })
  @JoinColumn({ name: 'id_tutor_empresarial' })
  tutor_empresarial?: TutorEmpresarialEntity;
}

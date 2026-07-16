import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';
import { bigintTransformer } from '../../../config/bigint-transformer';

@Entity({ name: 'practica_estudiante' })
export class PracticaEntity {
  @PrimaryColumn({ name: 'id_practica', type: 'bigint', transformer: bigintTransformer })
  @Generated('increment')
  id_practica!: number;

  @Column({ name: 'id_matricula_detalle', type: 'bigint' })
  id_matricula_detalle!: number;

  @Column({ name: 'id_periodo_empresa', type: 'bigint' })
  id_periodo_empresa!: number;

  @Column({ name: 'id_periodo_tutor_empresarial', type: 'bigint' })
  id_periodo_tutor_empresarial!: number;

  @Column({ name: 'id_periodo_docente', type: 'bigint' })
  id_periodo_docente!: number;

  @Column({ name: 'total_horas_requeridas', type: 'int', nullable: true, default: 400 })
  total_horas_requeridas?: number;

  @Column({ name: 'total_horas_cumplidas', type: 'int', nullable: true, default: 0 })
  total_horas_cumplidas?: number;

  @Column({ name: 'estado', type: 'varchar', nullable: true, default: 'EN_CURSO' })
  estado?: string;
}

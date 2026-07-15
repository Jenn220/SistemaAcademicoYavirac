import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';
import { bigintTransformer } from '../../../config/bigint-transformer';

@Entity({ name: 'bitacora_semanal' })
export class BitacoraSemanalEntity {
  @PrimaryColumn({ name: 'id_bitacora', type: 'bigint', transformer: bigintTransformer })
  @Generated('increment')
  id_bitacora!: number;

  @Column({ name: 'id_informe', type: 'bigint' })
  id_informe!: number;

  @Column({ name: 'semana', type: 'int' })
  semana!: number;

  @Column({ name: 'fecha_inicio_semana', type: 'date', nullable: true })
  fecha_inicio_semana?: string;

  @Column({ name: 'fecha_fin_semana', type: 'date', nullable: true })
  fecha_fin_semana?: string;

  @Column({ name: 'puesto_aprendizaje', type: 'varchar', nullable: true })
  puesto_aprendizaje?: string;

  @Column({ name: 'actividades_realizadas', type: 'text', nullable: true })
  actividades_realizadas?: string;

  @Column({ name: 'actividades_autonomas', type: 'text', nullable: true })
  actividades_autonomas?: string;
}

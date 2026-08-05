import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';
import { bigintTransformer } from '../../../config/bigint-transformer';

@Entity({ name: 'plan_rotacion_semana' })
export class PlanRotacionSemanaEntity {
  @PrimaryColumn({ name: 'id_rotacion_semana', type: 'bigint', transformer: bigintTransformer })
  @Generated('increment')
  id_rotacion_semana!: number;

  @Column({ name: 'id_plan_rotacion', type: 'bigint' })
  id_plan_rotacion!: number;

  @Column({ name: 'id_item_pm', type: 'bigint', nullable: true })
  id_item_pm?: number;

  @Column({ name: 'semana', type: 'int' })
  semana!: number;

  @Column({ name: 'es_defensa_proyecto', type: 'boolean', nullable: true })
  es_defensa_proyecto?: boolean;
}

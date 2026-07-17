import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';
import { bigintTransformer } from '../../../config/bigint-transformer';

@Entity({ name: 'plan_rotacion_semana' })
export class PlanRotacionSemanaEntity {
  @PrimaryColumn({ name: 'id_rotacion_semana', type: 'bigint', transformer: bigintTransformer })
  @Generated('increment')
  id_rotacion_semana!: number;

  @Column({ name: 'id_plan_rotacion', type: 'bigint' })
  id_plan_rotacion!: number;

  @Column({ name: 'semana', type: 'int' })
  semana!: number;
}

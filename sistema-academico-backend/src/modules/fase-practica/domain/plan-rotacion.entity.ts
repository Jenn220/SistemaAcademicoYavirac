import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';
import { bigintTransformer } from '../../../config/bigint-transformer';

@Entity({ name: 'plan_rotacion' })
export class PlanRotacionEntity {
  @PrimaryColumn({ name: 'id_plan_rotacion', type: 'bigint', transformer: bigintTransformer })
  @Generated('increment')
  id_plan_rotacion!: number;

  @Column({ name: 'id_practica', type: 'bigint' })
  id_practica!: number;

  @Column({ name: 'id_item_pm', type: 'bigint' })
  id_item_pm!: number;

  @Column({ name: 'puesto_aprendizaje', type: 'varchar', length: 200 })
  puesto_aprendizaje!: string;
}

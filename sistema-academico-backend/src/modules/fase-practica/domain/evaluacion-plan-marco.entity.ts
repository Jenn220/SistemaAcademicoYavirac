import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';
import { bigintTransformer } from '../../../config/bigint-transformer';

@Entity({ name: 'evaluacion_plan_marco' })
export class EvaluacionPlanMarcoEntity {
  @PrimaryColumn({ name: 'id_evaluacion_pm', type: 'bigint', transformer: bigintTransformer })
  @Generated('increment')
  id_evaluacion_pm!: number;

  @Column({ name: 'id_practica', type: 'bigint' })
  id_practica!: number;

  @Column({ name: 'id_item_pm', type: 'bigint' })
  id_item_pm!: number;

  @Column({ name: 'nivel_real_alcanzado', type: 'int', nullable: true })
  nivel_real_alcanzado?: number;
}

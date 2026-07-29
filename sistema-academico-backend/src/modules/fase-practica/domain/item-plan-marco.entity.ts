import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';
import { bigintTransformer } from '../../../config/bigint-transformer';

@Entity({ name: 'item_plan_marco' })
export class ItemPlanMarcoEntity {
  @PrimaryColumn({ name: 'id_item_pm', type: 'bigint', transformer: bigintTransformer })
  @Generated('increment')
  id_item_pm!: number;

  @Column({ name: 'id_plan_marco', type: 'bigint' })
  id_plan_marco!: number;

  @Column({ name: 'resultado_aprendizaje', type: 'text' })
  resultado_aprendizaje!: string;

  @Column({ name: 'nivel_logro_esperado', type: 'integer' })
  nivel_logro_esperado!: number;

  @Column({ name: 'tareas_laborales', type: 'text', nullable: true })
  tareas_laborales?: string;

  @Column({ name: 'puesto_aprendizaje', type: 'varchar', length: 150, nullable: true })
  puesto_aprendizaje?: string;

  @Column({ name: 'semanas', type: 'integer', nullable: true })
  semanas?: number;

  @Column({ name: 'responsable_puesto', type: 'varchar', length: 150, nullable: true })
  responsable_puesto?: string;
}

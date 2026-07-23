import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';
import { bigintTransformer } from '../../../config/bigint-transformer';

@Entity({ name: 'detalle_evaluacion' })
export class DetalleEvaluacionEntity {
  @PrimaryColumn({ name: 'id_detalle_evaluacion', type: 'bigint', transformer: bigintTransformer })
  @Generated('increment')
  id_detalle_evaluacion!: number;

  @Column({ name: 'id_evaluacion', type: 'bigint' })
  id_evaluacion!: number;

  @Column({ name: 'id_item', type: 'bigint' })
  id_item!: number;

  @Column({ name: 'puntaje_asignado', type: 'numeric', precision: 5, scale: 2 })
  puntaje_asignado!: number;
}

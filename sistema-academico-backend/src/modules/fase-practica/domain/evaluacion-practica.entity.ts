import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';
import { bigintTransformer } from '../../../config/bigint-transformer';

@Entity({ name: 'evaluacion_practica' })
export class EvaluacionPracticaEntity {
  @PrimaryColumn({ name: 'id_evaluacion', type: 'bigint', transformer: bigintTransformer })
  @Generated('increment')
  id_evaluacion!: number;

  @Column({ name: 'id_practica', type: 'bigint' })
  id_practica!: number;

  @Column({ name: 'id_rubrica', type: 'bigint' })
  id_rubrica!: number;

  @Column({ name: 'tipo_evaluador', type: 'varchar', length: 50 })
  tipo_evaluador!: string;

  @Column({ name: 'nota_final_calculada', type: 'numeric', nullable: true })
  nota_final_calculada?: number;

  @Column({ name: 'fecha_evaluacion', type: 'date', nullable: true })
  fecha_evaluacion?: string;
}

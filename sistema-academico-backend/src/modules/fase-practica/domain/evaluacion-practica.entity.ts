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

  @Column({ name: 'fecha_evaluacion', type: 'date', nullable: true, default: () => 'CURRENT_DATE' })
  fecha_evaluacion?: string;

  @Column({ name: 'id_tutor_empresarial', type: 'bigint', nullable: true })
  id_tutor_empresarial?: number;

  @Column({ name: 'estado', type: 'varchar', length: 20, nullable: true, default: 'BORRADOR' })
  estado?: string;

  @Column({ name: 'observaciones', type: 'text', nullable: true })
  observaciones?: string;

  @Column({ name: 'promedio_desempeno', type: 'numeric', nullable: true })
  promedio_desempeno?: number;

  @Column({ name: 'nota_ponderada_desempeno', type: 'numeric', nullable: true })
  nota_ponderada_desempeno?: number;

  @Column({ name: 'nota_parcial_defensa', type: 'numeric', nullable: true })
  nota_parcial_defensa?: number;

  @Column({ name: 'nota_final_defensa', type: 'numeric', nullable: true })
  nota_final_defensa?: number;

  @Column({ name: 'nota_ponderada_defensa', type: 'numeric', nullable: true })
  nota_ponderada_defensa?: number;

  @Column({ name: 'nota_final_empresa', type: 'numeric', nullable: true })
  nota_final_empresa?: number;

  @Column({ name: 'promedio_proyecto_empresarial', type: 'numeric', nullable: true })
  promedio_proyecto_empresarial?: number;

  @Column({ name: 'nota_ponderada_proyecto', type: 'numeric', nullable: true })
  nota_ponderada_proyecto?: number;

  @Column({ name: 'nota_final_instituto', type: 'numeric', nullable: true })
  nota_final_instituto?: number;
}

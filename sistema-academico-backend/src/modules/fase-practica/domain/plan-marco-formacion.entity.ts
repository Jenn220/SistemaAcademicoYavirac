import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';
import { bigintTransformer } from '../../../config/bigint-transformer';

@Entity({ name: 'plan_marco_formacion' })
export class PlanMarcoFormacionEntity {
  @PrimaryColumn({ name: 'id_plan_marco', type: 'bigint', transformer: bigintTransformer })
  @Generated('increment')
  id_plan_marco!: number;

  @Column({ name: 'id_practica', type: 'bigint' })
  id_practica!: number;

  @Column({ name: 'id_nivel', type: 'bigint', nullable: true })
  id_nivel?: number;

  @Column({ name: 'horas_formacion', type: 'integer', nullable: true })
  horas_formacion?: number;

  @Column({ name: 'objetivos_fase_practica', type: 'text', nullable: true })
  objetivos_fase_practica?: string;

  @Column({ name: 'id_nucleo_estructurante', type: 'bigint', nullable: true })
  id_nucleo_estructurante?: number;

  @Column({ name: 'estado', type: 'varchar', length: 20, nullable: true, default: 'ACTIVO' })
  estado?: string;
}

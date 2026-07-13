import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';
import { bigintTransformer } from '../../../config/bigint-transformer';

@Entity({ name: 'registro_diario_practica' })
export class RegistroDiarioEntity {
  @PrimaryColumn({ name: 'id_registro_diario', type: 'bigint', transformer: bigintTransformer })
  @Generated('increment')
  id_registro_diario!: number;

  @Column({ name: 'id_practica', type: 'bigint' })
  id_practica!: number;

  @Column({ name: 'fecha', type: 'date' })
  fecha!: string;

  @Column({ name: 'hora_ingreso', type: 'time', nullable: true })
  hora_ingreso?: string;

  @Column({ name: 'hora_salida_almuerzo', type: 'time', nullable: true })
  hora_salida_almuerzo?: string;

  @Column({ name: 'hora_regreso_almuerzo', type: 'time', nullable: true })
  hora_regreso_almuerzo?: string;

  @Column({ name: 'hora_salida', type: 'time', nullable: true })
  hora_salida?: string;

  @Column({ name: 'observaciones', type: 'text', nullable: true })
  observaciones?: string;

  @Column({ name: 'firma_estudiante', type: 'boolean', nullable: true, default: false })
  firma_estudiante?: boolean;
}

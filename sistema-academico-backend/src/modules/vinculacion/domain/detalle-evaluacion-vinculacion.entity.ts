import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('detalle_evaluacion_vinculacion')
export class DetalleEvaluacionVinculacion {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id_detalle_vinc' })
  idDetalleVinc: string;

  @Column({ type: 'bigint', name: 'id_evaluacion_vinc' })
  idEvaluacionVinc: string;

  @Column({ type: 'bigint', name: 'id_item' })
  idItem: string;

  @Column({ type: 'numeric', precision: 5, scale: 2, name: 'puntaje_asignado' })
  puntajeAsignado: number;
}
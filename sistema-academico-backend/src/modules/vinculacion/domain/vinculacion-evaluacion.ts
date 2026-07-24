import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('evaluacion_vinculacion')
export class EvaluacionVinculacion {
  
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id_evaluacion_vinc' })
  idEvaluacionVinc: string;

  @Column({ type: 'bigint', name: 'id_vinculacion' })
  idVinculacion: string;

  @Column({ type: 'bigint', name: 'id_rubrica' })
  idRubrica: string;

  @Column({ type: 'numeric', precision: 5, scale: 2, name: 'nota_final' })
  notaFinal: number;

  @Column({ type: 'date', name: 'fecha_evaluacion' })
  fechaEvaluacion: Date;
}
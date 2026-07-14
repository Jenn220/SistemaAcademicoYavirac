import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('vinculacion_asistencia_tutor') // Debe coincidir exactamente con el nombre de tu tabla
export class VinculacionAsistenciaTutor {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id_asistencia_tutor: number;

  @Column({ type: 'bigint', name: 'id_vinculacion' })
  id_vinculacion: number;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'time without time zone' })
  hora_inicio: string;

  @Column({ type: 'time without time zone' })
  hora_fin: string;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  horas_total: number;

  @Column({ type: 'text', nullable: true })
  observaciones: string;
}
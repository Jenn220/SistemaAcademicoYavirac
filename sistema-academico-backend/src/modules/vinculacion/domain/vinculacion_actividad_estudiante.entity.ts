import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('vinculacion_actividad_estudiante')
export class VinculacionActividadEstudiante {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id_actividad_estudiante: string;

  @Column({ type: 'bigint' })
  id_vinculacion: string;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'time without time zone' })
  hora_inicio: string;

  @Column({ type: 'time without time zone' })
  hora_fin: string;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  horas_total: number;

  @Column({ type: 'text' })
  actividades_realizadas: string;

  @Column({ type: 'text', nullable: true })
  resultado_aprendizaje: string; // ✅ Descomentado
}
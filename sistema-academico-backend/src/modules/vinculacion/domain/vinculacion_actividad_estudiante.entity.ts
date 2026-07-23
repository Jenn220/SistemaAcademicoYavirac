import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('vinculacion_actividad_estudiante') // Debe coincidir exactamente con el nombre en tu BD
export class VinculacionActividadEstudiante {
  
  // [PK] bigint
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id_actividad_estudiante: string; 

  // bigint
  @Column({ type: 'bigint' })
  id_vinculacion: string;

  // date
  @Column({ type: 'date' })
  fecha: string; // TypeORM también acepta el tipo Date nativo de JS aquí

  // time without time zone
  @Column({ type: 'time without time zone' })
  hora_inicio: string;

  // time without time zone
  @Column({ type: 'time without time zone' })
  hora_fin: string;

  // numeric(5,2)
  @Column({ type: 'numeric', precision: 5, scale: 2 })
  horas_total: number;

  // text
  @Column({ type: 'text' })
  actividades_realizadas: string;
  // resultado_aprendizaje text
    @Column({ type: 'text' })
  resultado_aprendizaje: string;
}
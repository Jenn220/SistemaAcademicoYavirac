import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('vinculacion_informe') // Nombre exacto de la tabla
export class VinculacionInforme {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id_informe: number;

  @Column({ type: 'bigint' })
  id_vinculacion: number;

  @Column({ type: 'date' })
  fecha_informe: Date;

  @Column({ type: 'text' })
  actividad_macro: string;

  @Column({ type: 'text' })
  resultado_aprendizaje: string;
}
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('portafolio_aceptacion_estudiante')
export class PortafolioAceptacionEstudiante {
  @PrimaryGeneratedColumn({ name: 'id_aceptacion' })
  idAceptacion: number;

  @Column({ name: 'id_reporte_notas' })
  idReporteNotas: number;

  @Column({ name: 'id_matricula_detalle' })
  idMatriculaDetalle: number;

  @Column({ name: 'nota_registrada', type: 'numeric', precision: 5, scale: 2, nullable: true })
  notaRegistrada: number | null;

  @Column({ name: 'estado_aceptacion', length: 20, nullable: true })
  estadoAceptacion: string;

  @Column({ name: 'fecha_aceptacion', type: 'timestamp', nullable: true })
  fechaAceptacion: Date | null;
}

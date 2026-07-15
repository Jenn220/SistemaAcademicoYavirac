import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('portafolio_reporte_notas')
export class PortafolioReporteNotas {
  @PrimaryGeneratedColumn({ name: 'id_reporte_notas' })
  idReporteNotas: number;

  @Column({ name: 'id_periodo' })
  idPeriodo: number;

  @Column({ name: 'id_oferta_asignatura' })
  idOfertaAsignatura: number;

  @Column({ name: 'tipo_reporte', length: 20 })
  tipoReporte: string;

  @Column({ name: 'fecha_generacion', type: 'timestamp', nullable: true })
  fechaGeneracion: Date;

  @Column({ name: 'ruta_archivo_pdf', type: 'varchar', length: 255, nullable: true })
  rutaArchivoPdf: string | null;

  @Column({ name: 'estado', length: 20, nullable: true })
  estado: string;
}

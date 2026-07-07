import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('portafolio_informe_final')
export class PortafolioInformeFinal {
  @PrimaryGeneratedColumn({ name: 'id_informe_final' })
  idInformeFinal: number;

  @Column({ name: 'id_docente' })
  idDocente: number;

  @Column({ name: 'id_periodo' })
  idPeriodo: number;

  @Column({ name: 'id_asignatura' })
  idAsignatura: number;

  @Column({ name: 'id_paralelo' })
  idParalelo: number;

  @Column({ name: 'horario', length: 100 })
  horario: string;

  @Column({ name: 'fecha_firma_docente', type: 'timestamp', nullable: true })
  fechaFirmaDocente: Date | null;

  @Column({ name: 'fecha_firma_coordinador', type: 'timestamp', nullable: true })
  fechaFirmaCoordinador: Date | null;
}

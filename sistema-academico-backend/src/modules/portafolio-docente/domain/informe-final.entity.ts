import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('portafolio_informe_final')
export class PortafolioInformeFinal {
  @PrimaryGeneratedColumn({ name: 'id_informe_final' })
  idInformeFinal: number;

  @Column({ name: 'id_oferta_asignatura' })
  idOfertaAsignatura: number;

  @Column({ name: 'horario', length: 100 })
  horario: string;

  @Column({ name: 'fecha_firma_docente', type: 'timestamp', nullable: true })
  fechaFirmaDocente: Date | null;

  @Column({ name: 'fecha_firma_coordinador', type: 'timestamp', nullable: true })
  fechaFirmaCoordinador: Date | null;
}

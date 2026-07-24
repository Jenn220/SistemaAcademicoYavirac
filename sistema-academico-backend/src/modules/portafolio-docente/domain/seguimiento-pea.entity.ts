import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('portafolio_seguimiento_pea')
export class PortafolioSeguimientoPea {
  @PrimaryGeneratedColumn({ name: 'id_seguimiento_pea' })
  idSeguimientoPea: number;

  @Column({ name: 'id_oferta_asignatura' })
  idOfertaAsignatura: number;

  @Column({ name: 'id_representante', type: 'bigint', nullable: true })
  idRepresentante: number | null;
}

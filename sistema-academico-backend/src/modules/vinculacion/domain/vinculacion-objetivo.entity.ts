import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'vinculacion_objetivo' })
export class VinculacionObjetivo {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id_vinculacion_objetivo' })
  id_vinculacion_objetivo: string; // Se define como string por compatibilidad con bigint

  @Column({ type: 'bigint', name: 'id_vinculacion' })
  id_vinculacion: string;

  @Column({ type: 'text', name: 'descripcion' })
  descripcion: string;

  @Column({ type: 'integer', name: 'orden' })
  orden: number;


}
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('vinculacion_reporte_observacion', { schema: 'public' })
export class VinculacionReporteObservacionEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id_observacion' })
  id_observacion: string; // TypeORM suele manejar bigint como string para evitar pérdida de precisión

  @Column({ type: 'bigint', name: 'id_vinculacion' })
  id_vinculacion: string;

  @Column({ type: 'varchar', length: 30, name: 'tipo_reporte', nullable: true })
  tipo_reporte: string;

  @Column({ type: 'text', name: 'observacion', nullable: true })
  observacion: string;
}
import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';
import { bigintTransformer } from '../../../config/bigint-transformer';

@Entity({ name: 'informe_aprendizaje' })
export class InformeAprendizajeEntity {
  @PrimaryColumn({ name: 'id_informe', type: 'bigint', transformer: bigintTransformer })
  @Generated('increment')
  id_informe!: number;

  @Column({ name: 'id_practica', type: 'bigint' })
  id_practica!: number;

  @Column({ name: 'reflexion_aprendizaje', type: 'text', nullable: true })
  reflexion_aprendizaje?: string;

  @Column({ name: 'observaciones_empresa', type: 'text', nullable: true })
  observaciones_empresa?: string;
}

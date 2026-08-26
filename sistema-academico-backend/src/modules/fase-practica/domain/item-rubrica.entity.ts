import { Column, Entity, Generated, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { bigintTransformer } from '../../../config/bigint-transformer';
import { RubricaEntity } from './rubrica.entity';

@Entity({ name: 'item_rubrica' })
export class ItemRubricaEntity {
  @PrimaryColumn({ name: 'id_item', type: 'bigint', transformer: bigintTransformer })
  @Generated('increment')
  id_item!: number;

  @Column({ name: 'id_rubrica', type: 'bigint', transformer: bigintTransformer })
  id_rubrica!: number;

  @Column({ name: 'descripcion_criterio', type: 'text' })
  descripcion_criterio!: string;

  @Column({ name: 'puntaje_maximo', type: 'numeric', precision: 5, scale: 2 })
  puntaje_maximo!: number;

  @Column({ name: 'ponderacion', type: 'numeric', precision: 5, scale: 2, nullable: true })
  ponderacion?: number;

  @ManyToOne(() => RubricaEntity, { eager: false })
  @JoinColumn({ name: 'id_rubrica' })
  rubrica?: RubricaEntity;
}

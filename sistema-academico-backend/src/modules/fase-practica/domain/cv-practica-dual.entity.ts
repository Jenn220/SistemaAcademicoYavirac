import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';
import { bigintTransformer } from '../../../config/bigint-transformer';

@Entity({ name: 'cv_practica_dual' })
export class CvPracticaDualEntity {
  @PrimaryColumn({ name: 'id_cv_practica_dual', type: 'bigint', transformer: bigintTransformer })
  @Generated('increment')
  id_cv_practica_dual!: number;

  @Column({ name: 'id_estudiante', type: 'bigint' })
  id_estudiante!: number;

  @Column({ name: 'anio_periodo', type: 'varchar', length: 20 })
  anio_periodo!: string;

  @Column({ name: 'institucion', type: 'varchar', length: 150 })
  institucion!: string;

  @Column({ name: 'cargo', type: 'varchar', length: 100 })
  cargo!: string;

  @Column({ name: 'actividades_realizadas', type: 'text' })
  actividades_realizadas!: string;
}

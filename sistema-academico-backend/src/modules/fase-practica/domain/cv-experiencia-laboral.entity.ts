import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';
import { bigintTransformer } from '../../../config/bigint-transformer';

@Entity({ name: 'cv_experiencia_laboral' })
export class CvExperienciaLaboralEntity {
  @PrimaryColumn({ name: 'id_cv_experiencia_laboral', type: 'bigint', transformer: bigintTransformer })
  @Generated('increment')
  id_cv_experiencia_laboral!: number;

  @Column({ name: 'id_estudiante', type: 'bigint' })
  id_estudiante!: number;

  @Column({ name: 'anio', type: 'varchar', length: 20 })
  anio!: string;

  @Column({ name: 'institucion', type: 'varchar', length: 150 })
  institucion!: string;

  @Column({ name: 'cargo', type: 'varchar', length: 100 })
  cargo!: string;

  @Column({ name: 'actividades', type: 'text' })
  actividades!: string;
}

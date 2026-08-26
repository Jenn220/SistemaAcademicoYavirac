import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';
import { bigintTransformer } from '../../../config/bigint-transformer';

@Entity({ name: 'cv_dato_academico' })
export class CvDatoAcademicoEntity {
  @PrimaryColumn({ name: 'id_cv_dato_academico', type: 'bigint', transformer: bigintTransformer })
  @Generated('increment')
  id_cv_dato_academico!: number;

  @Column({ name: 'id_estudiante', type: 'bigint' })
  id_estudiante!: number;

  @Column({ name: 'anio', type: 'varchar', length: 20 })
  anio!: string;

  @Column({ name: 'institucion', type: 'varchar', length: 150 })
  institucion!: string;

  @Column({ name: 'titulo_mencion', type: 'varchar', length: 150 })
  titulo_mencion!: string;

  @Column({ name: 'nota_final', type: 'numeric', precision: 5, scale: 2, nullable: true })
  nota_final?: number;
}

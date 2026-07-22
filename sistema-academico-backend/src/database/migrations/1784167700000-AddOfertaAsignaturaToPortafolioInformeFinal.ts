import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOfertaAsignaturaToPortafolioInformeFinal1784167700000
  implements MigrationInterface
{
  name = 'AddOfertaAsignaturaToPortafolioInformeFinal1784167700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE portafolio_informe_final
        ADD COLUMN id_oferta_asignatura BIGINT;
    `);

    await queryRunner.query(`
      UPDATE portafolio_informe_final pif
      SET id_oferta_asignatura = oa.id_oferta_asignatura
      FROM oferta_asignatura oa
      JOIN periodo_carrera pc ON oa.id_periodo_carrera = pc.id_periodo_carrera
      WHERE oa.id_docente = pif.id_docente
        AND oa.id_asignatura = pif.id_asignatura
        AND oa.id_paralelo = pif.id_paralelo
        AND pc.id_periodo = pif.id_periodo;
    `);

    await queryRunner.query(`
      ALTER TABLE portafolio_informe_final
        ALTER COLUMN id_oferta_asignatura SET NOT NULL,
        ADD CONSTRAINT fk_pif_oferta_asignatura
          FOREIGN KEY (id_oferta_asignatura) REFERENCES oferta_asignatura(id_oferta_asignatura),
        ADD CONSTRAINT uk_pif_oferta_asignatura UNIQUE (id_oferta_asignatura),
        DROP CONSTRAINT uk_pif_docente_periodo_asignatura,
        DROP CONSTRAINT fk_pif_docente,
        DROP CONSTRAINT fk_pif_periodo,
        DROP CONSTRAINT fk_pif_asignatura,
        DROP CONSTRAINT fk_pif_paralelo,
        DROP COLUMN id_docente,
        DROP COLUMN id_periodo,
        DROP COLUMN id_asignatura,
        DROP COLUMN id_paralelo;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE portafolio_informe_final
        ADD COLUMN id_docente BIGINT,
        ADD COLUMN id_periodo BIGINT,
        ADD COLUMN id_asignatura BIGINT,
        ADD COLUMN id_paralelo BIGINT;
    `);

    await queryRunner.query(`
      UPDATE portafolio_informe_final pif
      SET id_docente = oa.id_docente,
          id_asignatura = oa.id_asignatura,
          id_paralelo = oa.id_paralelo,
          id_periodo = pc.id_periodo
      FROM oferta_asignatura oa
      JOIN periodo_carrera pc ON oa.id_periodo_carrera = pc.id_periodo_carrera
      WHERE oa.id_oferta_asignatura = pif.id_oferta_asignatura;
    `);

    await queryRunner.query(`
      ALTER TABLE portafolio_informe_final
        ALTER COLUMN id_docente SET NOT NULL,
        ALTER COLUMN id_periodo SET NOT NULL,
        ALTER COLUMN id_asignatura SET NOT NULL,
        ALTER COLUMN id_paralelo SET NOT NULL,
        ADD CONSTRAINT fk_pif_docente FOREIGN KEY (id_docente) REFERENCES docente(id_docente),
        ADD CONSTRAINT fk_pif_periodo FOREIGN KEY (id_periodo) REFERENCES periodo_academico(id_periodo),
        ADD CONSTRAINT fk_pif_asignatura FOREIGN KEY (id_asignatura) REFERENCES asignatura(id_asignatura),
        ADD CONSTRAINT fk_pif_paralelo FOREIGN KEY (id_paralelo) REFERENCES paralelo(id_paralelo),
        ADD CONSTRAINT uk_pif_docente_periodo_asignatura UNIQUE (id_docente, id_periodo, id_asignatura),
        DROP CONSTRAINT fk_pif_oferta_asignatura,
        DROP CONSTRAINT uk_pif_oferta_asignatura,
        DROP COLUMN id_oferta_asignatura;
    `);
  }
}

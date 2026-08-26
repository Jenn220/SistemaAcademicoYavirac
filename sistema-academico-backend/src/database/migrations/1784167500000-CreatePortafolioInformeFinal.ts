import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePortafolioInformeFinal1784167500000 implements MigrationInterface {
  name = 'CreatePortafolioInformeFinal1784167500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE portafolio_informe_final (
          id_informe_final         BIGSERIAL PRIMARY KEY,
          id_docente               BIGINT NOT NULL,
          id_periodo               BIGINT NOT NULL,
          id_asignatura            BIGINT NOT NULL,
          id_paralelo              BIGINT NOT NULL,
          horario                  VARCHAR(100) NOT NULL,
          fecha_firma_docente      TIMESTAMP,
          fecha_firma_coordinador  TIMESTAMP,

          CONSTRAINT fk_pif_docente
              FOREIGN KEY (id_docente) REFERENCES docente(id_docente),
          CONSTRAINT fk_pif_periodo
              FOREIGN KEY (id_periodo) REFERENCES periodo_academico(id_periodo),
          CONSTRAINT fk_pif_asignatura
              FOREIGN KEY (id_asignatura) REFERENCES asignatura(id_asignatura),
          CONSTRAINT fk_pif_paralelo
              FOREIGN KEY (id_paralelo) REFERENCES paralelo(id_paralelo),
          CONSTRAINT uk_pif_docente_periodo_asignatura
              UNIQUE (id_docente, id_periodo, id_asignatura)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE portafolio_informe_final;`);
  }
}

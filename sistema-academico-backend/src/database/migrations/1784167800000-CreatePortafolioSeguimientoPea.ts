import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePortafolioSeguimientoPea1784167800000 implements MigrationInterface {
  name = 'CreatePortafolioSeguimientoPea1784167800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE portafolio_seguimiento_pea (
          id_seguimiento_pea    BIGSERIAL PRIMARY KEY,
          id_oferta_asignatura  BIGINT NOT NULL,
          id_representante      BIGINT,

          CONSTRAINT fk_psp_oferta_asignatura
              FOREIGN KEY (id_oferta_asignatura) REFERENCES oferta_asignatura(id_oferta_asignatura),
          CONSTRAINT fk_psp_representante
              FOREIGN KEY (id_representante) REFERENCES estudiante(id_estudiante),
          CONSTRAINT uk_psp_oferta_asignatura
              UNIQUE (id_oferta_asignatura)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE portafolio_seguimiento_pea;`);
  }
}

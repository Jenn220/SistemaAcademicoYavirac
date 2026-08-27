import {
  MigrationInterface,
  QueryRunner,
} from 'typeorm';

export class CreateControlPeriodosAudit1785814200000
  implements MigrationInterface
{
  name = 'CreateControlPeriodosAudit1785814200000';

  public async up(
    queryRunner: QueryRunner,
  ): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE periodo_carrera
      ADD COLUMN IF NOT EXISTS fecha_cierre TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS id_usuario_cierre BIGINT
    `);

    await queryRunner.query(`
      ALTER TABLE periodo_carrera
      ADD CONSTRAINT fk_periodo_carrera_usuario_cierre
      FOREIGN KEY (id_usuario_cierre)
      REFERENCES usuario(id_usuario)
      ON DELETE SET NULL
    `);

    await queryRunner.query(`
      CREATE TABLE periodo_carrera_historial (
        id_periodo_carrera_historial BIGSERIAL
          CONSTRAINT pk_periodo_carrera_historial
          PRIMARY KEY,

        id_periodo_carrera BIGINT NOT NULL,

        tipo_accion VARCHAR(40) NOT NULL,

        estado_anterior VARCHAR(20),
        estado_nuevo VARCHAR(20),

        id_coordinador_anterior BIGINT,
        id_coordinador_nuevo BIGINT,

        id_usuario_ejecutor BIGINT NOT NULL,

        motivo VARCHAR(500),

        fecha_accion TIMESTAMPTZ NOT NULL
          DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_historial_periodo_carrera
          FOREIGN KEY (id_periodo_carrera)
          REFERENCES periodo_carrera(id_periodo_carrera)
          ON DELETE CASCADE,

        CONSTRAINT fk_historial_coordinador_anterior
          FOREIGN KEY (id_coordinador_anterior)
          REFERENCES docente(id_docente)
          ON DELETE SET NULL,

        CONSTRAINT fk_historial_coordinador_nuevo
          FOREIGN KEY (id_coordinador_nuevo)
          REFERENCES docente(id_docente)
          ON DELETE SET NULL,

        CONSTRAINT fk_historial_usuario_ejecutor
          FOREIGN KEY (id_usuario_ejecutor)
          REFERENCES usuario(id_usuario)
          ON DELETE RESTRICT,

        CONSTRAINT ck_historial_tipo_accion
          CHECK (
            tipo_accion IN (
              'CIERRE',
              'REASIGNACION_COORDINADOR'
            )
          )
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_historial_periodo_carrera
      ON periodo_carrera_historial(
        id_periodo_carrera
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_historial_fecha_accion
      ON periodo_carrera_historial(
        fecha_accion
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_periodo_carrera_usuario_cierre
      ON periodo_carrera(id_usuario_cierre)
    `);
  }

  public async down(
    queryRunner: QueryRunner,
  ): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS
      idx_periodo_carrera_usuario_cierre
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS
      idx_historial_fecha_accion
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS
      idx_historial_periodo_carrera
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS periodo_carrera_historial
    `);

    await queryRunner.query(`
      ALTER TABLE periodo_carrera
      DROP CONSTRAINT IF EXISTS
      fk_periodo_carrera_usuario_cierre
    `);

    await queryRunner.query(`
      ALTER TABLE periodo_carrera
      DROP COLUMN IF EXISTS id_usuario_cierre,
      DROP COLUMN IF EXISTS fecha_cierre
    `);
  }
}
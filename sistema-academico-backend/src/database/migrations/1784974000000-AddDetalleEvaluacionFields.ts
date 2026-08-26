import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDetalleEvaluacionFields1784974000000 implements MigrationInterface {
  name = 'AddDetalleEvaluacionFields1784974000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE public.detalle_evaluacion
      ADD COLUMN IF NOT EXISTS tipo_criterio varchar(20) NULL
    `);
    await queryRunner.query(`
      ALTER TABLE public.detalle_evaluacion
      ADD COLUMN IF NOT EXISTS nivel_calificacion varchar(20) NULL
    `);
    await queryRunner.query(`
      ALTER TABLE public.detalle_evaluacion
      ADD COLUMN IF NOT EXISTS observacion text NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE public.detalle_evaluacion DROP COLUMN IF EXISTS observacion`);
    await queryRunner.query(`ALTER TABLE public.detalle_evaluacion DROP COLUMN IF EXISTS nivel_calificacion`);
    await queryRunner.query(`ALTER TABLE public.detalle_evaluacion DROP COLUMN IF EXISTS tipo_criterio`);
  }
}

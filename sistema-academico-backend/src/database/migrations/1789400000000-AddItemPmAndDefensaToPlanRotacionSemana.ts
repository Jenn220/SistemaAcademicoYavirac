import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddItemPmAndDefensaToPlanRotacionSemana1789400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE public.plan_rotacion_semana
      ADD COLUMN IF NOT EXISTS id_item_pm bigint NULL
    `);
    await queryRunner.query(`
      ALTER TABLE public.plan_rotacion_semana
      ADD COLUMN IF NOT EXISTS es_defensa_proyecto boolean NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE public.plan_rotacion_semana
      DROP COLUMN IF EXISTS es_defensa_proyecto
    `);
    await queryRunner.query(`
      ALTER TABLE public.plan_rotacion_semana
      DROP COLUMN IF EXISTS id_item_pm
    `);
  }
}

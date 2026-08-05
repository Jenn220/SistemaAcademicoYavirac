import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNivelRealAlcanzadoToItemPlanMarco1789300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE public.item_plan_marco
      ADD COLUMN IF NOT EXISTS nivel_real_alcanzado integer NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE public.item_plan_marco
      DROP COLUMN IF EXISTS nivel_real_alcanzado
    `);
  }
}

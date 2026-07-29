import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakePonderacionNullable1784976000000 implements MigrationInterface {
  name = 'MakePonderacionNullable1784976000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE public.item_rubrica
      ALTER COLUMN ponderacion DROP NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE public.item_rubrica
      ALTER COLUMN ponderacion SET NOT NULL
    `);
  }
}

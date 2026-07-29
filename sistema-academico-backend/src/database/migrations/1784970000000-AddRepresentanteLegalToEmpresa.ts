import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRepresentanteLegalToEmpresa1784970000000 implements MigrationInterface {
  name = 'AddRepresentanteLegalToEmpresa1784970000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE public.empresa
      ADD COLUMN IF NOT EXISTS representante_legal varchar(200) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE public.empresa DROP COLUMN IF EXISTS representante_legal`);
  }
}

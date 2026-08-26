import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCedulaToTutorEmpresarial1784971000000 implements MigrationInterface {
  name = 'AddCedulaToTutorEmpresarial1784971000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE public.tutor_empresarial
      ADD COLUMN IF NOT EXISTS cedula varchar(20) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE public.tutor_empresarial DROP COLUMN IF EXISTS cedula`);
  }
}

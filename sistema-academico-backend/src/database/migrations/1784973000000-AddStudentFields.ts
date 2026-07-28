import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStudentFields1784973000000 implements MigrationInterface {
  name = 'AddStudentFields1784973000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE public.estudiante
      ADD COLUMN IF NOT EXISTS estado_civil varchar(20) NULL
    `);
    await queryRunner.query(`
      ALTER TABLE public.estudiante
      ADD COLUMN IF NOT EXISTS tipo_sangre varchar(10) NULL
    `);
    await queryRunner.query(`
      ALTER TABLE public.estudiante
      ADD COLUMN IF NOT EXISTS contacto_emergencia_nombre varchar(200) NULL
    `);
    await queryRunner.query(`
      ALTER TABLE public.estudiante
      ADD COLUMN IF NOT EXISTS contacto_emergencia_telefono varchar(50) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE public.estudiante DROP COLUMN IF EXISTS contacto_emergencia_telefono`);
    await queryRunner.query(`ALTER TABLE public.estudiante DROP COLUMN IF EXISTS contacto_emergencia_nombre`);
    await queryRunner.query(`ALTER TABLE public.estudiante DROP COLUMN IF EXISTS tipo_sangre`);
    await queryRunner.query(`ALTER TABLE public.estudiante DROP COLUMN IF EXISTS estado_civil`);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPracticaCamposFormacion1784969000000 implements MigrationInterface {
  name = 'AddPracticaCamposFormacion1784969000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE public.practica_estudiante
      ADD COLUMN IF NOT EXISTS fecha_inicio date NULL
    `);
    await queryRunner.query(`
      ALTER TABLE public.practica_estudiante
      ADD COLUMN IF NOT EXISTS fecha_fin date NULL
    `);
    await queryRunner.query(`
      ALTER TABLE public.practica_estudiante
      ADD COLUMN IF NOT EXISTS nombre_proyecto varchar(255) NULL
    `);
    await queryRunner.query(`
      ALTER TABLE public.practica_estudiante
      ADD COLUMN IF NOT EXISTS cobertura_localizacion varchar(255) NULL
    `);
    await queryRunner.query(`
      ALTER TABLE public.practica_estudiante
      ADD COLUMN IF NOT EXISTS plazo_ejecucion varchar(100) NULL
    `);
    await queryRunner.query(`
      ALTER TABLE public.practica_estudiante
      ADD COLUMN IF NOT EXISTS tipo_sangre varchar(5) NULL
    `);
    await queryRunner.query(`
      ALTER TABLE public.practica_estudiante
      ADD COLUMN IF NOT EXISTS contacto_emergencia_nombre varchar(150) NULL
    `);
    await queryRunner.query(`
      ALTER TABLE public.practica_estudiante
      ADD COLUMN IF NOT EXISTS contacto_emergencia_telefono varchar(20) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE public.practica_estudiante DROP COLUMN IF EXISTS contacto_emergencia_telefono`);
    await queryRunner.query(`ALTER TABLE public.practica_estudiante DROP COLUMN IF EXISTS contacto_emergencia_nombre`);
    await queryRunner.query(`ALTER TABLE public.practica_estudiante DROP COLUMN IF EXISTS tipo_sangre`);
    await queryRunner.query(`ALTER TABLE public.practica_estudiante DROP COLUMN IF EXISTS plazo_ejecucion`);
    await queryRunner.query(`ALTER TABLE public.practica_estudiante DROP COLUMN IF EXISTS cobertura_localizacion`);
    await queryRunner.query(`ALTER TABLE public.practica_estudiante DROP COLUMN IF EXISTS nombre_proyecto`);
    await queryRunner.query(`ALTER TABLE public.practica_estudiante DROP COLUMN IF EXISTS fecha_fin`);
    await queryRunner.query(`ALTER TABLE public.practica_estudiante DROP COLUMN IF EXISTS fecha_inicio`);
  }
}

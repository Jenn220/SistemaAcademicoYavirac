import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOverrideFieldsPracticaEstudiante1789100000000 implements MigrationInterface {
  name = 'AddOverrideFieldsPracticaEstudiante1789100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE public.practica_estudiante ADD COLUMN IF NOT EXISTS nombre_carrera varchar(150) NULL`);
    await queryRunner.query(`ALTER TABLE public.practica_estudiante ADD COLUMN IF NOT EXISTS nombre_nivel varchar(100) NULL`);
    await queryRunner.query(`ALTER TABLE public.practica_estudiante ADD COLUMN IF NOT EXISTS nombre_periodo varchar(100) NULL`);
    await queryRunner.query(`ALTER TABLE public.practica_estudiante ADD COLUMN IF NOT EXISTS nombre_nucleo varchar(200) NULL`);
    await queryRunner.query(`ALTER TABLE public.practica_estudiante ADD COLUMN IF NOT EXISTS nombre_tutor_academico varchar(200) NULL`);
    await queryRunner.query(`ALTER TABLE public.practica_estudiante ADD COLUMN IF NOT EXISTS nombre_coordinador varchar(200) NULL`);
    await queryRunner.query(`ALTER TABLE public.practica_estudiante ADD COLUMN IF NOT EXISTS nombre_empresa varchar(200) NULL`);
    await queryRunner.query(`ALTER TABLE public.practica_estudiante ADD COLUMN IF NOT EXISTS nombre_tutor_empresarial varchar(200) NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE public.practica_estudiante DROP COLUMN IF EXISTS nombre_tutor_empresarial`);
    await queryRunner.query(`ALTER TABLE public.practica_estudiante DROP COLUMN IF EXISTS nombre_empresa`);
    await queryRunner.query(`ALTER TABLE public.practica_estudiante DROP COLUMN IF EXISTS nombre_coordinador`);
    await queryRunner.query(`ALTER TABLE public.practica_estudiante DROP COLUMN IF EXISTS nombre_tutor_academico`);
    await queryRunner.query(`ALTER TABLE public.practica_estudiante DROP COLUMN IF EXISTS nombre_nucleo`);
    await queryRunner.query(`ALTER TABLE public.practica_estudiante DROP COLUMN IF EXISTS nombre_periodo`);
    await queryRunner.query(`ALTER TABLE public.practica_estudiante DROP COLUMN IF EXISTS nombre_nivel`);
    await queryRunner.query(`ALTER TABLE public.practica_estudiante DROP COLUMN IF EXISTS nombre_carrera`);
  }
}

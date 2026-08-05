import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHornadaParaleloToPracticaEstudiante1789200000000 implements MigrationInterface {
  name = 'AddHornadaParaleloToPracticaEstudiante1789200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE public.practica_estudiante ADD COLUMN IF NOT EXISTS hornada varchar(20) NULL`);
    await queryRunner.query(`ALTER TABLE public.practica_estudiante ADD COLUMN IF NOT EXISTS paralelo varchar(5) NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE public.practica_estudiante DROP COLUMN IF EXISTS paralelo`);
    await queryRunner.query(`ALTER TABLE public.practica_estudiante DROP COLUMN IF EXISTS hornada`);
  }
}
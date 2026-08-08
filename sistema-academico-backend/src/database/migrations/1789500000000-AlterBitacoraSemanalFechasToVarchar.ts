import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterBitacoraSemanalFechasToVarchar1789500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE public.bitacora_semanal
      ALTER COLUMN fecha_inicio_semana TYPE varchar(20) USING fecha_inicio_semana::varchar(20),
      ALTER COLUMN fecha_fin_semana TYPE varchar(20) USING fecha_fin_semana::varchar(20)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE public.bitacora_semanal
      ALTER COLUMN fecha_inicio_semana TYPE date USING fecha_inicio_semana::date,
      ALTER COLUMN fecha_fin_semana TYPE date USING fecha_fin_semana::date
    `);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakePuestoAprendizajeNullable1784972000000 implements MigrationInterface {
  name = 'MakePuestoAprendizajeNullable1784972000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE public.plan_rotacion
      ALTER COLUMN puesto_aprendizaje DROP NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE public.plan_rotacion
      ALTER COLUMN puesto_aprendizaje SET NOT NULL
    `);
  }
}

import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMissingEvaluacionPracticaColumns1784966000000 implements MigrationInterface {
  name = "AddMissingEvaluacionPracticaColumns1784966000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE public.evaluacion_practica
      ADD COLUMN IF NOT EXISTS id_tutor_empresarial bigint NULL
    `);
    await queryRunner.query(`
      ALTER TABLE public.evaluacion_practica
      ADD COLUMN IF NOT EXISTS estado varchar(20) NULL DEFAULT 'BORRADOR'
    `);
    await queryRunner.query(`
      ALTER TABLE public.evaluacion_practica
      ADD COLUMN IF NOT EXISTS observaciones text NULL
    `);
    await queryRunner.query(`
      ALTER TABLE public.evaluacion_practica
      ADD COLUMN IF NOT EXISTS promedio_desempeno numeric NULL
    `);
    await queryRunner.query(`
      ALTER TABLE public.evaluacion_practica
      ADD COLUMN IF NOT EXISTS nota_ponderada_desempeno numeric NULL
    `);
    await queryRunner.query(`
      ALTER TABLE public.evaluacion_practica
      ADD COLUMN IF NOT EXISTS nota_parcial_defensa numeric NULL
    `);
    await queryRunner.query(`
      ALTER TABLE public.evaluacion_practica
      ADD COLUMN IF NOT EXISTS nota_final_defensa numeric NULL
    `);
    await queryRunner.query(`
      ALTER TABLE public.evaluacion_practica
      ADD COLUMN IF NOT EXISTS nota_ponderada_defensa numeric NULL
    `);
    await queryRunner.query(`
      ALTER TABLE public.evaluacion_practica
      ADD COLUMN IF NOT EXISTS nota_final_empresa numeric NULL
    `);
    await queryRunner.query(`
      ALTER TABLE public.evaluacion_practica
      ADD COLUMN IF NOT EXISTS promedio_proyecto_empresarial numeric NULL
    `);
    await queryRunner.query(`
      ALTER TABLE public.evaluacion_practica
      ADD COLUMN IF NOT EXISTS nota_ponderada_proyecto numeric NULL
    `);
    await queryRunner.query(`
      ALTER TABLE public.evaluacion_practica
      ADD COLUMN IF NOT EXISTS nota_final_instituto numeric NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE public.evaluacion_practica DROP COLUMN IF EXISTS nota_final_instituto`);
    await queryRunner.query(`ALTER TABLE public.evaluacion_practica DROP COLUMN IF EXISTS nota_ponderada_proyecto`);
    await queryRunner.query(`ALTER TABLE public.evaluacion_practica DROP COLUMN IF EXISTS promedio_proyecto_empresarial`);
    await queryRunner.query(`ALTER TABLE public.evaluacion_practica DROP COLUMN IF EXISTS nota_final_empresa`);
    await queryRunner.query(`ALTER TABLE public.evaluacion_practica DROP COLUMN IF EXISTS nota_ponderada_defensa`);
    await queryRunner.query(`ALTER TABLE public.evaluacion_practica DROP COLUMN IF EXISTS nota_final_defensa`);
    await queryRunner.query(`ALTER TABLE public.evaluacion_practica DROP COLUMN IF EXISTS nota_parcial_defensa`);
    await queryRunner.query(`ALTER TABLE public.evaluacion_practica DROP COLUMN IF EXISTS nota_ponderada_desempeno`);
    await queryRunner.query(`ALTER TABLE public.evaluacion_practica DROP COLUMN IF EXISTS promedio_desempeno`);
    await queryRunner.query(`ALTER TABLE public.evaluacion_practica DROP COLUMN IF EXISTS observaciones`);
    await queryRunner.query(`ALTER TABLE public.evaluacion_practica DROP COLUMN IF EXISTS estado`);
    await queryRunner.query(`ALTER TABLE public.evaluacion_practica DROP COLUMN IF EXISTS id_tutor_empresarial`);
  }
}

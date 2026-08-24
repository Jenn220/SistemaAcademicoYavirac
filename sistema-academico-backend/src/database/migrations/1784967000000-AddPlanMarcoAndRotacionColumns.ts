import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPlanMarcoAndRotacionColumns1784967000000 implements MigrationInterface {
  name = 'AddPlanMarcoAndRotacionColumns1784967000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE public.plan_marco_formacion
      ADD COLUMN IF NOT EXISTS horas_formacion integer NULL
    `);
    await queryRunner.query(`
      ALTER TABLE public.plan_marco_formacion
      ADD COLUMN IF NOT EXISTS objetivos_fase_practica text NULL
    `);
    await queryRunner.query(`
      ALTER TABLE public.plan_marco_formacion
      ADD COLUMN IF NOT EXISTS id_nucleo_estructurante bigint NULL
    `);
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'fk_pmf_nucleo'
        ) THEN
          ALTER TABLE public.plan_marco_formacion
          ADD CONSTRAINT fk_pmf_nucleo
          FOREIGN KEY (id_nucleo_estructurante) REFERENCES public.nucleo_estructurante(id_nucleo);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      ALTER TABLE public.item_plan_marco
      ADD COLUMN IF NOT EXISTS tareas_laborales text NULL
    `);
    await queryRunner.query(`
      ALTER TABLE public.item_plan_marco
      ADD COLUMN IF NOT EXISTS puesto_aprendizaje varchar(150) NULL
    `);
    await queryRunner.query(`
      ALTER TABLE public.item_plan_marco
      ADD COLUMN IF NOT EXISTS semanas integer NULL
    `);
    await queryRunner.query(`
      ALTER TABLE public.item_plan_marco
      ADD COLUMN IF NOT EXISTS responsable_puesto varchar(150) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE public.item_plan_marco DROP COLUMN IF EXISTS responsable_puesto`);
    await queryRunner.query(`ALTER TABLE public.item_plan_marco DROP COLUMN IF EXISTS semanas`);
    await queryRunner.query(`ALTER TABLE public.item_plan_marco DROP COLUMN IF EXISTS puesto_aprendizaje`);
    await queryRunner.query(`ALTER TABLE public.item_plan_marco DROP COLUMN IF EXISTS tareas_laborales`);
    await queryRunner.query(`ALTER TABLE public.plan_marco_formacion DROP CONSTRAINT IF EXISTS fk_pmf_nucleo`);
    await queryRunner.query(`ALTER TABLE public.plan_marco_formacion DROP COLUMN IF EXISTS id_nucleo_estructurante`);
    await queryRunner.query(`ALTER TABLE public.plan_marco_formacion DROP COLUMN IF EXISTS objetivos_fase_practica`);
    await queryRunner.query(`ALTER TABLE public.plan_marco_formacion DROP COLUMN IF EXISTS horas_formacion`);
  }
}

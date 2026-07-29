import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPracticaToPlanMarco1784968000000 implements MigrationInterface {
  name = 'AddPracticaToPlanMarco1784968000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE public.plan_marco_formacion
      ADD COLUMN IF NOT EXISTS id_practica bigint NULL
    `);
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'fk_pmf_practica'
        ) THEN
          ALTER TABLE public.plan_marco_formacion
          ADD CONSTRAINT fk_pmf_practica
          FOREIGN KEY (id_practica) REFERENCES public.practica_estudiante(id_practica);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_attribute 
          WHERE attrelid = 'public.plan_marco_formacion'::regclass 
          AND attname = 'id_nivel' 
          AND attnotnull = true
        ) THEN
          ALTER TABLE public.plan_marco_formacion ALTER COLUMN id_nivel DROP NOT NULL;
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE public.plan_marco_formacion DROP CONSTRAINT IF EXISTS fk_pmf_practica`);
    await queryRunner.query(`ALTER TABLE public.plan_marco_formacion DROP COLUMN IF EXISTS id_practica`);
    await queryRunner.query(`ALTER TABLE public.plan_marco_formacion ALTER COLUMN id_nivel SET NOT NULL`);
  }
}

import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEvaluacionEmpresaFields1784948928853 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE public.evaluacion_practica
            ADD COLUMN IF NOT EXISTS fortalezas text,
            ADD COLUMN IF NOT EXISTS oportunidades_mejora text,
            ADD COLUMN IF NOT EXISTS recomendaciones text;
        `);
    }
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE public.evaluacion_practica
            DROP COLUMN IF EXISTS recomendaciones,
            DROP COLUMN IF EXISTS oportunidades_mejora,
            DROP COLUMN IF EXISTS fortalezas;
        `);
    }
}
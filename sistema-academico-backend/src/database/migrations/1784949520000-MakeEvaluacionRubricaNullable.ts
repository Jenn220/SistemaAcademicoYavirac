import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeEvaluacionRubricaNullable1784949520000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE public.evaluacion_practica ALTER COLUMN id_rubrica DROP NOT NULL;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE public.evaluacion_practica ALTER COLUMN id_rubrica SET NOT NULL;
        `);
    }
}

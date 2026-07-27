import { MigrationInterface, QueryRunner } from "typeorm";

export class AssignRubricaToEvaluaciones20260727122004 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE public.evaluacion_practica
            SET id_rubrica = CASE
                WHEN tipo_evaluador = 'EMPRESA' THEN 1
                WHEN tipo_evaluador = 'INSTITUTO' THEN 2
            END
            WHERE id_rubrica IS NULL;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE public.evaluacion_practica SET id_rubrica = NULL WHERE id_rubrica IN (1, 2);`);
    }
}

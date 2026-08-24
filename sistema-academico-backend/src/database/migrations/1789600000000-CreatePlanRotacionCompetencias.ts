import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * "Competencias Necesarias" (Formato 04, Plan de Rotación) es un único
 * bloque de texto libre por práctica (no por ítem/resultado de
 * aprendizaje), a diferencia de plan_rotacion que tiene una fila por
 * id_item_pm. Por eso no se agregan columnas a plan_rotacion (se
 * duplicarían/desincronizarían entre filas) sino una tabla 1:1 con
 * practica_estudiante, igual de simple que plan_marco para su propio
 * formato.
 */
export class CreatePlanRotacionCompetencias1789600000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS public.plan_rotacion_competencias (
                id_practica bigint PRIMARY KEY REFERENCES public.practica_estudiante(id_practica) ON DELETE CASCADE,
                conocimientos_teoricos text,
                procedimentales text,
                actitudinales text,
                updated_at timestamp DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS public.plan_rotacion_competencias;
        `);
    }
}

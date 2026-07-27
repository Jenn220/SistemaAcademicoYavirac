import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedRubricasFormato071784949353911 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO public.rubrica (nombre, descripcion, estado)
            VALUES ('Formato 07 - Evaluacion Empresa', 'Rubrica base para evaluacion de empresa en fase practica', 'ACTIVO')
            ON CONFLICT DO NOTHING;
        `);

        await queryRunner.query(`
            INSERT INTO public.evaluacion_plan_marco (id_rubrica, nombre, descripcion, estado)
            SELECT id_rubrica, 'Desempeno Tecnico', 'Evaluacion del desempeno tecnico del estudiante', 'ACTIVO'
            FROM public.rubrica WHERE nombre = 'Formato 07 - Evaluacion Empresa'
            ON CONFLICT DO NOTHING;
        `);

        await queryRunner.query(`
            INSERT INTO public.item_rubrica (id_evaluacion_plan_marco, nombre, descripcion, peso, estado)
            SELECT id_evaluacion_plan_marco, 'Dominio de herramientas', 'El estudiante domina las herramientas utilizadas', 25, 'ACTIVO'
            FROM public.evaluacion_plan_marco WHERE nombre = 'Desempeno Tecnico'
            ON CONFLICT DO NOTHING;
        `);

        await queryRunner.query(`
            INSERT INTO public.item_rubrica (id_evaluacion_plan_marco, nombre, descripcion, peso, estado)
            SELECT id_evaluacion_plan_marco, 'Cumplimiento de actividades', 'Cumple con las actividades asignadas', 25, 'ACTIVO'
            FROM public.evaluacion_plan_marco WHERE nombre = 'Desempeno Tecnico'
            ON CONFLICT DO NOTHING;
        `);

        await queryRunner.query(`
            INSERT INTO public.item_rubrica (id_evaluacion_plan_marco, nombre, descripcion, peso, estado)
            SELECT id_evaluacion_plan_marco, 'Trabajo en equipo', 'Colabora efectivamente con el equipo', 25, 'ACTIVO'
            FROM public.evaluacion_plan_marco WHERE nombre = 'Desempeno Tecnico'
            ON CONFLICT DO NOTHING;
        `);

        await queryRunner.query(`
            INSERT INTO public.item_rubrica (id_evaluacion_plan_marco, nombre, descripcion, peso, estado)
            SELECT id_evaluacion_plan_marco, 'Puntualidad y asistencia', 'Asiste puntualmente y cumple horarios', 25, 'ACTIVO'
            FROM public.evaluacion_plan_marco WHERE nombre = 'Desempeno Tecnico'
            ON CONFLICT DO NOTHING;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM public.item_rubrica WHERE nombre IN ('Puntualidad y asistencia', 'Trabajo en equipo', 'Cumplimiento de actividades', 'Dominio de herramientas');`);
        await queryRunner.query(`DELETE FROM public.evaluacion_plan_marco WHERE nombre = 'Desempeno Tecnico';`);
        await queryRunner.query(`DELETE FROM public.rubrica WHERE nombre = 'Formato 07 - Evaluacion Empresa';`);
    }
}

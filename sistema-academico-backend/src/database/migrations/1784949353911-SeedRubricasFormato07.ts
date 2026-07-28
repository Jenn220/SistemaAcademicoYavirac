import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedRubricasFormato071784949353911 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO public.catalogo_rubrica (nombre, tipo, estado)
            VALUES ('Formato 07 - Evaluacion Empresa', 'FASE_PRACTICA', 'ACTIVO')
            ON CONFLICT DO NOTHING;
        `);
        await queryRunner.query(`
            INSERT INTO public.item_rubrica (id_rubrica, descripcion_criterio, puntaje_maximo, ponderacion)
            SELECT id_rubrica, 'Dominio de herramientas: el estudiante domina las herramientas utilizadas', 25, 25
            FROM public.catalogo_rubrica WHERE nombre = 'Formato 07 - Evaluacion Empresa'
            AND NOT EXISTS (
                SELECT 1 FROM public.item_rubrica ir
                JOIN public.catalogo_rubrica cr ON cr.id_rubrica = ir.id_rubrica
                WHERE cr.nombre = 'Formato 07 - Evaluacion Empresa'
                AND ir.descripcion_criterio = 'Dominio de herramientas: el estudiante domina las herramientas utilizadas'
            );
        `);
        await queryRunner.query(`
            INSERT INTO public.item_rubrica (id_rubrica, descripcion_criterio, puntaje_maximo, ponderacion)
            SELECT id_rubrica, 'Cumplimiento de actividades: cumple con las actividades asignadas', 25, 25
            FROM public.catalogo_rubrica WHERE nombre = 'Formato 07 - Evaluacion Empresa'
            AND NOT EXISTS (
                SELECT 1 FROM public.item_rubrica ir
                JOIN public.catalogo_rubrica cr ON cr.id_rubrica = ir.id_rubrica
                WHERE cr.nombre = 'Formato 07 - Evaluacion Empresa'
                AND ir.descripcion_criterio = 'Cumplimiento de actividades: cumple con las actividades asignadas'
            );
        `);
        await queryRunner.query(`
            INSERT INTO public.item_rubrica (id_rubrica, descripcion_criterio, puntaje_maximo, ponderacion)
            SELECT id_rubrica, 'Trabajo en equipo: colabora efectivamente con el equipo', 25, 25
            FROM public.catalogo_rubrica WHERE nombre = 'Formato 07 - Evaluacion Empresa'
            AND NOT EXISTS (
                SELECT 1 FROM public.item_rubrica ir
                JOIN public.catalogo_rubrica cr ON cr.id_rubrica = ir.id_rubrica
                WHERE cr.nombre = 'Formato 07 - Evaluacion Empresa'
                AND ir.descripcion_criterio = 'Trabajo en equipo: colabora efectivamente con el equipo'
            );
        `);
        await queryRunner.query(`
            INSERT INTO public.item_rubrica (id_rubrica, descripcion_criterio, puntaje_maximo, ponderacion)
            SELECT id_rubrica, 'Puntualidad y asistencia: asiste puntualmente y cumple horarios', 25, 25
            FROM public.catalogo_rubrica WHERE nombre = 'Formato 07 - Evaluacion Empresa'
            AND NOT EXISTS (
                SELECT 1 FROM public.item_rubrica ir
                JOIN public.catalogo_rubrica cr ON cr.id_rubrica = ir.id_rubrica
                WHERE cr.nombre = 'Formato 07 - Evaluacion Empresa'
                AND ir.descripcion_criterio = 'Puntualidad y asistencia: asiste puntualmente y cumple horarios'
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM public.item_rubrica
            WHERE id_rubrica IN (SELECT id_rubrica FROM public.catalogo_rubrica WHERE nombre = 'Formato 07 - Evaluacion Empresa');
        `);
        await queryRunner.query(`DELETE FROM public.catalogo_rubrica WHERE nombre = 'Formato 07 - Evaluacion Empresa';`);
    }
}
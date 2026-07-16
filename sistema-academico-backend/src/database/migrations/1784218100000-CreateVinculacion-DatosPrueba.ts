import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateVinculacionDatosPrueba1784218100000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Reutiliza los datos base y la empresa creados por CreateFasePractica-DatosPrueba.
        // Si esta migracion se corre sola, hace falta que exista al menos:
        // matricula_detalle, empresa, docente, periodo_academico.
        await queryRunner.query(`
            INSERT INTO public.vinculacion_estudiante (id_periodo, id_matricula_detalle, id_empresa, id_docente, nombre_proyecto, fecha_inicio, fecha_fin, total_horas_estudiante, total_horas_docente, estado)
            SELECT (SELECT id_periodo FROM public.periodo_academico LIMIT 1),
                   (SELECT id_matricula_detalle FROM public.matricula_detalle LIMIT 1),
                   (SELECT id_empresa FROM public.empresa LIMIT 1),
                   (SELECT id_docente FROM public.docente LIMIT 1),
                   'Alfabetizacion Digital', '2026-05-01', '2026-06-30', 8.0, 2.0, 'EN_CURSO';
        `);
        await queryRunner.query(`
            INSERT INTO public.vinculacion_actividad_estudiante (id_vinculacion, fecha, hora_inicio, hora_fin, horas_total, actividades_realizadas)
            SELECT (SELECT id_vinculacion FROM public.vinculacion_estudiante LIMIT 1),
                   '2026-05-05', '10:00', '12:00', 2.0, 'Charla a la comunidad sobre herramientas ofimaticas';
        `);
        await queryRunner.query(`
            INSERT INTO public.vinculacion_asistencia_tutor (id_vinculacion, fecha, hora_inicio, hora_fin, horas_total, observaciones)
            SELECT (SELECT id_vinculacion FROM public.vinculacion_estudiante LIMIT 1),
                   '2026-05-05', '09:00', '10:00', 1.0, 'Supervision de actividad, todo en orden';
        `);
        await queryRunner.query(`
            INSERT INTO public.vinculacion_informe (id_vinculacion, fecha_informe, actividad_macro, resultado_aprendizaje)
            SELECT (SELECT id_vinculacion FROM public.vinculacion_estudiante LIMIT 1),
                   '2026-06-30', 'Capacitacion en herramientas ofimaticas',
                   'Los participantes identifican las partes basicas de un computador y manejan procesadores de texto.';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM public.vinculacion_informe;`);
        await queryRunner.query(`DELETE FROM public.vinculacion_asistencia_tutor;`);
        await queryRunner.query(`DELETE FROM public.vinculacion_actividad_estudiante;`);
        await queryRunner.query(`DELETE FROM public.vinculacion_estudiante;`);
    }
}

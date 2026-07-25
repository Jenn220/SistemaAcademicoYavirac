import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePortafolioDatosPruebaRonniVilla1785000000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Requiere que ya existan (sembrados por migraciones previas de datos de prueba):
        // - docente con cedula '1750000199' (Ronni Villa, ya vinculado a usuario rav.villa@yavirac.edu.ec)
        // - periodo_carrera, asignatura 'PPP-501', jornada 'INTENSIVA', paralelo 'B', periodo_academico, matricula
        await queryRunner.query(`
            DO $$
            DECLARE
                v_id_docente bigint;
                v_id_periodo_carrera bigint;
                v_id_asignatura bigint;
                v_id_jornada bigint;
                v_id_paralelo bigint;
                v_id_oferta_asignatura bigint;
                v_id_matricula bigint;
                v_id_matricula_detalle bigint;
                v_id_periodo bigint;
                v_id_reporte_notas bigint;
            BEGIN
                SELECT id_docente INTO v_id_docente FROM public.docente WHERE cedula = '1750000199';

                IF v_id_docente IS NULL THEN
                    RAISE EXCEPTION 'No existe un docente con cedula 1750000199. Verifica el dato antes de correr esta migracion.';
                END IF;

                -- Si ya existe una oferta para este docente, no duplicar
                SELECT id_oferta_asignatura INTO v_id_oferta_asignatura
                FROM public.oferta_asignatura WHERE id_docente = v_id_docente LIMIT 1;

                IF v_id_oferta_asignatura IS NULL THEN
                    SELECT id_periodo_carrera INTO v_id_periodo_carrera FROM public.periodo_carrera LIMIT 1;
                    SELECT id_asignatura INTO v_id_asignatura FROM public.asignatura WHERE codigo = 'PPP-501';
                    SELECT id_jornada INTO v_id_jornada FROM public.jornada WHERE nombre = 'INTENSIVA';
                    SELECT id_paralelo INTO v_id_paralelo FROM public.paralelo WHERE nombre = 'B';

                    IF v_id_periodo_carrera IS NULL OR v_id_asignatura IS NULL OR v_id_jornada IS NULL OR v_id_paralelo IS NULL THEN
                        RAISE EXCEPTION 'Faltan datos base (periodo_carrera/asignatura/jornada/paralelo). Corre primero las migraciones de datos de prueba de fase practica.';
                    END IF;

                    INSERT INTO public.oferta_asignatura (id_periodo_carrera, id_asignatura, id_docente, id_jornada, id_paralelo, cupos, horas_semanales, estado)
                    VALUES (v_id_periodo_carrera, v_id_asignatura, v_id_docente, v_id_jornada, v_id_paralelo, 35, 8, 'ACTIVO')
                    RETURNING id_oferta_asignatura INTO v_id_oferta_asignatura;
                END IF;

                SELECT id_periodo INTO v_id_periodo FROM public.periodo_academico LIMIT 1;
                SELECT id_matricula INTO v_id_matricula FROM public.matricula LIMIT 1;

                -- Matricula del estudiante de prueba en la nueva oferta (si no existe ya)
                SELECT id_matricula_detalle INTO v_id_matricula_detalle
                FROM public.matricula_detalle WHERE id_oferta_asignatura = v_id_oferta_asignatura LIMIT 1;

                IF v_id_matricula_detalle IS NULL THEN
                    INSERT INTO public.matricula_detalle (id_matricula, id_oferta_asignatura, nota_ap1, estado)
                    VALUES (v_id_matricula, v_id_oferta_asignatura, 8.5, 'CURSANDO')
                    RETURNING id_matricula_detalle INTO v_id_matricula_detalle;
                END IF;

                -- Reporte de notas generado para esa oferta
                SELECT id_reporte_notas INTO v_id_reporte_notas
                FROM public.portafolio_reporte_notas WHERE id_oferta_asignatura = v_id_oferta_asignatura LIMIT 1;

                IF v_id_reporte_notas IS NULL THEN
                    INSERT INTO public.portafolio_reporte_notas (id_periodo, id_oferta_asignatura, tipo_reporte, ruta_archivo_pdf, estado)
                    VALUES (v_id_periodo, v_id_oferta_asignatura, 'APORTE_1', NULL, 'GENERADO')
                    RETURNING id_reporte_notas INTO v_id_reporte_notas;
                END IF;

                -- Aceptacion pendiente del estudiante sobre ese reporte
                IF NOT EXISTS (
                    SELECT 1 FROM public.portafolio_aceptacion_estudiante
                    WHERE id_reporte_notas = v_id_reporte_notas AND id_matricula_detalle = v_id_matricula_detalle
                ) THEN
                    INSERT INTO public.portafolio_aceptacion_estudiante (id_reporte_notas, id_matricula_detalle, nota_registrada, estado_aceptacion)
                    VALUES (v_id_reporte_notas, v_id_matricula_detalle, 8.5, 'PENDIENTE');
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            DECLARE
                v_id_docente bigint;
            BEGIN
                SELECT id_docente INTO v_id_docente FROM public.docente WHERE cedula = '1750000199';

                IF v_id_docente IS NOT NULL THEN
                    DELETE FROM public.portafolio_aceptacion_estudiante
                    WHERE id_matricula_detalle IN (
                        SELECT md.id_matricula_detalle FROM public.matricula_detalle md
                        JOIN public.oferta_asignatura oa ON oa.id_oferta_asignatura = md.id_oferta_asignatura
                        WHERE oa.id_docente = v_id_docente
                    );

                    DELETE FROM public.portafolio_reporte_notas
                    WHERE id_oferta_asignatura IN (
                        SELECT id_oferta_asignatura FROM public.oferta_asignatura WHERE id_docente = v_id_docente
                    );

                    DELETE FROM public.matricula_detalle
                    WHERE id_oferta_asignatura IN (
                        SELECT id_oferta_asignatura FROM public.oferta_asignatura WHERE id_docente = v_id_docente
                    );

                    DELETE FROM public.oferta_asignatura WHERE id_docente = v_id_docente;
                END IF;
            END $$;
        `);
    }
}

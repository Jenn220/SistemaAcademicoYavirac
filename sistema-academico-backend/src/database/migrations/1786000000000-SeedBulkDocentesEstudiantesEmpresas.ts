import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedBulkDocentesEstudiantesEmpresas1786000000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            DECLARE
                v_id_periodo bigint;
                v_id_carrera bigint;
                v_id_periodo_carrera bigint;
                v_id_asignatura bigint;
                v_id_jornada bigint;
                v_id_paralelo bigint;
                v_id_oferta_lote bigint;
                v_faltan_empresas integer;
                v_faltan_docentes integer;
                v_faltan_estudiantes integer;
            BEGIN
                -- Resincronizar secuencias (algunos seeds anteriores insertan ids fijos a mano
                -- y eso descuadra el contador interno de Postgres para los proximos INSERT)
                PERFORM setval('public.docente_id_docente_seq', COALESCE((SELECT MAX(id_docente) FROM public.docente), 0));
                PERFORM setval('public.estudiante_id_estudiante_seq', COALESCE((SELECT MAX(id_estudiante) FROM public.estudiante), 0));
                PERFORM setval('public.empresa_id_empresa_seq', COALESCE((SELECT MAX(id_empresa) FROM public.empresa), 0));
                PERFORM setval('public.matricula_id_matricula_seq', COALESCE((SELECT MAX(id_matricula) FROM public.matricula), 0));
                PERFORM setval('public.oferta_asignatura_id_oferta_asignatura_seq', COALESCE((SELECT MAX(id_oferta_asignatura) FROM public.oferta_asignatura), 0));
                PERFORM setval('public.matricula_detalle_id_matricula_detalle_seq', COALESCE((SELECT MAX(id_matricula_detalle) FROM public.matricula_detalle), 0));
                PERFORM setval('public.practica_estudiante_id_practica_seq', COALESCE((SELECT MAX(id_practica) FROM public.practica_estudiante), 0));
                PERFORM setval('public.tutor_empresarial_id_tutor_empresarial_seq', COALESCE((SELECT MAX(id_tutor_empresarial) FROM public.tutor_empresarial), 0));

                -- Preferir el periodo VIGENTE (activo y la fecha de hoy cae dentro de su rango)
                SELECT id_periodo INTO v_id_periodo
                FROM public.periodo_academico
                WHERE estado = 'ACTIVO'
                  AND CURRENT_DATE BETWEEN fecha_inicio AND fecha_fin
                ORDER BY fecha_inicio DESC
                LIMIT 1;

                -- Si ninguno esta vigente por fecha (ej. entre periodos), usar el ACTIVO mas reciente como respaldo
                IF v_id_periodo IS NULL THEN
                    SELECT id_periodo INTO v_id_periodo
                    FROM public.periodo_academico
                    WHERE estado = 'ACTIVO'
                    ORDER BY fecha_inicio DESC
                    LIMIT 1;
                END IF;

                SELECT id_carrera INTO v_id_carrera FROM public.carrera ORDER BY id_carrera LIMIT 1;

                IF v_id_periodo IS NULL OR v_id_carrera IS NULL THEN
                    RAISE EXCEPTION 'Faltan datos base (periodo_academico/carrera) para generar matriculas.';
                END IF;

                -- periodo_carrera es el que usan oferta_asignatura y practica_estudiante para
                -- filtrar por periodo, asi que es obligatorio tenerlo para poder generar accesos
                SELECT id_periodo_carrera INTO v_id_periodo_carrera
                FROM public.periodo_carrera
                WHERE id_periodo = v_id_periodo AND id_carrera = v_id_carrera
                LIMIT 1;

                IF v_id_periodo_carrera IS NULL THEN
                    RAISE EXCEPTION 'No existe periodo_carrera para id_periodo=% e id_carrera=%.', v_id_periodo, v_id_carrera;
                END IF;

                SELECT id_asignatura INTO v_id_asignatura FROM public.asignatura ORDER BY id_asignatura LIMIT 1;
                SELECT id_jornada INTO v_id_jornada FROM public.jornada ORDER BY id_jornada LIMIT 1;
                SELECT id_paralelo INTO v_id_paralelo FROM public.paralelo ORDER BY id_paralelo LIMIT 1;

                IF v_id_asignatura IS NULL OR v_id_jornada IS NULL OR v_id_paralelo IS NULL THEN
                    RAISE EXCEPTION 'Faltan datos base (asignatura/jornada/paralelo) para generar ofertas.';
                END IF;

                RAISE NOTICE 'Usando id_periodo=%, id_carrera=%, id_periodo_carrera=% para la oferta academica de prueba', v_id_periodo, v_id_carrera, v_id_periodo_carrera;

                -- 1. Completar EMPRESAS hasta tener ~50 en total (no toca las que ya existen)
                v_faltan_empresas := 50 - (SELECT COUNT(*) FROM public.empresa);
                IF v_faltan_empresas > 0 THEN
                    INSERT INTO public.empresa (ruc, razon_social, direccion, estado)
                    SELECT
                        '99' || LPAD(gs::text, 11, '0'),
                        'Empresa Lote ' || gs,
                        'Quito',
                        'ACTIVO'
                    FROM generate_series(1, v_faltan_empresas) AS gs
                    ON CONFLICT (ruc) DO NOTHING;
                END IF;

                -- 2. Completar DOCENTES hasta tener ~500 en total (no toca a Ronni Villa, docente1, Byron Moreno, etc.)
                v_faltan_docentes := 500 - (SELECT COUNT(*) FROM public.docente);
                IF v_faltan_docentes > 0 THEN
                    INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
                    SELECT
                        '98' || LPAD(gs::text, 8, '0'),
                        'Docente',
                        'Lote ' || gs,
                        'docente.lote' || gs || '@yavirac.edu.ec',
                        '09' || LPAD((90000000 + gs)::text, 8, '0'),
                        'ACTIVO'
                    FROM generate_series(1, v_faltan_docentes) AS gs
                    ON CONFLICT (cedula) DO NOTHING;
                END IF;

                -- 3. Completar ESTUDIANTES hasta tener ~1000 en total (no toca a Juan Perez, etc.)
                v_faltan_estudiantes := 1000 - (SELECT COUNT(*) FROM public.estudiante);
                IF v_faltan_estudiantes > 0 THEN
                    INSERT INTO public.estudiante (cedula, nombres, apellidos, correo, telefono, estado)
                    SELECT
                        '97' || LPAD(gs::text, 8, '0'),
                        'Estudiante',
                        'Lote ' || gs,
                        'estudiante.lote' || gs || '@yavirac.edu.ec',
                        '09' || LPAD((80000000 + gs)::text, 8, '0'),
                        'ACTIVO'
                    FROM generate_series(1, v_faltan_estudiantes) AS gs
                    ON CONFLICT (cedula) DO NOTHING;
                END IF;

                -- 4. Matricular a cada estudiante de lote en el periodo base
                --    (generarAccesos tipo ESTUDIANTE solo detecta estudiantes matriculados en el periodo indicado)
                INSERT INTO public.matricula (id_estudiante, id_periodo, id_carrera, estado)
                SELECT e.id_estudiante, v_id_periodo, v_id_carrera, 'ACTIVA'
                FROM public.estudiante e
                WHERE e.cedula LIKE '97%'
                  AND NOT EXISTS (
                      SELECT 1 FROM public.matricula m
                      WHERE m.id_estudiante = e.id_estudiante AND m.id_periodo = v_id_periodo
                  );

                -- 5. Dar OFERTA ACADEMICA (oferta_asignatura) a cada docente de lote en el periodo_carrera base
                --    (generarAccesos tipo DOCENTE solo detecta docentes con oferta_asignatura en ese periodo)
                INSERT INTO public.oferta_asignatura (id_periodo_carrera, id_asignatura, id_docente, id_jornada, id_paralelo, cupos, horas_semanales, estado)
                SELECT v_id_periodo_carrera, v_id_asignatura, d.id_docente, v_id_jornada, v_id_paralelo, 40, 4, 'ACTIVO'
                FROM public.docente d
                WHERE d.cedula LIKE '98%'
                  AND NOT EXISTS (
                      SELECT 1 FROM public.oferta_asignatura oa
                      WHERE oa.id_docente = d.id_docente AND oa.id_periodo_carrera = v_id_periodo_carrera
                  );

                -- 6. Crear un tutor empresarial por cada EMPRESA de lote (requisito de practica_estudiante)
                INSERT INTO public.tutor_empresarial (id_empresa, nombres, apellidos, cargo, correo, estado)
                SELECT emp.id_empresa, 'Tutor', 'Lote ' || emp.id_empresa, 'Supervisor de Practicas',
                       'tutor.lote' || emp.id_empresa || '@empresa-lote.ec', 'ACTIVO'
                FROM public.empresa emp
                WHERE emp.ruc LIKE '99%'
                  AND NOT EXISTS (
                      SELECT 1 FROM public.tutor_empresarial te WHERE te.id_empresa = emp.id_empresa
                  );

                -- 7. Dar a cada matricula de estudiante de lote un detalle de matricula (materia cursando),
                --    usando la primera oferta_asignatura disponible en el periodo_carrera base
                SELECT id_oferta_asignatura INTO v_id_oferta_lote
                FROM public.oferta_asignatura
                WHERE id_periodo_carrera = v_id_periodo_carrera
                ORDER BY id_oferta_asignatura
                LIMIT 1;

                INSERT INTO public.matricula_detalle (id_matricula, id_oferta_asignatura, estado)
                SELECT m.id_matricula, v_id_oferta_lote, 'CURSANDO'
                FROM public.matricula m
                JOIN public.estudiante e ON e.id_estudiante = m.id_estudiante
                WHERE e.cedula LIKE '97%'
                  AND m.id_periodo = v_id_periodo
                  AND NOT EXISTS (
                      SELECT 1 FROM public.matricula_detalle md WHERE md.id_matricula = m.id_matricula
                  );

                -- 8. Dar OFERTA DE PRACTICA (practica_estudiante) a cada estudiante de lote,
                --    repartiendolos en round-robin entre las empresas y docentes de lote.
                --    (generarAccesos tipo EMPRESA solo detecta empresas con practica_estudiante en ese periodo)
                WITH estudiantes_sin_practica AS (
                    SELECT md.id_matricula_detalle,
                           ROW_NUMBER() OVER (ORDER BY md.id_matricula_detalle) AS rn
                    FROM public.matricula_detalle md
                    JOIN public.matricula m ON m.id_matricula = md.id_matricula
                    JOIN public.estudiante e ON e.id_estudiante = m.id_estudiante
                    WHERE e.cedula LIKE '97%'
                      AND NOT EXISTS (
                          SELECT 1 FROM public.practica_estudiante pe WHERE pe.id_matricula_detalle = md.id_matricula_detalle
                      )
                ),
                empresas_lote AS (
                    SELECT emp.id_empresa, te.id_tutor_empresarial,
                           ROW_NUMBER() OVER (ORDER BY emp.id_empresa) AS rn,
                           COUNT(*) OVER () AS total
                    FROM public.empresa emp
                    JOIN public.tutor_empresarial te ON te.id_empresa = emp.id_empresa
                    WHERE emp.ruc LIKE '99%'
                ),
                docentes_lote AS (
                    SELECT d.id_docente,
                           ROW_NUMBER() OVER (ORDER BY d.id_docente) AS rn,
                           COUNT(*) OVER () AS total
                    FROM public.docente d
                    WHERE d.cedula LIKE '98%'
                )
                INSERT INTO public.practica_estudiante (id_periodo, id_matricula_detalle, id_empresa, id_tutor_empresarial, id_docente, estado)
                SELECT v_id_periodo, esp.id_matricula_detalle, emp.id_empresa, emp.id_tutor_empresarial, doc.id_docente, 'EN_CURSO'
                FROM estudiantes_sin_practica esp
                JOIN empresas_lote emp ON emp.rn = ((esp.rn - 1) % emp.total) + 1
                JOIN docentes_lote doc ON doc.rn = ((esp.rn - 1) % doc.total) + 1
                WHERE emp.total > 0 AND doc.total > 0;

            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
                -- Practicas de estudiantes de lote (o con empresa/docente/estudiante de lote involucrados)
                DELETE FROM public.practica_estudiante
                WHERE id_matricula_detalle IN (
                    SELECT md.id_matricula_detalle
                    FROM public.matricula_detalle md
                    JOIN public.matricula m ON m.id_matricula = md.id_matricula
                    JOIN public.estudiante e ON e.id_estudiante = m.id_estudiante
                    WHERE e.cedula LIKE '97%'
                )
                OR id_empresa IN (SELECT id_empresa FROM public.empresa WHERE ruc LIKE '99%')
                OR id_docente IN (SELECT id_docente FROM public.docente WHERE cedula LIKE '98%');

                -- Detalle de matricula de estudiantes de lote
                DELETE FROM public.matricula_detalle
                WHERE id_matricula IN (
                    SELECT m.id_matricula FROM public.matricula m
                    JOIN public.estudiante e ON e.id_estudiante = m.id_estudiante
                    WHERE e.cedula LIKE '97%'
                );

                -- Tutores empresariales de empresas de lote
                DELETE FROM public.tutor_empresarial
                WHERE id_empresa IN (SELECT id_empresa FROM public.empresa WHERE ruc LIKE '99%');

                -- Ofertas academicas de docentes de lote
                DELETE FROM public.oferta_asignatura
                WHERE id_docente IN (SELECT id_docente FROM public.docente WHERE cedula LIKE '98%');

                DELETE FROM public.matricula
                WHERE id_estudiante IN (SELECT id_estudiante FROM public.estudiante WHERE cedula LIKE '97%');

                -- Si mientras tanto se corrio "generar-accesos" y se crearon usuarios para el lote,
                -- hay que borrar primero usuario_rol (FK) antes que usuario.
                DELETE FROM public.usuario_rol
                WHERE id_usuario IN (
                    SELECT id_usuario FROM public.usuario
                    WHERE id_estudiante IN (SELECT id_estudiante FROM public.estudiante WHERE cedula LIKE '97%')
                       OR id_docente IN (SELECT id_docente FROM public.docente WHERE cedula LIKE '98%')
                       OR id_empresa IN (SELECT id_empresa FROM public.empresa WHERE ruc LIKE '99%')
                );

                DELETE FROM public.usuario
                WHERE id_estudiante IN (SELECT id_estudiante FROM public.estudiante WHERE cedula LIKE '97%')
                   OR id_docente IN (SELECT id_docente FROM public.docente WHERE cedula LIKE '98%')
                   OR id_empresa IN (SELECT id_empresa FROM public.empresa WHERE ruc LIKE '99%');

                DELETE FROM public.estudiante WHERE cedula LIKE '97%';
                DELETE FROM public.docente WHERE cedula LIKE '98%';
                DELETE FROM public.empresa WHERE ruc LIKE '99%';
            END $$;
        `);
    }
}
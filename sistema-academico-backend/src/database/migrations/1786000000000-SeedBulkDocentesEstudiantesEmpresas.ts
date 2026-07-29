import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedBulkDocentesEstudiantesEmpresas1786000000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            DECLARE
                v_id_periodo bigint;
                v_id_carrera bigint;
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

                RAISE NOTICE 'Usando id_periodo=% e id_carrera=% para las matriculas de prueba', v_id_periodo, v_id_carrera;

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

            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
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
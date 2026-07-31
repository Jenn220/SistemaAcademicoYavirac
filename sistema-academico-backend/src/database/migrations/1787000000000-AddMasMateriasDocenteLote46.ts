import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMasMateriasDocenteLote461787000000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // ============================================================
        // BLOQUE 1: 5 materias para el docente 9800000046 en el periodo
        // vigente (2026-1P). No toca a nadie mas del lote.
        // ============================================================
        await queryRunner.query(`
            DO $$
            DECLARE
                v_id_docente bigint;
                v_id_periodo bigint;
                v_id_carrera bigint;
                v_id_periodo_carrera bigint;
                v_id_nivel bigint;
                v_id_jornada bigint;
                v_id_paralelo bigint;
            BEGIN
                -- Resincronizar secuencias por si acaso (mismo criterio que la migracion anterior)
                PERFORM setval('public.asignatura_id_asignatura_seq', COALESCE((SELECT MAX(id_asignatura) FROM public.asignatura), 0));
                PERFORM setval('public.oferta_asignatura_id_oferta_asignatura_seq', COALESCE((SELECT MAX(id_oferta_asignatura) FROM public.oferta_asignatura), 0));

                -- Docente puntual sobre el que se agregan mas materias (el resto del lote queda intacto)
                SELECT id_docente INTO v_id_docente
                FROM public.docente
                WHERE cedula = '9800000046';

                IF v_id_docente IS NULL THEN
                    RAISE EXCEPTION 'No existe el docente con cedula 9800000046 (docente.lote46@yavirac.edu.ec).';
                END IF;

                -- Mismo periodo vigente que usa el resto del seed
                SELECT id_periodo INTO v_id_periodo
                FROM public.periodo_academico
                WHERE estado = 'ACTIVO'
                  AND CURRENT_DATE BETWEEN fecha_inicio AND fecha_fin
                ORDER BY fecha_inicio DESC
                LIMIT 1;

                IF v_id_periodo IS NULL THEN
                    SELECT id_periodo INTO v_id_periodo
                    FROM public.periodo_academico
                    WHERE estado = 'ACTIVO'
                    ORDER BY fecha_inicio DESC
                    LIMIT 1;
                END IF;

                SELECT id_carrera INTO v_id_carrera FROM public.carrera ORDER BY id_carrera LIMIT 1;

                IF v_id_periodo IS NULL OR v_id_carrera IS NULL THEN
                    RAISE EXCEPTION 'Faltan datos base (periodo_academico/carrera).';
                END IF;

                SELECT id_periodo_carrera INTO v_id_periodo_carrera
                FROM public.periodo_carrera
                WHERE id_periodo = v_id_periodo AND id_carrera = v_id_carrera
                LIMIT 1;

                IF v_id_periodo_carrera IS NULL THEN
                    RAISE EXCEPTION 'No existe periodo_carrera para id_periodo=% e id_carrera=%.', v_id_periodo, v_id_carrera;
                END IF;

                SELECT id_nivel INTO v_id_nivel FROM public.nivel WHERE id_carrera = v_id_carrera ORDER BY id_nivel LIMIT 1;
                SELECT id_jornada INTO v_id_jornada FROM public.jornada ORDER BY id_jornada LIMIT 1;
                SELECT id_paralelo INTO v_id_paralelo FROM public.paralelo ORDER BY id_paralelo LIMIT 1;

                IF v_id_nivel IS NULL OR v_id_jornada IS NULL OR v_id_paralelo IS NULL THEN
                    RAISE EXCEPTION 'Faltan datos base (nivel/jornada/paralelo).';
                END IF;

                -- Crear 4 asignaturas de prueba adicionales (solo si no existen) para tener 5 materias distintas
                INSERT INTO public.asignatura (id_nivel, codigo, nombre, horas, creditos, estado)
                SELECT v_id_nivel, codigo, nombre, 60, 4, 'ACTIVO'
                FROM (VALUES
                    ('LOTE-502', 'Materia de Prueba 2'),
                    ('LOTE-503', 'Materia de Prueba 3'),
                    ('LOTE-504', 'Materia de Prueba 4'),
                    ('LOTE-505', 'Materia de Prueba 5')
                ) AS nuevas(codigo, nombre)
                WHERE NOT EXISTS (
                    SELECT 1 FROM public.asignatura a WHERE a.codigo = nuevas.codigo
                );

                -- Dar al docente una oferta_asignatura por cada una de las 5 materias (PPP-501 + las 4 nuevas)
                -- en el mismo periodo_carrera vigente, sin duplicar si ya tenia alguna de ellas.
                INSERT INTO public.oferta_asignatura (id_periodo_carrera, id_asignatura, id_docente, id_jornada, id_paralelo, cupos, horas_semanales, estado)
                SELECT v_id_periodo_carrera, a.id_asignatura, v_id_docente, v_id_jornada, v_id_paralelo, 40, 4, 'ACTIVO'
                FROM public.asignatura a
                WHERE a.codigo IN ('PPP-501', 'LOTE-502', 'LOTE-503', 'LOTE-504', 'LOTE-505')
                  AND NOT EXISTS (
                      SELECT 1 FROM public.oferta_asignatura oa
                      WHERE oa.id_docente = v_id_docente
                        AND oa.id_periodo_carrera = v_id_periodo_carrera
                        AND oa.id_asignatura = a.id_asignatura
                  );

                RAISE NOTICE 'Docente id=% (cedula 9800000046) ahora tiene % ofertas en periodo_carrera=%',
                    v_id_docente,
                    (SELECT COUNT(*) FROM public.oferta_asignatura WHERE id_docente = v_id_docente AND id_periodo_carrera = v_id_periodo_carrera),
                    v_id_periodo_carrera;

            END $$;
        `);

        // ============================================================
        // BLOQUE 2: Nuevo periodo 2026-2P con 3 materias propias, 10
        // docentes nuevos, 10 estudiantes nuevos matriculados e
        // inscritos, y 3 materias mas para el docente 9800000046 pero
        // en ESTE periodo (sus 5 materias de 2026-1P no se tocan).
        // No se crean coordinadores nuevos: se deja el que ya exista
        // por carrera.
        // ============================================================
        await queryRunner.query(`
            DO $$
            DECLARE
                v_id_carrera bigint;
                v_id_nivel bigint;
                v_id_jornada bigint;
                v_id_paralelo bigint;
                v_id_periodo_p2 bigint;
                v_id_periodo_carrera_p2 bigint;
                v_id_docente_46 bigint;
                v_faltan_docentes_p2 integer;
                v_faltan_estudiantes_p2 integer;
            BEGIN
                -- Resincronizar secuencias que toca este bloque
                PERFORM setval('public.periodo_academico_id_periodo_seq', COALESCE((SELECT MAX(id_periodo) FROM public.periodo_academico), 0));
                PERFORM setval('public.periodo_carrera_id_periodo_carrera_seq', COALESCE((SELECT MAX(id_periodo_carrera) FROM public.periodo_carrera), 0));
                PERFORM setval('public.docente_id_docente_seq', COALESCE((SELECT MAX(id_docente) FROM public.docente), 0));
                PERFORM setval('public.estudiante_id_estudiante_seq', COALESCE((SELECT MAX(id_estudiante) FROM public.estudiante), 0));
                PERFORM setval('public.asignatura_id_asignatura_seq', COALESCE((SELECT MAX(id_asignatura) FROM public.asignatura), 0));
                PERFORM setval('public.oferta_asignatura_id_oferta_asignatura_seq', COALESCE((SELECT MAX(id_oferta_asignatura) FROM public.oferta_asignatura), 0));
                PERFORM setval('public.matricula_id_matricula_seq', COALESCE((SELECT MAX(id_matricula) FROM public.matricula), 0));
                PERFORM setval('public.matricula_detalle_id_matricula_detalle_seq', COALESCE((SELECT MAX(id_matricula_detalle) FROM public.matricula_detalle), 0));

                SELECT id_carrera INTO v_id_carrera FROM public.carrera ORDER BY id_carrera LIMIT 1;
                IF v_id_carrera IS NULL THEN
                    RAISE EXCEPTION 'Falta la carrera base.';
                END IF;

                SELECT id_nivel INTO v_id_nivel FROM public.nivel WHERE id_carrera = v_id_carrera ORDER BY id_nivel LIMIT 1;
                SELECT id_jornada INTO v_id_jornada FROM public.jornada ORDER BY id_jornada LIMIT 1;
                SELECT id_paralelo INTO v_id_paralelo FROM public.paralelo ORDER BY id_paralelo LIMIT 1;

                IF v_id_nivel IS NULL OR v_id_jornada IS NULL OR v_id_paralelo IS NULL THEN
                    RAISE EXCEPTION 'Faltan datos base (nivel/jornada/paralelo).';
                END IF;

                -- 1. Crear el periodo academico 2026-2P (siguiente al vigente 2026-1P)
                INSERT INTO public.periodo_academico (codigo, nombre, fecha_inicio, fecha_fin, estado)
                VALUES ('2026-2P', 'Periodo 2026-2P', '2026-09-01', '2027-01-30', 'ACTIVO')
                ON CONFLICT DO NOTHING;

                SELECT id_periodo INTO v_id_periodo_p2 FROM public.periodo_academico WHERE codigo = '2026-2P';

                -- 2. Crear periodo_carrera para 2026-2P + la carrera base.
                --    NOTA: se deja id_coordinador sin tocar (usa el mismo criterio/coordinador
                --    que ya exista por carrera; no se crean coordinadores nuevos).
                INSERT INTO public.periodo_carrera (id_periodo, id_carrera, fecha_inicio, fecha_fin, estado)
                SELECT v_id_periodo_p2, v_id_carrera, '2026-09-01', '2027-01-30', 'ACTIVO'
                WHERE NOT EXISTS (
                    SELECT 1 FROM public.periodo_carrera pc WHERE pc.id_periodo = v_id_periodo_p2 AND pc.id_carrera = v_id_carrera
                );

                SELECT id_periodo_carrera INTO v_id_periodo_carrera_p2
                FROM public.periodo_carrera
                WHERE id_periodo = v_id_periodo_p2 AND id_carrera = v_id_carrera
                LIMIT 1;

                IF v_id_periodo_carrera_p2 IS NULL THEN
                    RAISE EXCEPTION 'No se pudo crear/obtener periodo_carrera para 2026-2P.';
                END IF;

                -- 3. Crear 3 materias nuevas propias del periodo 2026-2P
                INSERT INTO public.asignatura (id_nivel, codigo, nombre, horas, creditos, estado)
                SELECT v_id_nivel, codigo, nombre, 60, 4, 'ACTIVO'
                FROM (VALUES
                    ('P2-601', 'Materia Periodo 2 - 1'),
                    ('P2-602', 'Materia Periodo 2 - 2'),
                    ('P2-603', 'Materia Periodo 2 - 3')
                ) AS nuevas(codigo, nombre)
                WHERE NOT EXISTS (SELECT 1 FROM public.asignatura a WHERE a.codigo = nuevas.codigo);

                -- 4. Completar 10 DOCENTES nuevos propios de 2026-2P (prefijo de cedula '95')
                v_faltan_docentes_p2 := 10 - (SELECT COUNT(*) FROM public.docente WHERE cedula LIKE '95%');
                IF v_faltan_docentes_p2 > 0 THEN
                    INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
                    SELECT
                        '95' || LPAD(gs::text, 8, '0'),
                        'Docente',
                        'Periodo2 ' || gs,
                        'docente.p2.' || gs || '@yavirac.edu.ec',
                        '09' || LPAD((70000000 + gs)::text, 8, '0'),
                        'ACTIVO'
                    FROM generate_series(1, v_faltan_docentes_p2) AS gs
                    ON CONFLICT (cedula) DO NOTHING;
                END IF;

                -- 5. Completar 10 ESTUDIANTES nuevos propios de 2026-2P (prefijo de cedula '96')
                v_faltan_estudiantes_p2 := 10 - (SELECT COUNT(*) FROM public.estudiante WHERE cedula LIKE '96%');
                IF v_faltan_estudiantes_p2 > 0 THEN
                    INSERT INTO public.estudiante (cedula, nombres, apellidos, correo, telefono, estado)
                    SELECT
                        '96' || LPAD(gs::text, 8, '0'),
                        'Estudiante',
                        'Periodo2 ' || gs,
                        'estudiante.p2.' || gs || '@yavirac.edu.ec',
                        '09' || LPAD((60000000 + gs)::text, 8, '0'),
                        'ACTIVO'
                    FROM generate_series(1, v_faltan_estudiantes_p2) AS gs
                    ON CONFLICT (cedula) DO NOTHING;
                END IF;

                -- 6. Dar a cada docente nuevo de 2026-2P una oferta_asignatura (reparte entre las 3 materias nuevas)
                WITH docentes_p2 AS (
                    SELECT d.id_docente, ROW_NUMBER() OVER (ORDER BY d.id_docente) AS rn
                    FROM public.docente d
                    WHERE d.cedula LIKE '95%'
                ),
                materias_p2 AS (
                    SELECT a.id_asignatura, ROW_NUMBER() OVER (ORDER BY a.id_asignatura) AS rn, COUNT(*) OVER () AS total
                    FROM public.asignatura a
                    WHERE a.codigo IN ('P2-601', 'P2-602', 'P2-603')
                )
                INSERT INTO public.oferta_asignatura (id_periodo_carrera, id_asignatura, id_docente, id_jornada, id_paralelo, cupos, horas_semanales, estado)
                SELECT v_id_periodo_carrera_p2, m.id_asignatura, dp.id_docente, v_id_jornada, v_id_paralelo, 40, 4, 'ACTIVO'
                FROM docentes_p2 dp
                JOIN materias_p2 m ON m.rn = ((dp.rn - 1) % m.total) + 1
                WHERE m.total > 0
                  AND NOT EXISTS (
                      SELECT 1 FROM public.oferta_asignatura oa
                      WHERE oa.id_docente = dp.id_docente AND oa.id_periodo_carrera = v_id_periodo_carrera_p2
                  );

                -- 7. Matricular a los 10 estudiantes nuevos en 2026-2P
                INSERT INTO public.matricula (id_estudiante, id_periodo, id_carrera, estado)
                SELECT e.id_estudiante, v_id_periodo_p2, v_id_carrera, 'ACTIVA'
                FROM public.estudiante e
                WHERE e.cedula LIKE '96%'
                  AND NOT EXISTS (
                      SELECT 1 FROM public.matricula m WHERE m.id_estudiante = e.id_estudiante AND m.id_periodo = v_id_periodo_p2
                  );

                -- 8. Inscribir a cada estudiante nuevo en una de las ofertas de 2026-2P (round-robin)
                WITH estudiantes_p2 AS (
                    SELECT m.id_matricula, ROW_NUMBER() OVER (ORDER BY m.id_matricula) AS rn
                    FROM public.matricula m
                    JOIN public.estudiante e ON e.id_estudiante = m.id_estudiante
                    WHERE e.cedula LIKE '96%' AND m.id_periodo = v_id_periodo_p2
                      AND NOT EXISTS (SELECT 1 FROM public.matricula_detalle md WHERE md.id_matricula = m.id_matricula)
                ),
                ofertas_p2 AS (
                    SELECT oa.id_oferta_asignatura, ROW_NUMBER() OVER (ORDER BY oa.id_oferta_asignatura) AS rn, COUNT(*) OVER () AS total
                    FROM public.oferta_asignatura oa
                    WHERE oa.id_periodo_carrera = v_id_periodo_carrera_p2
                )
                INSERT INTO public.matricula_detalle (id_matricula, id_oferta_asignatura, estado)
                SELECT ep.id_matricula, o.id_oferta_asignatura, 'CURSANDO'
                FROM estudiantes_p2 ep
                JOIN ofertas_p2 o ON o.rn = ((ep.rn - 1) % o.total) + 1
                WHERE o.total > 0;

                -- 9. El docente puntual 9800000046 tambien recibe 3 materias, pero del periodo 2026-2P
                --    (sus 5 materias del periodo 2026-1P de la migracion anterior no se tocan)
                SELECT id_docente INTO v_id_docente_46 FROM public.docente WHERE cedula = '9800000046';

                IF v_id_docente_46 IS NULL THEN
                    RAISE EXCEPTION 'No existe el docente con cedula 9800000046.';
                END IF;

                INSERT INTO public.oferta_asignatura (id_periodo_carrera, id_asignatura, id_docente, id_jornada, id_paralelo, cupos, horas_semanales, estado)
                SELECT v_id_periodo_carrera_p2, a.id_asignatura, v_id_docente_46, v_id_jornada, v_id_paralelo, 40, 4, 'ACTIVO'
                FROM public.asignatura a
                WHERE a.codigo IN ('P2-601', 'P2-602', 'P2-603')
                  AND NOT EXISTS (
                      SELECT 1 FROM public.oferta_asignatura oa
                      WHERE oa.id_docente = v_id_docente_46
                        AND oa.id_periodo_carrera = v_id_periodo_carrera_p2
                        AND oa.id_asignatura = a.id_asignatura
                  );

                RAISE NOTICE 'Periodo 2026-2P listo: id_periodo=%, id_periodo_carrera=%', v_id_periodo_p2, v_id_periodo_carrera_p2;

            END $$;
        `);

        // ============================================================
        // BLOQUE 3: UN solo usuario "coordinador puro" (solo rol
        // COORDINADOR, sin rol DOCENTE y sin materias asignadas).
        // NO se toca periodo_carrera.id_coordinador: se deja el que ya
        // este asignado (no se cambia nada de lo existente).
        // Credenciales: correo coordinador.general@yavirac.edu.ec /
        // password 123456 (mismo hash que usan los demas usuarios de prueba).
        // ============================================================
        await queryRunner.query(`
            DO $$
            DECLARE
                v_id_docente_coord bigint;
                v_id_usuario_coord bigint;
                v_id_rol_coordinador bigint;
            BEGIN
                PERFORM setval('public.docente_id_docente_seq', COALESCE((SELECT MAX(id_docente) FROM public.docente), 0));

                -- Docente "cascaron" solo para poder colgar el usuario (requisito de FK),
                -- no dicta materias ni recibe rol DOCENTE.
                INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
                VALUES ('1750000555', 'Coordinador', 'General Prueba', 'coordinador.general@yavirac.edu.ec', '0999000555', 'ACTIVO')
                ON CONFLICT (cedula) DO UPDATE SET
                    nombres = EXCLUDED.nombres,
                    apellidos = EXCLUDED.apellidos,
                    correo = EXCLUDED.correo,
                    telefono = EXCLUDED.telefono,
                    estado = EXCLUDED.estado
                RETURNING id_docente INTO v_id_docente_coord;

                INSERT INTO public.usuario (
                    correo, password_hash, estado, id_docente, debe_cambiar_password, intentos_fallidos, bloqueado
                )
                VALUES (
                    'coordinador.general@yavirac.edu.ec',
                    '$2a$10$qtzW2ox1tH/P7f32NPTs4uNq5GxfYzpEKiUDLj9GOA8C8D3ft0i8q',
                    'ACTIVO',
                    v_id_docente_coord,
                    false,
                    0,
                    false
                )
                ON CONFLICT (correo) DO UPDATE SET
                    password_hash = '$2a$10$qtzW2ox1tH/P7f32NPTs4uNq5GxfYzpEKiUDLj9GOA8C8D3ft0i8q',
                    estado = 'ACTIVO',
                    id_docente = EXCLUDED.id_docente,
                    debe_cambiar_password = false,
                    intentos_fallidos = 0,
                    bloqueado = false
                RETURNING id_usuario INTO v_id_usuario_coord;

                SELECT id_rol INTO v_id_rol_coordinador FROM public.rol WHERE nombre = 'COORDINADOR';

                IF v_id_rol_coordinador IS NULL THEN
                    RAISE EXCEPTION 'No existe el rol COORDINADOR en la tabla rol.';
                END IF;

                -- Solo el rol COORDINADOR (a proposito no se agrega DOCENTE aqui)
                INSERT INTO public.usuario_rol (id_usuario, id_rol)
                VALUES (v_id_usuario_coord, v_id_rol_coordinador)
                ON CONFLICT DO NOTHING;

                RAISE NOTICE 'Usuario coordinador puro listo: id_usuario=%, correo=coordinador.general@yavirac.edu.ec', v_id_usuario_coord;
            END $$;
        `);

        // ============================================================
        // BLOQUE 4: 3 carreras nuevas (Diseno de Modas, Marketing,
        // Gastronomia) repartidas en los dos periodos, cada una con su
        // propio coordinador y docente entre los 3 correos indicados
        // (docente.lote46, docente.lote483, rav.villa). Se matriculan
        // algunos estudiantes de los lotes existentes y se genera la
        // cadena reporte_notas + aceptacion_estudiante con los 3
        // estados (PENDIENTE / ACEPTADO / RECHAZADO) para poder probar
        // la pantalla de aceptacion de notas en varios casos.
        // Desarrollo de Software NO se toca (ya tiene su coordinador y
        // sus 3 docentes desde las migraciones anteriores).
        // ============================================================
        await queryRunner.query(`
            DO $$
            DECLARE
                v_id_docente_46 bigint;
                v_id_docente_483 bigint;
                v_id_docente_ronni bigint;
                v_id_periodo_p1 bigint;
                v_id_periodo_p2 bigint;
                v_id_jornada bigint;
                v_id_paralelo bigint;

                v_id_carrera_moda bigint;
                v_id_carrera_mkt bigint;
                v_id_carrera_gastro bigint;

                v_id_nivel_moda bigint;
                v_id_nivel_mkt bigint;
                v_id_nivel_gastro bigint;

                v_id_pc_moda bigint;
                v_id_pc_mkt bigint;
                v_id_pc_gastro bigint;

                v_id_asig_moda bigint;
                v_id_asig_mkt bigint;
                v_id_asig_gastro bigint;

                v_id_oferta_moda bigint;
                v_id_oferta_mkt bigint;
                v_id_oferta_gastro bigint;

                v_id_reporte_moda bigint;
                v_id_reporte_mkt bigint;
                v_id_reporte_gastro bigint;
            BEGIN
                -- Resincronizar todas las secuencias que toca este bloque
                PERFORM setval('public.carrera_id_carrera_seq', COALESCE((SELECT MAX(id_carrera) FROM public.carrera), 0));
                PERFORM setval('public.nivel_id_nivel_seq', COALESCE((SELECT MAX(id_nivel) FROM public.nivel), 0));
                PERFORM setval('public.asignatura_id_asignatura_seq', COALESCE((SELECT MAX(id_asignatura) FROM public.asignatura), 0));
                PERFORM setval('public.periodo_carrera_id_periodo_carrera_seq', COALESCE((SELECT MAX(id_periodo_carrera) FROM public.periodo_carrera), 0));
                PERFORM setval('public.oferta_asignatura_id_oferta_asignatura_seq', COALESCE((SELECT MAX(id_oferta_asignatura) FROM public.oferta_asignatura), 0));
                PERFORM setval('public.matricula_id_matricula_seq', COALESCE((SELECT MAX(id_matricula) FROM public.matricula), 0));
                PERFORM setval('public.matricula_detalle_id_matricula_detalle_seq', COALESCE((SELECT MAX(id_matricula_detalle) FROM public.matricula_detalle), 0));
                PERFORM setval('public.portafolio_reporte_notas_id_reporte_notas_seq', COALESCE((SELECT MAX(id_reporte_notas) FROM public.portafolio_reporte_notas), 0));
                PERFORM setval('public.portafolio_aceptacion_estudiante_id_aceptacion_seq', COALESCE((SELECT MAX(id_aceptacion) FROM public.portafolio_aceptacion_estudiante), 0));

                -- Los 3 docentes indicados (deben existir de migraciones previas)
                SELECT id_docente INTO v_id_docente_46 FROM public.docente WHERE cedula = '9800000046';
                SELECT id_docente INTO v_id_docente_483 FROM public.docente WHERE cedula = '9800000483';
                SELECT id_docente INTO v_id_docente_ronni FROM public.docente WHERE cedula = '1750000199';

                IF v_id_docente_46 IS NULL OR v_id_docente_483 IS NULL OR v_id_docente_ronni IS NULL THEN
                    RAISE EXCEPTION 'Faltan docentes base (9800000046 / 9800000483 / 1750000199). Corre primero el seed masivo y la migracion de Ronni Villa.';
                END IF;

                -- Los 2 periodos ya creados (2026-1P del seed base, 2026-2P del BLOQUE 2)
                SELECT id_periodo INTO v_id_periodo_p1 FROM public.periodo_academico WHERE codigo = '2026-1P';
                SELECT id_periodo INTO v_id_periodo_p2 FROM public.periodo_academico WHERE codigo = '2026-2P';

                IF v_id_periodo_p1 IS NULL OR v_id_periodo_p2 IS NULL THEN
                    RAISE EXCEPTION 'Faltan los periodos 2026-1P/2026-2P. Corre primero el seed base y el BLOQUE 2 de esta migracion.';
                END IF;

                SELECT id_jornada INTO v_id_jornada FROM public.jornada ORDER BY id_jornada LIMIT 1;
                SELECT id_paralelo INTO v_id_paralelo FROM public.paralelo ORDER BY id_paralelo LIMIT 1;

                IF v_id_jornada IS NULL OR v_id_paralelo IS NULL THEN
                    RAISE EXCEPTION 'Faltan datos base (jornada/paralelo).';
                END IF;

                -- 1. Crear las 3 carreras nuevas
                INSERT INTO public.carrera (codigo, nombre, modalidad, estado)
                VALUES ('MODA-01', 'Diseno de Modas', 'PRESENCIAL', 'ACTIVO')
                ON CONFLICT (codigo) DO NOTHING;
                SELECT id_carrera INTO v_id_carrera_moda FROM public.carrera WHERE codigo = 'MODA-01';

                INSERT INTO public.carrera (codigo, nombre, modalidad, estado)
                VALUES ('MKT-01', 'Marketing', 'PRESENCIAL', 'ACTIVO')
                ON CONFLICT (codigo) DO NOTHING;
                SELECT id_carrera INTO v_id_carrera_mkt FROM public.carrera WHERE codigo = 'MKT-01';

                INSERT INTO public.carrera (codigo, nombre, modalidad, estado)
                VALUES ('GASTRO-01', 'Gastronomia', 'PRESENCIAL', 'ACTIVO')
                ON CONFLICT (codigo) DO NOTHING;
                SELECT id_carrera INTO v_id_carrera_gastro FROM public.carrera WHERE codigo = 'GASTRO-01';

                -- 2. Un nivel por carrera nueva
                INSERT INTO public.nivel (id_carrera, nombre, estado)
                VALUES (v_id_carrera_moda, 'Primer Nivel', 'ACTIVO')
                ON CONFLICT ON CONSTRAINT uk_nivel_carrera DO NOTHING;
                SELECT id_nivel INTO v_id_nivel_moda FROM public.nivel WHERE id_carrera = v_id_carrera_moda AND nombre = 'Primer Nivel';

                INSERT INTO public.nivel (id_carrera, nombre, estado)
                VALUES (v_id_carrera_mkt, 'Primer Nivel', 'ACTIVO')
                ON CONFLICT ON CONSTRAINT uk_nivel_carrera DO NOTHING;
                SELECT id_nivel INTO v_id_nivel_mkt FROM public.nivel WHERE id_carrera = v_id_carrera_mkt AND nombre = 'Primer Nivel';

                INSERT INTO public.nivel (id_carrera, nombre, estado)
                VALUES (v_id_carrera_gastro, 'Primer Nivel', 'ACTIVO')
                ON CONFLICT ON CONSTRAINT uk_nivel_carrera DO NOTHING;
                SELECT id_nivel INTO v_id_nivel_gastro FROM public.nivel WHERE id_carrera = v_id_carrera_gastro AND nombre = 'Primer Nivel';

                -- 3. periodo_carrera por carrera nueva, repartidas entre los 2 periodos,
                --    con su coordinador respectivo (uno de los 3 docentes indicados)
                INSERT INTO public.periodo_carrera (id_periodo, id_carrera, fecha_inicio, fecha_fin, estado)
                SELECT v_id_periodo_p1, v_id_carrera_moda, '2026-04-01', '2026-08-30', 'ACTIVO'
                WHERE NOT EXISTS (SELECT 1 FROM public.periodo_carrera WHERE id_periodo = v_id_periodo_p1 AND id_carrera = v_id_carrera_moda);
                SELECT id_periodo_carrera INTO v_id_pc_moda FROM public.periodo_carrera WHERE id_periodo = v_id_periodo_p1 AND id_carrera = v_id_carrera_moda;
                UPDATE public.periodo_carrera SET id_coordinador = v_id_docente_46 WHERE id_periodo_carrera = v_id_pc_moda AND id_coordinador IS NULL;

                INSERT INTO public.periodo_carrera (id_periodo, id_carrera, fecha_inicio, fecha_fin, estado)
                SELECT v_id_periodo_p2, v_id_carrera_mkt, '2026-09-01', '2027-01-30', 'ACTIVO'
                WHERE NOT EXISTS (SELECT 1 FROM public.periodo_carrera WHERE id_periodo = v_id_periodo_p2 AND id_carrera = v_id_carrera_mkt);
                SELECT id_periodo_carrera INTO v_id_pc_mkt FROM public.periodo_carrera WHERE id_periodo = v_id_periodo_p2 AND id_carrera = v_id_carrera_mkt;
                UPDATE public.periodo_carrera SET id_coordinador = v_id_docente_483 WHERE id_periodo_carrera = v_id_pc_mkt AND id_coordinador IS NULL;

                INSERT INTO public.periodo_carrera (id_periodo, id_carrera, fecha_inicio, fecha_fin, estado)
                SELECT v_id_periodo_p1, v_id_carrera_gastro, '2026-04-01', '2026-08-30', 'ACTIVO'
                WHERE NOT EXISTS (SELECT 1 FROM public.periodo_carrera WHERE id_periodo = v_id_periodo_p1 AND id_carrera = v_id_carrera_gastro);
                SELECT id_periodo_carrera INTO v_id_pc_gastro FROM public.periodo_carrera WHERE id_periodo = v_id_periodo_p1 AND id_carrera = v_id_carrera_gastro;
                UPDATE public.periodo_carrera SET id_coordinador = v_id_docente_ronni WHERE id_periodo_carrera = v_id_pc_gastro AND id_coordinador IS NULL;

                -- 4. Una materia por carrera nueva
                INSERT INTO public.asignatura (id_nivel, codigo, nombre, horas, creditos, estado)
                SELECT v_id_nivel_moda, 'MODA-101', 'Diseno de Prendas I', 60, 4, 'ACTIVO'
                WHERE NOT EXISTS (SELECT 1 FROM public.asignatura WHERE codigo = 'MODA-101');
                SELECT id_asignatura INTO v_id_asig_moda FROM public.asignatura WHERE codigo = 'MODA-101';

                INSERT INTO public.asignatura (id_nivel, codigo, nombre, horas, creditos, estado)
                SELECT v_id_nivel_mkt, 'MKT-101', 'Fundamentos de Marketing', 60, 4, 'ACTIVO'
                WHERE NOT EXISTS (SELECT 1 FROM public.asignatura WHERE codigo = 'MKT-101');
                SELECT id_asignatura INTO v_id_asig_mkt FROM public.asignatura WHERE codigo = 'MKT-101';

                INSERT INTO public.asignatura (id_nivel, codigo, nombre, horas, creditos, estado)
                SELECT v_id_nivel_gastro, 'GASTRO-101', 'Tecnicas Culinarias I', 60, 4, 'ACTIVO'
                WHERE NOT EXISTS (SELECT 1 FROM public.asignatura WHERE codigo = 'GASTRO-101');
                SELECT id_asignatura INTO v_id_asig_gastro FROM public.asignatura WHERE codigo = 'GASTRO-101';

                -- 5. oferta_asignatura: cada carrera la dicta su propio docente/coordinador
                INSERT INTO public.oferta_asignatura (id_periodo_carrera, id_asignatura, id_docente, id_jornada, id_paralelo, cupos, horas_semanales, estado)
                SELECT v_id_pc_moda, v_id_asig_moda, v_id_docente_46, v_id_jornada, v_id_paralelo, 30, 4, 'ACTIVO'
                WHERE NOT EXISTS (SELECT 1 FROM public.oferta_asignatura WHERE id_periodo_carrera = v_id_pc_moda AND id_asignatura = v_id_asig_moda AND id_docente = v_id_docente_46);
                SELECT id_oferta_asignatura INTO v_id_oferta_moda FROM public.oferta_asignatura WHERE id_periodo_carrera = v_id_pc_moda AND id_asignatura = v_id_asig_moda AND id_docente = v_id_docente_46;

                INSERT INTO public.oferta_asignatura (id_periodo_carrera, id_asignatura, id_docente, id_jornada, id_paralelo, cupos, horas_semanales, estado)
                SELECT v_id_pc_mkt, v_id_asig_mkt, v_id_docente_483, v_id_jornada, v_id_paralelo, 30, 4, 'ACTIVO'
                WHERE NOT EXISTS (SELECT 1 FROM public.oferta_asignatura WHERE id_periodo_carrera = v_id_pc_mkt AND id_asignatura = v_id_asig_mkt AND id_docente = v_id_docente_483);
                SELECT id_oferta_asignatura INTO v_id_oferta_mkt FROM public.oferta_asignatura WHERE id_periodo_carrera = v_id_pc_mkt AND id_asignatura = v_id_asig_mkt AND id_docente = v_id_docente_483;

                INSERT INTO public.oferta_asignatura (id_periodo_carrera, id_asignatura, id_docente, id_jornada, id_paralelo, cupos, horas_semanales, estado)
                SELECT v_id_pc_gastro, v_id_asig_gastro, v_id_docente_ronni, v_id_jornada, v_id_paralelo, 30, 4, 'ACTIVO'
                WHERE NOT EXISTS (SELECT 1 FROM public.oferta_asignatura WHERE id_periodo_carrera = v_id_pc_gastro AND id_asignatura = v_id_asig_gastro AND id_docente = v_id_docente_ronni);
                SELECT id_oferta_asignatura INTO v_id_oferta_gastro FROM public.oferta_asignatura WHERE id_periodo_carrera = v_id_pc_gastro AND id_asignatura = v_id_asig_gastro AND id_docente = v_id_docente_ronni;

                -- 6. Matricular 3 estudiantes del lote de 2026-1P en Modas (los primeros 3 disponibles)
                --    y matricula_detalle + reporte + aceptacion con los 3 estados distintos
                INSERT INTO public.matricula (id_estudiante, id_periodo, id_carrera, estado)
                SELECT e.id_estudiante, v_id_periodo_p1, v_id_carrera_moda, 'ACTIVA'
                FROM (SELECT id_estudiante FROM public.estudiante WHERE cedula LIKE '97%' ORDER BY id_estudiante LIMIT 3 OFFSET 0) e
                WHERE NOT EXISTS (SELECT 1 FROM public.matricula m WHERE m.id_estudiante = e.id_estudiante AND m.id_periodo = v_id_periodo_p1 AND m.id_carrera = v_id_carrera_moda);

                INSERT INTO public.matricula_detalle (id_matricula, id_oferta_asignatura, nota_ap1, estado)
                SELECT m.id_matricula, v_id_oferta_moda, 8.5, 'CURSANDO'
                FROM public.matricula m
                JOIN public.estudiante e ON e.id_estudiante = m.id_estudiante
                WHERE m.id_carrera = v_id_carrera_moda AND m.id_periodo = v_id_periodo_p1 AND e.cedula LIKE '97%'
                  AND NOT EXISTS (SELECT 1 FROM public.matricula_detalle md WHERE md.id_matricula = m.id_matricula AND md.id_oferta_asignatura = v_id_oferta_moda);

                INSERT INTO public.portafolio_reporte_notas (id_periodo, id_oferta_asignatura, tipo_reporte, estado)
                SELECT v_id_periodo_p1, v_id_oferta_moda, 'APORTE_1', 'GENERADO'
                WHERE NOT EXISTS (SELECT 1 FROM public.portafolio_reporte_notas WHERE id_oferta_asignatura = v_id_oferta_moda AND tipo_reporte = 'APORTE_1');
                SELECT id_reporte_notas INTO v_id_reporte_moda FROM public.portafolio_reporte_notas WHERE id_oferta_asignatura = v_id_oferta_moda AND tipo_reporte = 'APORTE_1';

                WITH detalles_moda AS (
                    SELECT md.id_matricula_detalle, ROW_NUMBER() OVER (ORDER BY md.id_matricula_detalle) AS rn
                    FROM public.matricula_detalle md
                    WHERE md.id_oferta_asignatura = v_id_oferta_moda
                )
                INSERT INTO public.portafolio_aceptacion_estudiante (id_reporte_notas, id_matricula_detalle, nota_registrada, estado_aceptacion)
                SELECT v_id_reporte_moda, dm.id_matricula_detalle, 8.5,
                       (ARRAY['PENDIENTE', 'ACEPTADO', 'RECHAZADO'])[((dm.rn - 1) % 3) + 1]
                FROM detalles_moda dm
                WHERE NOT EXISTS (
                    SELECT 1 FROM public.portafolio_aceptacion_estudiante pae
                    WHERE pae.id_reporte_notas = v_id_reporte_moda AND pae.id_matricula_detalle = dm.id_matricula_detalle
                );

                -- 7. Matricular otros 3 estudiantes del lote de 2026-1P en Gastronomia (los siguientes 3)
                INSERT INTO public.matricula (id_estudiante, id_periodo, id_carrera, estado)
                SELECT e.id_estudiante, v_id_periodo_p1, v_id_carrera_gastro, 'ACTIVA'
                FROM (SELECT id_estudiante FROM public.estudiante WHERE cedula LIKE '97%' ORDER BY id_estudiante LIMIT 3 OFFSET 3) e
                WHERE NOT EXISTS (SELECT 1 FROM public.matricula m WHERE m.id_estudiante = e.id_estudiante AND m.id_periodo = v_id_periodo_p1 AND m.id_carrera = v_id_carrera_gastro);

                INSERT INTO public.matricula_detalle (id_matricula, id_oferta_asignatura, nota_ap1, estado)
                SELECT m.id_matricula, v_id_oferta_gastro, 7.8, 'CURSANDO'
                FROM public.matricula m
                JOIN public.estudiante e ON e.id_estudiante = m.id_estudiante
                WHERE m.id_carrera = v_id_carrera_gastro AND m.id_periodo = v_id_periodo_p1 AND e.cedula LIKE '97%'
                  AND NOT EXISTS (SELECT 1 FROM public.matricula_detalle md WHERE md.id_matricula = m.id_matricula AND md.id_oferta_asignatura = v_id_oferta_gastro);

                INSERT INTO public.portafolio_reporte_notas (id_periodo, id_oferta_asignatura, tipo_reporte, estado)
                SELECT v_id_periodo_p1, v_id_oferta_gastro, 'APORTE_1', 'GENERADO'
                WHERE NOT EXISTS (SELECT 1 FROM public.portafolio_reporte_notas WHERE id_oferta_asignatura = v_id_oferta_gastro AND tipo_reporte = 'APORTE_1');
                SELECT id_reporte_notas INTO v_id_reporte_gastro FROM public.portafolio_reporte_notas WHERE id_oferta_asignatura = v_id_oferta_gastro AND tipo_reporte = 'APORTE_1';

                WITH detalles_gastro AS (
                    SELECT md.id_matricula_detalle, ROW_NUMBER() OVER (ORDER BY md.id_matricula_detalle) AS rn
                    FROM public.matricula_detalle md
                    WHERE md.id_oferta_asignatura = v_id_oferta_gastro
                )
                INSERT INTO public.portafolio_aceptacion_estudiante (id_reporte_notas, id_matricula_detalle, nota_registrada, estado_aceptacion)
                SELECT v_id_reporte_gastro, dg.id_matricula_detalle, 7.8,
                       (ARRAY['ACEPTADO', 'RECHAZADO', 'PENDIENTE'])[((dg.rn - 1) % 3) + 1]
                FROM detalles_gastro dg
                WHERE NOT EXISTS (
                    SELECT 1 FROM public.portafolio_aceptacion_estudiante pae
                    WHERE pae.id_reporte_notas = v_id_reporte_gastro AND pae.id_matricula_detalle = dg.id_matricula_detalle
                );

                -- 8. Matricular 3 estudiantes del lote de 2026-2P en Marketing
                INSERT INTO public.matricula (id_estudiante, id_periodo, id_carrera, estado)
                SELECT e.id_estudiante, v_id_periodo_p2, v_id_carrera_mkt, 'ACTIVA'
                FROM (SELECT id_estudiante FROM public.estudiante WHERE cedula LIKE '96%' ORDER BY id_estudiante LIMIT 3 OFFSET 0) e
                WHERE NOT EXISTS (SELECT 1 FROM public.matricula m WHERE m.id_estudiante = e.id_estudiante AND m.id_periodo = v_id_periodo_p2 AND m.id_carrera = v_id_carrera_mkt);

                INSERT INTO public.matricula_detalle (id_matricula, id_oferta_asignatura, nota_ap1, estado)
                SELECT m.id_matricula, v_id_oferta_mkt, 9.2, 'CURSANDO'
                FROM public.matricula m
                JOIN public.estudiante e ON e.id_estudiante = m.id_estudiante
                WHERE m.id_carrera = v_id_carrera_mkt AND m.id_periodo = v_id_periodo_p2 AND e.cedula LIKE '96%'
                  AND NOT EXISTS (SELECT 1 FROM public.matricula_detalle md WHERE md.id_matricula = m.id_matricula AND md.id_oferta_asignatura = v_id_oferta_mkt);

                INSERT INTO public.portafolio_reporte_notas (id_periodo, id_oferta_asignatura, tipo_reporte, estado)
                SELECT v_id_periodo_p2, v_id_oferta_mkt, 'APORTE_1', 'GENERADO'
                WHERE NOT EXISTS (SELECT 1 FROM public.portafolio_reporte_notas WHERE id_oferta_asignatura = v_id_oferta_mkt AND tipo_reporte = 'APORTE_1');
                SELECT id_reporte_notas INTO v_id_reporte_mkt FROM public.portafolio_reporte_notas WHERE id_oferta_asignatura = v_id_oferta_mkt AND tipo_reporte = 'APORTE_1';

                WITH detalles_mkt AS (
                    SELECT md.id_matricula_detalle, ROW_NUMBER() OVER (ORDER BY md.id_matricula_detalle) AS rn
                    FROM public.matricula_detalle md
                    WHERE md.id_oferta_asignatura = v_id_oferta_mkt
                )
                INSERT INTO public.portafolio_aceptacion_estudiante (id_reporte_notas, id_matricula_detalle, nota_registrada, estado_aceptacion)
                SELECT v_id_reporte_mkt, dk.id_matricula_detalle, 9.2,
                       (ARRAY['RECHAZADO', 'PENDIENTE', 'ACEPTADO'])[((dk.rn - 1) % 3) + 1]
                FROM detalles_mkt dk
                WHERE NOT EXISTS (
                    SELECT 1 FROM public.portafolio_aceptacion_estudiante pae
                    WHERE pae.id_reporte_notas = v_id_reporte_mkt AND pae.id_matricula_detalle = dk.id_matricula_detalle
                );

                RAISE NOTICE 'BLOQUE 4 listo: Modas pc=%, Marketing pc=%, Gastronomia pc=%', v_id_pc_moda, v_id_pc_mkt, v_id_pc_gastro;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revertir BLOQUE 4 (3 carreras nuevas y su cadena de aceptacion de notas)
        await queryRunner.query(`
            DO $$
            DECLARE
                v_id_carrera_moda bigint;
                v_id_carrera_mkt bigint;
                v_id_carrera_gastro bigint;
            BEGIN
                SELECT id_carrera INTO v_id_carrera_moda FROM public.carrera WHERE codigo = 'MODA-01';
                SELECT id_carrera INTO v_id_carrera_mkt FROM public.carrera WHERE codigo = 'MKT-01';
                SELECT id_carrera INTO v_id_carrera_gastro FROM public.carrera WHERE codigo = 'GASTRO-01';

                DELETE FROM public.portafolio_aceptacion_estudiante
                WHERE id_reporte_notas IN (
                    SELECT prn.id_reporte_notas FROM public.portafolio_reporte_notas prn
                    JOIN public.oferta_asignatura oa ON oa.id_oferta_asignatura = prn.id_oferta_asignatura
                    JOIN public.periodo_carrera pc ON pc.id_periodo_carrera = oa.id_periodo_carrera
                    WHERE pc.id_carrera IN (v_id_carrera_moda, v_id_carrera_mkt, v_id_carrera_gastro)
                );

                DELETE FROM public.portafolio_reporte_notas
                WHERE id_oferta_asignatura IN (
                    SELECT oa.id_oferta_asignatura FROM public.oferta_asignatura oa
                    JOIN public.periodo_carrera pc ON pc.id_periodo_carrera = oa.id_periodo_carrera
                    WHERE pc.id_carrera IN (v_id_carrera_moda, v_id_carrera_mkt, v_id_carrera_gastro)
                );

                DELETE FROM public.matricula_detalle
                WHERE id_matricula IN (
                    SELECT id_matricula FROM public.matricula
                    WHERE id_carrera IN (v_id_carrera_moda, v_id_carrera_mkt, v_id_carrera_gastro)
                );

                DELETE FROM public.matricula
                WHERE id_carrera IN (v_id_carrera_moda, v_id_carrera_mkt, v_id_carrera_gastro);

                DELETE FROM public.oferta_asignatura
                WHERE id_periodo_carrera IN (
                    SELECT id_periodo_carrera FROM public.periodo_carrera
                    WHERE id_carrera IN (v_id_carrera_moda, v_id_carrera_mkt, v_id_carrera_gastro)
                );

                DELETE FROM public.asignatura WHERE codigo IN ('MODA-101', 'MKT-101', 'GASTRO-101');

                DELETE FROM public.periodo_carrera
                WHERE id_carrera IN (v_id_carrera_moda, v_id_carrera_mkt, v_id_carrera_gastro);

                DELETE FROM public.nivel WHERE id_carrera IN (v_id_carrera_moda, v_id_carrera_mkt, v_id_carrera_gastro);

                DELETE FROM public.carrera WHERE codigo IN ('MODA-01', 'MKT-01', 'GASTRO-01');
            END $$;
        `);

        // Revertir BLOQUE 3 (usuario coordinador puro)
        await queryRunner.query(`
            DO $$
            DECLARE
                v_id_usuario_coord bigint;
            BEGIN
                SELECT id_usuario INTO v_id_usuario_coord FROM public.usuario WHERE correo = 'coordinador.general@yavirac.edu.ec';

                IF v_id_usuario_coord IS NOT NULL THEN
                    DELETE FROM public.usuario_rol WHERE id_usuario = v_id_usuario_coord;
                    DELETE FROM public.usuario WHERE id_usuario = v_id_usuario_coord;
                END IF;

                DELETE FROM public.docente WHERE cedula = '1750000555';
            END $$;
        `);

        // Revertir BLOQUE 2 (2026-2P completo)
        await queryRunner.query(`
            DO $$
            DECLARE
                v_id_periodo_p2 bigint;
                v_id_periodo_carrera_p2 bigint;
                v_id_docente_46 bigint;
            BEGIN
                SELECT id_periodo INTO v_id_periodo_p2 FROM public.periodo_academico WHERE codigo = '2026-2P';
                SELECT id_docente INTO v_id_docente_46 FROM public.docente WHERE cedula = '9800000046';

                IF v_id_periodo_p2 IS NOT NULL THEN
                    SELECT id_periodo_carrera INTO v_id_periodo_carrera_p2
                    FROM public.periodo_carrera WHERE id_periodo = v_id_periodo_p2 LIMIT 1;
                END IF;

                -- Quita las 3 materias que se le dieron a docente 46 en 2026-2P
                -- (sus materias de 2026-1P quedan intactas)
                IF v_id_docente_46 IS NOT NULL AND v_id_periodo_carrera_p2 IS NOT NULL THEN
                    DELETE FROM public.oferta_asignatura
                    WHERE id_docente = v_id_docente_46 AND id_periodo_carrera = v_id_periodo_carrera_p2;
                END IF;

                IF v_id_periodo_carrera_p2 IS NOT NULL THEN
                    DELETE FROM public.matricula_detalle
                    WHERE id_matricula IN (
                        SELECT m.id_matricula FROM public.matricula m
                        JOIN public.estudiante e ON e.id_estudiante = m.id_estudiante
                        WHERE e.cedula LIKE '96%' AND m.id_periodo = v_id_periodo_p2
                    );

                    DELETE FROM public.oferta_asignatura
                    WHERE id_periodo_carrera = v_id_periodo_carrera_p2
                      AND id_docente IN (SELECT id_docente FROM public.docente WHERE cedula LIKE '95%');
                END IF;

                IF v_id_periodo_p2 IS NOT NULL THEN
                    DELETE FROM public.matricula
                    WHERE id_periodo = v_id_periodo_p2
                      AND id_estudiante IN (SELECT id_estudiante FROM public.estudiante WHERE cedula LIKE '96%');
                END IF;

                DELETE FROM public.estudiante WHERE cedula LIKE '96%';
                DELETE FROM public.docente WHERE cedula LIKE '95%';

                DELETE FROM public.asignatura a
                WHERE a.codigo IN ('P2-601', 'P2-602', 'P2-603')
                  AND NOT EXISTS (SELECT 1 FROM public.oferta_asignatura oa WHERE oa.id_asignatura = a.id_asignatura);

                IF v_id_periodo_carrera_p2 IS NOT NULL THEN
                    DELETE FROM public.periodo_carrera WHERE id_periodo_carrera = v_id_periodo_carrera_p2;
                END IF;

                IF v_id_periodo_p2 IS NOT NULL THEN
                    DELETE FROM public.periodo_academico WHERE id_periodo = v_id_periodo_p2;
                END IF;
            END $$;
        `);

        // Revertir BLOQUE 1 (las 5 materias de 2026-1P para el docente 9800000046)
        await queryRunner.query(`
            DO $$
            DECLARE
                v_id_docente bigint;
            BEGIN
                SELECT id_docente INTO v_id_docente FROM public.docente WHERE cedula = '9800000046';

                IF v_id_docente IS NOT NULL THEN
                    -- Solo quita las materias extra que agrego esta migracion (deja PPP-501 si ya la tenia antes)
                    DELETE FROM public.oferta_asignatura
                    WHERE id_docente = v_id_docente
                      AND id_asignatura IN (
                          SELECT id_asignatura FROM public.asignatura
                          WHERE codigo IN ('LOTE-502', 'LOTE-503', 'LOTE-504', 'LOTE-505')
                      );
                END IF;

                -- Elimina las asignaturas de prueba solo si ya no las usa ningun otro docente
                DELETE FROM public.asignatura a
                WHERE a.codigo IN ('LOTE-502', 'LOTE-503', 'LOTE-504', 'LOTE-505')
                  AND NOT EXISTS (
                      SELECT 1 FROM public.oferta_asignatura oa WHERE oa.id_asignatura = a.id_asignatura
                  );
            END $$;
        `);
    }
}
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateVinculacionDatosPrueba1787000000001 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            DECLARE
                v_id_periodo bigint;
                v_id_carrera bigint;
                v_id_docente46 bigint;
                v_id_docente483 bigint;
                v_id_estudiante1 bigint;
                v_id_estudiante28 bigint;
                v_id_empresa25 bigint;
                v_id_empresa28 bigint;
                v_id_entidad_receptora bigint;
                v_id_matricula_detalle1 bigint;
                v_id_matricula_detalle28 bigint;
                v_id_vinculacion1 bigint;
                v_id_vinculacion28 bigint;
                v_id_rubrica bigint;
            BEGIN
                -- PERIODO ACTIVO
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

                IF v_id_periodo IS NULL THEN
                    SELECT id_periodo INTO v_id_periodo FROM public.periodo_academico LIMIT 1;
                END IF;

                -- CARRERA BASE
                SELECT id_carrera INTO v_id_carrera FROM public.carrera ORDER BY id_carrera LIMIT 1;

                -- DOCENTES (YA EXISTEN)
                SELECT id_docente INTO v_id_docente46 FROM public.docente WHERE cedula = '9800000046';
                SELECT id_docente INTO v_id_docente483 FROM public.docente WHERE cedula = '9800000483';

                -- ESTUDIANTES (YA EXISTEN)
                SELECT id_estudiante INTO v_id_estudiante1 FROM public.estudiante WHERE cedula = '9700000001';
                SELECT id_estudiante INTO v_id_estudiante28 FROM public.estudiante WHERE cedula = '9700000028';

                -- EMPRESAS (YA EXISTEN)
                SELECT id_empresa INTO v_id_empresa25 FROM public.empresa WHERE ruc = '9900000000025';
                SELECT id_empresa INTO v_id_empresa28 FROM public.empresa WHERE ruc = '9900000000028';

                -- ENTIDAD RECEPTORA
                INSERT INTO public.vinculacion_entidad_receptora (nombre_entidad, direccion, telefono, correo, tutor_entidad_receptora)
                VALUES ('Fundación Yavirac Social', 'Av. Amazonas N37-45', '022500999', 'fundacion@yavirac.edu.ec', 'Lic. María Sánchez')
                ON CONFLICT DO NOTHING;

                SELECT id_entidad INTO v_id_entidad_receptora
                FROM public.vinculacion_entidad_receptora
                WHERE nombre_entidad = 'Fundación Yavirac Social';

                -- MATRÍCULA DETALLE ESTUDIANTE 1
                SELECT md.id_matricula_detalle INTO v_id_matricula_detalle1
                FROM public.matricula_detalle md
                JOIN public.matricula m ON m.id_matricula = md.id_matricula
                WHERE m.id_estudiante = v_id_estudiante1 AND m.id_periodo = v_id_periodo
                LIMIT 1;

                -- MATRÍCULA DETALLE ESTUDIANTE 28
                SELECT md.id_matricula_detalle INTO v_id_matricula_detalle28
                FROM public.matricula_detalle md
                JOIN public.matricula m ON m.id_matricula = md.id_matricula
                WHERE m.id_estudiante = v_id_estudiante28 AND m.id_periodo = v_id_periodo
                LIMIT 1;

                -- CREAR MATRÍCULA SI NO EXISTE (ESTUDIANTE 1)
                IF v_id_matricula_detalle1 IS NULL THEN
                    INSERT INTO public.matricula (id_estudiante, id_periodo, id_carrera, estado)
                    VALUES (v_id_estudiante1, v_id_periodo, v_id_carrera, 'ACTIVA')
                    ON CONFLICT DO NOTHING;

                    INSERT INTO public.oferta_asignatura (id_periodo_carrera, id_asignatura, id_docente, id_jornada, id_paralelo, cupos, horas_semanales, estado)
                    SELECT pc.id_periodo_carrera, a.id_asignatura, v_id_docente46, j.id_jornada, p.id_paralelo, 30, 4, 'ACTIVO'
                    FROM public.periodo_carrera pc
                    CROSS JOIN public.asignatura a
                    CROSS JOIN public.jornada j
                    CROSS JOIN public.paralelo p
                    WHERE pc.id_periodo = v_id_periodo
                    LIMIT 1
                    ON CONFLICT DO NOTHING;

                    INSERT INTO public.matricula_detalle (id_matricula, id_oferta_asignatura, estado)
                    SELECT m.id_matricula, oa.id_oferta_asignatura, 'CURSANDO'
                    FROM public.matricula m
                    CROSS JOIN public.oferta_asignatura oa
                    WHERE m.id_estudiante = v_id_estudiante1 AND m.id_periodo = v_id_periodo
                    LIMIT 1
                    ON CONFLICT DO NOTHING;

                    SELECT md.id_matricula_detalle INTO v_id_matricula_detalle1
                    FROM public.matricula_detalle md
                    JOIN public.matricula m ON m.id_matricula = md.id_matricula
                    WHERE m.id_estudiante = v_id_estudiante1 AND m.id_periodo = v_id_periodo
                    LIMIT 1;
                END IF;

                -- CREAR MATRÍCULA SI NO EXISTE (ESTUDIANTE 28)
                IF v_id_matricula_detalle28 IS NULL THEN
                    INSERT INTO public.matricula (id_estudiante, id_periodo, id_carrera, estado)
                    VALUES (v_id_estudiante28, v_id_periodo, v_id_carrera, 'ACTIVA')
                    ON CONFLICT DO NOTHING;

                    INSERT INTO public.oferta_asignatura (id_periodo_carrera, id_asignatura, id_docente, id_jornada, id_paralelo, cupos, horas_semanales, estado)
                    SELECT pc.id_periodo_carrera, a.id_asignatura, v_id_docente483, j.id_jornada, p.id_paralelo, 30, 4, 'ACTIVO'
                    FROM public.periodo_carrera pc
                    CROSS JOIN public.asignatura a
                    CROSS JOIN public.jornada j
                    CROSS JOIN public.paralelo p
                    WHERE pc.id_periodo = v_id_periodo
                    LIMIT 1
                    ON CONFLICT DO NOTHING;

                    INSERT INTO public.matricula_detalle (id_matricula, id_oferta_asignatura, estado)
                    SELECT m.id_matricula, oa.id_oferta_asignatura, 'CURSANDO'
                    FROM public.matricula m
                    CROSS JOIN public.oferta_asignatura oa
                    WHERE m.id_estudiante = v_id_estudiante28 AND m.id_periodo = v_id_periodo
                    LIMIT 1
                    ON CONFLICT DO NOTHING;

                    SELECT md.id_matricula_detalle INTO v_id_matricula_detalle28
                    FROM public.matricula_detalle md
                    JOIN public.matricula m ON m.id_matricula = md.id_matricula
                    WHERE m.id_estudiante = v_id_estudiante28 AND m.id_periodo = v_id_periodo
                    LIMIT 1;
                END IF;

                -- RÚBRICA
                SELECT id_rubrica INTO v_id_rubrica FROM public.catalogo_rubrica LIMIT 1;
                IF v_id_rubrica IS NULL THEN
                    INSERT INTO public.catalogo_rubrica (nombre, tipo, estado)
                    VALUES ('Rúbrica Vinculación', 'VINCULACION', 'ACTIVO')
                    RETURNING id_rubrica INTO v_id_rubrica;
                END IF;

                -- VINCULACIÓN ESTUDIANTE 1
                INSERT INTO public.vinculacion_estudiante (
                    id_periodo, id_matricula_detalle, id_empresa, id_docente, id_entidad_receptora,
                    nombre_proyecto, fecha_inicio, fecha_fin, total_horas_estudiante, total_horas_docente, estado
                ) VALUES (
                    v_id_periodo, v_id_matricula_detalle1, v_id_empresa25, v_id_docente46, v_id_entidad_receptora,
                    'Proyecto de Vinculación - Estudiante 1',
                    CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days', 120, 40, 'EN_CURSO'
                ) ON CONFLICT (id_matricula_detalle) DO UPDATE SET
                    id_periodo = EXCLUDED.id_periodo,
                    id_empresa = EXCLUDED.id_empresa,
                    id_docente = EXCLUDED.id_docente,
                    id_entidad_receptora = EXCLUDED.id_entidad_receptora,
                    nombre_proyecto = EXCLUDED.nombre_proyecto,
                    fecha_inicio = EXCLUDED.fecha_inicio,
                    fecha_fin = EXCLUDED.fecha_fin,
                    estado = EXCLUDED.estado
                RETURNING id_vinculacion INTO v_id_vinculacion1;

                -- VINCULACIÓN ESTUDIANTE 28
                INSERT INTO public.vinculacion_estudiante (
                    id_periodo, id_matricula_detalle, id_empresa, id_docente, id_entidad_receptora,
                    nombre_proyecto, fecha_inicio, fecha_fin, total_horas_estudiante, total_horas_docente, estado
                ) VALUES (
                    v_id_periodo, v_id_matricula_detalle28, v_id_empresa28, v_id_docente483, v_id_entidad_receptora,
                    'Proyecto de Vinculación - Estudiante 28',
                    CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days', 120, 40, 'EN_CURSO'
                ) ON CONFLICT (id_matricula_detalle) DO UPDATE SET
                    id_periodo = EXCLUDED.id_periodo,
                    id_empresa = EXCLUDED.id_empresa,
                    id_docente = EXCLUDED.id_docente,
                    id_entidad_receptora = EXCLUDED.id_entidad_receptora,
                    nombre_proyecto = EXCLUDED.nombre_proyecto,
                    fecha_inicio = EXCLUDED.fecha_inicio,
                    fecha_fin = EXCLUDED.fecha_fin,
                    estado = EXCLUDED.estado
                RETURNING id_vinculacion INTO v_id_vinculacion28;

                -- OBJETIVOS
                INSERT INTO public.vinculacion_objetivo (id_vinculacion, descripcion, orden)
                VALUES 
                    (v_id_vinculacion1, 'Fortalecer el vínculo entre la institución y la comunidad', 1),
                    (v_id_vinculacion1, 'Desarrollar habilidades de liderazgo y trabajo en equipo', 2),
                    (v_id_vinculacion1, 'Generar soluciones innovadoras a problemáticas comunitarias', 3)
                ON CONFLICT DO NOTHING;

                INSERT INTO public.vinculacion_objetivo (id_vinculacion, descripcion, orden)
                VALUES 
                    (v_id_vinculacion28, 'Implementar estrategias de vinculación efectivas', 1),
                    (v_id_vinculacion28, 'Fomentar el emprendimiento y la innovación social', 2),
                    (v_id_vinculacion28, 'Evaluar el impacto de las actividades de vinculación', 3)
                ON CONFLICT DO NOTHING;

                -- INFORMES
                INSERT INTO public.vinculacion_informe (id_vinculacion, fecha_informe, actividad_macro, resultado_aprendizaje)
                VALUES (
                    v_id_vinculacion1, CURRENT_DATE,
                    'Planificación y ejecución de actividades de vinculación',
                    'Los estudiantes desarrollaron competencias en gestión de proyectos'
                ) ON CONFLICT DO NOTHING;

                INSERT INTO public.vinculacion_informe (id_vinculacion, fecha_informe, actividad_macro, resultado_aprendizaje)
                VALUES (
                    v_id_vinculacion28, CURRENT_DATE,
                    'Implementación de proyectos de vinculación social',
                    'Los estudiantes aplicaron conocimientos teóricos en contextos reales'
                ) ON CONFLICT DO NOTHING;

                -- EVALUACIONES
                IF v_id_rubrica IS NOT NULL THEN
                    INSERT INTO public.evaluacion_vinculacion (id_vinculacion, id_rubrica, nota_final, fecha_evaluacion)
                    VALUES (v_id_vinculacion1, v_id_rubrica, 8.5, CURRENT_DATE)
                    ON CONFLICT DO NOTHING;

                    INSERT INTO public.evaluacion_vinculacion (id_vinculacion, id_rubrica, nota_final, fecha_evaluacion)
                    VALUES (v_id_vinculacion28, v_id_rubrica, 9.0, CURRENT_DATE)
                    ON CONFLICT DO NOTHING;
                END IF;

                -- OBSERVACIONES
                DELETE FROM public.vinculacion_reporte_observacion WHERE id_vinculacion = v_id_vinculacion1;
                INSERT INTO public.vinculacion_reporte_observacion (id_vinculacion, tipo_reporte, observacion)
                VALUES 
                    (v_id_vinculacion1, 'INFORME_FINAL', 'Estudiante cumplió con todas las actividades planificadas.'),
                    (v_id_vinculacion1, 'ASISTENCIA_ESTUDIANTE', 'Estudiante demostró puntualidad y responsabilidad.'),
                    (v_id_vinculacion1, 'ASISTENCIA_TUTOR', 'Docente 46 realizó seguimiento adecuado.');

                DELETE FROM public.vinculacion_reporte_observacion WHERE id_vinculacion = v_id_vinculacion28;
                INSERT INTO public.vinculacion_reporte_observacion (id_vinculacion, tipo_reporte, observacion)
                VALUES 
                    (v_id_vinculacion28, 'INFORME_FINAL', 'Estudiante demostró excelente desempeño.'),
                    (v_id_vinculacion28, 'ASISTENCIA_ESTUDIANTE', 'Estudiante participó activamente en todas las actividades.'),
                    (v_id_vinculacion28, 'ASISTENCIA_TUTOR', 'Docente 483 realizó seguimiento excelente.');
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            DECLARE
                v_id_vinculacion1 bigint;
                v_id_vinculacion28 bigint;
            BEGIN
                SELECT id_vinculacion INTO v_id_vinculacion1
                FROM public.vinculacion_estudiante
                WHERE nombre_proyecto = 'Proyecto de Vinculación - Estudiante 1'
                LIMIT 1;

                SELECT id_vinculacion INTO v_id_vinculacion28
                FROM public.vinculacion_estudiante
                WHERE nombre_proyecto = 'Proyecto de Vinculación - Estudiante 28'
                LIMIT 1;

                IF v_id_vinculacion1 IS NOT NULL THEN
                    DELETE FROM public.vinculacion_reporte_observacion WHERE id_vinculacion = v_id_vinculacion1;
                    DELETE FROM public.vinculacion_actividad_estudiante WHERE id_vinculacion = v_id_vinculacion1;
                    DELETE FROM public.vinculacion_asistencia_tutor WHERE id_vinculacion = v_id_vinculacion1;
                    DELETE FROM public.evaluacion_vinculacion WHERE id_vinculacion = v_id_vinculacion1;
                    DELETE FROM public.vinculacion_objetivo WHERE id_vinculacion = v_id_vinculacion1;
                    DELETE FROM public.vinculacion_informe WHERE id_vinculacion = v_id_vinculacion1;
                    DELETE FROM public.vinculacion_estudiante WHERE id_vinculacion = v_id_vinculacion1;
                END IF;

                IF v_id_vinculacion28 IS NOT NULL THEN
                    DELETE FROM public.vinculacion_reporte_observacion WHERE id_vinculacion = v_id_vinculacion28;
                    DELETE FROM public.vinculacion_actividad_estudiante WHERE id_vinculacion = v_id_vinculacion28;
                    DELETE FROM public.vinculacion_asistencia_tutor WHERE id_vinculacion = v_id_vinculacion28;
                    DELETE FROM public.evaluacion_vinculacion WHERE id_vinculacion = v_id_vinculacion28;
                    DELETE FROM public.vinculacion_objetivo WHERE id_vinculacion = v_id_vinculacion28;
                    DELETE FROM public.vinculacion_informe WHERE id_vinculacion = v_id_vinculacion28;
                    DELETE FROM public.vinculacion_estudiante WHERE id_vinculacion = v_id_vinculacion28;
                END IF;

                DELETE FROM public.vinculacion_entidad_receptora WHERE nombre_entidad = 'Fundación Yavirac Social';
            END $$;
        `);
    }
}
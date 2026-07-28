import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePortafolioDatosPruebaRonniVilla1785000000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            DECLARE
                v_id_docente_coordinador bigint;
                v_id_docente_profesor bigint;
                v_id_docente_sin_materias bigint;
                v_id_periodo_carrera bigint;
                v_id_asignatura bigint;
                v_id_jornada bigint;
                v_id_paralelo bigint;
                v_id_oferta_asignatura bigint;
                v_id_oferta_docente bigint;
                v_id_matricula bigint;
                v_id_matricula_detalle bigint;
                v_id_periodo bigint;
                v_id_reporte_notas bigint;
                v_id_rol_coordinador bigint;
                v_id_rol_docente bigint;
                v_id_usuario bigint;
                v_id_usuario_docente1 bigint;
            BEGIN
                -- 1. Crear/Actualizar el docente principal (Ronni Villa)
                INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
                VALUES ('1750000199', 'Ronni', 'Villa', 'rav.villa@yavirac.edu.ec', '0999000002', 'ACTIVO')
                ON CONFLICT (cedula) DO UPDATE SET
                    nombres = EXCLUDED.nombres,
                    apellidos = EXCLUDED.apellidos,
                    correo = EXCLUDED.correo,
                    telefono = EXCLUDED.telefono,
                    estado = EXCLUDED.estado
                RETURNING id_docente INTO v_id_docente_coordinador;

                -- 1.1 Crear/Actualizar el docente SIN MATERIAS (docente1)
                INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
                VALUES ('1750000999', 'Docente', 'Prueba', 'docente1@yavirac.edu.ec', '0999000999', 'ACTIVO')
                ON CONFLICT (cedula) DO UPDATE SET
                    nombres = EXCLUDED.nombres,
                    apellidos = EXCLUDED.apellidos,
                    correo = EXCLUDED.correo,
                    telefono = EXCLUDED.telefono,
                    estado = EXCLUDED.estado
                RETURNING id_docente INTO v_id_docente_sin_materias;

                -- 2. Obtener el docente secundario (Byron Moreno)
                SELECT id_docente INTO v_id_docente_profesor FROM public.docente WHERE cedula = '1803980844';

                IF v_id_docente_profesor IS NULL THEN
                    RAISE EXCEPTION 'No existe el docente con cedula 1803980844. Verifica los datos de prueba previos.';
                END IF;

                -- 3. Crear/actualizar usuario Ronni Villa con hash '123456'
                INSERT INTO public.usuario (
                    correo, password_hash, estado, id_docente, debe_cambiar_password, intentos_fallidos, bloqueado
                )
                VALUES (
                    'rav.villa@yavirac.edu.ec',
                    '$2a$10$qtzW2ox1tH/P7f32NPTs4uNq5GxfYzpEKiUDLj9GOA8C8D3ft0i8q',
                    'ACTIVO',
                    v_id_docente_coordinador,
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
                RETURNING id_usuario INTO v_id_usuario;

                -- 3.1 Crear/actualizar usuario docente1 con hash '123456'
                INSERT INTO public.usuario (
                    correo, password_hash, estado, id_docente, debe_cambiar_password, intentos_fallidos, bloqueado
                )
                VALUES (
                    'docente1@yavirac.edu.ec',
                    '$2a$10$qtzW2ox1tH/P7f32NPTs4uNq5GxfYzpEKiUDLj9GOA8C8D3ft0i8q',
                    'ACTIVO',
                    v_id_docente_sin_materias,
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
                RETURNING id_usuario INTO v_id_usuario_docente1;

                -- 4. Asignar roles
                SELECT id_rol INTO v_id_rol_coordinador FROM public.rol WHERE nombre = 'COORDINADOR';
                SELECT id_rol INTO v_id_rol_docente FROM public.rol WHERE nombre = 'DOCENTE';

                IF v_id_rol_coordinador IS NULL OR v_id_rol_docente IS NULL THEN
                    RAISE EXCEPTION 'Faltan roles (COORDINADOR o DOCENTE) en la tabla rol.';
                END IF;

                -- Roles para Ronni Villa
                INSERT INTO public.usuario_rol (id_usuario, id_rol)
                VALUES 
                    (v_id_usuario, v_id_rol_coordinador),
                    (v_id_usuario, v_id_rol_docente)
                ON CONFLICT DO NOTHING;

                -- Rol para docente1 (Solo DOCENTE)
                INSERT INTO public.usuario_rol (id_usuario, id_rol)
                VALUES 
                    (v_id_usuario_docente1, v_id_rol_docente)
                ON CONFLICT DO NOTHING;

                -- 5. Obtener catalogos base
                SELECT id_periodo_carrera INTO v_id_periodo_carrera FROM public.periodo_carrera LIMIT 1;
                SELECT id_asignatura INTO v_id_asignatura FROM public.asignatura LIMIT 1;
                SELECT id_jornada INTO v_id_jornada FROM public.jornada LIMIT 1;
                SELECT id_paralelo INTO v_id_paralelo FROM public.paralelo LIMIT 1;

                IF v_id_periodo_carrera IS NULL OR v_id_asignatura IS NULL OR v_id_jornada IS NULL OR v_id_paralelo IS NULL THEN
                    RAISE EXCEPTION 'Faltan datos base (periodo_carrera/asignatura/jornada/paralelo).';
                END IF;

                -- 6. Crear oferta asignatura propia para Ronni Villa
                SELECT id_oferta_asignatura INTO v_id_oferta_docente
                FROM public.oferta_asignatura WHERE id_docente = v_id_docente_coordinador LIMIT 1;

                IF v_id_oferta_docente IS NULL THEN
                    INSERT INTO public.oferta_asignatura (id_periodo_carrera, id_asignatura, id_docente, id_jornada, id_paralelo, cupos, horas_semanales, estado)
                    VALUES (v_id_periodo_carrera, v_id_asignatura, v_id_docente_coordinador, v_id_jornada, v_id_paralelo, 30, 6, 'ACTIVO')
                    RETURNING id_oferta_asignatura INTO v_id_oferta_docente;
                END IF;

                -- 7. Crear oferta para Byron Moreno
                SELECT id_oferta_asignatura INTO v_id_oferta_asignatura
                FROM public.oferta_asignatura WHERE id_docente = v_id_docente_profesor LIMIT 1;

                IF v_id_oferta_asignatura IS NULL THEN
                    INSERT INTO public.oferta_asignatura (id_periodo_carrera, id_asignatura, id_docente, id_jornada, id_paralelo, cupos, horas_semanales, estado)
                    VALUES (v_id_periodo_carrera, v_id_asignatura, v_id_docente_profesor, v_id_jornada, v_id_paralelo, 35, 8, 'ACTIVO')
                    RETURNING id_oferta_asignatura INTO v_id_oferta_asignatura;
                END IF;

                -- 8. Asignar Ronni Villa como coordinador de periodo_carrera
                UPDATE public.periodo_carrera
                SET id_coordinador = v_id_docente_coordinador
                WHERE id_periodo_carrera = v_id_periodo_carrera;

                -- 9. Datos de prueba para portafolio (asociados a Ronni Villa)
                SELECT id_periodo INTO v_id_periodo FROM public.periodo_academico LIMIT 1;
                SELECT id_matricula INTO v_id_matricula FROM public.matricula LIMIT 1;

                IF v_id_matricula IS NOT NULL THEN
                    SELECT id_matricula_detalle INTO v_id_matricula_detalle
                    FROM public.matricula_detalle WHERE id_oferta_asignatura = v_id_oferta_docente LIMIT 1;

                    IF v_id_matricula_detalle IS NULL THEN
                        INSERT INTO public.matricula_detalle (id_matricula, id_oferta_asignatura, nota_ap1, estado)
                        VALUES (v_id_matricula, v_id_oferta_docente, 9.0, 'CURSANDO')
                        RETURNING id_matricula_detalle INTO v_id_matricula_detalle;
                    END IF;

                    SELECT id_reporte_notas INTO v_id_reporte_notas
                    FROM public.portafolio_reporte_notas WHERE id_oferta_asignatura = v_id_oferta_docente LIMIT 1;

                    IF v_id_reporte_notas IS NULL AND v_id_periodo IS NOT NULL THEN
                        INSERT INTO public.portafolio_reporte_notas (id_periodo, id_oferta_asignatura, tipo_reporte, ruta_archivo_pdf, estado)
                        VALUES (v_id_periodo, v_id_oferta_docente, 'APORTE_1', NULL, 'GENERADO')
                        RETURNING id_reporte_notas INTO v_id_reporte_notas;
                    END IF;

                    IF v_id_reporte_notas IS NOT NULL AND v_id_matricula_detalle IS NOT NULL THEN
                        IF NOT EXISTS (
                            SELECT 1 FROM public.portafolio_aceptacion_estudiante
                            WHERE id_reporte_notas = v_id_reporte_notas AND id_matricula_detalle = v_id_matricula_detalle
                        ) THEN
                            INSERT INTO public.portafolio_aceptacion_estudiante (id_reporte_notas, id_matricula_detalle, nota_registrada, estado_aceptacion)
                            VALUES (v_id_reporte_notas, v_id_matricula_detalle, 9.0, 'PENDIENTE');
                        END IF;
                    END IF;
                END IF;

                -- NOTA: A 'docente1@yavirac.edu.ec' se le omite cualquier tipo de oferta_asignatura o materia.

            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            DECLARE
                v_id_docente_coordinador bigint;
                v_id_docente_sin_materias bigint;
                v_id_usuario bigint;
                v_id_usuario_docente1 bigint;
            BEGIN
                SELECT id_docente INTO v_id_docente_coordinador FROM public.docente WHERE cedula = '1750000199';
                SELECT id_docente INTO v_id_docente_sin_materias FROM public.docente WHERE cedula = '1750000999';

                -- Limpieza Ronni Villa
                IF v_id_docente_coordinador IS NOT NULL THEN
                    UPDATE public.periodo_carrera
                    SET id_coordinador = NULL
                    WHERE id_coordinador = v_id_docente_coordinador;

                    DELETE FROM public.portafolio_aceptacion_estudiante
                    WHERE id_matricula_detalle IN (
                        SELECT md.id_matricula_detalle FROM public.matricula_detalle md
                        JOIN public.oferta_asignatura oa ON oa.id_oferta_asignatura = md.id_oferta_asignatura
                        WHERE oa.id_docente = v_id_docente_coordinador
                    );

                    DELETE FROM public.portafolio_reporte_notas
                    WHERE id_oferta_asignatura IN (
                        SELECT id_oferta_asignatura FROM public.oferta_asignatura
                        WHERE id_docente = v_id_docente_coordinador
                    );

                    DELETE FROM public.matricula_detalle
                    WHERE id_oferta_asignatura IN (
                        SELECT id_oferta_asignatura FROM public.oferta_asignatura
                        WHERE id_docente = v_id_docente_coordinador
                    );

                    DELETE FROM public.oferta_asignatura WHERE id_docente = v_id_docente_coordinador;

                    SELECT id_usuario INTO v_id_usuario FROM public.usuario WHERE correo = 'rav.villa@yavirac.edu.ec';
                    IF v_id_usuario IS NOT NULL THEN
                        DELETE FROM public.usuario_rol WHERE id_usuario = v_id_usuario;
                        DELETE FROM public.usuario WHERE id_usuario = v_id_usuario;
                    END IF;

                    DELETE FROM public.docente WHERE id_docente = v_id_docente_coordinador;
                END IF;

                -- Limpieza docente1
                IF v_id_docente_sin_materias IS NOT NULL THEN
                    SELECT id_usuario INTO v_id_usuario_docente1 FROM public.usuario WHERE correo = 'docente1@yavirac.edu.ec';
                    IF v_id_usuario_docente1 IS NOT NULL THEN
                        DELETE FROM public.usuario_rol WHERE id_usuario = v_id_usuario_docente1;
                        DELETE FROM public.usuario WHERE id_usuario = v_id_usuario_docente1;
                    END IF;

                    DELETE FROM public.docente WHERE id_docente = v_id_docente_sin_materias;
                END IF;
            END $$;
        `);
    }
}
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDatosRealesConLogicaSintetica1791000000000 implements MigrationInterface {
  name = 'SeedDatosRealesConLogicaSintetica1791000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ============================================================
    // BLOQUE 1: Crear periodo_academico 2026-2P + periodo_carrera
    // ============================================================
    await queryRunner.query(`
      DO $$
      DECLARE
        v_id_periodo_p2 bigint;
      BEGIN
        PERFORM setval('public.periodo_academico_id_periodo_seq',
          GREATEST(COALESCE((SELECT MAX(id_periodo) FROM public.periodo_academico), 1), 1),
          (SELECT MAX(id_periodo) FROM public.periodo_academico) IS NOT NULL);
        PERFORM setval('public.periodo_carrera_id_periodo_carrera_seq',
          GREATEST(COALESCE((SELECT MAX(id_periodo_carrera) FROM public.periodo_carrera), 1), 1),
          (SELECT MAX(id_periodo_carrera) FROM public.periodo_carrera) IS NOT NULL);

        INSERT INTO public.periodo_academico (codigo, nombre, fecha_inicio, fecha_fin, estado)
        VALUES ('2026-2P', 'Periodo 2026-2P', '2026-09-01', '2027-01-30', 'ACTIVO')
        ON CONFLICT (codigo) DO NOTHING;

        SELECT id_periodo INTO v_id_periodo_p2 FROM public.periodo_academico WHERE codigo = '2026-2P';

        INSERT INTO public.periodo_carrera (id_periodo, id_carrera, fecha_inicio, fecha_fin, estado)
        SELECT v_id_periodo_p2, c.id_carrera, '2026-09-01', '2027-01-30', 'ACTIVO'
        FROM public.carrera c
        WHERE NOT EXISTS (
          SELECT 1 FROM public.periodo_carrera pc
          WHERE pc.id_periodo = v_id_periodo_p2 AND pc.id_carrera = c.id_carrera
        );
      END $$;
    `);

    // ============================================================
    // BLOQUE 2: Coordinador General + asignacion de coordinadores
    // ============================================================
    await queryRunner.query(`
      DO $$
      DECLARE
        v_id_docente_coord bigint;
        v_id_usuario_coord bigint;
        v_id_rol_coordinador bigint;
        v_id_docente_ronni bigint;
      BEGIN
        PERFORM setval('public.docente_id_docente_seq',
          GREATEST(COALESCE((SELECT MAX(id_docente) FROM public.docente), 1), 1),
          (SELECT MAX(id_docente) FROM public.docente) IS NOT NULL);
        PERFORM setval('public.usuario_id_usuario_seq',
          GREATEST(COALESCE((SELECT MAX(id_usuario) FROM public.usuario), 1), 1),
          (SELECT MAX(id_usuario) FROM public.usuario) IS NOT NULL);
        PERFORM setval('public.usuario_rol_id_usuario_rol_seq',
          GREATEST(COALESCE((SELECT MAX(id_usuario_rol) FROM public.usuario_rol), 1), 1),
          (SELECT MAX(id_usuario_rol) FROM public.usuario_rol) IS NOT NULL);

        INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
        VALUES ('1750000555', 'Coordinador', 'General Prueba', 'coordinador.general@yavirac.edu.ec', '0999000555', 'ACTIVO')
        ON CONFLICT (cedula) DO UPDATE SET
          nombres = EXCLUDED.nombres, apellidos = EXCLUDED.apellidos,
          correo = EXCLUDED.correo, telefono = EXCLUDED.telefono, estado = EXCLUDED.estado
        RETURNING id_docente INTO v_id_docente_coord;

        INSERT INTO public.usuario (correo, password_hash, estado, id_docente, debe_cambiar_password, intentos_fallidos, bloqueado)
        VALUES ('coordinador.general@yavirac.edu.ec',
          '$2a$10$qtzW2ox1tH/P7f32NPTs4uNq5GxfYzpEKiUDLj9GOA8C8D3ft0i8q',
          'ACTIVO', v_id_docente_coord, false, 0, false)
        ON CONFLICT (correo) DO UPDATE SET
          password_hash = EXCLUDED.password_hash, estado = 'ACTIVO',
          id_docente = EXCLUDED.id_docente, debe_cambiar_password = false,
          intentos_fallidos = 0, bloqueado = false
        RETURNING id_usuario INTO v_id_usuario_coord;

        SELECT id_rol INTO v_id_rol_coordinador FROM public.rol WHERE nombre = 'COORDINADOR';
        IF v_id_rol_coordinador IS NULL THEN
          RAISE EXCEPTION 'No existe el rol COORDINADOR.';
        END IF;

        INSERT INTO public.usuario_rol (id_usuario, id_rol)
        VALUES (v_id_usuario_coord, v_id_rol_coordinador)
        ON CONFLICT DO NOTHING;

        -- Obtener Ronni Villa
        SELECT id_docente INTO v_id_docente_ronni FROM public.docente WHERE cedula = '1750000199' LIMIT 1;

        -- Asignar coordinadores: id_periodo_carrera impar = Ronni, par = Coordinador General
        IF v_id_docente_ronni IS NOT NULL THEN
          UPDATE public.periodo_carrera
          SET id_coordinador = CASE
            WHEN id_periodo_carrera % 2 = 1 THEN v_id_docente_ronni
            ELSE v_id_docente_coord
          END
          WHERE id_coordinador IS NULL;
        ELSE
          UPDATE public.periodo_carrera SET id_coordinador = v_id_docente_coord WHERE id_coordinador IS NULL;
        END IF;

        RAISE NOTICE 'Coordinadores asignados a periodo_carrera.';
      END $$;
    `);

    // ============================================================
    // BLOQUE 3: 10 empresas reales + tutores
    // ============================================================
    await queryRunner.query(`
      DO $$
      DECLARE
        v_emp RECORD;
        v_id_empresa bigint;
        v_id_tutor bigint;
      BEGIN
        PERFORM setval('public.empresa_id_empresa_seq',
          GREATEST(COALESCE((SELECT MAX(id_empresa) FROM public.empresa), 1), 1),
          (SELECT MAX(id_empresa) FROM public.empresa) IS NOT NULL);
        PERFORM setval('public.tutor_empresarial_id_tutor_empresarial_seq',
          GREATEST(COALESCE((SELECT MAX(id_tutor_empresarial) FROM public.tutor_empresarial), 1), 1),
          (SELECT MAX(id_tutor_empresarial) FROM public.tutor_empresarial) IS NOT NULL);

        FOR v_emp IN
          SELECT * FROM (VALUES
            ('1790012345001', 'TechCorp S.A.', 'Av. Amazonas N34-451, Quito', '022345678', 'contacto@techcorp.ec', 'Ing. Roberto Gomez', 'Roberto', 'Gomez', 'Jefe de Desarrollo', 'rgomez@techcorp.ec'),
            ('1790000000001', 'Empresa XYZ Cia. Ltda.', 'Av. Principal 123, Quito', '022456789', 'contacto@empresaxyz.com', 'Sra. Ana Salinas', 'Ana', 'Salinas Ortiz', 'Gerente de Talento Humano', 'ana@empresaxyz.com'),
            ('1791234567001', 'Soluciones Andinas S.A.', 'Av. Naciones Unidas, Quito', '022567890', 'info@solucionesandinas.ec', 'Ing. Carlos Perez', 'Carlos', 'Perez', 'Director de Operaciones', 'cperez@solucionesandinas.ec'),
            ('1792345678001', 'Innovatech Ecuador S.A.', 'Av. 6 de Diciembre, Quito', '022678901', 'contacto@innovatech.ec', 'Ing. Maria Vega', 'Maria', 'Vega', 'Gerente de Talento', 'mvega@innovatech.ec'),
            ('0992345678001', 'Grupo Industrial Guayaquil Cia. Ltda.', 'Av. 9 de Octubre, Guayaquil', '042789012', 'info@gig.ec', 'Lcdo. Luis Fernandez', 'Luis', 'Fernandez', 'Coordinador de RRHH', 'lfernandez@gig.ec'),
            ('0193456789001', 'Servicios Integrales Cuenca S.A.', 'Av. Las Americas, Cuenca', '073890123', 'contacto@sic.ec', 'Ing. Patricia Ruiz', 'Patricia', 'Ruiz', 'Jefa de Talento', 'pruiz@sic.ec'),
            ('1793456789001', 'Constructora Nacional S.A.', 'Av. Eloy Alfaro, Quito', '022901234', 'info@constructoranacional.ec', 'Arq. Fernando Castillo', 'Fernando', 'Castillo', 'Director de Proyectos', 'fcastillo@constructoranacional.ec'),
            ('1794567890001', 'Comercial Delta S.A.', 'Av. Los Shyris, Quito', '023012345', 'contacto@comercialdelta.ec', 'Ing. Sofia Medina', 'Sofia', 'Medina', 'Supervisora de Practicas', 'smedina@comercialdelta.ec'),
            ('1894567890001', 'Logistica y Transporte Ambato Cia. Ltda.', 'Av. Cevallos, Ambato', '033123456', 'info@logambato.ec', 'Ing. Diego Ramirez', 'Diego', 'Ramirez', 'Gerente de Talento', 'dramirez@logambato.ec'),
            ('1395678901001', 'Agroindustrial Manta S.A.', 'Av. 4 de Noviembre, Manta', '053234567', 'contacto@agromanta.ec', 'Ing. Camila Sanchez', 'Camila', 'Sanchez', 'Directora de RRHH', 'csanchez@agromanta.ec')
          ) AS e(ruc, razon_social, direccion, telefono, correo, representante_legal, tutor_nombres, tutor_apellidos, tutor_cargo, tutor_correo)
        LOOP
          INSERT INTO public.empresa (ruc, razon_social, direccion, telefono, correo, representante_legal, estado)
          VALUES (v_emp.ruc, v_emp.razon_social, v_emp.direccion, v_emp.telefono, v_emp.correo, v_emp.representante_legal, 'ACTIVO')
          ON CONFLICT (ruc) DO UPDATE SET
            razon_social = EXCLUDED.razon_social, direccion = EXCLUDED.direccion,
            telefono = EXCLUDED.telefono, correo = EXCLUDED.correo,
            representante_legal = EXCLUDED.representante_legal, estado = 'ACTIVO'
          RETURNING id_empresa INTO v_id_empresa;

          SELECT id_tutor_empresarial INTO v_id_tutor FROM public.tutor_empresarial
          WHERE id_empresa = v_id_empresa AND correo = v_emp.tutor_correo LIMIT 1;

          IF v_id_tutor IS NULL THEN
            INSERT INTO public.tutor_empresarial (id_empresa, nombres, apellidos, cargo, correo, estado)
            VALUES (v_id_empresa, v_emp.tutor_nombres, v_emp.tutor_apellidos, v_emp.tutor_cargo, v_emp.tutor_correo, 'ACTIVO')
            RETURNING id_tutor_empresarial INTO v_id_tutor;
          END IF;
        END LOOP;
      END $$;
    `);

    // ============================================================
    // BLOQUE 6: TODOS los docentes con 4 ofertas en 2026-1P
    // ============================================================
    await queryRunner.query(`
      DO $$
      DECLARE
        v_id_periodo_p1 bigint;
        v_pc_id bigint;
        v_jornada bigint;
        v_paralelo bigint;
        v_doc RECORD;
        v_contador integer := 0;
        v_idx integer;
        v_ofertas_existentes integer;
        v_faltantes integer;
        v_asignaturas bigint[];
        v_total integer;
      BEGIN
        PERFORM setval('public.oferta_asignatura_id_oferta_asignatura_seq',
          GREATEST(COALESCE((SELECT MAX(id_oferta_asignatura) FROM public.oferta_asignatura), 1), 1),
          (SELECT MAX(id_oferta_asignatura) FROM public.oferta_asignatura) IS NOT NULL);

        SELECT id_periodo INTO v_id_periodo_p1 FROM public.periodo_academico WHERE codigo = '2026-1P';
        IF v_id_periodo_p1 IS NULL THEN RAISE EXCEPTION 'No existe 2026-1P.'; END IF;

        SELECT pc.id_periodo_carrera INTO v_pc_id FROM public.periodo_carrera pc
        WHERE pc.id_periodo = v_id_periodo_p1 ORDER BY pc.id_periodo_carrera LIMIT 1;

        SELECT id_jornada INTO v_jornada FROM public.jornada ORDER BY id_jornada LIMIT 1;
        SELECT id_paralelo INTO v_paralelo FROM public.paralelo ORDER BY id_paralelo LIMIT 1;

        SELECT array_agg(id_asignatura) INTO v_asignaturas FROM public.asignatura;
        v_total := COALESCE(array_length(v_asignaturas, 1), 0);
        IF v_total = 0 THEN RAISE EXCEPTION 'No hay asignaturas.'; END IF;

        FOR v_doc IN
          SELECT d.id_docente FROM public.docente d
          WHERE d.estado = 'ACTIVO' AND d.cedula NOT IN ('1750000199', '1750000555')
          ORDER BY d.id_docente
        LOOP
          SELECT COUNT(*) INTO v_ofertas_existentes FROM public.oferta_asignatura oa
          JOIN public.periodo_carrera pc ON pc.id_periodo_carrera = oa.id_periodo_carrera
          WHERE oa.id_docente = v_doc.id_docente AND pc.id_periodo = v_id_periodo_p1;

          v_faltantes := 4 - v_ofertas_existentes;

          IF v_faltantes > 0 THEN
            FOR v_idx IN 0..(v_faltantes - 1) LOOP
              INSERT INTO public.oferta_asignatura (id_periodo_carrera, id_asignatura, id_docente, id_jornada, id_paralelo, cupos, horas_semanales, estado)
              VALUES (v_pc_id, v_asignaturas[((v_contador * 4 + v_idx) % v_total) + 1],
                v_doc.id_docente, v_jornada, v_paralelo, 40, 4, 'ACTIVO');
            END LOOP;
          END IF;
          v_contador := v_contador + 1;
        END LOOP;
      END $$;
    `);

    // ============================================================
    // BLOQUE 7: TODOS los docentes con 4 ofertas en 2026-2P
    // ============================================================
    await queryRunner.query(`
      DO $$
      DECLARE
        v_id_periodo_p2 bigint;
        v_pc_id bigint;
        v_jornada bigint;
        v_paralelo bigint;
        v_doc RECORD;
        v_contador integer := 0;
        v_idx integer;
        v_ofertas_existentes integer;
        v_faltantes integer;
        v_asignaturas bigint[];
        v_total integer;
      BEGIN
        PERFORM setval('public.oferta_asignatura_id_oferta_asignatura_seq',
          GREATEST(COALESCE((SELECT MAX(id_oferta_asignatura) FROM public.oferta_asignatura), 1), 1),
          (SELECT MAX(id_oferta_asignatura) FROM public.oferta_asignatura) IS NOT NULL);

        SELECT id_periodo INTO v_id_periodo_p2 FROM public.periodo_academico WHERE codigo = '2026-2P';
        IF v_id_periodo_p2 IS NULL THEN RAISE EXCEPTION 'No existe 2026-2P.'; END IF;

        SELECT pc.id_periodo_carrera INTO v_pc_id FROM public.periodo_carrera pc
        WHERE pc.id_periodo = v_id_periodo_p2 ORDER BY pc.id_periodo_carrera LIMIT 1;

        SELECT id_jornada INTO v_jornada FROM public.jornada ORDER BY id_jornada LIMIT 1;
        SELECT id_paralelo INTO v_paralelo FROM public.paralelo ORDER BY id_paralelo LIMIT 1;

        SELECT array_agg(id_asignatura) INTO v_asignaturas FROM public.asignatura;
        v_total := COALESCE(array_length(v_asignaturas, 1), 0);
        IF v_total = 0 THEN RAISE EXCEPTION 'No hay asignaturas.'; END IF;

        FOR v_doc IN
          SELECT d.id_docente FROM public.docente d
          WHERE d.estado = 'ACTIVO' AND d.cedula NOT IN ('1750000199', '1750000555')
          ORDER BY d.id_docente
        LOOP
          SELECT COUNT(*) INTO v_ofertas_existentes FROM public.oferta_asignatura oa
          JOIN public.periodo_carrera pc ON pc.id_periodo_carrera = oa.id_periodo_carrera
          WHERE oa.id_docente = v_doc.id_docente AND pc.id_periodo = v_id_periodo_p2;

          v_faltantes := 4 - v_ofertas_existentes;

          IF v_faltantes > 0 THEN
            FOR v_idx IN 0..(v_faltantes - 1) LOOP
              INSERT INTO public.oferta_asignatura (id_periodo_carrera, id_asignatura, id_docente, id_jornada, id_paralelo, cupos, horas_semanales, estado)
              VALUES (v_pc_id, v_asignaturas[((v_contador * 4 + v_idx) % v_total) + 1],
                v_doc.id_docente, v_jornada, v_paralelo, 40, 4, 'ACTIVO');
            END LOOP;
          END IF;
          v_contador := v_contador + 1;
        END LOOP;
      END $$;
    `);

    // ============================================================
    // BLOQUE 8: 1 practica por estudiante en 2026-1P (sin repetir)
    // ============================================================
    await queryRunner.query(`
      DO $$
      DECLARE
        v_id_periodo_p1 bigint;
        v_est RECORD;
        v_emp_id bigint;
        v_doc_id bigint;
        v_tutor_id bigint;
        v_contador integer := 0;
        v_empresas bigint[];
        v_docentes bigint[];
        v_total_emp integer;
        v_total_doc integer;
        v_idx_emp integer;
        v_idx_doc integer;
      BEGIN
        PERFORM setval('public.practica_estudiante_id_practica_seq',
          GREATEST(COALESCE((SELECT MAX(id_practica) FROM public.practica_estudiante), 1), 1),
          (SELECT MAX(id_practica) FROM public.practica_estudiante) IS NOT NULL);

        SELECT id_periodo INTO v_id_periodo_p1 FROM public.periodo_academico WHERE codigo = '2026-1P';
        IF v_id_periodo_p1 IS NULL THEN RAISE EXCEPTION 'No existe 2026-1P.'; END IF;

        SELECT array_agg(id_empresa ORDER BY id_empresa) INTO v_empresas FROM public.empresa
        WHERE estado = 'ACTIVO' AND razon_social NOT LIKE 'Empresa Lote%'
          AND razon_social NOT IN ('ALAS DE COLIBRI', 'GRUPOKFC', 'Empresa Correo Prueba S.A.')
          AND ruc NOT LIKE '99%' AND ruc NOT LIKE '179010000000%';
        v_total_emp := COALESCE(array_length(v_empresas, 1), 0);

        SELECT array_agg(id_docente ORDER BY id_docente) INTO v_docentes FROM public.docente
        WHERE estado = 'ACTIVO' AND cedula NOT IN ('1750000199', '1750000555');
        v_total_doc := COALESCE(array_length(v_docentes, 1), 0);

        IF v_total_emp = 0 OR v_total_doc = 0 THEN
          RAISE EXCEPTION 'No hay empresas o docentes reales.';
        END IF;

        -- Un estudiante unico por estudiante (menor id_matricula_detalle)
        FOR v_est IN
          SELECT DISTINCT ON (m.id_estudiante)
            m.id_estudiante, md.id_matricula_detalle
          FROM public.matricula_detalle md
          JOIN public.matricula m ON m.id_matricula = md.id_matricula
          JOIN public.estudiante e ON e.id_estudiante = m.id_estudiante
          WHERE e.estado = 'ACTIVO' AND m.id_periodo = v_id_periodo_p1
          ORDER BY m.id_estudiante, md.id_matricula_detalle
        LOOP
          v_idx_emp := (v_contador % v_total_emp) + 1;
          v_idx_doc := (v_contador % v_total_doc) + 1;
          v_emp_id := v_empresas[v_idx_emp];
          v_doc_id := v_docentes[v_idx_doc];

          SELECT id_tutor_empresarial INTO v_tutor_id FROM public.tutor_empresarial
          WHERE id_empresa = v_emp_id ORDER BY id_tutor_empresarial LIMIT 1;

          IF v_tutor_id IS NULL THEN
            INSERT INTO public.tutor_empresarial (id_empresa, nombres, apellidos, cargo, estado)
            VALUES (v_emp_id, 'Tutor', 'Empresa ' || v_emp_id, 'Supervisor', 'ACTIVO')
            RETURNING id_tutor_empresarial INTO v_tutor_id;
          END IF;

          INSERT INTO public.practica_estudiante (id_periodo, id_matricula_detalle, id_empresa, id_tutor_empresarial, id_docente, total_horas_requeridas, total_horas_cumplidas, estado)
          VALUES (v_id_periodo_p1, v_est.id_matricula_detalle, v_emp_id, v_tutor_id, v_doc_id, 400, 0, 'EN_CURSO')
          ON CONFLICT (id_matricula_detalle) DO NOTHING;

          v_contador := v_contador + 1;
        END LOOP;
      END $$;
    `);

    // ============================================================
    // BLOQUE 9: 1 vinculacion por estudiante de 1ro/2do en 2026-1P
    // ============================================================
    await queryRunner.query(`
      DO $$
      DECLARE
        v_id_periodo_p1 bigint;
        v_id_entidad_receptora bigint;
        v_est RECORD;
        v_emp_id bigint;
        v_doc_id bigint;
        v_contador integer := 0;
        v_empresas bigint[];
        v_docentes bigint[];
        v_total_emp integer;
        v_total_doc integer;
      BEGIN
        PERFORM setval('public.vinculacion_estudiante_id_vinculacion_seq',
          GREATEST(COALESCE((SELECT MAX(id_vinculacion) FROM public.vinculacion_estudiante), 1), 1),
          (SELECT MAX(id_vinculacion) FROM public.vinculacion_estudiante) IS NOT NULL);
        PERFORM setval('public.vinculacion_entidad_receptora_id_entidad_seq',
          GREATEST(COALESCE((SELECT MAX(id_entidad) FROM public.vinculacion_entidad_receptora), 1), 1),
          (SELECT MAX(id_entidad) FROM public.vinculacion_entidad_receptora) IS NOT NULL);

        SELECT id_periodo INTO v_id_periodo_p1 FROM public.periodo_academico WHERE codigo = '2026-1P';

        INSERT INTO public.vinculacion_entidad_receptora (nombre_entidad, direccion, telefono, correo, tutor_entidad_receptora)
        VALUES ('Fundacion Yavirac Social', 'Av. Amazonas N37-45', '022500999', 'fundacion@yavirac.edu.ec', 'Lic. Maria Sanchez')
        ON CONFLICT DO NOTHING;

        SELECT id_entidad INTO v_id_entidad_receptora FROM public.vinculacion_entidad_receptora
        WHERE nombre_entidad = 'Fundacion Yavirac Social' LIMIT 1;

        SELECT array_agg(id_empresa ORDER BY id_empresa) INTO v_empresas FROM public.empresa
        WHERE estado = 'ACTIVO' AND razon_social NOT LIKE 'Empresa Lote%'
          AND razon_social NOT IN ('ALAS DE COLIBRI', 'GRUPOKFC', 'Empresa Correo Prueba S.A.')
          AND ruc NOT LIKE '99%' AND ruc NOT LIKE '179010000000%';
        v_total_emp := COALESCE(array_length(v_empresas, 1), 0);

        SELECT array_agg(id_docente ORDER BY id_docente) INTO v_docentes FROM public.docente
        WHERE estado = 'ACTIVO' AND cedula NOT IN ('1750000199', '1750000555');
        v_total_doc := COALESCE(array_length(v_docentes, 1), 0);

        IF v_total_emp = 0 OR v_total_doc = 0 THEN RAISE EXCEPTION 'Sin datos.'; END IF;

        FOR v_est IN
          SELECT DISTINCT ON (m.id_estudiante)
            m.id_estudiante, md.id_matricula_detalle
          FROM public.matricula_detalle md
          JOIN public.matricula m ON m.id_matricula = md.id_matricula
          JOIN public.estudiante e ON e.id_estudiante = m.id_estudiante
          JOIN public.oferta_asignatura oa ON oa.id_oferta_asignatura = md.id_oferta_asignatura
          JOIN public.asignatura a ON a.id_asignatura = oa.id_asignatura
          JOIN public.nivel n ON n.id_nivel = a.id_nivel
          WHERE e.estado = 'ACTIVO' AND m.id_periodo = v_id_periodo_p1
            AND n.nombre IN ('PRIMERO', 'SEGUNDO')
          ORDER BY m.id_estudiante, md.id_matricula_detalle
        LOOP
          v_emp_id := v_empresas[(v_contador % v_total_emp) + 1];
          v_doc_id := v_docentes[(v_contador % v_total_doc) + 1];

          INSERT INTO public.vinculacion_estudiante (
            id_periodo, id_matricula_detalle, id_empresa, id_docente, id_entidad_receptora,
            nombre_proyecto, fecha_inicio, fecha_fin, total_horas_estudiante, total_horas_docente, estado
          ) VALUES (
            v_id_periodo_p1, v_est.id_matricula_detalle, v_emp_id, v_doc_id, v_id_entidad_receptora,
            'Proyecto de Vinculacion', CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days',
            120, 40, 'EN_CURSO'
          )
          ON CONFLICT (id_matricula_detalle) DO NOTHING;

          v_contador := v_contador + 1;
        END LOOP;
      END $$;
    `);

    // ============================================================
    // BLOQUE 10: 800 estudiantes nuevos + matriculas en 2026-2P
    // ============================================================
    await queryRunner.query(`
      DO $$
      DECLARE
        v_id_periodo_p2 bigint;
        v_id_carrera bigint;
        v_i integer;
        v_cedula text;
        v_nombres text;
        v_apellidos text;
        v_correo text;
        v_id_estudiante bigint;
        v_id_matricula bigint;
        v_ofertas bigint[];
        v_total_ofertas integer;
        v_id_oferta bigint;
        v_total_carreras integer;
      BEGIN
        PERFORM setval('public.estudiante_id_estudiante_seq',
          GREATEST(COALESCE((SELECT MAX(id_estudiante) FROM public.estudiante), 1), 1),
          (SELECT MAX(id_estudiante) FROM public.estudiante) IS NOT NULL);
        PERFORM setval('public.matricula_id_matricula_seq',
          GREATEST(COALESCE((SELECT MAX(id_matricula) FROM public.matricula), 1), 1),
          (SELECT MAX(id_matricula) FROM public.matricula) IS NOT NULL);
        PERFORM setval('public.matricula_detalle_id_matricula_detalle_seq',
          GREATEST(COALESCE((SELECT MAX(id_matricula_detalle) FROM public.matricula_detalle), 1), 1),
          (SELECT MAX(id_matricula_detalle) FROM public.matricula_detalle) IS NOT NULL);

        SELECT id_periodo INTO v_id_periodo_p2 FROM public.periodo_academico WHERE codigo = '2026-2P';

        SELECT COUNT(*) INTO v_total_carreras FROM public.carrera;

        SELECT array_agg(oa.id_oferta_asignatura) INTO v_ofertas FROM public.oferta_asignatura oa
        JOIN public.periodo_carrera pc ON pc.id_periodo_carrera = oa.id_periodo_carrera
        WHERE pc.id_periodo = v_id_periodo_p2;

        v_total_ofertas := COALESCE(array_length(v_ofertas, 1), 0);
        IF v_total_ofertas = 0 THEN RAISE EXCEPTION 'No hay ofertas 2026-2P.'; END IF;

        FOR v_i IN 0..799 LOOP
          v_cedula := (1799999000 + v_i)::text;
          v_nombres := 'Estudiante Nuevo ' || (v_i + 1);
          v_apellidos := 'Generado 2026-2P';
          v_correo := 'estudiante.nuevo' || (v_i + 1) || '@yavirac.edu.ec';

          SELECT id_carrera INTO v_id_carrera FROM public.carrera ORDER BY id_carrera
          OFFSET (v_i % v_total_carreras) LIMIT 1;

          INSERT INTO public.estudiante (cedula, nombres, apellidos, correo, estado)
          VALUES (v_cedula, v_nombres, v_apellidos, v_correo, 'ACTIVO')
          ON CONFLICT (cedula) DO UPDATE SET
            nombres = EXCLUDED.nombres, apellidos = EXCLUDED.apellidos,
            correo = EXCLUDED.correo, estado = 'ACTIVO'
          RETURNING id_estudiante INTO v_id_estudiante;

          INSERT INTO public.matricula (numero, id_estudiante, id_periodo, id_carrera, fecha_matricula, tipo_matricula, estado)
          VALUES ('MAT-2026-2P-' || lpad(v_i::text, 5, '0'), v_id_estudiante, v_id_periodo_p2, v_id_carrera, CURRENT_DATE, 'ORDINARIA', 'ACTIVA')
          ON CONFLICT DO NOTHING
          RETURNING id_matricula INTO v_id_matricula;

          IF v_id_matricula IS NULL THEN
            SELECT id_matricula INTO v_id_matricula FROM public.matricula
            WHERE id_periodo = v_id_periodo_p2 AND id_estudiante = v_id_estudiante LIMIT 1;
          END IF;

          v_id_oferta := v_ofertas[((v_i) % v_total_ofertas) + 1];

          INSERT INTO public.matricula_detalle (id_matricula, id_oferta_asignatura, estado)
          VALUES (v_id_matricula, v_id_oferta, 'CURSANDO')
          ON CONFLICT DO NOTHING;
        END LOOP;
      END $$;
    `);

    // ============================================================
    // BLOQUE 11: 10 docentes nuevos + 2 empresas + practicas 2026-2P
    // ============================================================
    await queryRunner.query(`
      DO $$
      DECLARE
        v_id_periodo_p2 bigint;
        v_pc_id bigint;
        v_jornada bigint;
        v_paralelo bigint;
        v_i integer;
        v_cedula text;
        v_id_docente bigint;
        v_asignaturas bigint[];
        v_total_asig integer;
        v_idx integer;
      BEGIN
        PERFORM setval('public.docente_id_docente_seq',
          GREATEST(COALESCE((SELECT MAX(id_docente) FROM public.docente), 1), 1),
          (SELECT MAX(id_docente) FROM public.docente) IS NOT NULL);
        PERFORM setval('public.oferta_asignatura_id_oferta_asignatura_seq',
          GREATEST(COALESCE((SELECT MAX(id_oferta_asignatura) FROM public.oferta_asignatura), 1), 1),
          (SELECT MAX(id_oferta_asignatura) FROM public.oferta_asignatura) IS NOT NULL);

        SELECT id_periodo INTO v_id_periodo_p2 FROM public.periodo_academico WHERE codigo = '2026-2P';

        SELECT pc.id_periodo_carrera INTO v_pc_id FROM public.periodo_carrera pc
        WHERE pc.id_periodo = v_id_periodo_p2 ORDER BY pc.id_periodo_carrera LIMIT 1;

        SELECT id_jornada INTO v_jornada FROM public.jornada ORDER BY id_jornada LIMIT 1;
        SELECT id_paralelo INTO v_paralelo FROM public.paralelo ORDER BY id_paralelo LIMIT 1;

        SELECT array_agg(id_asignatura) INTO v_asignaturas FROM public.asignatura;
        v_total_asig := COALESCE(array_length(v_asignaturas, 1), 0);

        FOR v_i IN 0..9 LOOP
          v_cedula := (1799988000 + v_i)::text;

          INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
          VALUES (v_cedula, 'Docente Nuevo ' || (v_i + 1), 'Generado 2026-2P',
            'docente.nuevo' || (v_i + 1) || '@yavirac.edu.ec',
            '09999999' || lpad(v_i::text, 2, '0'), 'ACTIVO')
          ON CONFLICT (cedula) DO UPDATE SET
            nombres = EXCLUDED.nombres, apellidos = EXCLUDED.apellidos,
            correo = EXCLUDED.correo, estado = 'ACTIVO'
          RETURNING id_docente INTO v_id_docente;

          FOR v_idx IN 0..3 LOOP
            INSERT INTO public.oferta_asignatura (id_periodo_carrera, id_asignatura, id_docente, id_jornada, id_paralelo, cupos, horas_semanales, estado)
            VALUES (v_pc_id, v_asignaturas[((v_i * 4 + v_idx) % v_total_asig) + 1],
              v_id_docente, v_jornada, v_paralelo, 40, 4, 'ACTIVO');
          END LOOP;
        END LOOP;
      END $$;
    `);

    await queryRunner.query(`
      DO $$
      DECLARE
        v_id_periodo_p2 bigint;
        v_emp RECORD;
        v_id_empresa bigint;
        v_id_tutor bigint;
        v_est RECORD;
        v_doc_id bigint;
        v_docentes bigint[];
        v_total_doc integer;
        v_contador integer := 0;
      BEGIN
        PERFORM setval('public.empresa_id_empresa_seq',
          GREATEST(COALESCE((SELECT MAX(id_empresa) FROM public.empresa), 1), 1),
          (SELECT MAX(id_empresa) FROM public.empresa) IS NOT NULL);
        PERFORM setval('public.tutor_empresarial_id_tutor_empresarial_seq',
          GREATEST(COALESCE((SELECT MAX(id_tutor_empresarial) FROM public.tutor_empresarial), 1), 1),
          (SELECT MAX(id_tutor_empresarial) FROM public.tutor_empresarial) IS NOT NULL);
        PERFORM setval('public.practica_estudiante_id_practica_seq',
          GREATEST(COALESCE((SELECT MAX(id_practica) FROM public.practica_estudiante), 1), 1),
          (SELECT MAX(id_practica) FROM public.practica_estudiante) IS NOT NULL);

        SELECT id_periodo INTO v_id_periodo_p2 FROM public.periodo_academico WHERE codigo = '2026-2P';

        SELECT array_agg(id_docente ORDER BY id_docente) INTO v_docentes FROM public.docente
        WHERE estado = 'ACTIVO' AND cedula NOT IN ('1750000199', '1750000555');
        v_total_doc := COALESCE(array_length(v_docentes, 1), 0);

        FOR v_emp IN
          SELECT * FROM (VALUES
            ('1799999001001', 'Empresa Nueva Uno S.A.', 'Av. Nueva 1, Quito', '022000111', 'contacto@nueva1.ec', 'Ing. Nuevo Uno', 'Tutor', 'Uno', 'Supervisor', 'tutor1@nueva1.ec'),
            ('1799999002001', 'Empresa Nueva Dos S.A.', 'Av. Nueva 2, Quito', '022000222', 'contacto@nueva2.ec', 'Ing. Nuevo Dos', 'Tutor', 'Dos', 'Supervisor', 'tutor2@nueva2.ec')
          ) AS e(ruc, razon_social, direccion, telefono, correo, representante_legal, tutor_nombres, tutor_apellidos, tutor_cargo, tutor_correo)
        LOOP
          INSERT INTO public.empresa (ruc, razon_social, direccion, telefono, correo, representante_legal, estado)
          VALUES (v_emp.ruc, v_emp.razon_social, v_emp.direccion, v_emp.telefono, v_emp.correo, v_emp.representante_legal, 'ACTIVO')
          ON CONFLICT (ruc) DO UPDATE SET razon_social = EXCLUDED.razon_social, estado = 'ACTIVO'
          RETURNING id_empresa INTO v_id_empresa;

          SELECT id_tutor_empresarial INTO v_id_tutor FROM public.tutor_empresarial
          WHERE id_empresa = v_id_empresa AND correo = v_emp.tutor_correo LIMIT 1;

          IF v_id_tutor IS NULL THEN
            INSERT INTO public.tutor_empresarial (id_empresa, nombres, apellidos, cargo, correo, estado)
            VALUES (v_id_empresa, v_emp.tutor_nombres, v_emp.tutor_apellidos, v_emp.tutor_cargo, v_emp.tutor_correo, 'ACTIVO')
            RETURNING id_tutor_empresarial INTO v_id_tutor;
          END IF;

          FOR v_est IN
            SELECT DISTINCT ON (m.id_estudiante) m.id_estudiante, md.id_matricula_detalle
            FROM public.estudiante e
            JOIN public.matricula m ON m.id_estudiante = e.id_estudiante
            JOIN public.matricula_detalle md ON md.id_matricula = m.id_matricula
            WHERE m.id_periodo = v_id_periodo_p2
              AND e.cedula BETWEEN '1799999000' AND '1799999799'
              AND NOT EXISTS (SELECT 1 FROM public.practica_estudiante pe WHERE pe.id_matricula_detalle = md.id_matricula_detalle)
            ORDER BY m.id_estudiante, md.id_matricula_detalle
            LIMIT 5
          LOOP
            v_doc_id := v_docentes[(v_contador % v_total_doc) + 1];

            INSERT INTO public.practica_estudiante (id_periodo, id_matricula_detalle, id_empresa, id_tutor_empresarial, id_docente, total_horas_requeridas, total_horas_cumplidas, estado)
            VALUES (v_id_periodo_p2, v_est.id_matricula_detalle, v_id_empresa, v_id_tutor, v_doc_id, 400, 0, 'EN_CURSO')
            ON CONFLICT (id_matricula_detalle) DO NOTHING;

            v_contador := v_contador + 1;
          END LOOP;
        END LOOP;
      END $$;
    `);

        // ============================================================
    // BLOQUE 12: Reporte APORTE_1 + aceptacion para cada oferta
    // Solo se crea APORTE_1 (el 1er parcial). Los docentes
    // generan APORTE_2 y SUPLETORIO desde la UI segun corresponda.
    // ============================================================
    await queryRunner.query(`
      DO $$
      DECLARE
        v_oa RECORD;
        v_id_reporte bigint;
        v_est RECORD;
      BEGIN
        PERFORM setval('public.portafolio_reporte_notas_id_reporte_notas_seq',
          GREATEST(COALESCE((SELECT MAX(id_reporte_notas) FROM public.portafolio_reporte_notas), 1), 1),
          (SELECT MAX(id_reporte_notas) FROM public.portafolio_reporte_notas) IS NOT NULL);
        PERFORM setval('public.portafolio_aceptacion_estudiante_id_aceptacion_seq',
          GREATEST(COALESCE((SELECT MAX(id_aceptacion) FROM public.portafolio_aceptacion_estudiante), 1), 1),
          (SELECT MAX(id_aceptacion) FROM public.portafolio_aceptacion_estudiante) IS NOT NULL);

        FOR v_oa IN
          SELECT oa.id_oferta_asignatura, pc.id_periodo
          FROM public.oferta_asignatura oa
          JOIN public.periodo_carrera pc ON pc.id_periodo_carrera = oa.id_periodo_carrera
          WHERE oa.id_docente IN (
            SELECT id_docente FROM public.docente
            WHERE estado = 'ACTIVO' AND cedula NOT IN ('1750000199', '1750000555')
          )
        LOOP
          INSERT INTO public.portafolio_reporte_notas (id_periodo, id_oferta_asignatura, tipo_reporte, estado)
          VALUES (v_oa.id_periodo, v_oa.id_oferta_asignatura, 'APORTE_1', 'GENERADO')
          ON CONFLICT (id_oferta_asignatura, tipo_reporte) DO NOTHING
          RETURNING id_reporte_notas INTO v_id_reporte;

          IF v_id_reporte IS NULL THEN
            SELECT id_reporte_notas INTO v_id_reporte FROM public.portafolio_reporte_notas
            WHERE id_oferta_asignatura = v_oa.id_oferta_asignatura AND tipo_reporte = 'APORTE_1' LIMIT 1;
          END IF;

          FOR v_est IN
            SELECT md.id_matricula_detalle
            FROM public.matricula_detalle md
            JOIN public.matricula m ON m.id_matricula = md.id_matricula
            WHERE md.id_oferta_asignatura = v_oa.id_oferta_asignatura
              AND m.id_periodo = v_oa.id_periodo
          LOOP
            INSERT INTO public.portafolio_aceptacion_estudiante (id_reporte_notas, id_matricula_detalle, nota_registrada, estado_aceptacion)
            VALUES (v_id_reporte, v_est.id_matricula_detalle, NULL, 'PENDIENTE')
            ON CONFLICT DO NOTHING;
          END LOOP;
        END LOOP;

        RAISE NOTICE 'Reportes APORTE_1 creados con estudiantes asignados en nota 0.';
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
        // Revertir BLOQUE 12
    await queryRunner.query(`DELETE FROM public.portafolio_aceptacion_estudiante WHERE id_reporte_notas IN (
      SELECT id_reporte_notas FROM public.portafolio_reporte_notas WHERE id_oferta_asignatura IN (
        SELECT id_oferta_asignatura FROM public.oferta_asignatura WHERE id_docente IN (
          SELECT id_docente FROM public.docente WHERE cedula NOT IN ('1750000199', '1750000555'))));`);
    await queryRunner.query(`DELETE FROM public.portafolio_reporte_notas WHERE id_oferta_asignatura IN (
      SELECT id_oferta_asignatura FROM public.oferta_asignatura WHERE id_docente IN (
        SELECT id_docente FROM public.docente WHERE cedula NOT IN ('1750000199', '1750000555')));`);

    // Revertir BLOQUE 11
    await queryRunner.query(`DELETE FROM public.practica_estudiante WHERE id_empresa IN (
      SELECT id_empresa FROM public.empresa WHERE ruc IN ('1799999001001', '1799999002001'));`);
    await queryRunner.query(`DELETE FROM public.tutor_empresarial WHERE id_empresa IN (
      SELECT id_empresa FROM public.empresa WHERE ruc IN ('1799999001001', '1799999002001'));`);
    await queryRunner.query(`DELETE FROM public.empresa WHERE ruc IN ('1799999001001', '1799999002001');`);
    await queryRunner.query(`DELETE FROM public.oferta_asignatura WHERE id_docente IN (
      SELECT id_docente FROM public.docente WHERE cedula BETWEEN '1799988000' AND '1799988009');`);
    await queryRunner.query(`DELETE FROM public.docente WHERE cedula BETWEEN '1799988000' AND '1799988009';`);

    // Revertir BLOQUE 10
    await queryRunner.query(`DELETE FROM public.matricula_detalle WHERE id_matricula IN (
      SELECT m.id_matricula FROM public.matricula m JOIN public.estudiante e ON e.id_estudiante = m.id_estudiante
      WHERE e.cedula BETWEEN '1799999000' AND '1799999799');`);
    await queryRunner.query(`DELETE FROM public.matricula WHERE id_estudiante IN (
      SELECT id_estudiante FROM public.estudiante WHERE cedula BETWEEN '1799999000' AND '1799999799');`);
    await queryRunner.query(`DELETE FROM public.estudiante WHERE cedula BETWEEN '1799999000' AND '1799999799';`);

    // Revertir BLOQUE 9
    await queryRunner.query(`DELETE FROM public.vinculacion_estudiante WHERE id_periodo IN (
      SELECT id_periodo FROM public.periodo_academico WHERE codigo = '2026-1P');`);
    await queryRunner.query(`DELETE FROM public.vinculacion_entidad_receptora WHERE nombre_entidad = 'Fundacion Yavirac Social';`);

    // Revertir BLOQUE 8
    await queryRunner.query(`DELETE FROM public.practica_estudiante WHERE id_periodo IN (
      SELECT id_periodo FROM public.periodo_academico WHERE codigo = '2026-1P');`);

    // Revertir BLOQUE 7 y 6
    await queryRunner.query(`DELETE FROM public.oferta_asignatura WHERE id_periodo_carrera IN (
      SELECT pc.id_periodo_carrera FROM public.periodo_carrera pc
      JOIN public.periodo_academico p ON p.id_periodo = pc.id_periodo WHERE p.codigo IN ('2026-1P', '2026-2P'));`);

    // Revertir BLOQUE 3
    await queryRunner.query(`DELETE FROM public.tutor_empresarial WHERE id_empresa IN (
      SELECT id_empresa FROM public.empresa WHERE ruc IN (
        '1790012345001', '1790000000001', '1791234567001', '1792345678001',
        '0992345678001', '0193456789001', '1793456789001', '1794567890001',
        '1894567890001', '1395678901001'));`);
    await queryRunner.query(`DELETE FROM public.empresa WHERE ruc IN (
      '1790012345001', '1790000000001', '1791234567001', '1792345678001',
      '0992345678001', '0193456789001', '1793456789001', '1794567890001',
      '1894567890001', '1395678901001');`);

    // Revertir BLOQUE 2
    await queryRunner.query(`UPDATE public.periodo_carrera SET id_coordinador = NULL;`);
    await queryRunner.query(`DELETE FROM public.usuario_rol WHERE id_usuario IN (
      SELECT id_usuario FROM public.usuario WHERE correo = 'coordinador.general@yavirac.edu.ec');`);
    await queryRunner.query(`DELETE FROM public.usuario WHERE correo = 'coordinador.general@yavirac.edu.ec';`);
    await queryRunner.query(`DELETE FROM public.docente WHERE cedula = '1750000555';`);

    // Revertir BLOQUE 1
    await queryRunner.query(`DELETE FROM public.periodo_carrera WHERE id_periodo IN (
      SELECT id_periodo FROM public.periodo_academico WHERE codigo = '2026-2P');`);
    await queryRunner.query(`DELETE FROM public.periodo_academico WHERE codigo = '2026-2P';`);
  }
}
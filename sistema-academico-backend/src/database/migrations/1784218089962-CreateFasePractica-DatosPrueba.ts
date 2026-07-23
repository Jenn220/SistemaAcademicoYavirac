import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFasePracticaDatosPrueba1784218089962 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Estructura académica base (necesaria para las FK de fase práctica)
        await queryRunner.query(`
            INSERT INTO public.carrera (codigo, nombre, modalidad, estado)
            VALUES ('DS-01', 'Desarrollo de Software', 'DUAL', 'ACTIVO')
            ON CONFLICT DO NOTHING;
        `);
        await queryRunner.query(`
            INSERT INTO public.nivel (id_carrera, nombre, estado)
            SELECT id_carrera, 'Quinto Semestre', 'ACTIVO' FROM public.carrera WHERE codigo = 'DS-01'
            ON CONFLICT DO NOTHING;
        `);
        await queryRunner.query(`
            INSERT INTO public.periodo_academico (codigo, nombre, fecha_inicio, fecha_fin, estado)
            VALUES ('2026-1P', 'Periodo 2026-1P', '2026-04-01', '2026-08-30', 'ACTIVO')
            ON CONFLICT DO NOTHING;
        `);
        await queryRunner.query(`
            INSERT INTO public.docente (cedula, nombres, apellidos, correo, telefono, estado)
            VALUES ('1803980844', 'Byron Rodrigo', 'Moreno Moreno', 'bmoreno@yavirac.edu.ec', '0999000001', 'ACTIVO')
            ON CONFLICT DO NOTHING;
        `);
        await queryRunner.query(`
            INSERT INTO public.estudiante (cedula, nombres, apellidos, correo, telefono, estado)
            VALUES ('2250022114', 'Kevin Smith', 'Nivesela Armijos', 'ksanivesela@yavirac.edu.ec', '0988000001', 'ACTIVO')
            ON CONFLICT DO NOTHING;
        `);
        await queryRunner.query(`
            INSERT INTO public.matricula (id_estudiante, id_periodo, id_carrera, fecha_matricula, tipo_matricula, estado)
            SELECT (SELECT id_estudiante FROM public.estudiante WHERE cedula = '2250022114'),
                   (SELECT id_periodo FROM public.periodo_academico WHERE codigo = '2026-1P'),
                   (SELECT id_carrera FROM public.carrera WHERE codigo = 'DS-01'),
                   '2026-04-01', 'ORDINARIA', 'ACTIVA'
            ON CONFLICT DO NOTHING;
        `);
        await queryRunner.query(`
            INSERT INTO public.jornada (nombre, estado) VALUES ('INTENSIVA', 'ACTIVO') ON CONFLICT DO NOTHING;
        `);
        await queryRunner.query(`
            INSERT INTO public.paralelo (nombre, estado) VALUES ('B', 'ACTIVO') ON CONFLICT DO NOTHING;
        `);
        await queryRunner.query(`
            INSERT INTO public.asignatura (id_nivel, codigo, nombre, horas, creditos, estado)
            SELECT id_nivel, 'PPP-501', 'Practicas Pre Profesionales V', 400, 10, 'ACTIVO'
            FROM public.nivel WHERE nombre = 'Quinto Semestre'
            ON CONFLICT DO NOTHING;
        `);
        await queryRunner.query(`
            INSERT INTO public.periodo_carrera (id_periodo, id_carrera, fecha_inicio, fecha_fin, estado)
            SELECT (SELECT id_periodo FROM public.periodo_academico WHERE codigo = '2026-1P'),
                   (SELECT id_carrera FROM public.carrera WHERE codigo = 'DS-01'),
                   '2026-04-01', '2026-08-30', 'ACTIVO'
            ON CONFLICT DO NOTHING;
        `);
        await queryRunner.query(`
            INSERT INTO public.oferta_asignatura (id_periodo_carrera, id_asignatura, id_docente, id_jornada, id_paralelo, cupos, horas_semanales, estado)
            SELECT (SELECT id_periodo_carrera FROM public.periodo_carrera LIMIT 1),
                   (SELECT id_asignatura FROM public.asignatura WHERE codigo = 'PPP-501'),
                   (SELECT id_docente FROM public.docente WHERE cedula = '1803980844'),
                   (SELECT id_jornada FROM public.jornada WHERE nombre = 'INTENSIVA'),
                   (SELECT id_paralelo FROM public.paralelo WHERE nombre = 'B'),
                   40, 8, 'ACTIVO'
            ON CONFLICT DO NOTHING;
        `);
        await queryRunner.query(`
            INSERT INTO public.matricula_detalle (id_matricula, id_oferta_asignatura, nota_ap1, estado)
            SELECT (SELECT id_matricula FROM public.matricula LIMIT 1),
                   (SELECT id_oferta_asignatura FROM public.oferta_asignatura LIMIT 1),
                   9.5, 'CURSANDO'
            ON CONFLICT DO NOTHING;
        `);

        // 2. Empresa y tutor empresarial (columnas reales: sin telefono/correo en empresa)
        await queryRunner.query(`
            INSERT INTO public.empresa (ruc, razon_social, direccion, estado)
            VALUES ('179001', 'TechCorp S.A.', 'Av. Amazonas N34-451, Quito', 'ACTIVO')
            ON CONFLICT DO NOTHING;
        `);
        await queryRunner.query(`
            INSERT INTO public.tutor_empresarial (id_empresa, nombres, apellidos, cargo, correo, estado)
            SELECT (SELECT id_empresa FROM public.empresa WHERE ruc = '179001'),
                   'Roberto', 'Gomez', 'Jefe de Desarrollo', 'rgomez@techcorp.ec', 'ACTIVO'
            ON CONFLICT DO NOTHING;
        `);

        // 3. Cadena de Fase Practica (nombres reales: practica_estudiante, registro_diario_practica)
        await queryRunner.query(`
            INSERT INTO public.practica_estudiante (id_periodo, id_matricula_detalle, id_empresa, id_tutor_empresarial, id_docente, total_horas_requeridas, total_horas_cumplidas, estado)
            SELECT (SELECT id_periodo FROM public.periodo_academico WHERE codigo = '2026-1P'),
                   (SELECT id_matricula_detalle FROM public.matricula_detalle LIMIT 1),
                   (SELECT id_empresa FROM public.empresa WHERE ruc = '179001'),
                   (SELECT id_tutor_empresarial FROM public.tutor_empresarial LIMIT 1),
                   (SELECT id_docente FROM public.docente WHERE cedula = '1803980844'),
                   400, 40, 'EN_CURSO';
        `);
        await queryRunner.query(`
            INSERT INTO public.registro_diario_practica (id_practica, fecha, hora_ingreso, hora_salida_almuerzo, hora_regreso_almuerzo, hora_salida, firma_estudiante)
            SELECT (SELECT id_practica FROM public.practica_estudiante LIMIT 1),
                   '2026-05-02', '08:00', '12:00', '13:00', '17:00', TRUE;
        `);
        await queryRunner.query(`
            INSERT INTO public.informe_aprendizaje (id_practica, reflexion_aprendizaje, observaciones_empresa)
            SELECT (SELECT id_practica FROM public.practica_estudiante LIMIT 1),
                   'Aprendi a trabajar con APIs REST y bases de datos relacionales.',
                   'Buen desempeno, cumple horarios.';
        `);
        await queryRunner.query(`
            INSERT INTO public.bitacora_semanal (id_informe, semana, fecha_inicio_semana, fecha_fin_semana, puesto_aprendizaje, actividades_realizadas, actividades_autonomas)
            SELECT (SELECT id_informe FROM public.informe_aprendizaje LIMIT 1), 1, '2026-05-01', '2026-05-07',
                   'Backend', 'Configuracion de entorno de desarrollo y analisis de requerimientos.', 'Investigacion de arquitectura hexagonal';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM public.bitacora_semanal;`);
        await queryRunner.query(`DELETE FROM public.informe_aprendizaje;`);
        await queryRunner.query(`DELETE FROM public.registro_diario_practica;`);
        await queryRunner.query(`DELETE FROM public.practica_estudiante;`);
        await queryRunner.query(`DELETE FROM public.tutor_empresarial;`);
        await queryRunner.query(`DELETE FROM public.empresa WHERE ruc = '179001';`);
        await queryRunner.query(`DELETE FROM public.matricula_detalle;`);
        await queryRunner.query(`DELETE FROM public.oferta_asignatura;`);
        await queryRunner.query(`DELETE FROM public.periodo_carrera;`);
        await queryRunner.query(`DELETE FROM public.asignatura WHERE codigo = 'PPP-501';`);
        await queryRunner.query(`DELETE FROM public.paralelo WHERE nombre = 'B';`);
        await queryRunner.query(`DELETE FROM public.jornada WHERE nombre = 'INTENSIVA';`);
        await queryRunner.query(`DELETE FROM public.matricula;`);
        await queryRunner.query(`DELETE FROM public.estudiante WHERE cedula = '2250022114';`);
        await queryRunner.query(`DELETE FROM public.docente WHERE cedula = '1803980844';`);
        await queryRunner.query(`DELETE FROM public.periodo_academico WHERE codigo = '2026-1P';`);
        await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'Quinto Semestre';`);
        await queryRunner.query(`DELETE FROM public.carrera WHERE codigo = 'DS-01';`);
    }
}

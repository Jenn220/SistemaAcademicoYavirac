import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Datos de prueba para verificar el filtro por rol de GET /practicas y la
 * pantalla de Asignaciones (COORDINADOR asigna docente/tutor por
 * estudiante):
 *
 * - Estudiante 3 (Pedro) queda con el MISMO docente que el estudiante 1
 *   (Byron Moreno) — sirve para confirmar que ese docente ve a los DOS.
 * - Estudiante 4 (Sofía) queda con un docente DISTINTO (Docente Prueba) —
 *   sirve para confirmar que ese docente NO ve a los otros tres.
 * - Se agrega un segundo tutor empresarial (Laura, en Empresa XYZ) para
 *   poder probar el aislamiento por empresa de TUTOR_EMPRESARIAL, y de
 *   paso se corrige un desajuste que ya existía: la práctica del
 *   estudiante 1 tenía id_empresa = Empresa XYZ pero un tutor cuya propia
 *   empresa era TechCorp (nunca se habían cruzado ambos campos hasta
 *   ahora, que la pantalla de Asignaciones empezó a derivar id_empresa
 *   directamente del tutor elegido).
 */
export class SeedMasEstudiantesYAsignaciones1785320000000 implements MigrationInterface {
  name = 'SeedMasEstudiantesYAsignaciones1785320000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // --- Segundo tutor empresarial, en Empresa XYZ ---
    await queryRunner.query(`
      INSERT INTO public.tutor_empresarial (id_empresa, nombres, apellidos, cargo, correo, estado)
      SELECT (SELECT id_empresa FROM public.empresa WHERE ruc = '1790000000001'),
             'Laura', 'Chávez', 'Coordinadora de Talento', 'laura@empresaxyz.com', 'ACTIVO'
      ON CONFLICT DO NOTHING;
    `);

    await queryRunner.query(`
      INSERT INTO public.usuario (correo, password_hash, id_empresa, debe_cambiar_password, bloqueado, intentos_fallidos, estado)
      SELECT 'laura@empresaxyz.com',
             '$2a$10$qtzW2ox1tH/P7f32NPTs4uNq5GxfYzpEKiUDLj9GOA8C8D3ft0i8q',
             (SELECT id_empresa FROM public.empresa WHERE ruc = '1790000000001'),
             false, false, 0, 'ACTIVO'
      ON CONFLICT DO NOTHING;
    `);

    await queryRunner.query(`
      INSERT INTO public.usuario_rol (id_usuario, id_rol)
      SELECT (SELECT id_usuario FROM public.usuario WHERE correo = 'laura@empresaxyz.com'),
             (SELECT id_rol FROM public.rol WHERE nombre = 'TUTOR_EMPRESARIAL')
      ON CONFLICT DO NOTHING;
    `);

    // --- Estudiante 3: Pedro, mismo docente que el estudiante 1 ---
    await queryRunner.query(`
      INSERT INTO public.estudiante (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1752345678', 'Pedro Andrés', 'Ramírez López', 'estudiante3@yavirac.edu.ec', '0987654322', 'ACTIVO')
      ON CONFLICT DO NOTHING;
    `);

    await queryRunner.query(`
      INSERT INTO public.usuario (correo, password_hash, id_estudiante, debe_cambiar_password, bloqueado, intentos_fallidos, estado)
      SELECT 'estudiante3@yavirac.edu.ec',
             '$2a$10$qtzW2ox1tH/P7f32NPTs4uNq5GxfYzpEKiUDLj9GOA8C8D3ft0i8q',
             (SELECT id_estudiante FROM public.estudiante WHERE cedula = '1752345678'),
             false, false, 0, 'ACTIVO'
      ON CONFLICT DO NOTHING;
    `);

    await queryRunner.query(`
      INSERT INTO public.usuario_rol (id_usuario, id_rol)
      SELECT (SELECT id_usuario FROM public.usuario WHERE correo = 'estudiante3@yavirac.edu.ec'),
             (SELECT id_rol FROM public.rol WHERE nombre = 'ESTUDIANTE')
      ON CONFLICT DO NOTHING;
    `);

    await queryRunner.query(`
      INSERT INTO public.matricula (id_estudiante, id_periodo, id_carrera, fecha_matricula, tipo_matricula, estado)
      SELECT (SELECT id_estudiante FROM public.estudiante WHERE cedula = '1752345678'),
             (SELECT id_periodo FROM public.periodo_academico WHERE codigo = '2026-1P'),
             (SELECT id_carrera FROM public.carrera WHERE codigo = 'DS-01'),
             '2026-04-01', 'ORDINARIA', 'ACTIVA'
      ON CONFLICT DO NOTHING;
    `);

    await queryRunner.query(`
      INSERT INTO public.matricula_detalle (id_matricula, id_oferta_asignatura, estado)
      SELECT (SELECT m.id_matricula FROM public.matricula m
              JOIN public.estudiante e ON e.id_estudiante = m.id_estudiante
              WHERE e.cedula = '1752345678'),
             (SELECT id_oferta_asignatura FROM public.oferta_asignatura LIMIT 1),
             'CURSANDO'
      ON CONFLICT DO NOTHING;
    `);

    await queryRunner.query(`
      INSERT INTO public.practica_estudiante (id_periodo, id_matricula_detalle, id_empresa, id_tutor_empresarial, id_docente, total_horas_requeridas, total_horas_cumplidas, estado)
      SELECT (SELECT id_periodo FROM public.periodo_academico WHERE codigo = '2026-1P'),
             (SELECT md.id_matricula_detalle FROM public.matricula_detalle md
              JOIN public.matricula m ON m.id_matricula = md.id_matricula
              JOIN public.estudiante e ON e.id_estudiante = m.id_estudiante
              WHERE e.cedula = '1752345678'),
             (SELECT id_empresa FROM public.empresa WHERE ruc = '1790000000001'),
             (SELECT id_tutor_empresarial FROM public.tutor_empresarial WHERE correo = 'laura@empresaxyz.com'),
             (SELECT id_docente FROM public.docente WHERE cedula = '1803980844'),
             400, 60, 'EN_CURSO';
    `);

    // --- Estudiante 4: Sofía, docente distinto (Docente Prueba) ---
    await queryRunner.query(`
      INSERT INTO public.estudiante (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1753456789', 'Sofía Alejandra', 'Mendoza Ruiz', 'estudiante4@yavirac.edu.ec', '0987654323', 'ACTIVO')
      ON CONFLICT DO NOTHING;
    `);

    await queryRunner.query(`
      INSERT INTO public.usuario (correo, password_hash, id_estudiante, debe_cambiar_password, bloqueado, intentos_fallidos, estado)
      SELECT 'estudiante4@yavirac.edu.ec',
             '$2a$10$qtzW2ox1tH/P7f32NPTs4uNq5GxfYzpEKiUDLj9GOA8C8D3ft0i8q',
             (SELECT id_estudiante FROM public.estudiante WHERE cedula = '1753456789'),
             false, false, 0, 'ACTIVO'
      ON CONFLICT DO NOTHING;
    `);

    await queryRunner.query(`
      INSERT INTO public.usuario_rol (id_usuario, id_rol)
      SELECT (SELECT id_usuario FROM public.usuario WHERE correo = 'estudiante4@yavirac.edu.ec'),
             (SELECT id_rol FROM public.rol WHERE nombre = 'ESTUDIANTE')
      ON CONFLICT DO NOTHING;
    `);

    await queryRunner.query(`
      INSERT INTO public.matricula (id_estudiante, id_periodo, id_carrera, fecha_matricula, tipo_matricula, estado)
      SELECT (SELECT id_estudiante FROM public.estudiante WHERE cedula = '1753456789'),
             (SELECT id_periodo FROM public.periodo_academico WHERE codigo = '2026-1P'),
             (SELECT id_carrera FROM public.carrera WHERE codigo = 'DS-01'),
             '2026-04-01', 'ORDINARIA', 'ACTIVA'
      ON CONFLICT DO NOTHING;
    `);

    await queryRunner.query(`
      INSERT INTO public.matricula_detalle (id_matricula, id_oferta_asignatura, estado)
      SELECT (SELECT m.id_matricula FROM public.matricula m
              JOIN public.estudiante e ON e.id_estudiante = m.id_estudiante
              WHERE e.cedula = '1753456789'),
             (SELECT id_oferta_asignatura FROM public.oferta_asignatura LIMIT 1),
             'CURSANDO'
      ON CONFLICT DO NOTHING;
    `);

    await queryRunner.query(`
      INSERT INTO public.practica_estudiante (id_periodo, id_matricula_detalle, id_empresa, id_tutor_empresarial, id_docente, total_horas_requeridas, total_horas_cumplidas, estado)
      SELECT (SELECT id_periodo FROM public.periodo_academico WHERE codigo = '2026-1P'),
             (SELECT md.id_matricula_detalle FROM public.matricula_detalle md
              JOIN public.matricula m ON m.id_matricula = md.id_matricula
              JOIN public.estudiante e ON e.id_estudiante = m.id_estudiante
              WHERE e.cedula = '1753456789'),
             (SELECT id_empresa FROM public.empresa WHERE ruc = '179001'),
             (SELECT id_tutor_empresarial FROM public.tutor_empresarial WHERE correo = 'rgomez@techcorp.ec'),
             (SELECT id_docente FROM public.docente WHERE cedula = '1750000999'),
             400, 20, 'EN_CURSO';
    `);

    // --- Corrige el desajuste preexistente de la práctica del estudiante 1:
    // tenía id_empresa = Empresa XYZ con un tutor de TechCorp. Se reasigna
    // a Laura (tutor real de Empresa XYZ) para que ambos campos coincidan.
    await queryRunner.query(`
      UPDATE public.practica_estudiante
      SET id_tutor_empresarial = (SELECT id_tutor_empresarial FROM public.tutor_empresarial WHERE correo = 'laura@empresaxyz.com')
      WHERE id_matricula_detalle IN (
        SELECT md.id_matricula_detalle FROM public.matricula_detalle md
        JOIN public.matricula m ON m.id_matricula = md.id_matricula
        JOIN public.estudiante e ON e.id_estudiante = m.id_estudiante
        WHERE e.cedula = '2250022114'
      )
      AND id_empresa = (SELECT id_empresa FROM public.empresa WHERE ruc = '1790000000001');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const cedula of ['1752345678', '1753456789']) {
      await queryRunner.query(`
        DELETE FROM public.practica_estudiante
        WHERE id_matricula_detalle IN (
          SELECT md.id_matricula_detalle FROM public.matricula_detalle md
          JOIN public.matricula m ON m.id_matricula = md.id_matricula
          JOIN public.estudiante e ON e.id_estudiante = m.id_estudiante
          WHERE e.cedula = '${cedula}'
        );
      `);
      await queryRunner.query(`
        DELETE FROM public.matricula_detalle
        WHERE id_matricula IN (
          SELECT m.id_matricula FROM public.matricula m
          JOIN public.estudiante e ON e.id_estudiante = m.id_estudiante
          WHERE e.cedula = '${cedula}'
        );
      `);
      await queryRunner.query(`
        DELETE FROM public.matricula
        WHERE id_estudiante = (SELECT id_estudiante FROM public.estudiante WHERE cedula = '${cedula}');
      `);
    }

    await queryRunner.query(`DELETE FROM public.usuario_rol WHERE id_usuario = (SELECT id_usuario FROM public.usuario WHERE correo = 'estudiante3@yavirac.edu.ec');`);
    await queryRunner.query(`DELETE FROM public.usuario_rol WHERE id_usuario = (SELECT id_usuario FROM public.usuario WHERE correo = 'estudiante4@yavirac.edu.ec');`);
    await queryRunner.query(`DELETE FROM public.usuario_rol WHERE id_usuario = (SELECT id_usuario FROM public.usuario WHERE correo = 'laura@empresaxyz.com');`);
    await queryRunner.query(`DELETE FROM public.usuario WHERE correo IN ('estudiante3@yavirac.edu.ec', 'estudiante4@yavirac.edu.ec', 'laura@empresaxyz.com');`);
    await queryRunner.query(`DELETE FROM public.estudiante WHERE cedula IN ('1752345678', '1753456789');`);
    await queryRunner.query(`DELETE FROM public.tutor_empresarial WHERE correo = 'laura@empresaxyz.com';`);
  }
}

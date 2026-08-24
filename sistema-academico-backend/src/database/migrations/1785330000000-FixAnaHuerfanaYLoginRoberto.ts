import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Corrige dos cuentas de prueba que quedaron a medias:
 *
 * 1. ana@empresaxyz.com tenía rol TUTOR_EMPRESARIAL pero su usuario
 *    apuntaba a TechCorp (id_empresa=1) — inconsistente con su propio
 *    correo (dominio empresaxyz.com) — y no existía ninguna fila en
 *    tutor_empresarial ligada a ella, así que no aparecía como opción en
 *    Asignaciones ni tenía ningún estudiante real asignado. Se mueve su
 *    usuario a Empresa XYZ, se crea su registro de persona (tutor_empresarial)
 *    y se le asigna un estudiante nuevo.
 *
 * 2. Roberto Gomez (tutor_empresarial de TechCorp, ya asignado a Sofía)
 *    nunca tuvo una fila en "usuario": estaba en la BD como tutor pero
 *    nadie podía loguearse como él para probar esa asignación. Se le crea
 *    login real con su mismo correo (rgomez@techcorp.ec).
 */
export class FixAnaHuerfanaYLoginRoberto1785330000000 implements MigrationInterface {
  name = 'FixAnaHuerfanaYLoginRoberto1785330000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // --- 1a. Mover a Ana de TechCorp a Empresa XYZ (coincide con su correo) ---
    await queryRunner.query(`
      UPDATE public.usuario
      SET id_empresa = (SELECT id_empresa FROM public.empresa WHERE ruc = '1790000000001')
      WHERE correo = 'ana@empresaxyz.com';
    `);

    // --- 1b. Crear su registro de persona en tutor_empresarial ---
    await queryRunner.query(`
      INSERT INTO public.tutor_empresarial (id_empresa, nombres, apellidos, cargo, correo, estado)
      SELECT (SELECT id_empresa FROM public.empresa WHERE ruc = '1790000000001'),
             'Ana', 'Salinas Ortiz', 'Gerente de Talento Humano', 'ana@empresaxyz.com', 'ACTIVO'
      ON CONFLICT DO NOTHING;
    `);

    // --- 1c. Estudiante nuevo asignado a Ana, en Empresa XYZ ---
    await queryRunner.query(`
      INSERT INTO public.estudiante (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1754567890', 'Diego Alejandro', 'Vásquez Cruz', 'estudiante5@yavirac.edu.ec', '0987654324', 'ACTIVO')
      ON CONFLICT DO NOTHING;
    `);

    await queryRunner.query(`
      INSERT INTO public.usuario (correo, password_hash, id_estudiante, debe_cambiar_password, bloqueado, intentos_fallidos, estado)
      SELECT 'estudiante5@yavirac.edu.ec',
             '$2a$10$qtzW2ox1tH/P7f32NPTs4uNq5GxfYzpEKiUDLj9GOA8C8D3ft0i8q',
             (SELECT id_estudiante FROM public.estudiante WHERE cedula = '1754567890'),
             false, false, 0, 'ACTIVO'
      ON CONFLICT DO NOTHING;
    `);

    await queryRunner.query(`
      INSERT INTO public.usuario_rol (id_usuario, id_rol)
      SELECT (SELECT id_usuario FROM public.usuario WHERE correo = 'estudiante5@yavirac.edu.ec'),
             (SELECT id_rol FROM public.rol WHERE nombre = 'ESTUDIANTE')
      ON CONFLICT DO NOTHING;
    `);

    await queryRunner.query(`
      INSERT INTO public.matricula (id_estudiante, id_periodo, id_carrera, fecha_matricula, tipo_matricula, estado)
      SELECT (SELECT id_estudiante FROM public.estudiante WHERE cedula = '1754567890'),
             (SELECT id_periodo FROM public.periodo_academico WHERE codigo = '2026-1P'),
             (SELECT id_carrera FROM public.carrera WHERE codigo = 'DS-01'),
             '2026-04-01', 'ORDINARIA', 'ACTIVA'
      ON CONFLICT DO NOTHING;
    `);

    await queryRunner.query(`
      INSERT INTO public.matricula_detalle (id_matricula, id_oferta_asignatura, estado)
      SELECT (SELECT m.id_matricula FROM public.matricula m
              JOIN public.estudiante e ON e.id_estudiante = m.id_estudiante
              WHERE e.cedula = '1754567890'),
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
              WHERE e.cedula = '1754567890'),
             (SELECT id_empresa FROM public.empresa WHERE ruc = '1790000000001'),
             (SELECT id_tutor_empresarial FROM public.tutor_empresarial WHERE correo = 'ana@empresaxyz.com'),
             (SELECT id_docente FROM public.docente WHERE cedula = '1750000199'),
             400, 10, 'EN_CURSO';
    `);

    // --- 2. Login real para Roberto Gomez (tutor de Sofía en TechCorp) ---
    await queryRunner.query(`
      INSERT INTO public.usuario (correo, password_hash, id_empresa, debe_cambiar_password, bloqueado, intentos_fallidos, estado)
      SELECT 'rgomez@techcorp.ec',
             '$2a$10$qtzW2ox1tH/P7f32NPTs4uNq5GxfYzpEKiUDLj9GOA8C8D3ft0i8q',
             (SELECT id_empresa FROM public.empresa WHERE ruc = '179001'),
             false, false, 0, 'ACTIVO'
      ON CONFLICT DO NOTHING;
    `);

    await queryRunner.query(`
      INSERT INTO public.usuario_rol (id_usuario, id_rol)
      SELECT (SELECT id_usuario FROM public.usuario WHERE correo = 'rgomez@techcorp.ec'),
             (SELECT id_rol FROM public.rol WHERE nombre = 'TUTOR_EMPRESARIAL')
      ON CONFLICT DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM public.usuario_rol WHERE id_usuario = (SELECT id_usuario FROM public.usuario WHERE correo = 'rgomez@techcorp.ec');`);
    await queryRunner.query(`DELETE FROM public.usuario WHERE correo = 'rgomez@techcorp.ec';`);

    await queryRunner.query(`
      DELETE FROM public.practica_estudiante
      WHERE id_matricula_detalle IN (
        SELECT md.id_matricula_detalle FROM public.matricula_detalle md
        JOIN public.matricula m ON m.id_matricula = md.id_matricula
        JOIN public.estudiante e ON e.id_estudiante = m.id_estudiante
        WHERE e.cedula = '1754567890'
      );
    `);
    await queryRunner.query(`
      DELETE FROM public.matricula_detalle
      WHERE id_matricula IN (
        SELECT m.id_matricula FROM public.matricula m
        JOIN public.estudiante e ON e.id_estudiante = m.id_estudiante
        WHERE e.cedula = '1754567890'
      );
    `);
    await queryRunner.query(`DELETE FROM public.matricula WHERE id_estudiante = (SELECT id_estudiante FROM public.estudiante WHERE cedula = '1754567890');`);
    await queryRunner.query(`DELETE FROM public.usuario_rol WHERE id_usuario = (SELECT id_usuario FROM public.usuario WHERE correo = 'estudiante5@yavirac.edu.ec');`);
    await queryRunner.query(`DELETE FROM public.usuario WHERE correo = 'estudiante5@yavirac.edu.ec';`);
    await queryRunner.query(`DELETE FROM public.estudiante WHERE cedula = '1754567890';`);

    await queryRunner.query(`DELETE FROM public.tutor_empresarial WHERE correo = 'ana@empresaxyz.com';`);
    await queryRunner.query(`
      UPDATE public.usuario
      SET id_empresa = (SELECT id_empresa FROM public.empresa WHERE ruc = '179001')
      WHERE correo = 'ana@empresaxyz.com';
    `);
  }
}

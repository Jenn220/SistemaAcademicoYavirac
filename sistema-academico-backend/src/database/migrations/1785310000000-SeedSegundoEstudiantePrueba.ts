import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Segundo estudiante de prueba para poder probar el selector de práctica
 * (fase-practica/plan-formacion) con más de una tarjeta — antes de esta
 * migración solo existía practica_estudiante #1, así que el selector nunca
 * se había ejercitado con una lista real de varios estudiantes.
 *
 * Reutiliza la estructura académica ya sembrada por
 * CreateFasePractica-DatosPrueba (carrera DS-01, periodo 2026-1P, asignatura
 * PPP-501, etc.) — solo agrega el estudiante, su matrícula y su práctica.
 * A propósito usa empresa 'TechCorp S.A.' (la del tutor Roberto Gomez, que
 * SÍ pertenece a esa empresa) y el docente 'Ronni Villa' (DOCENTE +
 * COORDINADOR) para poder probar ambos roles contra un vínculo real.
 */
export class SeedSegundoEstudiantePrueba1785310000000 implements MigrationInterface {
  name = 'SeedSegundoEstudiantePrueba1785310000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO public.estudiante (cedula, nombres, apellidos, correo, telefono, estado)
      VALUES ('1751234567', 'María Fernanda', 'Torres Salazar', 'estudiante2@yavirac.edu.ec', '0987654321', 'ACTIVO')
      ON CONFLICT DO NOTHING;
    `);

    // Password real: "123456" (mismo hash de prueba usado por el resto de
    // cuentas del módulo — ver notas de la sesión).
    await queryRunner.query(`
      INSERT INTO public.usuario (correo, password_hash, id_estudiante, debe_cambiar_password, bloqueado, intentos_fallidos, estado)
      SELECT 'estudiante2@yavirac.edu.ec',
             '$2a$10$qtzW2ox1tH/P7f32NPTs4uNq5GxfYzpEKiUDLj9GOA8C8D3ft0i8q',
             (SELECT id_estudiante FROM public.estudiante WHERE cedula = '1751234567'),
             false, false, 0, 'ACTIVO'
      ON CONFLICT DO NOTHING;
    `);

    await queryRunner.query(`
      INSERT INTO public.usuario_rol (id_usuario, id_rol)
      SELECT (SELECT id_usuario FROM public.usuario WHERE correo = 'estudiante2@yavirac.edu.ec'),
             (SELECT id_rol FROM public.rol WHERE nombre = 'ESTUDIANTE')
      ON CONFLICT DO NOTHING;
    `);

    await queryRunner.query(`
      INSERT INTO public.matricula (id_estudiante, id_periodo, id_carrera, fecha_matricula, tipo_matricula, estado)
      SELECT (SELECT id_estudiante FROM public.estudiante WHERE cedula = '1751234567'),
             (SELECT id_periodo FROM public.periodo_academico WHERE codigo = '2026-1P'),
             (SELECT id_carrera FROM public.carrera WHERE codigo = 'DS-01'),
             '2026-04-01', 'ORDINARIA', 'ACTIVA'
      ON CONFLICT DO NOTHING;
    `);

    await queryRunner.query(`
      INSERT INTO public.matricula_detalle (id_matricula, id_oferta_asignatura, estado)
      SELECT (SELECT m.id_matricula FROM public.matricula m
              JOIN public.estudiante e ON e.id_estudiante = m.id_estudiante
              WHERE e.cedula = '1751234567'),
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
              WHERE e.cedula = '1751234567'),
             (SELECT id_empresa FROM public.empresa WHERE ruc = '179001'),
             (SELECT id_tutor_empresarial FROM public.tutor_empresarial WHERE correo = 'rgomez@techcorp.ec'),
             (SELECT id_docente FROM public.docente WHERE cedula = '1750000199'),
             400, 80, 'EN_CURSO';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM public.practica_estudiante
      WHERE id_matricula_detalle IN (
        SELECT md.id_matricula_detalle FROM public.matricula_detalle md
        JOIN public.matricula m ON m.id_matricula = md.id_matricula
        JOIN public.estudiante e ON e.id_estudiante = m.id_estudiante
        WHERE e.cedula = '1751234567'
      );
    `);
    await queryRunner.query(`
      DELETE FROM public.matricula_detalle
      WHERE id_matricula IN (
        SELECT m.id_matricula FROM public.matricula m
        JOIN public.estudiante e ON e.id_estudiante = m.id_estudiante
        WHERE e.cedula = '1751234567'
      );
    `);
    await queryRunner.query(`
      DELETE FROM public.matricula
      WHERE id_estudiante = (SELECT id_estudiante FROM public.estudiante WHERE cedula = '1751234567');
    `);
    await queryRunner.query(`
      DELETE FROM public.usuario_rol
      WHERE id_usuario = (SELECT id_usuario FROM public.usuario WHERE correo = 'estudiante2@yavirac.edu.ec');
    `);
    await queryRunner.query(`DELETE FROM public.usuario WHERE correo = 'estudiante2@yavirac.edu.ec';`);
    await queryRunner.query(`DELETE FROM public.estudiante WHERE cedula = '1751234567';`);
  }
}

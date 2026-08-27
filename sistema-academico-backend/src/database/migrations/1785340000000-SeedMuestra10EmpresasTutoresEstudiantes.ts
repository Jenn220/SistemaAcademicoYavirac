import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración de datos de prueba para validación de FKs desde el frontend.
 *
 * Propósito: verificar que cada rol (estudiante, tutor_empresarial, docente)
 * trae exactamente los datos de su empresa, tutor y estudiante asignado,
 * y que no mezcla datos de otras prácticas.
 *
 * Estructura inyectada:
 *   10 empresas distintas (RUCs secuenciales)
 *   10 tutores empresariales (1 por empresa)
 *   10 estudiantes (1 por empresa/tutor)
 *   10 prácticas con cadena FK completa:
 *     practica_estudiante → empresa → tutores_empresarial → matricula_detalle → estudiante
 *   Usuarios y roles para cada tutor y estudiante (password: "123456")
 *
 * Nota: se reutilizan la carrera DS-01, periodo 2026-1P y la oferta_asignatura existente.
 *       se usan docentes existentes del seed original (Byron Moreno como coordinador)
 *       y 2 docentes adicionales para variar la asignación.
 */
export class SeedMuestra10EmpresasTutoresEstudiantes1785340000000 implements MigrationInterface {
  name = 'SeedMuestra10EmpresasTutoresEstudiantes1785340000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const pwdHash = '$2a$10$qtzW2ox1tH/P7f32NPTs4uNq5GxfYzpEKiUDLj9GOA8C8D3ft0i8q';

    const empresas = [
      { ruc: '1790100000001', razon: 'Empresa Tecnológica Alpha S.A.', dir: 'Av. Alpha 100, Quito', tel: '0210000001', correo: 'contacto@alpha.ec', rep: 'María Vega' },
      { ruc: '1790100000002', razon: 'Ingenieria Beta Cia Ltda', dir: 'Calle Beta 200, Guayaquil', tel: '0420000002', correo: 'info@beta.ec', rep: 'Carlos Pérez' },
      { ruc: '1790100000003', razon: 'Soluciones Gamma S.A.', dir: 'Av. Gamma 300, Cuenca', tel: '0730000003', correo: 'admin@gamma.ec', rep: 'Ana Lucía Torres' },
      { ruc: '1790100000004', razon: 'Delta Consultora SAC', dir: 'Av. Delta 400, Ambato', tel: '0340000004', correo: 'contacto@delta.ec', rep: 'Luis Fernández' },
      { ruc: '1790100000005', razon: 'Epsilon Sistemas SRL', dir: 'Calle Epsilon 500, Santo Domingo', tel: '0250000005', correo: 'info@epsilon.ec', rep: 'Ricardo Gómez' },
      { ruc: '1790100000006', razon: 'Omega Digital S.A.', dir: 'Av. Omega 600, Esmeraldas', tel: '0660000006', correo: 'contacto@omega.ec', rep: 'Patricia Ruiz' },
      { ruc: '1790100000007', razon: 'NovaTech Machala Ltda', dir: 'Av. Nova 700, Machala', tel: '0770000007', correo: 'info@novatech.ec', rep: 'Fernando Castillo' },
      { ruc: '1790100000008', razon: 'DigitalCorp Manta S.A.', dir: 'Av. Digital 800, Manta', tel: '0580000008', correo: 'contacto@digitalcorp.ec', rep: 'Sofía Medina' },
      { ruc: '1790100000009', razon: 'TechVentura Guaranda SRL', dir: 'Av. Tech 900, Guaranda', tel: '0390000009', correo: 'info@techventura.ec', rep: 'Diego Ramírez' },
      { ruc: '1790100000010', razon: 'ByteForce Riobamba S.A.', dir: 'Av. Byte 1000, Riobamba', tel: '0320000010', correo: 'contacto@byteforce.ec', rep: 'Camila Sánchez' },
    ];

    const tutores = [
      { nombre: 'Andrea', apellido: 'López Chávez', cargo: 'Gerente de Talento', correo: 'andrea.lopez@alpha.ec' },
      { nombre: 'Jorge', apellido: 'Moreno Terán', cargo: 'Director de Operaciones', correo: 'jorge.moreno@beta.ec' },
      { nombre: 'Liliana', apellido: 'Vargas Peralta', cargo: 'Coordinadora de RRHH', correo: 'liliana.vargas@gamma.ec' },
      { nombre: 'Enrique', apellido: 'Salinas Córdova', cargo: 'Jefe de Desarrollo', correo: 'enrique.salinas@delta.ec' },
      { nombre: 'Mónica', apellido: 'Herrera Ibarra', cargo: 'Directora de Proyectos', correo: 'monica.herrera@epsilon.ec' },
      { nombre: 'Pablo', apellido: 'Donoso Méndez', cargo: 'Supervisor de Prácticas', correo: 'pablo.donoso@omega.ec' },
      { nombre: 'Gabriela', apellido: 'Pazmiño Alcívar', cargo: 'Jefa de Talento', correo: 'gabriela.pazmino@novatech.ec' },
      { nombre: 'Sergio', apellido: 'Guamán Chávez', cargo: 'Coordinador de Capacitación', correo: 'sergio.guaman@digitalcorp.ec' },
      { nombre: 'Verónica', apellido: 'Almeida Borja', cargo: 'Gerente de Talento', correo: 'veronica.almeida@techventura.ec' },
      { nombre: 'Ricardo', apellido: 'Chávez Velasco', cargo: 'Director de Recursos Humanos', correo: 'ricardo.chavez@byteforce.ec' },
    ];

    const estudiantes = [
      { cedula: '1760000001', nombres: 'Estudiante', apellido: 'Uno', correo: 'estu1@yavirac.edu.ec', tel: '0980000001' },
      { cedula: '1760000002', nombres: 'Estudiante', apellido: 'Dos', correo: 'estu2@yavirac.edu.ec', tel: '0980000002' },
      { cedula: '1760000003', nombres: 'Estudiante', apellido: 'Tres', correo: 'estu3@yavirac.edu.ec', tel: '0980000003' },
      { cedula: '1760000004', nombres: 'Estudiante', apellido: 'Cuatro', correo: 'estu4@yavirac.edu.ec', tel: '0980000004' },
      { cedula: '1760000005', nombres: 'Estudiante', apellido: 'Cinco', correo: 'estu5@yavirac.edu.ec', tel: '0980000005' },
      { cedula: '1760000006', nombres: 'Estudiante', apellido: 'Seis', correo: 'estu6@yavirac.edu.ec', tel: '0980000006' },
      { cedula: '1760000007', nombres: 'Estudiante', apellido: 'Siete', correo: 'estu7@yavirac.edu.ec', tel: '0980000007' },
      { cedula: '1760000008', nombres: 'Estudiante', apellido: 'Ocho', correo: 'estu8@yavirac.edu.ec', tel: '0980000008' },
      { cedula: '1760000009', nombres: 'Estudiante', apellido: 'Nueve', correo: 'estu9@yavirac.edu.ec', tel: '0980000009' },
      { cedula: '1760000010', nombres: 'Estudiante', apellido: 'Diez', correo: 'estu10@yavirac.edu.ec', tel: '0980000010' },
    ];

    const docentesRef = [
      { cedula: '1803980844', rol: 'DOCENTE' },
      { cedula: '1750000199', rol: 'DOCENTE' },
    ];

    for (let i = 0; i < 10; i++) {
      const emp = empresas[i];
      const tut = tutores[i];
      const est = estudiantes[i];
      const docRef = docentesRef[i % docentesRef.length];
      const tutCorreo = tut.correo;
      const estCorreo = est.correo;

      await queryRunner.query(`INSERT INTO public.empresa (ruc, razon_social, direccion, estado, telefono, correo, representante_legal)
        VALUES ('${emp.ruc}', '${emp.razon}', '${emp.dir}', 'ACTIVO', '${emp.tel}', '${emp.correo}', '${emp.rep}')
        ON CONFLICT DO NOTHING;`);

      await queryRunner.query(`INSERT INTO public.tutor_empresarial (id_empresa, nombres, apellidos, cargo, correo, estado)
        SELECT (SELECT id_empresa FROM public.empresa WHERE ruc = '${emp.ruc}'),
               '${tut.nombre}', '${tut.apellido}', '${tut.cargo}', '${tut.correo}', 'ACTIVO'
        ON CONFLICT DO NOTHING;`);

      await queryRunner.query(`INSERT INTO public.usuario (correo, password_hash, id_empresa, debe_cambiar_password, bloqueado, intentos_fallidos, estado)
        SELECT '${tutCorreo}', '${pwdHash}',
               (SELECT id_empresa FROM public.empresa WHERE ruc = '${emp.ruc}'),
               false, false, 0, 'ACTIVO'
        ON CONFLICT (correo) DO NOTHING;`);

      await queryRunner.query(`INSERT INTO public.usuario_rol (id_usuario, id_rol)
        SELECT (SELECT id_usuario FROM public.usuario WHERE correo = '${tutCorreo}'),
               (SELECT id_rol FROM public.rol WHERE nombre = 'TUTOR_EMPRESARIAL')
        ON CONFLICT DO NOTHING;`);

      await queryRunner.query(`INSERT INTO public.estudiante (cedula, nombres, apellidos, correo, telefono, estado)
        VALUES ('${est.cedula}', '${est.nombres}', '${est.apellido}', '${est.correo}', '${est.tel}', 'ACTIVO')
        ON CONFLICT (cedula) DO NOTHING;`);

      await queryRunner.query(`INSERT INTO public.usuario (correo, password_hash, id_estudiante, debe_cambiar_password, bloqueado, intentos_fallidos, estado)
        SELECT '${estCorreo}', '${pwdHash}',
               (SELECT id_estudiante FROM public.estudiante WHERE cedula = '${est.cedula}'),
               false, false, 0, 'ACTIVO'
        ON CONFLICT (correo) DO NOTHING;`);

      await queryRunner.query(`INSERT INTO public.usuario_rol (id_usuario, id_rol)
        SELECT (SELECT id_usuario FROM public.usuario WHERE correo = '${estCorreo}'),
               (SELECT id_rol FROM public.rol WHERE nombre = 'ESTUDIANTE')
        ON CONFLICT DO NOTHING;`);

      await queryRunner.query(`INSERT INTO public.matricula (id_estudiante, id_periodo, id_carrera, fecha_matricula, tipo_matricula, estado)
        SELECT (SELECT id_estudiante FROM public.estudiante WHERE cedula = '${est.cedula}'),
               (SELECT id_periodo FROM public.periodo_academico WHERE codigo = '2026-1P'),
               (SELECT id_carrera FROM public.carrera WHERE codigo = 'DS-01'),
               '2026-04-01', 'ORDINARIA', 'ACTIVA'
        ON CONFLICT DO NOTHING;`);

      await queryRunner.query(`INSERT INTO public.matricula_detalle (id_matricula, id_oferta_asignatura, estado)
        SELECT (SELECT m.id_matricula FROM public.matricula m
                JOIN public.estudiante e ON e.id_estudiante = m.id_estudiante
                WHERE e.cedula = '${est.cedula}'),
               (SELECT id_oferta_asignatura FROM public.oferta_asignatura LIMIT 1),
               'CURSANDO'
        ON CONFLICT DO NOTHING;`);

      await queryRunner.query(`INSERT INTO public.practica_estudiante (id_periodo, id_matricula_detalle, id_empresa, id_tutor_empresarial, id_docente, total_horas_requeridas, total_horas_cumplidas, estado)
        SELECT (SELECT id_periodo FROM public.periodo_academico WHERE codigo = '2026-1P'),
               (SELECT md.id_matricula_detalle FROM public.matricula_detalle md
                JOIN public.matricula m ON m.id_matricula = md.id_matricula
                JOIN public.estudiante e ON e.id_estudiante = m.id_estudiante
                WHERE e.cedula = '${est.cedula}'),
               (SELECT id_empresa FROM public.empresa WHERE ruc = '${emp.ruc}'),
               (SELECT id_tutor_empresarial FROM public.tutor_empresarial WHERE correo = '${tutCorreo}'),
               (SELECT id_docente FROM public.docente WHERE cedula = '${docRef.cedula}'),
               400, 0, 'EN_CURSO'
        ON CONFLICT DO NOTHING;`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const rucs = [
      '1790100000001', '1790100000002', '1790100000003', '1790100000004', '1790100000005',
      '1790100000006', '1790100000007', '1790100000008', '1790100000009', '1790100000010',
    ];

    const estudiantes = [
      '1760000001', '1760000002', '1760000003', '1760000004', '1760000005',
      '1760000006', '1760000007', '1760000008', '1760000009', '1760000010',
    ];

    const correosTutores = [
      'andrea.lopez@alpha.ec', 'jorge.moreno@beta.ec', 'liliana.vargas@gamma.ec',
      'enrique.salinas@delta.ec', 'monica.herrera@epsilon.ec', 'pablo.donoso@omega.ec',
      'gabriela.pazmino@novatech.ec', 'sergio.guaman@digitalcorp.ec',
      'veronica.almeida@techventura.ec', 'ricardo.chavez@byteforce.ec',
    ];

    const correosEstudiantes = [
      'estu1@yavirac.edu.ec', 'estu2@yavirac.edu.ec', 'estu3@yavirac.edu.ec',
      'estu4@yavirac.edu.ec', 'estu5@yavirac.edu.ec', 'estu6@yavirac.edu.ec',
      'estu7@yavirac.edu.ec', 'estu8@yavirac.edu.ec', 'estu9@yavirac.edu.ec',
      'estu10@yavirac.edu.ec',
    ];

    for (const cedula of estudiantes) {
      await queryRunner.query(`
        DELETE FROM public.practica_estudiante
        WHERE id_matricula_detalle IN (
          SELECT md.id_matricula_detalle FROM public.matricula_detalle md
          JOIN public.matricula m ON m.id_matricula = md.id_matricula
          JOIN public.estudiante e ON e.id_estudiante = m.id_estudiante
          WHERE e.cedula = '${cedula}'
        );`);
      await queryRunner.query(`
        DELETE FROM public.matricula_detalle
        WHERE id_matricula IN (
          SELECT m.id_matricula FROM public.matricula m
          JOIN public.estudiante e ON e.id_estudiante = m.id_estudiante
          WHERE e.cedula = '${cedula}'
        );`);
      await queryRunner.query(`
        DELETE FROM public.matricula
        WHERE id_estudiante = (SELECT id_estudiante FROM public.estudiante WHERE cedula = '${cedula}');`);
      await queryRunner.query(`DELETE FROM public.usuario_rol WHERE id_usuario IN (SELECT id_usuario FROM public.usuario WHERE correo IN ('${correosEstudiantes.join("','")}') AND id_estudiante IS NOT NULL);`);
      await queryRunner.query(`DELETE FROM public.usuario WHERE correo IN ('${correosEstudiantes.join("','")}') AND id_estudiante IS NOT NULL;`);
      await queryRunner.query(`DELETE FROM public.estudiante WHERE cedula = '${cedula}';`);
    }

    for (const correo of correosTutores) {
      await queryRunner.query(`DELETE FROM public.usuario_rol WHERE id_usuario = (SELECT id_usuario FROM public.usuario WHERE correo = '${correo}');`);
      await queryRunner.query(`DELETE FROM public.usuario WHERE correo = '${correo}';`);
      await queryRunner.query(`DELETE FROM public.tutor_empresarial WHERE correo = '${correo}';`);
    }

    for (const ruc of rucs) {
      await queryRunner.query(`DELETE FROM public.empresa WHERE ruc = '${ruc}';`);
    }
  }
}
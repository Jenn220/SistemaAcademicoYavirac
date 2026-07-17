import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReporteNotasView1784092361098 implements MigrationInterface {
  name = 'CreateReporteNotasView1784092361098';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
CREATE VIEW public.vw_reporte_notas AS
 SELECT oa.id_oferta_asignatura,
    oa.id_periodo_carrera,
    c.nombre AS carrera,
    n.nombre AS nivel,
    a.nombre AS asignatura,
    p.nombre AS paralelo,
    j.nombre AS jornada,
    (((d.nombres)::text || ' '::text) || (d.apellidos)::text) AS docente,
    e.cedula AS estudiante_cedula,
    (((e.nombres)::text || ' '::text) || (e.apellidos)::text) AS estudiante_nombre,
    md.nota_ap1,
    md.nota_ap2,
    md.nota_supletorio,
    md.nota_final
   FROM (((((((((public.oferta_asignatura oa
     JOIN public.asignatura a ON ((oa.id_asignatura = a.id_asignatura)))
     JOIN public.nivel n ON ((a.id_nivel = n.id_nivel)))
     JOIN public.carrera c ON ((n.id_carrera = c.id_carrera)))
     JOIN public.paralelo p ON ((oa.id_paralelo = p.id_paralelo)))
     JOIN public.jornada j ON ((oa.id_jornada = j.id_jornada)))
     JOIN public.docente d ON ((oa.id_docente = d.id_docente)))
     JOIN public.matricula_detalle md ON ((oa.id_oferta_asignatura = md.id_oferta_asignatura)))
     JOIN public.matricula m ON ((md.id_matricula = m.id_matricula)))
     JOIN public.estudiante e ON ((m.id_estudiante = e.id_estudiante)));
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP VIEW public.vw_reporte_notas`);
  }
}

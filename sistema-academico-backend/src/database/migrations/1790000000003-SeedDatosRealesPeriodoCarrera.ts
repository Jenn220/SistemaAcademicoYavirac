import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * periodo_carrera real para las 12 carreras confirmadas, periodo 2026-1P.
 *
 * Reutiliza el periodo_academico 2026-1P ya existente (creado por
 * CreateFasePractica-DatosPrueba.ts, fechas 2026-04-01/2026-08-30) - no se
 * inventan fechas nuevas, se sigue la misma convencion ya usada en el repo
 * para este mismo periodo.
 *
 * Necesario como FK de oferta_asignatura (que requiere id_periodo_carrera,
 * no id_periodo + id_carrera sueltos).
 *
 * Idempotente via ON CONFLICT (id_periodo, id_carrera) - la tabla SI tiene
 * ese UNIQUE (uk_pc), confirmado contra migrations.zip.
 */
const CODIGOS_CARRERA_REALES = [
  '551013C02-D-1701', // ARTE CULINARIO ECUATORIANO
  'YEC', // CENTRO DE IDIOMAS YAVIRAC
  '550613A01-D-1701', // DESARROLLO DE SOFTWARE
  '550212Q02-P-1701', // DISEÑO DE MODAS
  '550213Z-P-26', // DISEÑO DE MODAS CON NIVEL EQUIVALENTE A TECNOLOGIA SUPERIOR
  '551015B02-D-1701', // GUIA NACIONAL DE TURISMO
  '551015C-D-01', // GUIA NACIONAL DE TURISMO CON NIVEL EQUIVALENTE A TECNOLOGIA SUPERIOR
  'IMPST-01-V', // IMPULSAT V01 VIRTUAL
  '550414G02-P-1701', // MARKETING DIGITAL
  '001776', // TECNOLOGIA EN MARKETING
  '550613A-D-01', // TECNOLOGIA SUPERIOR EN DESARROLLO DE SOFTWARE
  '550414A-P-01', // TECNOLOGIA SUPERIOR EN MARKETING
];

export class SeedDatosRealesPeriodoCarrera1790000000003 implements MigrationInterface {
  name = 'SeedDatosRealesPeriodoCarrera1790000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const codigo of CODIGOS_CARRERA_REALES) {
      await queryRunner.query(
        `INSERT INTO public.periodo_carrera (id_periodo, id_carrera, fecha_inicio, fecha_fin, estado)
         SELECT p.id_periodo, c.id_carrera, '2026-04-01', '2026-08-30', 'ACTIVO'
         FROM public.periodo_academico p, public.carrera c
         WHERE p.codigo = '2026-1P' AND c.codigo = $1
         ON CONFLICT (id_periodo, id_carrera) DO NOTHING;`,
        [codigo],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const codigo of CODIGOS_CARRERA_REALES) {
      await queryRunner.query(
        `DELETE FROM public.periodo_carrera pc
         USING public.periodo_academico p, public.carrera c
         WHERE pc.id_periodo = p.id_periodo AND pc.id_carrera = c.id_carrera
           AND p.codigo = '2026-1P' AND c.codigo = $1;`,
        [codigo],
      );
    }
  }
}

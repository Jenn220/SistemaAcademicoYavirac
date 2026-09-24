import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Crea el periodo_academico 2026-1P (2026-04-01 a 2026-08-30) y su
 * periodo_carrera para las 12 carreras reales.
 *
 * ANTES esta migracion asumia que 2026-1P ya existia (lo creaba
 * CreateFasePractica-DatosPrueba.ts, migracion sintetica eliminada). Ahora
 * es autosuficiente: crea primero el periodo_academico y luego los
 * periodo_carrera, asi no depende de ninguna migracion eliminada.
 *
 * Idempotente: ON CONFLICT DO NOTHING tanto en periodo_academico (codigo)
 * como en periodo_carrera (id_periodo, id_carrera).
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
    // 1. Crear (si no existe) el periodo_academico 2026-1P
    await queryRunner.query(`INSERT INTO public.periodo_academico (codigo, nombre, fecha_inicio, fecha_fin, estado)
      VALUES ('2026-1P', 'Periodo 2026-1P', '2026-04-01', '2026-08-30', 'ACTIVO')
      ON CONFLICT (codigo) DO NOTHING;`);

    // 2. Crear periodo_carrera para cada carrera real
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
    await queryRunner.query(`DELETE FROM public.periodo_academico WHERE codigo = '2026-1P';`);
  }
}
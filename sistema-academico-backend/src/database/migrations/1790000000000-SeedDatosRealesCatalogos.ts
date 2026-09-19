import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Carga de datos reales del SIGA (carreras, niveles, jornadas, paralelos).
 * Fuente: MAESTRO_MATRICULAS, MAESTRO_DE_ASIGNATURAS, MAESTRO_DE_NOTAS (2026-1P).
 * Aditiva e idempotente (ON CONFLICT DO NOTHING) - convive con datos de prueba existentes.
 *
 * EXCLUIDAS a propósito (pendiente código SNIESE / confirmación del Ing. Moreno):
 *   PREPARATEC (+ variantes V02, V02 CMI, Virtual)
 *   TECNOLOGIA SUPERIOR EN CONTROL DE INCENDIOS Y OPERACIONES DE RESCATE
 *   IMPULSAT V01 (no-virtual) + IMPULSAT V01 CMI (¿mismo programa que IMPULSAT V01 VIRTUAL? sin confirmar)
 */
export class SeedDatosRealesCatalogos1790000000000 implements MigrationInterface {
  name = 'SeedDatosRealesCatalogos1790000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ---- 1. Carreras reales confirmadas (12) ----
    await queryRunner.query(`
      INSERT INTO public.carrera (codigo, nombre, modalidad, estado)
      VALUES ('551013C02-D-1701', 'ARTE CULINARIO ECUATORIANO', 'DUAL', 'ACTIVO')
      ON CONFLICT (codigo) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.carrera (codigo, nombre, modalidad, estado)
      VALUES ('YEC', 'CENTRO DE IDIOMAS YAVIRAC', 'HÍBRIDA', 'ACTIVO')
      ON CONFLICT (codigo) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.carrera (codigo, nombre, modalidad, estado)
      VALUES ('550613A01-D-1701', 'DESARROLLO DE SOFTWARE', 'DUAL', 'ACTIVO')
      ON CONFLICT (codigo) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.carrera (codigo, nombre, modalidad, estado)
      VALUES ('550212Q02-P-1701', 'DISEÑO DE MODAS', 'PRESENCIAL', 'ACTIVO')
      ON CONFLICT (codigo) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.carrera (codigo, nombre, modalidad, estado)
      VALUES ('550213Z-P-26', 'DISEÑO DE MODAS CON NIVEL EQUIVALENTE A TECNOLOGIA SUPERIOR', 'PRESENCIAL', 'ACTIVO')
      ON CONFLICT (codigo) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.carrera (codigo, nombre, modalidad, estado)
      VALUES ('551015B02-D-1701', 'GUIA NACIONAL DE TURISMO', 'DUAL', 'ACTIVO')
      ON CONFLICT (codigo) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.carrera (codigo, nombre, modalidad, estado)
      VALUES ('551015C-D-01', 'GUIA NACIONAL DE TURISMO CON NIVEL EQUIVALENTE A TECNOLOGIA SUPERIOR', 'DUAL', 'ACTIVO')
      ON CONFLICT (codigo) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.carrera (codigo, nombre, modalidad, estado)
      VALUES ('IMPST-01-V', 'IMPULSAT V01 VIRTUAL', 'EN LÍNEA', 'ACTIVO')
      ON CONFLICT (codigo) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.carrera (codigo, nombre, modalidad, estado)
      VALUES ('550414G02-P-1701', 'MARKETING DIGITAL', 'PRESENCIAL', 'ACTIVO')
      ON CONFLICT (codigo) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.carrera (codigo, nombre, modalidad, estado)
      VALUES ('001776', 'TECNOLOGIA EN MARKETING', 'PRESENCIAL', 'ACTIVO')
      ON CONFLICT (codigo) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.carrera (codigo, nombre, modalidad, estado)
      VALUES ('550613A-D-01', 'TECNOLOGIA SUPERIOR EN DESARROLLO DE SOFTWARE', 'DUAL', 'ACTIVO')
      ON CONFLICT (codigo) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.carrera (codigo, nombre, modalidad, estado)
      VALUES ('550414A-P-01', 'TECNOLOGIA SUPERIOR EN MARKETING', 'PRESENCIAL', 'ACTIVO')
      ON CONFLICT (codigo) DO NOTHING;
    `);

    // ---- 2. Jornadas reales (derivadas de paralelo_jornada en matrículas/notas) ----
    await queryRunner.query(`INSERT INTO public.jornada (nombre, estado) VALUES ('INTENSIVA', 'ACTIVO') ON CONFLICT (nombre) DO NOTHING;`);
    await queryRunner.query(`INSERT INTO public.jornada (nombre, estado) VALUES ('MATUTINA', 'ACTIVO') ON CONFLICT (nombre) DO NOTHING;`);
    await queryRunner.query(`INSERT INTO public.jornada (nombre, estado) VALUES ('VESPERTINA', 'ACTIVO') ON CONFLICT (nombre) DO NOTHING;`);
    await queryRunner.query(`INSERT INTO public.jornada (nombre, estado) VALUES ('NOCTURNA', 'ACTIVO') ON CONFLICT (nombre) DO NOTHING;`);
    await queryRunner.query(`INSERT INTO public.jornada (nombre, estado) VALUES ('NOAPLICAJORNADA', 'ACTIVO') ON CONFLICT (nombre) DO NOTHING;`);

    // ---- 3. Paralelos reales ----
    await queryRunner.query(`INSERT INTO public.paralelo (nombre, estado) VALUES ('A', 'ACTIVO') ON CONFLICT (nombre) DO NOTHING;`);
    await queryRunner.query(`INSERT INTO public.paralelo (nombre, estado) VALUES ('B', 'ACTIVO') ON CONFLICT (nombre) DO NOTHING;`);
    await queryRunner.query(`INSERT INTO public.paralelo (nombre, estado) VALUES ('C', 'ACTIVO') ON CONFLICT (nombre) DO NOTHING;`);
    await queryRunner.query(`INSERT INTO public.paralelo (nombre, estado) VALUES ('D', 'ACTIVO') ON CONFLICT (nombre) DO NOTHING;`);
    await queryRunner.query(`INSERT INTO public.paralelo (nombre, estado) VALUES ('E', 'ACTIVO') ON CONFLICT (nombre) DO NOTHING;`);
    await queryRunner.query(`INSERT INTO public.paralelo (nombre, estado) VALUES ('F', 'ACTIVO') ON CONFLICT (nombre) DO NOTHING;`);
    await queryRunner.query(`INSERT INTO public.paralelo (nombre, estado) VALUES ('G', 'ACTIVO') ON CONFLICT (nombre) DO NOTHING;`);
    await queryRunner.query(`INSERT INTO public.paralelo (nombre, estado) VALUES ('T', 'ACTIVO') ON CONFLICT (nombre) DO NOTHING;`);
    await queryRunner.query(`INSERT INTO public.paralelo (nombre, estado) VALUES ('Z', 'ACTIVO') ON CONFLICT (nombre) DO NOTHING;`);

    // ---- 4. Niveles reales por carrera confirmada (53 combinaciones) ----
    // nivel.id_carrera es FK -> se resuelve por sub-select contra carrera.codigo
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'CUARTO', 'ACTIVO' FROM public.carrera WHERE codigo = '551013C02-D-1701'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'PRIMERO', 'ACTIVO' FROM public.carrera WHERE codigo = '551013C02-D-1701'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'QUINTO', 'ACTIVO' FROM public.carrera WHERE codigo = '551013C02-D-1701'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'SEGUNDO', 'ACTIVO' FROM public.carrera WHERE codigo = '551013C02-D-1701'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'TERCERO', 'ACTIVO' FROM public.carrera WHERE codigo = '551013C02-D-1701'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'PRIMERO', 'ACTIVO' FROM public.carrera WHERE codigo = 'YEC'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'SEGUNDO', 'ACTIVO' FROM public.carrera WHERE codigo = 'YEC'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'TERCERO', 'ACTIVO' FROM public.carrera WHERE codigo = 'YEC'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'CUARTO', 'ACTIVO' FROM public.carrera WHERE codigo = '550613A01-D-1701'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'PRIMERO', 'ACTIVO' FROM public.carrera WHERE codigo = '550613A01-D-1701'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'QUINTO', 'ACTIVO' FROM public.carrera WHERE codigo = '550613A01-D-1701'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'SEGUNDO', 'ACTIVO' FROM public.carrera WHERE codigo = '550613A01-D-1701'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'TERCERO', 'ACTIVO' FROM public.carrera WHERE codigo = '550613A01-D-1701'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'CUARTO', 'ACTIVO' FROM public.carrera WHERE codigo = '550212Q02-P-1701'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'PRIMERO', 'ACTIVO' FROM public.carrera WHERE codigo = '550212Q02-P-1701'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'QUINTO', 'ACTIVO' FROM public.carrera WHERE codigo = '550212Q02-P-1701'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'SEGUNDO', 'ACTIVO' FROM public.carrera WHERE codigo = '550212Q02-P-1701'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'TERCERO', 'ACTIVO' FROM public.carrera WHERE codigo = '550212Q02-P-1701'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'CUARTO', 'ACTIVO' FROM public.carrera WHERE codigo = '550213Z-P-26'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'PRIMERO', 'ACTIVO' FROM public.carrera WHERE codigo = '550213Z-P-26'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'QUINTO', 'ACTIVO' FROM public.carrera WHERE codigo = '550213Z-P-26'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'SEGUNDO', 'ACTIVO' FROM public.carrera WHERE codigo = '550213Z-P-26'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'TERCERO', 'ACTIVO' FROM public.carrera WHERE codigo = '550213Z-P-26'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'CUARTO', 'ACTIVO' FROM public.carrera WHERE codigo = '551015B02-D-1701'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'PRIMERO', 'ACTIVO' FROM public.carrera WHERE codigo = '551015B02-D-1701'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'SEGUNDO', 'ACTIVO' FROM public.carrera WHERE codigo = '551015B02-D-1701'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'TERCERO', 'ACTIVO' FROM public.carrera WHERE codigo = '551015B02-D-1701'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'CUARTO', 'ACTIVO' FROM public.carrera WHERE codigo = '551015C-D-01'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'PRIMERO', 'ACTIVO' FROM public.carrera WHERE codigo = '551015C-D-01'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'QUINTO', 'ACTIVO' FROM public.carrera WHERE codigo = '551015C-D-01'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'SEGUNDO', 'ACTIVO' FROM public.carrera WHERE codigo = '551015C-D-01'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'TERCERO', 'ACTIVO' FROM public.carrera WHERE codigo = '551015C-D-01'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'PRIMERO', 'ACTIVO' FROM public.carrera WHERE codigo = 'IMPST-01-V'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'CUARTO', 'ACTIVO' FROM public.carrera WHERE codigo = '550414G02-P-1701'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'PRIMERO', 'ACTIVO' FROM public.carrera WHERE codigo = '550414G02-P-1701'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'SEGUNDO', 'ACTIVO' FROM public.carrera WHERE codigo = '550414G02-P-1701'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'TERCERO', 'ACTIVO' FROM public.carrera WHERE codigo = '550414G02-P-1701'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'CUARTO', 'ACTIVO' FROM public.carrera WHERE codigo = '001776'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'PRIMERO', 'ACTIVO' FROM public.carrera WHERE codigo = '001776'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'QUINTO', 'ACTIVO' FROM public.carrera WHERE codigo = '001776'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'SEGUNDO', 'ACTIVO' FROM public.carrera WHERE codigo = '001776'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'SEXTO', 'ACTIVO' FROM public.carrera WHERE codigo = '001776'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'TERCERO', 'ACTIVO' FROM public.carrera WHERE codigo = '001776'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'CUARTO', 'ACTIVO' FROM public.carrera WHERE codigo = '550613A-D-01'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'PRIMERO', 'ACTIVO' FROM public.carrera WHERE codigo = '550613A-D-01'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'QUINTO', 'ACTIVO' FROM public.carrera WHERE codigo = '550613A-D-01'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'SEGUNDO', 'ACTIVO' FROM public.carrera WHERE codigo = '550613A-D-01'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'TERCERO', 'ACTIVO' FROM public.carrera WHERE codigo = '550613A-D-01'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'CUARTO', 'ACTIVO' FROM public.carrera WHERE codigo = '550414A-P-01'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'PRIMERO', 'ACTIVO' FROM public.carrera WHERE codigo = '550414A-P-01'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'QUINTO', 'ACTIVO' FROM public.carrera WHERE codigo = '550414A-P-01'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'SEGUNDO', 'ACTIVO' FROM public.carrera WHERE codigo = '550414A-P-01'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
    await queryRunner.query(`
      INSERT INTO public.nivel (id_carrera, nombre, estado)
      SELECT id_carrera, 'TERCERO', 'ACTIVO' FROM public.carrera WHERE codigo = '550414A-P-01'
      ON CONFLICT (id_carrera, nombre) DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Solo revierte lo insertado por ESTA migración (por código real, nunca un DELETE genérico)
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'CUARTO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '551013C02-D-1701');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'PRIMERO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '551013C02-D-1701');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'QUINTO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '551013C02-D-1701');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'SEGUNDO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '551013C02-D-1701');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'TERCERO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '551013C02-D-1701');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'PRIMERO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = 'YEC');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'SEGUNDO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = 'YEC');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'TERCERO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = 'YEC');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'CUARTO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '550613A01-D-1701');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'PRIMERO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '550613A01-D-1701');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'QUINTO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '550613A01-D-1701');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'SEGUNDO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '550613A01-D-1701');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'TERCERO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '550613A01-D-1701');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'CUARTO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '550212Q02-P-1701');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'PRIMERO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '550212Q02-P-1701');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'QUINTO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '550212Q02-P-1701');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'SEGUNDO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '550212Q02-P-1701');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'TERCERO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '550212Q02-P-1701');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'CUARTO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '550213Z-P-26');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'PRIMERO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '550213Z-P-26');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'QUINTO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '550213Z-P-26');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'SEGUNDO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '550213Z-P-26');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'TERCERO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '550213Z-P-26');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'CUARTO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '551015B02-D-1701');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'PRIMERO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '551015B02-D-1701');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'SEGUNDO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '551015B02-D-1701');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'TERCERO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '551015B02-D-1701');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'CUARTO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '551015C-D-01');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'PRIMERO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '551015C-D-01');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'QUINTO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '551015C-D-01');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'SEGUNDO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '551015C-D-01');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'TERCERO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '551015C-D-01');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'PRIMERO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = 'IMPST-01-V');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'CUARTO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '550414G02-P-1701');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'PRIMERO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '550414G02-P-1701');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'SEGUNDO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '550414G02-P-1701');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'TERCERO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '550414G02-P-1701');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'CUARTO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '001776');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'PRIMERO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '001776');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'QUINTO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '001776');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'SEGUNDO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '001776');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'SEXTO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '001776');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'TERCERO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '001776');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'CUARTO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '550613A-D-01');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'PRIMERO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '550613A-D-01');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'QUINTO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '550613A-D-01');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'SEGUNDO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '550613A-D-01');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'TERCERO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '550613A-D-01');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'CUARTO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '550414A-P-01');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'PRIMERO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '550414A-P-01');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'QUINTO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '550414A-P-01');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'SEGUNDO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '550414A-P-01');`);
    await queryRunner.query(`DELETE FROM public.nivel WHERE nombre = 'TERCERO' AND id_carrera = (SELECT id_carrera FROM public.carrera WHERE codigo = '550414A-P-01');`);
    await queryRunner.query(`DELETE FROM public.paralelo WHERE nombre = 'A';`);
    await queryRunner.query(`DELETE FROM public.paralelo WHERE nombre = 'B';`);
    await queryRunner.query(`DELETE FROM public.paralelo WHERE nombre = 'C';`);
    await queryRunner.query(`DELETE FROM public.paralelo WHERE nombre = 'D';`);
    await queryRunner.query(`DELETE FROM public.paralelo WHERE nombre = 'E';`);
    await queryRunner.query(`DELETE FROM public.paralelo WHERE nombre = 'F';`);
    await queryRunner.query(`DELETE FROM public.paralelo WHERE nombre = 'G';`);
    await queryRunner.query(`DELETE FROM public.paralelo WHERE nombre = 'T';`);
    await queryRunner.query(`DELETE FROM public.paralelo WHERE nombre = 'Z';`);
    await queryRunner.query(`DELETE FROM public.jornada WHERE nombre = 'INTENSIVA';`);
    await queryRunner.query(`DELETE FROM public.jornada WHERE nombre = 'MATUTINA';`);
    await queryRunner.query(`DELETE FROM public.jornada WHERE nombre = 'VESPERTINA';`);
    await queryRunner.query(`DELETE FROM public.jornada WHERE nombre = 'NOCTURNA';`);
    await queryRunner.query(`DELETE FROM public.jornada WHERE nombre = 'NOAPLICAJORNADA';`);
    await queryRunner.query(`DELETE FROM public.carrera WHERE codigo = '551013C02-D-1701';`);
    await queryRunner.query(`DELETE FROM public.carrera WHERE codigo = 'YEC';`);
    await queryRunner.query(`DELETE FROM public.carrera WHERE codigo = '550613A01-D-1701';`);
    await queryRunner.query(`DELETE FROM public.carrera WHERE codigo = '550212Q02-P-1701';`);
    await queryRunner.query(`DELETE FROM public.carrera WHERE codigo = '550213Z-P-26';`);
    await queryRunner.query(`DELETE FROM public.carrera WHERE codigo = '551015B02-D-1701';`);
    await queryRunner.query(`DELETE FROM public.carrera WHERE codigo = '551015C-D-01';`);
    await queryRunner.query(`DELETE FROM public.carrera WHERE codigo = 'IMPST-01-V';`);
    await queryRunner.query(`DELETE FROM public.carrera WHERE codigo = '550414G02-P-1701';`);
    await queryRunner.query(`DELETE FROM public.carrera WHERE codigo = '001776';`);
    await queryRunner.query(`DELETE FROM public.carrera WHERE codigo = '550613A-D-01';`);
    await queryRunner.query(`DELETE FROM public.carrera WHERE codigo = '550414A-P-01';`);
  }
}
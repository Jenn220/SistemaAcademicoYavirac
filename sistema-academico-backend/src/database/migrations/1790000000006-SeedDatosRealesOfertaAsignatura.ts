import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * oferta_asignatura real para la carrera Desarrollo de Software (codigo canonico
 * 550613A01-D-1701), periodo 2026-1P, construida a partir de MAESTRO_DE_NOTAS.
 *
 * Cada fila representa una combinacion real (asignatura, paralelo) que aparecio
 * en el reporte, con exactamente un docente asociado (verificado: 0 combinaciones
 * asignatura+paralelo con mas de un docente en las 1813 filas de DS).
 *
 * Jornada: siempre 'INTENSIVA' para esta carrera en el reporte (dato verificado,
 * no asumido).
 *
 * Paralelo: tomado del prefijo antes del '_' en la columna "Paralelo" del reporte
 * (ej. 'B_INTENSIVA' -> 'B'). 22 filas de las 1813 traian el campo Paralelo vacio;
 * para esas se infirio el paralelo dominante del mismo estudiante en las demas
 * asignaturas del mismo periodo (siempre fue posible inferirlo, 0 filas quedaron
 * sin paralelo).
 *
 * Codigo de asignatura: se toma como los primeros dos segmentos separados por '-'
 * del campo "Asignatura" del reporte (ej. 'DS4AC1-111-OFIMATICA' -> 'DS4AC1-111'),
 * que es exactamente el mismo formato usado en SeedDatosRealesAsignaturas.
 *
 * Nota: se dejan de reutilizar los mismos placeholders $N entre el SELECT/INSERT
 * y el NOT EXISTS (bug ya encontrado y corregido en Asignaturas/Matriculas:
 * "inconsistent types deduced for parameter $1" - text vs character varying).
 */
const CARRERA_REAL = '550613A01-D-1701';
const PERIODO_REAL = '2026-1P';
const JORNADA_REAL = 'INTENSIVA';

// [codigoAsignatura, paralelo, nivel, cedulaDocente]
const OFERTAS: [string, string, string, string][] = [
  ['DS4AC1-211', 'C', 'SEGUNDO', '1705041646'],
  ['DS4AC1-212', 'C', 'SEGUNDO', '1717078818'],
  ['DS4AC1-213', 'C', 'SEGUNDO', '1803980844'],
  ['DS4AC1-214', 'C', 'SEGUNDO', '0602464265'],
  ['DS4AC1-215', 'C', 'SEGUNDO', '1717675902'],
  ['DS4AC1-221', 'C', 'SEGUNDO', '1717675902'],
  ['SD4-591', 'B', 'QUINTO', '1750242354'],
  ['SD4-506', 'B', 'QUINTO', '1717078818'],
  ['SD4-521', 'B', 'QUINTO', '1721928461'],
  ['SD4-511', 'B', 'QUINTO', '1750242354'],
  ['SD4-512', 'B', 'QUINTO', '1750242354'],
  ['SD4-513', 'B', 'QUINTO', '1721928461'],
  ['SD4-514', 'B', 'QUINTO', '1712641933'],
  ['SD4-515', 'B', 'QUINTO', '1803980844'],
  ['DS4AC1-411', 'A', 'CUARTO', '1804544391'],
  ['DS4AC1-412', 'A', 'CUARTO', '0401022892'],
  ['DS4AC1-413', 'A', 'CUARTO', '0602464265'],
  ['DS4AC1-414', 'A', 'CUARTO', '1708234867'],
  ['DS4AC1-415', 'A', 'CUARTO', '1708234867'],
  ['DS4AC1-421', 'A', 'CUARTO', '0401022892'],
  ['DS4AC1-491', 'A', 'CUARTO', '0502212806'],
  ['DS4AC1-111', 'A', 'PRIMERO', '0401022892'],
  ['DS4AC1-112', 'A', 'PRIMERO', '1712226255'],
  ['DS4AC1-113', 'A', 'PRIMERO', '1721907655'],
  ['DS4AC1-114', 'A', 'PRIMERO', '1707716435'],
  ['DS4AC1-115', 'A', 'PRIMERO', '1711178119'],
  ['DS4AC1-121', 'A', 'PRIMERO', '1718125519'],
  ['DS4AC1-411', 'B', 'CUARTO', '1804544391'],
  ['DS4AC1-412', 'B', 'CUARTO', '1750242354'],
  ['DS4AC1-413', 'B', 'CUARTO', '1707716435'],
  ['DS4AC1-414', 'B', 'CUARTO', '1708234867'],
  ['DS4AC1-415', 'B', 'CUARTO', '1721928461'],
  ['DS4AC1-421', 'B', 'CUARTO', '1708234867'],
  ['DS4AC1-491', 'B', 'CUARTO', '0502212806'],
  ['SD4-591', 'G', 'QUINTO', '1750242354'],
  ['DS4AC1-311', 'B', 'TERCERO', '0800852733'],
  ['DS4AC1-312', 'B', 'TERCERO', '1712226255'],
  ['DS4AC1-313', 'B', 'TERCERO', '1721907655'],
  ['DS4AC1-314', 'B', 'TERCERO', '1712641933'],
  ['DS4AC1-321', 'B', 'TERCERO', '1712641933'],
  ['DS4AC1-331', 'B', 'TERCERO', '1707716435'],
  ['DS4AC1-111', 'B', 'PRIMERO', '1716201098'],
  ['DS4AC1-112', 'B', 'PRIMERO', '1716201098'],
  ['DS4AC1-113', 'B', 'PRIMERO', '1721907655'],
  ['DS4AC1-114', 'B', 'PRIMERO', '1718125519'],
  ['DS4AC1-115', 'B', 'PRIMERO', '1711178119'],
  ['DS4AC1-121', 'B', 'PRIMERO', '1721907655'],
  ['DS4AC1-211', 'A', 'SEGUNDO', '1705041646'],
  ['DS4AC1-212', 'A', 'SEGUNDO', '1713724407'],
  ['DS4AC1-213', 'A', 'SEGUNDO', '1713724407'],
  ['DS4AC1-214', 'A', 'SEGUNDO', '0602464265'],
  ['DS4AC1-215', 'A', 'SEGUNDO', '0502212806'],
  ['DS4AC1-221', 'A', 'SEGUNDO', '0502212806'],
  ['SD4-591', 'E', 'QUINTO', '1750242354'],
  ['DS4AC1-311', 'A', 'TERCERO', '0800852733'],
  ['DS4AC1-312', 'A', 'TERCERO', '1712226255'],
  ['DS4AC1-313', 'A', 'TERCERO', '1721907655'],
  ['DS4AC1-314', 'A', 'TERCERO', '1712641933'],
  ['DS4AC1-321', 'A', 'TERCERO', '1712226255'],
  ['DS4AC1-331', 'A', 'TERCERO', '1707716435'],
  ['DS4AC1-111', 'D', 'PRIMERO', '1709439010'],
  ['DS4AC1-112', 'D', 'PRIMERO', '1712226255'],
  ['DS4AC1-113', 'D', 'PRIMERO', '0502212806'],
  ['DS4AC1-114', 'D', 'PRIMERO', '0401022892'],
  ['DS4AC1-115', 'D', 'PRIMERO', '1718125519'],
  ['DS4AC1-121', 'D', 'PRIMERO', '1709439010'],
  ['SD4-591', 'C', 'QUINTO', '1750242354'],
  ['SD4-506', 'C', 'QUINTO', '1721877270'],
  ['SD4-521', 'C', 'QUINTO', '1724909443'],
  ['SD4-511', 'C', 'QUINTO', '1724909443'],
  ['SD4-512', 'C', 'QUINTO', '1750242354'],
  ['SD4-513', 'C', 'QUINTO', '1724909443'],
  ['SD4-514', 'C', 'QUINTO', '1721877270'],
  ['SD4-515', 'C', 'QUINTO', '1803980844'],
  ['DS4AC1-121', 'F', 'PRIMERO', '1750242354'],
  ['DS4AC1-211', 'B', 'SEGUNDO', '1705041646'],
  ['DS4AC1-212', 'B', 'SEGUNDO', '1717078818'],
  ['DS4AC1-213', 'B', 'SEGUNDO', '1713724407'],
  ['DS4AC1-214', 'B', 'SEGUNDO', '0602464265'],
  ['DS4AC1-215', 'B', 'SEGUNDO', '0502212806'],
  ['DS4AC1-221', 'B', 'SEGUNDO', '0602464265'],
  ['DS4AC1-111', 'C', 'PRIMERO', '0401022892'],
  ['DS4AC1-112', 'C', 'PRIMERO', '1716201098'],
  ['DS4AC1-113', 'C', 'PRIMERO', '0502212806'],
  ['DS4AC1-114', 'C', 'PRIMERO', '1713724407'],
  ['DS4AC1-115', 'C', 'PRIMERO', '1718125519'],
  ['DS4AC1-121', 'C', 'PRIMERO', '1713724407'],
  ['SD4-591', 'F', 'QUINTO', '1750242354'],
  ['DS4AC1-111', 'E', 'PRIMERO', '1709439010'],
  ['DS4AC1-112', 'E', 'PRIMERO', '1721928461'],
  ['DS4AC1-113', 'E', 'PRIMERO', '1721877270'],
  ['DS4AC1-114', 'E', 'PRIMERO', '1707716435'],
  ['DS4AC1-115', 'E', 'PRIMERO', '1717675902'],
  ['DS4AC1-121', 'E', 'PRIMERO', '1721877270'],
  ['SD4-591', 'A', 'QUINTO', '1750242354'],
  ['SD4-506', 'A', 'QUINTO', '1717078818'],
  ['SD4-521', 'A', 'QUINTO', '1803980844'],
  ['SD4-511', 'A', 'QUINTO', '1708234867'],
  ['SD4-512', 'A', 'QUINTO', '1712641933'],
  ['SD4-513', 'A', 'QUINTO', '1708234867'],
  ['SD4-514', 'A', 'QUINTO', '1712641933'],
  ['SD4-515', 'A', 'QUINTO', '1803980844'],
  ['DS4AC1-215', 'D', 'SEGUNDO', '1717675902'],
  ['DS4AC1-221', 'D', 'SEGUNDO', '1707716435'],
  ['DS4AC1-211', 'D', 'SEGUNDO', '1709918914'],
  ['DS4AC1-212', 'D', 'SEGUNDO', '1709439010'],
  ['DS4AC1-213', 'D', 'SEGUNDO', '1724909443'],
  ['DS4AC1-214', 'D', 'SEGUNDO', '1707716435'],
  ['DS4AC1-111', 'F', 'PRIMERO', '1709439010'],
  ['DS4AC1-112', 'F', 'PRIMERO', '1721928461'],
  ['DS4AC1-113', 'F', 'PRIMERO', '1750242354'],
  ['DS4AC1-114', 'F', 'PRIMERO', '1707716435'],
  ['DS4AC1-115', 'F', 'PRIMERO', '1717675902'],
];

export class SeedDatosRealesOfertaAsignatura1790000000006 implements MigrationInterface {
  name = 'SeedDatosRealesOfertaAsignatura1790000000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const [codigoAsignatura, paralelo, nivel, cedulaDocente] of OFERTAS) {
      await queryRunner.query(
        `INSERT INTO public.oferta_asignatura (id_periodo_carrera, id_asignatura, id_docente, id_jornada, id_paralelo, estado)
         SELECT pc.id_periodo_carrera, a.id_asignatura, d.id_docente, j.id_jornada, par.id_paralelo, 'ACTIVO'
         FROM public.periodo_carrera pc
         JOIN public.periodo_academico per ON per.id_periodo = pc.id_periodo
         JOIN public.carrera c ON c.id_carrera = pc.id_carrera
         JOIN public.nivel n ON n.id_carrera = c.id_carrera
         JOIN public.asignatura a ON a.id_nivel = n.id_nivel
         JOIN public.docente d ON d.cedula = $4
         JOIN public.jornada j ON j.nombre = $5
         JOIN public.paralelo par ON par.nombre = $6
         WHERE per.codigo = $7
           AND c.codigo = $1
           AND n.nombre = $2
           AND a.codigo = $3
           AND NOT EXISTS (
             SELECT 1 FROM public.oferta_asignatura oa2
             WHERE oa2.id_periodo_carrera = pc.id_periodo_carrera
               AND oa2.id_asignatura = a.id_asignatura
               AND oa2.id_paralelo = par.id_paralelo
           );`,
        [CARRERA_REAL, nivel, codigoAsignatura, cedulaDocente, JORNADA_REAL, paralelo, PERIODO_REAL],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const [codigoAsignatura, paralelo, nivel] of OFERTAS) {
      await queryRunner.query(
        `DELETE FROM public.oferta_asignatura oa
         USING public.periodo_carrera pc, public.periodo_academico per, public.carrera c,
               public.nivel n, public.asignatura a, public.paralelo par
         WHERE oa.id_periodo_carrera = pc.id_periodo_carrera
           AND oa.id_asignatura = a.id_asignatura
           AND oa.id_paralelo = par.id_paralelo
           AND pc.id_periodo = per.id_periodo
           AND pc.id_carrera = c.id_carrera
           AND n.id_carrera = c.id_carrera
           AND a.id_nivel = n.id_nivel
           AND per.codigo = $5
           AND c.codigo = $1
           AND n.nombre = $2
           AND a.codigo = $3
           AND par.nombre = $4;`,
        [CARRERA_REAL, nivel, codigoAsignatura, paralelo, PERIODO_REAL],
      );
    }
  }
}

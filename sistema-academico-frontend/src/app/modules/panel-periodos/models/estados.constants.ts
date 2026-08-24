// Catálogo de estados terminales — respuesta al punto 7.2 del informe.
// Confirmado contra las migraciones: NINGUNA columna "estado" tiene CHECK ni ENUM hoy
// (son varchar libres). No existe un catálogo previo que "conservar", así que se
// mantiene la propuesta original hasta que Backend lo respalde con una restricción real.

export const ESTADOS_MATRICULA_DETALLE = {
  CURSANDO: 'CURSANDO', // valor inicial, ya existente en BD
  APROBADO: 'APROBADO',
  REPROBADO: 'REPROBADO',
  SUPLETORIO: 'SUPLETORIO',
  RETIRADO: 'RETIRADO',
} as const;

export type EstadoMatriculaDetalle =
  (typeof ESTADOS_MATRICULA_DETALLE)[keyof typeof ESTADOS_MATRICULA_DETALLE];

export const ESTADOS_PERIODO_CARRERA = {
  ACTIVO: 'ACTIVO', // valor inicial, ya existente en BD
  FINALIZADO: 'FINALIZADO',
} as const;

export type EstadoPeriodoCarrera =
  (typeof ESTADOS_PERIODO_CARRERA)[keyof typeof ESTADOS_PERIODO_CARRERA];

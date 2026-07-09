export const TIPOS_REPORTE_VALIDOS = ['APORTE_1', 'APORTE_2', 'SUPLETORIO'] as const;

const ALIAS_TIPO_REPORTE: Record<string, string> = {
  'PARCIAL UNO': 'APORTE_1',
  APORTE_1: 'APORTE_1',
  'PARCIAL DOS': 'APORTE_2',
  APORTE_2: 'APORTE_2',
  'EXAMEN SUPLETORIO': 'SUPLETORIO',
  SUPLETORIO: 'SUPLETORIO',
};

export function normalizarTipoReporte(valor: unknown): unknown {
  if (typeof valor !== 'string') return valor;
  const clave = valor.trim().toUpperCase();
  return ALIAS_TIPO_REPORTE[clave] ?? valor;
}

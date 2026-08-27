// Token de Inyección de Dependencias
export const VINCULACION_ACTA_PORT = 'VINCULACION_ACTA_PORT';

export interface IVinculacionActaPort {
  obtainActaCompromisoRaw(idVinculacion: number): Promise<any>;
}
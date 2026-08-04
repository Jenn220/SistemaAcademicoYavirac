export const CERTIFICADO_VINCULACION_PORT = Symbol('CERTIFICADO_VINCULACION_PORT');

export interface ICertificadoVinculacionPort {
  /**
   * Obtiene los datos raw necesarios para la generación del
   * certificado de vinculación por el ID de vinculación del estudiante.
   * 
   * @param idVinculacion ID del registro en vinculacion_estudiante
   * @returns Promesa con los datos raw del certificado o null si no existe
   */
  obtainCertificadoVinculacionRaw(idVinculacion: number): Promise<any | null>;
}
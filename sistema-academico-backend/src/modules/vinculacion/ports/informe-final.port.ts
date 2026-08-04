export const INFORME_FINAL_PORT = Symbol('INFORME_FINAL_PORT');

export interface IInformeFinalPort {
  /**
   * Obtiene la información raw necesaria para generar el informe final
   * de un estudiante por su ID de vinculación.
   * 
   * @param idVinculacion ID del registro en vinculacion_estudiante
   * @returns Promesa con el listado de resultados raw
   */
  listarInformesEstudiantesPorDocente(idDocente: number): Promise<any[]>;
  obtainInformeFinalRaw(idVinculacion: number): Promise<any[]>;
}
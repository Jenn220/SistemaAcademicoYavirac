export const INFORME_ACTIVIDADES_PORT = Symbol('INFORME_ACTIVIDADES_PORT');

export interface IInformeActividadesPort {
  /**
   * Obtiene la información raw de la base de datos para construir
   * el informe de actividades de un estudiante por su ID de vinculación.
   * 
   * @param idVinculacion ID del registro en vinculacion_estudiante
   * @returns Promesa con el listado de registros raw
   */
  obtainInformeActividadesRaw(idVinculacion: number): Promise<any[]>;
  actualizarResultadoAprendizaje(idActividad: number, resultadoAprendizaje: string): Promise<any>;
}
export const INFORME_ACTIVIDADES_PORT = Symbol('INFORME_ACTIVIDADES_PORT');

export interface IInformeActividadesPort {
  obtainInformeActividadesRaw(idVinculacion: number): Promise<any[]>;
  actualizarResultadoAprendizaje(idActividad: number, resultadoAprendizaje: string): Promise<any>;
}
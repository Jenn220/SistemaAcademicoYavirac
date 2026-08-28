export const INFORME_ACTIVIDADES_PORT = Symbol('INFORME_ACTIVIDADES_PORT');

export interface IInformeActividadesPort {
  obtainInformeActividadesRaw(idVinculacion: number): Promise<any[]>;
  actualizarResultadoAprendizaje(idActividad: number, resultadoAprendizaje: string): Promise<any>;
  obtenerActividadPorId(idActividad: number): Promise<any>;
  guardarOActualizarObservacion(idVinculacion: number, tipoReporte: string, observacion: string): Promise<any>;
}
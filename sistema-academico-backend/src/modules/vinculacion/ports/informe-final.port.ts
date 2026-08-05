export const INFORME_FINAL_PORT = Symbol('INFORME_FINAL_PORT');

export interface IInformeFinalPort {
  listarInformesEstudiantesPorDocente(idDocente: number): Promise<any[]>;
  obtainInformeFinalRaw(idVinculacion: number): Promise<any[]>;
}
export const CERTIFICADO_VINCULACION_PORT = Symbol('CERTIFICADO_VINCULACION_PORT');

export interface ICertificadoVinculacionPort {
  obtainCertificadoVinculacionRaw(idVinculacion: number): Promise<any | null>;
}
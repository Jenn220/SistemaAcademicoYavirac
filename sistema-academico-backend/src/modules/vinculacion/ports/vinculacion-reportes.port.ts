export const VINCULACION_REPORTES_PORT = 'VINCULACION_REPORTES_PORT';

export interface IVinculacionReportesPort {
  obtainInicioActividadesTutorRaw(idVinculacion: number): Promise<any>;
  obtainActaCompromisoRaw(idVinculacion: number): Promise<any>;
  obtainReporteConsolidadoRaw(idVinculacion: number): Promise<any[]>;
  obtainReporteAsistenciaTutorRaw(idVinculacion: number): Promise<any[]>;
  obtainInformeActividadesRaw(idVinculacion: number): Promise<any[]>;
  obtainCertificadoVinculacionRaw(idVinculacion: number): Promise<any>;
  obtainInformeFinalRaw(idVinculacion: number): Promise<any[]>;
}
export interface PeriodoCarrera {
  idPeriodoCarrera: number;
  idPeriodo: number;
  idCarrera: number;
  nombreCarrera: string;
  codigoPeriodo: string;
  fechaInicio: string;
  fechaFin: string;
  fechaFinSupletorio?: string;
  estado: string; // ver estados.constants.ts
  idCoordinador: number;
  nombreCoordinador: string;
}

export interface ResumenCierrePeriodo {
  idPeriodoCarrera: number;
  totalOfertas: number;
  totalMatriculasDetalle: number;
  totalVinculaciones: number;
  totalPracticas: number;
}

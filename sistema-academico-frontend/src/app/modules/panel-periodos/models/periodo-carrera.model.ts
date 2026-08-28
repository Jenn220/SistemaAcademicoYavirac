export interface PeriodoCarrera {
  idPeriodoCarrera: number;
  idPeriodo: number;
  idCarrera: number;
  nombreCarrera: string;
  codigoPeriodo: string;

  fechaInicio: string;
  fechaFin: string;

  fechaFinSupletorio?: string | null;
  fechaCierre?: string | null;

  estado: string;

  idCoordinador: number | null;
  nombreCoordinador: string | null;
}

export interface ResumenCierrePeriodo {
  idPeriodoCarrera: number;

  totalOfertas: number;
  totalMatriculasDetalle: number;
  totalVinculaciones: number;
  totalPracticas: number;

  matriculasDetallePendientes: number;
  vinculacionesPendientes: number;
  practicasPendientes: number;

  puedeCerrar: boolean;
  bloqueos: string[];
}

export interface HistorialPeriodoCarrera {
  idHistorial: number;

  tipoAccion:
    | 'CIERRE'
    | 'REASIGNACION_COORDINADOR';

  estadoAnterior?: string | null;
  estadoNuevo?: string | null;

  idCoordinadorAnterior?: number | null;
  nombreCoordinadorAnterior?: string | null;

  idCoordinadorNuevo?: number | null;
  nombreCoordinadorNuevo?: string | null;

  idUsuarioEjecutor: number;
  correoEjecutor: string;

  motivo?: string | null;
  fechaAccion: string;
}

export interface CoordinadorDisponible {
  idDocente: number;
  nombre: string;
  correo?: string | null;
}

export interface CarreraCatalogo {
  idCarrera: number;
  nombre: string;
}

export interface PeriodoPermitido {
  valor: '1P' | '2P';
  nombre: string;
}

export interface CatalogosCreacionPeriodo {
  carreras: CarreraCatalogo[];
  coordinadores: CoordinadorDisponible[];
  periodosPermitidos: PeriodoPermitido[];
}

export interface CrearPeriodoCarreraRequest {
  anio: number;

  numeroPeriodo:
    | '1P'
    | '2P';

  idCarrera: number;
  idCoordinador: number;

  fechaInicio: string;
  fechaFin: string;

  fechaInicioAporte1?: string;
  fechaFinAporte1?: string;

  fechaInicioAporte2?: string;
  fechaFinAporte2?: string;

  fechaInicioSupletorio?: string;
  fechaFinSupletorio?: string;

  fechaInicioFaseTeorica?: string;
  fechaFinFaseTeorica?: string;

  fechaInicioFasePractica?: string;
  fechaFinFasePractica?: string;

  nombrePeriodo?: string;
}

export interface CrearPeriodoCarreraResponse {
  ok: boolean;
  mensaje: string;

  idPeriodo: number;
  idPeriodoCarrera: number;

  codigoPeriodo: string;

  numeroPeriodo:
    | '1P'
    | '2P';

  anio: number;

  idCarrera: number;
  nombreCarrera: string;

  idCoordinador: number;
  nombreCoordinador: string;

  fechaInicio: string;
  fechaFin: string;

  estado: string;
}

export interface CerrarPeriodoRequest {
  confirmacion: 'CERRAR';
  motivo?: string;
}

export interface CerrarPeriodoResponse {
  ok: boolean;
  mensaje: string;

  idPeriodoCarrera: number;

  estado: string;
  fechaCierre: string;
}

export interface ReasignarCoordinadorRequest {
  idNuevoCoordinador: number;
  motivo?: string;
}

export interface ReasignarCoordinadorResponse {
  ok: boolean;
  mensaje: string;

  idPeriodoCarrera: number;

  idCoordinadorAnterior: number;
  idNuevoCoordinador: number;

  nombreNuevoCoordinador: string;
}
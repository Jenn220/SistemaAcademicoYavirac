export interface CabeceraSeguimientoPeaDto {
  carrera: string;
  asignatura: string;
  paralelo: string;
  periodo: string;
  docente: string;
}

export interface RepresentanteDto {
  id_estudiante: number;
  nombre: string;
  telefono: string | null;
  email: string | null;
}

export interface SeguimientoPeaResponseDto {
  id_seguimiento_pea: number;
  informe: CabeceraSeguimientoPeaDto;
  representante: RepresentanteDto;
}

export interface CreateSeguimientoPeaDto {
  id_oferta_asignatura: number;
  id_representante: number;
}

export interface UpdateRepresentanteSeguimientoPeaDto {
  id_representante: number;
}

/**
 * El backend (portafolio_seguimiento_pea) SOLO guarda id_seguimiento_pea,
 * id_oferta_asignatura e id_representante. El Formato 02 físico pide además
 * el detalle semana a semana (temas tratados, observaciones) y las 3 cajas
 * de observaciones finales (representante/docente/coordinador), que no
 * existen como columnas en el back.
 *
 * Mismo workaround que InformeFinalManualData: se guarda en localStorage
 * por oferta académica mientras el backend no soporte estos campos.
 */
export interface SemanaSeguimientoPea {
  semana: number;
  fecha: string;
  temas: string;
  observaciones: string;
}

export interface SeguimientoPeaManualData {
  semanas: SemanaSeguimientoPea[];
  observacionesRepresentante: string;
  observacionesDocente: string;
  observacionesCoordinador: string;
}
export class CabeceraSeguimientoPeaDto {
  carrera: string;
  asignatura: string;
  paralelo: string;
  periodo: string;
  docente: string;
}

export class RepresentanteDto {
  id_estudiante: number;
  nombre: string;
  telefono: string | null;
  email: string | null;
}

export class SeguimientoPeaResponseDto {
  id_seguimiento_pea: number;
  informe: CabeceraSeguimientoPeaDto;
  representante: RepresentanteDto;
}

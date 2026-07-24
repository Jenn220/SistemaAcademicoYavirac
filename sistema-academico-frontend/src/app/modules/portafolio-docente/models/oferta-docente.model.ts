// ============================================================
// Mis Ofertas — punto de entrada al Portafolio Docente
// Contrato REAL: GET /portafolio/mis-ofertas (oferta-docente.dto.ts backend)
// ============================================================

export interface OfertaDocenteDto {
  id_oferta_asignatura: number;
  asignatura: string;
  paralelo: string;
  id_periodo: number;
  periodo: string;
  estado: string;
}

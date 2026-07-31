export interface OfertaDocenteDto {
  id_oferta_asignatura: number;
  id_asignatura: number;
  id_paralelo: number;
  asignatura: string;
  paralelo: string;
  id_periodo: number;
  periodo: string;
  estado: string;
  tiene_informe_final?: boolean;
  tiene_seguimiento_pea?: boolean; // <-- Nuevo campo
}
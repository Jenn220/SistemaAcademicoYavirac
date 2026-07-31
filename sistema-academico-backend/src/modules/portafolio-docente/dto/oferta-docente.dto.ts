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
  tiene_seguimiento_pea?: boolean;
  tiene_aporte_1?: boolean;
  tiene_aporte_2?: boolean;
  tiene_supletorio?: boolean;
}
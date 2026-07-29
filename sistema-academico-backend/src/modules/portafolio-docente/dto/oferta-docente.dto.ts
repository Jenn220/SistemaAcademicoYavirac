export class OfertaDocenteDto {
  id_oferta_asignatura: number;
  id_asignatura: number;   // ⬅ agregar
  id_paralelo: number;     // ⬅ agregar
  asignatura: string;
  paralelo: string;
  id_periodo: number;
  periodo: string;
  estado: string;
}
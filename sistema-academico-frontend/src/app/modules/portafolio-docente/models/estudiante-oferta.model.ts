export interface EstudianteOfertaDto {
  id_estudiante: number;
  cedula: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
}
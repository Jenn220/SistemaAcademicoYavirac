export class ReporteDto {
  id_reporte_notas: number;
  carrera: string;
  nivel: string;
  asignatura: string;
  paralelo: string;
  jornada: string;
  docente: string;
  periodo: string;
  tipo_reporte: string;
  fecha_generacion: Date;
}

export class EstudianteAceptacionDto {
  id_aceptacion: number;
  cedula: string;
  estudiante: string;
  nota_registrada: number | null;
  estado_aceptacion: string;
  fecha_aceptacion: Date | null;
}

export class ReporteNotasResponseDto {
  reporte: ReporteDto;
  estudiantes: EstudianteAceptacionDto[];
}

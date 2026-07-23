// Lo que el backend realmente acepta/devuelve (contrato real, no tocar)
export interface CreateInformeFinalDto {
  id_docente: number;
  id_periodo: number;
  id_asignatura: number;
  id_paralelo: number;
  horario: string;
}

export interface InformeFinalResponse {
  informe: {
    nombre_docente: string;
    nombre_asignatura: string;
    paralelo: string;
    horario: string;
    periodo: string;
  };
  firmas: {
    docente: string;
    fecha_firma_docente: string | null;
    fecha_firma_coordinador: string | null;
  };
}

// Extensión SOLO de frontend (no la acepta el backend todavía) — secciones 1, 3, 4 y 5 del PDF
export interface EstudianteNota {
  cedula: string;
  apellidos: string;
  nombres: string;
  asistencia: number;
  p1: number;
  p2: number;
  rc: number | null;
  nf: number;
  evaluacion: string;
  promocion: string;
}

export interface InformeFinalCompleto {
  antecedentes: string;
  desarrolloActividades: string;
  cualitativos: {
    infraestructuraResultado: string;
    infraestructuraRecomendacion: string;
    planEstudiosResultado: string;
    planEstudiosRecomendacion: string;
  };
  cuantitativos: {
    estudiantes: EstudianteNota[];
  };
  recomendacionesFinales: string;
}
// ============================================================
// Informe Final — Formato 04
// Contrato REAL del backend (NestJS). No modificar estos tipos
// sin que el backend cambie primero.
// ============================================================

export interface CreateInformeFinalDto {
  id_docente: number;
  id_periodo: number;
  id_asignatura: number;
  id_paralelo: number;
  horario: string;
}

export interface InformeDto {
  nombre_docente: string;
  nombre_asignatura: string;
  paralelo: string;
  horario: string;
  periodo: string;
}

export interface FirmasDto {
  docente: string;
  fecha_firma_docente: string | null;
  fecha_firma_coordinador: string | null;
}

export interface InformeFinalResponseDto {
  informe: InformeDto;
  firmas: FirmasDto;
}

// ============================================================
// Secciones 1, 3, 4 y 5 del PDF (Antecedentes, Desarrollo de
// actividades, Resultados cualitativos, Resultados cuantitativos).
// El backend NO tiene contrato para esto todavía: son recuadros
// libres que llena el propio docente y se guardan SOLO en el
// navegador (localStorage), atados al id_oferta_asignatura.
// No se envían al servidor.
// ============================================================
export interface EstudianteNotaLocal {
  id: string; // id local (crypto.randomUUID), no viene del backend
  cedula: string;
  nombresApellidos: string;
  asistencia: number | null;
  p1: number | null;
  p2: number | null;
  rc: number | null;
  nf: number | null;
  evaluacion: string;
  promocion: string;
}

export interface InformeFinalCamposLocales {
  antecedentes: string;
  desarrolloActividades: string;
  cualitativoInfraestructuraResultado: string;
  cualitativoInfraestructuraRecomendacion: string;
  cualitativoPlanEstudiosResultado: string;
  cualitativoPlanEstudiosRecomendacion: string;
  recomendacionesFinales: string;
  estudiantes: EstudianteNotaLocal[];
}

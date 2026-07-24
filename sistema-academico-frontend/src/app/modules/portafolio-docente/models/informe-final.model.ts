export interface InformeDto {
  nombre_docente: string;
  nombre_asignatura: string;
  paralelo: string;
  horario: string;
  periodo: string;
}

export interface FirmasDto {
  docente: string;
  coordinador: string | null;
  fecha_firma_docente: string | null;
  fecha_firma_coordinador: string | null;
}

export interface InformeFinalResponseDto {
  informe: InformeDto;
  firmas: FirmasDto;
}

export interface CreateInformeFinalDto {
  id_docente: number;
  id_periodo: number;
  id_asignatura: number;
  id_paralelo: number;
  horario: string;
}

export interface ResultadoEstudianteManual {
  cedula: string;
  nombres: string;
  asistencia: number | null;
  p1: number | null;
  p2: number | null;
  rc: number | null;
}

/**
 * Secciones del Formato 04 que el backend NO persiste (no existen
 * columnas para ellas). Se guardan en localStorage por oferta
 * académica, mientras el backend no soporte estos campos.
 */
export interface InformeFinalManualData {
  antecedentes: string;
  desarrolloActividades: string;
  infraestructura: string;
  recomendacionesInfraestructura: string;
  planEstudios: string;
  recomendacionesPlanEstudios: string;
  resultados: ResultadoEstudianteManual[];
  recomendacionesCuantitativas: string;
  fechaElaboracion: string;
}

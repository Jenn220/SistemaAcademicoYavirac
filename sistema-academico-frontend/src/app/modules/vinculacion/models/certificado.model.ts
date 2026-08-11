export interface Certificado {
  fecha_emision: string;
  estudiante: string;
  cedula: string;
  carrera: string;
  proyecto: string;
  fecha_inicio: string;
  fecha_fin: string;
  total_horas: number;
  institucion: string;
  representante: string;
}

// ✅ OPCIONAL: Interfaz para datos combinados
export interface CertificadoCompleto {
  certificado: Certificado;
  proyectoNombre: string;
  fechaInicio: string;
  fechaFin: string;
  totalHoras: number;
}
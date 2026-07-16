export interface DatosEstudiante {
  nombre: string;
  cedula: string;
  carrera: string;
  nivel: string;
  email: string;
  telefono: string;
  estadoCivil: string;
  tipoSangre: string;
  domicilio: string;
  contactoEmergencia: string;
}

export interface DatosCarrera {
  coordinador: string;
  tutorAcademico: string;
}

export interface DatosProyectoEmpresarial {
  nombre: string;
  cobertura: string;
  plazo: string;
  fechaInicio: string;
  fechaFin: string;
}

export interface DatosEmpresaBeneficiaria {
  razonSocial: string;
  representanteLegal: string;
  tutorEmpresarial: string;
  direccion: string;
  ubicacion: string;
}

export interface CronogramaFecha {
  fecha: string;
  descripcion: string;
}

export interface DatosMaestra {
  estudiante: DatosEstudiante;
  carrera: DatosCarrera;
  proyectoEmpresarial: DatosProyectoEmpresarial;
  empresaBeneficiaria: DatosEmpresaBeneficiaria;
  cronograma: CronogramaFecha[];
}

export interface CartaCompromiso {
  encabezado: string;
  destinatario: string;
  cuerpo: string[];
  obligaciones: string[];
  prohibiciones: string[];
  compromisosConfidencialidad: string[];
  estudiante: { nombre: string; cedula: string };
  espacioFirma: { lugar: string; fecha: string };
}

export interface Curriculum {
  datosPersonales: DatosEstudiante;
  datosAcademicos: { carrera: string; nivel: string; institucion: string; promedio: string };
  experienciaLaboral: { empresa: string; cargo: string; periodo: string; funciones: string }[];
  practicasDualesPrevias: { empresa: string; periodo: string; horas: number }[];
  informacionAdicional: { logros: string[]; idiomas: string[]; habilidades: string[] };
}

export interface RegistroAsistenciaDia {
  fecha: string;
  horaIngreso: string;
  almuerzo: string;
  horaSalida: string;
  horasDia: number;
  firma: string;
  observaciones: string;
}

export interface RegistroAsistencia {
  estudiante: { nombre: string; cedula: string };
  empresa: string;
  registros: RegistroAsistenciaDia[];
  horasAutonomas: number;
  subtotalHorasPractica: number;
}

export interface InformeSemana {
  semana: number;
  rangoFechas: string;
  puestoAprendizaje: string;
  actividadesRealizadas: string;
  actividadesAutonomas: string;
  reflexion: string;
  observacionesEmpresa: string;
}

export interface InformeAprendizaje {
  estudiante: { nombre: string; cedula: string };
  empresa: string;
  semanas: InformeSemana[];
  totalSemanas: number;
}

export interface CriterioEmpresarial {
  id: number;
  criterio: string;
  puntaje: number;
  maximo: number;
}

export interface EvaluacionEmpresarial {
  estudiante: { nombre: string; cedula: string };
  empresa: string;
  tutorEmpresarial: string;
  criterios: CriterioEmpresarial[];
  defensaProyecto: { notaParcial: number; notaFinal: number };
  promedioCriterios: number;
  notaFinalEmpresa: number;
}

export interface CriterioInstituto {
  id: number;
  criterio: string;
  puntaje: number;
  maximo: number;
}

export interface EvaluacionInstituto {
  estudiante: { nombre: string; cedula: string };
  instituto: string;
  tutorAcademico: string;
  defensaProyecto: { nota: number };
  criteriosProyecto: CriterioInstituto[];
  notaFinalEmpresa: number;
  notaFinalInstituto: number;
  notaFinalConsolidada: number;
}

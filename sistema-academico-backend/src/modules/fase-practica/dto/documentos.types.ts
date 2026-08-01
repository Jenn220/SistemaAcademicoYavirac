export interface DatosEstudiante {
  idEstudiante: number | null;
  nombre: string;
  cedula: string;
  carrera: string;
  curso: string;
  nivel: string;
  email: string;
  telefono: string;
  estadoCivil: string;
  tipoSangre: string;
  domicilio: string;
  contactoEmergenciaNombre: string;
  contactoEmergenciaTelefono: string;
}

export interface DatosCarrera {
  coordinador: string;
  tutorAcademico: string;
  nucleoEstructurante: string;
  objetivoNucleoEstructurante: string;
}

export interface DatosProyectoEmpresarial {
  nombre: string;
  cobertura: string;
  plazo: string;
  empresaAsignada: string;
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

export interface PeriodoAcademico {
  codigo: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
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
  periodoAcademico: PeriodoAcademico;
  cronograma: CronogramaFecha[];
  /** Práctica resuelta por obtenerIdPractica — para que el front pueda usar el sistema real (informe/bitácoras, evaluaciones, CV) sin volver a resolverla. */
  idPractica?: number;
}

export interface CartaCompromiso {
  encabezado: string;
  cuerpo: string[];
  prohibicionesIntro: string;
  prohibiciones: string[];
  compromisosIntro: string;
  compromisosConfidencialidad: string[];
  cierre: string[];
  estudiante: { nombre: string; cedula: string };
  espacioFirma: { lugar: string; fecha: string };
}

export interface DatosAcademicos {
  anio: string;
  institucion: string;
  tituloMencion: string;
  notaFinal?: string;
}

export interface ExperienciaLaboral {
  anio: string;
  institucion: string;
  cargo: string;
  actividades: string;
}

export interface PracticaDual {
  anio: string;
  institucion: string;
  cargo: string;
  actividadesRealizadas: string;
}

export interface InformacionAdicional {
  anio: string;
  institucion: string;
  logro: string;
  detalle: string;
}

export interface Curriculum {
  datosPersonales: {
    nombre: string;
    cedula: string;
    estadoCivil: string;
    telefono: string;
    domicilio: string;
    emailInstitucional: string;
  };
  datosAcademicos: DatosAcademicos[];
  experienciaLaboral: ExperienciaLaboral[];
  practicasDualesPrevias: PracticaDual[];
  informacionAdicional: InformacionAdicional[];
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
  empresa: string;
  carrera: string;
  tutorAcademico: string;
  periodoAcademico: string;
  tutorEmpresarial: string;
  nivel: string;
  nucleoEstructurante: string;
  estudiante: {
    nombre: string;
    cedula: string;
    email: string;
    telefono: string;
    contactoEmergenciaNombre: string;
    contactoEmergenciaTelefono: string;
    tipoSangre: string;
    domicilio: string;
  };
  registros: RegistroAsistenciaDia[];
  horasAutonomas: number;
  subtotalHorasPractica: number;
}

export interface InformeAprendizajeEncabezado {
  empresa: string;
  nivel: string;
  cicloAcademico: string;
  fechaInicio: string;
  fechaFin: string;
  tutorAcademico: string;
  tutorEmpresarial: string;
  nucleoEstructurante: string;
  carrera: string;
  objetivoNucleoEstructurante: string;
  totalSemanas: number;
}

export interface InformeSemana {
  semana: number;
  fechaInicio: string;
  fechaFin: string;
  rangoFechas: string;
  puestoAprendizaje: string;
  actividadesRealizadas: string;
  actividadesAutonomas: string;
  reflexion: string;
  observacionesEmpresa: string;
}

export interface InformeAprendizaje {
  encabezado: InformeAprendizajeEncabezado;
  semanas: InformeSemana[];
  reflexionAprendizaje: string;
  observacionesEmpresa: string;
}

export interface CriterioEmpresarial {
  id: number;
  criterio: string;
  puntaje: number;
  maximo: number;
}

export interface DefensaProyectoItem {
  id?: number;
  criterio: string;
  puntaje: number;
  maximo: number;
}

export interface EvaluacionEmpresarial {
  estudiante: { nombre: string; cedula: string };
  empresa: string;
  tutorEmpresarial: string;
  nivel: string;
  cicloAcademico: string;
  nucleoEstructurante: string;
  carrera: string;
  fechaInicio: string;
  fechaFin: string;
  criterios: CriterioEmpresarial[];
  defensaProyecto: DefensaProyectoItem[];
  promedioCriterios: number;
  notaPonderadaSobre7: number;
  notaParcialDefensa: number;
  notaFinalDefensa: number;
  notaPonderadaDefensa: number;
  notaFinalEmpresa: number;
  observaciones: string;
  /** Datos para que el front pueda leer/escribir contra el sistema real de evaluaciones. */
  idPractica: number;
  idEvaluacion: number | null;
  idRubrica: number | null;
}

export interface CriterioInstituto {
  id: number;
  criterio: string;
  puntaje: number;
  maximo: number;
}

export interface EvaluacionInstituto {
  estudiante: { nombre: string; cedula: string };
  empresa: string;
  tutorEmpresarial: string;
  tutorAcademico: string;
  nivel: string;
  cicloAcademico: string;
  nucleoEstructurante: string;
  carrera: string;
  fechaInicio: string;
  fechaFin: string;
  defensaProyecto: DefensaProyectoItem[];
  notaParcialDefensa: number;
  notaFinalDefensa: number;
  notaPonderadaDefensa: number;
  criteriosProyecto: CriterioInstituto[];
  promedioProyecto: number;
  notaPonderadaProyecto: number;
  notaFinalEmpresa: number;
  notaFinalInstituto: number;
  notaFinalConsolidada: number;
  observaciones: string;
  /** Datos para que el front pueda leer/escribir contra el sistema real de evaluaciones. */
  idPractica: number;
  idEvaluacion: number | null;
  idRubrica: number | null;
}

export interface ActaInduccionSeguridad {
  lugarFecha: string;
  estudiante: {
    nombre: string;
    cedula: string;
    nivel: string;
    carrera: string;
  };
  empresa: {
    razonSocial: string;
  };
  textoLegal: string[];
  firmaEstudiante: string;
}

export interface EstudianteActaEntorno {
  no: number;
  nombre: string;
  cedula: string;
  nivel: string;
  nota: string;
  firma: string;
}

export interface FirmasActaEntorno {
  tutorEmpresarial: {
    nombre: string;
    cedula: string;
  };
  coordinador: {
    nombre: string;
    cedula: string;
  };
  tutorAcademico: {
    nombre: string;
    cedula: string;
  };
}

export interface ActaEntornoLaboral {
  encabezado: {
    instituto: string;
    titulo: string;
    fecha: string;
    carrera: string;
    periodoAcademico: string;
    entidadReceptora: string;
  };
  textoLegal: string[];
  anexos: string[];
  estudiantes: EstudianteActaEntorno[];
  firmas: FirmasActaEntorno;
}

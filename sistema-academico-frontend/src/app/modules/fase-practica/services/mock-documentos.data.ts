/**
 * Datos moqueados TEMPORALES para los documentos de Fase Práctica.
 *
 * Motivo: el login/JWT del frontend todavía no está implementado, por lo que
 * los endpoints /api/fase-practica/documentos/* responden 401 y no hay forma
 * de ver las vistas con datos reales. Mientras tanto se usan estos mocks
 * (basados en los formatos oficiales F01, F02, F05, F06, F07 y F08 del
 * estudiante NIVESELA ARMIJOS KEVIN SMITH) como fallback cuando la petición
 * falla.
 *
 * QUITAR este archivo y sus usos en las páginas una vez que el login esté
 * conectado y los endpoints devuelvan datos reales del usuario autenticado.
 */

import {
  CartaCompromiso,
  RegistroAsistencia,
  Curriculum,
  InformeAprendizajeDocumento,
  EvaluacionEmpresarial,
  EvaluacionInstituto,
  InformeAprendizajeEncabezado
} from '../interfaces';

export const MOCK_CARTA_COMPROMISO: CartaCompromiso = {

  encabezado: 'D.M. Quito, lunes, 9 de junio de 2025',

  cuerpo: [
    'De acuerdo con el proyecto de carrera aprobado y vigente, en cumplimiento del currículo de la carrera, y en el marco del convenio firmado, me presento y, expreso mi interés y predisposición de realizar prácticas de formación dual, con el fin de cumplir con la planificación, ejecución, control y evaluación del proceso de desarrollo de las competencias laborales como estudiante de la carrera.',
    'Soy una persona que cumple con el perfil de ingreso de la carrera, y busco aprender y desarrollar los conocimientos, habilidades-destrezas y actitudes del perfil de egreso, y lograr las competencias como profesional de mi carrera.',
    'Por lo cual, solicito su aceptación para realizar mi proceso de formación práctica en el entorno laboral real en modalidad dual.',
    'A la vez que, me comprometo con acatar la normativa general vigente con las obligaciones establecidas en el Artículo 16 (Obligaciones generales del estudiante en modalidad dual) del Reglamento para Carreras y Programas en Modalidad de Formación Dual vigente, así como también, la normativa interna de la entidad formadora y, la normativa del Instituto.'
  ],

  prohibicionesIntro: 'Reconociendo y aceptando entre otras prohibiciones expresas durante la Fase Práctica, las que se determinan a continuación:',

  prohibiciones: [
    'Prohibición de consumo de alcohol.',
    'Prohibición de consumo de sustancias estupefacientes, psicotrópicos y estimulantes.',
    'Prohibición de tratos groseros e irrespetuosos a compañeros y del entorno (compañeros y demás personas involucradas)',
    'Prohibición de desacatar las directrices de tutores empresariales y también de tutores académicos del instituto.'
  ],

  compromisosIntro: 'También me comprometo en:',

  compromisosConfidencialidad: [
    'Garantizar la confidencialidad, reserva y protección de los datos e información proporcionados por la entidad receptora formadora, durante y después de mi fase práctica.',
    'Y, promover un entorno social armónico, precautelar y salvaguardar la propiedad ajena y los bienes que pertenecen al sitio.'
  ],

  cierre: [
    'Y así mismo, me comprometo en elaborar y presentar todos los documentos necesarios para validar el proceso de formación en modalidad dual, de acuerdo con lo establecido por la entidad receptora formadora y/o el Instituto, los cuáles deberán estar correctamente llenados y firmados.',
    'El incumplimiento a lo comprometido con la entidad receptora formadora y/o del Instituto, será causal para la toma de medidas disciplinarias conforme a las responsabilidades del proceso de formación en modalidad dual.',
    'De manera libre y voluntaria acepto lo expresado y firmo como esta acta compromiso como constancia.'
  ],

  estudiante: {
    nombre: 'NIVESELA ARMIJOS KEVIN SMITH',
    cedula: '2250022114',
    carrera: 'DESARROLLO DE SOFTWARE',
    curso: '3ro'
  },

  empresaAsignada: 'INSTITUTO DE CAPACITACIÓN Y ESPECIALIZACIÓN AMAUTA-TECH S.A.S. B.I.C.',

  espacioFirma: {
    lugar: 'D.M. Quito',
    fecha: 'lunes, 9 de junio de 2025'
  }

};

const FECHAS_ASISTENCIA: string[] = [
  '09/06/2025', '10/06/2025', '11/06/2025', '12/06/2025', '13/06/2025',
  '16/06/2025', '17/06/2025', '18/06/2025', '19/06/2025', '20/06/2025',
  '23/06/2025', '24/06/2025', '25/06/2025', '26/06/2025', '27/06/2025',
  '30/06/2025', '01/07/2025', '02/07/2025', '03/07/2025', '04/07/2025',
  '07/07/2025', '08/07/2025', '09/07/2025', '10/07/2025', '11/07/2025',
  '14/07/2025', '15/07/2025', '16/07/2025', '17/07/2025', '18/07/2025',
  '21/07/2025', '22/07/2025', '23/07/2025', '24/07/2025', '25/07/2025',
  '28/07/2025', '29/07/2025', '30/07/2025', '31/07/2025', '01/08/2025'
];

export const MOCK_REGISTRO_ASISTENCIA: RegistroAsistencia = {

  estudiante: {
    nombre: 'NIVESELA ARMIJOS KEVIN SMITH',
    cedula: '2250022114',
    email: 'ksa.nivesela@yavirac.edu.ec',
    telefono: '0994618520',
    tipoSangre: 'O+'
  },

  empresa: 'INSTITUTO DE CAPACITACIÓN Y ESPECIALIZACIÓN AMAUTA-TECH S.A.S. B.I.C.',
  carrera: 'DESARROLLO DE SOFTWARE',
  curso: 'TERCERO',
  periodoAcademico: '2025-I',
  nucleoEstructurante: 'DESARROLLO WEB FRONT-END',
  tutorAcademico: 'Ing. Byron Moreno',
  tutorEmpresarial: 'Ing. Mauricio Tamayo',
  contactoEmergenciaNombre: 'ANDREA ARMIJOS',
  contactoEmergenciaTelefono: '0988137695',

  registros: FECHAS_ASISTENCIA.map((fecha) => ({
    fecha,
    horaIngreso: '09H00',
    almuerzo: '12H30 - 13H30',
    horaSalida: '18H00',
    horasDia: 8,
    firma: '',
    observaciones: 'S/N'
  })),

  horasAutonomas: 40,
  subtotalHorasPractica: 360

};

export const MOCK_CURRICULUM: Curriculum = {

  periodoAcademico: '2025-I',

  datosPersonales: {
    nombre: 'NIVESELA ARMIJOS KEVIN SMITH',
    cedula: '2250022114',
    estadoCivil: 'SOLTERO',
    telefono: '0968699079',
    domicilio: 'Mira Flores, Calles Buenos Aires y Panamá',
    emailInstitucional: 'ksa.nivesela@yavirac.edu.ec'
  },

  datosAcademicos: [
    { anio: '2022', institucion: 'Colegio de Bachillerato Narcisa de Jesús', tituloMencion: 'Electrónica de Consumos', notaFinal: '9,47' },
    { anio: '2023-En curso', institucion: 'Universidad Técnica Particular de Loja', tituloMencion: 'Ingeniería en Tecnologías de la Información', notaFinal: 'Pendiente' },
    { anio: '2024-En curso', institucion: 'Instituto Superior Tecnológico "Yavirac"', tituloMencion: 'Desarrollo de Software', notaFinal: 'Pendiente' }
  ],

  experienciaLaboral: [
    { anio: '2022-2023', institucion: 'Taller de mecánica "Tecnocar"', cargo: 'Atención al Cliente', actividades: 'Recepción de vehículos, caja, compra y pedido de repuestos' }
  ],

  practicasDuales: [
    { anio: '2024-I', institucion: 'LIKME', puestoAprendizaje: 'Atención al Cliente', actividades: 'Soporte técnico' },
    { anio: '2024-II', institucion: 'LINKME', puestoAprendizaje: 'Sistema contable', actividades: 'Desarrollo e implementación del sistema contable' }
  ],

  informacionAdicional: [
    { anio: '2021', institucion: 'Federación deportiva de Orellana', logro: 'Subcampeón Nacional', detalle: 'Campeonato Nacional de Taekwondo' },
    { anio: '2022', institucion: 'Learning Bridge', logro: 'Certificación B1', detalle: 'B1 inglés' },
    { anio: '2023', institucion: 'Colegio de Bachillerato Técnico Narcisa de Jesús', logro: 'Abanderado', detalle: 'Porta estandarte Provincial' },
    { anio: '2024', institucion: 'Automóvil Club del Ecuador', logro: 'Licencia de conducir', detalle: 'Obtención de licencia tipo B' }
  ]

};

const ENCABEZADO_FASE_PRACTICA: InformeAprendizajeEncabezado = {
  empresaFormadora: 'INSTITUTO DE CAPACITACIÓN Y ESPECIALIZACIÓN AMAUTA-TECH S.A.S. B.I.C.',
  nivel: 'TERCERO',
  cicloAcademico: '2025-I',
  fechaInicioFasePractica: '09/06/2025',
  fechaFinFasePractica: '01/08/2025',
  tutorAcademico: 'Ing. Byron Moreno',
  nucleoEstructurante: 'DESARROLLO WEB FRONT-END',
  tutorEmpresarial: 'Ing. Mauricio Tamayo',
  carrera: 'DESARROLLO DE SOFTWARE',
  objetivoNucleoEstructurante: 'Desarrollar aplicaciones complejas aplicando el paradigma de la programación orientada a objetos.'
};

export const MOCK_INFORME_APRENDIZAJE: InformeAprendizajeDocumento = {

  estudiante: {
    nombre: 'NIVESELA ARMIJOS KEVIN SMITH',
    cedula: '2250022114'
  },

  encabezado: ENCABEZADO_FASE_PRACTICA,

  semanas: [
    { semana: 1, fechaInicio: '09/06/2025', fechaFin: '13/06/2025', puestoAprendizaje: 'TICS', actividadesRealizadas: 'Configuración del entorno y proyecto.', actividadesAutonomas: 'Revisión de documentación de Angular y Firebase.' },
    { semana: 2, fechaInicio: '16/06/2025', fechaFin: '20/06/2025', puestoAprendizaje: 'TICS', actividadesRealizadas: 'Presentación y definición del sistema.', actividadesAutonomas: 'Estudio de patrones de diseño y modelado de datos.' },
    { semana: 3, fechaInicio: '23/06/2025', fechaFin: '27/06/2025', puestoAprendizaje: 'TICS', actividadesRealizadas: 'Base del frontend y componentes iniciales.', actividadesAutonomas: 'Investigación de PrimeNG y SCSS responsivo.' },
    { semana: 4, fechaInicio: '30/06/2025', fechaFin: '04/07/2025', puestoAprendizaje: 'TICS', actividadesRealizadas: 'Diseño y maquetación de vistas principales.', actividadesAutonomas: 'Ajustes visuales y pruebas de interfaz.' },
    { semana: 5, fechaInicio: '07/07/2025', fechaFin: '11/07/2025', puestoAprendizaje: 'TICS', actividadesRealizadas: 'Formularios reactivos y login.', actividadesAutonomas: 'Prácticas de validaciones y manejo de errores.' },
    { semana: 6, fechaInicio: '14/07/2025', fechaFin: '18/07/2025', puestoAprendizaje: 'TICS', actividadesRealizadas: 'Corrección de errores y mejoras internas.', actividadesAutonomas: 'Refactorización y optimización de código.' },
    { semana: 7, fechaInicio: '21/07/2025', fechaFin: '25/07/2025', puestoAprendizaje: 'TICS', actividadesRealizadas: 'Integración con Firestore y gestión de citas.', actividadesAutonomas: 'Ajustes de consultas y pruebas de flujo.' },
    { semana: 8, fechaInicio: '28/07/2025', fechaFin: '01/08/2025', puestoAprendizaje: 'TICS', actividadesRealizadas: 'Corrección de bugs y mejoras visuales finales.', actividadesAutonomas: 'Pruebas finales y revisión general del sistema.' }
  ],

  reflexionAprendizaje: 'La práctica me permitió mejorar en Angular, Firebase y Git, aplicar buenas prácticas y trabajar con un sistema real, fortaleciendo mi capacidad técnica y de resolución de problemas.',

  observacionesEmpresa: 'El estudiante mostró buen desempeño técnico, uso adecuado de Angular, Firebase y Git, y realizó sus tareas con responsabilidad y eficiencia.'

};

const CRITERIOS_DEFENSA_PROYECTO = [
  'Presentación en tiempo y forma (formato, normas APA, cronograma)',
  'Calidad de la presentación (uso ayudas técnicas y audiovisuales, etc.)',
  'Dominio del contenido',
  'Claridad y precisión en la exposición',
  'Satisfacción de la Empresa Formadora'
];

export const MOCK_EVALUACION_EMPRESARIAL: EvaluacionEmpresarial = {

  estudiante: {
    nombre: 'NIVESELA ARMIJOS KEVIN SMITH',
    cedula: '2250022114'
  },

  encabezado: ENCABEZADO_FASE_PRACTICA,

  desempeno: [
    { criterio: 'Logro de Objetivos de Aprendizaje', nota: 8 },
    { criterio: 'Desempeño en los puestos de trabajo y actividades asignadas (Plan de rotación)', nota: 8 },
    { criterio: 'Capacidad de aplicar los conocimientos en la práctica.', nota: 8 },
    { criterio: 'Capacidad de comunicación oral y escrita.', nota: 8 },
    { criterio: 'Capacidad de investigación, aprender y actualizarse permanentemente', nota: 8 },
    { criterio: 'Capacidad creativa.', nota: 8 },
    { criterio: 'Capacidad para identificar, plantear y resolver problemas.', nota: 8 },
    { criterio: 'Capacidad de trabajo en equipo y capacidades interpersonales', nota: 8 },
    { criterio: 'Valoración y respeto por la diversidad y multiculturalidad.', nota: 8 },
    { criterio: 'Habilidad para trabajar en forma autónoma.', nota: 8 }
  ],

  defensaProyecto: CRITERIOS_DEFENSA_PROYECTO.map((criterio) => ({ criterio, nota: 4 })),

  observaciones: ''

};

export const MOCK_EVALUACION_INSTITUTO: EvaluacionInstituto = {

  estudiante: {
    nombre: 'NIVESELA ARMIJOS KEVIN SMITH',
    cedula: '2250022114'
  },

  encabezado: ENCABEZADO_FASE_PRACTICA,

  defensaProyecto: CRITERIOS_DEFENSA_PROYECTO.map((criterio) => ({ criterio, nota: 4 })),

  tema: 'Sistema de Gestión Académica Yavirac',

  parametrosProyecto: [
    { criterio: 'Proactividad, independencia y compromiso demostrado en la elaboración del proyecto', nota: 9 },
    { criterio: 'Plazo y calidad en la entrega de documentos', nota: 9 },
    { criterio: 'Cumplimiento de parámetros en el proyecto empresarial escrito', nota: 9 },
    { criterio: 'Desarrollo del proyecto en profundidad y aporte a la solución del problema', nota: 9 },
    { criterio: 'Cumplimiento de requerimientos / objetivos planteados al inicio del proyecto', nota: 9 },
    { criterio: 'Uso de metodología científica y aplicación de normas bibliográficas', nota: 9 },
    { criterio: 'Aporte al proyecto acorde al nivel académico', nota: 9 }
  ],

  notaFinalEmpresa: 8.58,

  observaciones: ''

};

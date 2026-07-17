/**
 * Datos moqueados TEMPORALES para los documentos de Fase Práctica.
 *
 * Motivo: el login/JWT del frontend todavía no está implementado, por lo que
 * los endpoints /api/fase-practica/documentos/* responden 401 y no hay forma
 * de ver las vistas con datos reales. Mientras tanto se usan estos mocks
 * (basados en los formatos oficiales F01, F02, F05 y F06 del estudiante
 * NIVESELA ARMIJOS KEVIN SMITH) como fallback cuando la petición falla.
 *
 * QUITAR este archivo y sus usos en las páginas una vez que el login esté
 * conectado y los endpoints devuelvan datos reales del usuario autenticado.
 */

import {
  CartaCompromiso,
  RegistroAsistencia,
  Curriculum,
  InformeAprendizajeDocumento
} from '../interfaces';

export const MOCK_CARTA_COMPROMISO: CartaCompromiso = {

  encabezado: 'D.M. Quito, Lunes, junio 09, 2025',

  cuerpo: [
    'Yo, NIVESELA ARMIJOS KEVIN SMITH con C.C. 2250022114 estudiante de 3ro de la carrera DESARROLLO DE SOFTWARE en modalidad dual, DEL INSTITUTO SUPERIOR TECNOLÓGICO DE TURISMO Y PATRIMONIO YAVIRAC, asignado/a a INSTITUTO DE CAPACITACIÓN Y ESPECIALIZACIÓN AMAUTA-TECH S.A.S. B.I.C.',
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
    'De no dar cumplimiento con lo antes citado, puede conllevar bajo el debido proceso a la pérdida de la fase práctica.',
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
    fecha: 'Lunes, junio 09, 2025'
  }

};

const FECHAS_ASISTENCIA: string[] = [
  'lun 9/6/2025', 'mar 10/6/2025', 'mié 11/6/2025', 'jue 12/6/2025', 'vie 13/6/2025',
  'lun 16/6/2025', 'mar 17/6/2025', 'mié 18/6/2025', 'jue 19/6/2025', 'vie 20/6/2025',
  'lun 23/6/2025', 'mar 24/6/2025', 'mié 25/6/2025', 'jue 26/6/2025', 'vie 27/6/2025',
  'lun 30/6/2025', 'mar 1/7/2025', 'mié 2/7/2025', 'jue 3/7/2025', 'vie 4/7/2025',
  'lun 7/7/2025', 'mar 8/7/2025', 'mié 9/7/2025', 'jue 10/7/2025', 'vie 11/7/2025',
  'lun 14/7/2025', 'mar 15/7/2025', 'mié 16/7/2025', 'jue 17/7/2025', 'vie 18/7/2025',
  'lun 21/7/2025', 'mar 22/7/2025', 'mié 23/7/2025', 'jue 24/7/2025', 'vie 26/7/2025',
  'lun 28/7/2025', 'mar 29/7/2025', 'mié 30/7/2025', 'jue 31/7/2025', 'vie 1/8/2025'
];

export const MOCK_REGISTRO_ASISTENCIA: RegistroAsistencia = {

  estudiante: {
    nombre: 'NIVESELA ARMIJOS KEVIN SMITH',
    cedula: '2250022114',
    email: 'ksa.nivesela@yavirac.edu.ec',
    telefono: '994618520',
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
    horaIngreso: '8:00',
    almuerzo: '12:00:00-13:00',
    horaSalida: '17:00',
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

export const MOCK_INFORME_APRENDIZAJE: InformeAprendizajeDocumento = {

  estudiante: {
    nombre: 'NIVESELA ARMIJOS KEVIN SMITH',
    cedula: '2250022114'
  },

  encabezado: {
    empresaFormadora: 'INSTITUTO DE CAPACITACIÓN Y ESPECIALIZACIÓN AMAUTA-TECH S.A.S. B.I.C.',
    nivel: 'TERCERO',
    cicloAcademico: '2025-I',
    fechaInicioFasePractica: '9/6/2025',
    fechaFinFasePractica: '1/8/2025',
    tutorAcademico: 'Ing. Byron Moreno',
    nucleoEstructurante: 'DESARROLLO WEB FRONT-END',
    tutorEmpresarial: 'Ing. Mauricio Tamayo',
    carrera: 'DESARROLLO DE SOFTWARE',
    objetivoNucleoEstructurante: 'Desarrollar aplicaciones complejas aplicando el paradigma de la programación orientada a objetos.'
  },

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

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentoEntity } from '../domain/documento.entity';

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

@Injectable()
export class DocumentoService {
  constructor(
    @InjectRepository(DocumentoEntity)
    private readonly documentoRepository: Repository<DocumentoEntity>,
  ) {}

  private readonly datosMaestra: DatosMaestra = {
    estudiante: {
      nombre: 'MARÍA FERNANDA QUISPE ÑAUPARI',
      cedula: '1750123456',
      carrera: 'Tecnología Superior en Desarrollo de Software',
      nivel: 'Sexto Nivel - Fase Práctica',
      email: 'maria.quispe@estudiante.yavirac.edu.ec',
      telefono: '0987654321',
      estadoCivil: 'Soltera',
      tipoSangre: 'O+',
      domicilio: 'Calle Los Capulíes N23-45 y Av. Amazonas, Quito',
      contactoEmergencia: 'LUZ MARÍA ÑAUPARI - 0991234567 (Madre)',
    },
    carrera: {
      coordinador: 'ING. PATRICIO RAMÍREZ',
      tutorAcademico: 'ING. CARLOS MONTENEGRO',
    },
    proyectoEmpresarial: {
      nombre: 'Sistema de Gestión Académica Yavirac',
      cobertura: 'Institucional - Campus Matriz',
      plazo: '6 meses',
      fechaInicio: '2025-12-01',
      fechaFin: '2026-05-29',
    },
    empresaBeneficiaria: {
      razonSocial: 'INSTITUTO TECNOLÓGICO SUPERIOR YAVIRAC',
      representanteLegal: 'LIC. ANA BELÉN TORRES',
      tutorEmpresarial: 'ING. DIANA VÁSQUEZ',
      direccion: 'Av. 12 de Octubre N12-10 y Wilson, Quito',
      ubicacion: 'Quito - Ecuador',
    },
    cronograma: [
      { fecha: '2025-12-01', descripcion: 'Inicio de fase práctica' },
      { fecha: '2025-12-08', descripcion: 'Inducción y plan de rotación' },
      { fecha: '2026-02-15', descripcion: 'Seguimiento intermedio' },
      { fecha: '2026-04-30', descripcion: 'Entrega de informe final' },
      { fecha: '2026-05-29', descripcion: 'Defensa de proyecto' },
    ],
  };

  getDatosMaestra(): DatosMaestra {
    return this.datosMaestra;
  }

  getCartaCompromiso(): CartaCompromiso {
    const { estudiante, empresaBeneficiaria } = this.datosMaestra;
    return {
      encabezado: 'CARTA DE COMPROMISO (Formato 01)',
      destinatario: `A la ${empresaBeneficiaria.razonSocial}`,
      cuerpo: [
        `Yo, ${estudiante.nombre}, con cédula ${estudiante.cedula}, estudiante de la ${estudiante.carrera}, me presento para cumplir mi fase práctica pre profesional.`,
        'Me comprometo a cumplir el horario establecido y las normativas de la institución y la empresa beneficiaria.',
      ],
      obligaciones: [
        'Cumplir el horario y plan de rotación acordado.',
        'Ejecutar las actividades asignadas con responsabilidad.',
        'Entregar los informes y bitácoras en los plazos establecidos.',
        'Cuidar los recursos y equipos asignados.',
      ],
      prohibiciones: [
        'Consumo de bebidas alcohólicas dentro de la jornada y las instalaciones.',
        'Consumo o porte de sustancias estupefacientes o psicotrópicas.',
        'Malos tratos, acoso o cualquier forma de violencia hacia el personal.',
        'Abandono del puesto de trabajo sin autorización.',
      ],
      compromisosConfidencialidad: [
        'Mantener reserva de la información confidencial a la que tenga acceso.',
        'No divulgar datos de la empresa beneficiaria ni de terceros.',
        'Devolver toda la documentación y activos al finalizar la práctica.',
      ],
      estudiante: { nombre: estudiante.nombre, cedula: estudiante.cedula },
      espacioFirma: { lugar: 'Quito', fecha: '2025-12-01' },
    };
  }

  getCurriculum(): Curriculum {
    const { estudiante } = this.datosMaestra;
    return {
      datosPersonales: estudiante,
      datosAcademicos: {
        carrera: estudiante.carrera,
        nivel: estudiante.nivel,
        institucion: 'Instituto Tecnológico Superior Yavirac',
        promedio: '8.92',
      },
      experienciaLaboral: [
        {
          empresa: 'Empresa Demo S.A.',
          cargo: 'Practicante de Soporte Técnico',
          periodo: '2024-06 a 2024-08',
          funciones: 'Soporte a usuarios, mantenimiento de equipos y redes.',
        },
      ],
      practicasDualesPrevias: [
        { empresa: 'Tech Solutions', periodo: '2024', horas: 120 },
      ],
      informacionAdicional: {
        logros: [
          'Primer puesto en feria de proyectos 2024.',
          'Certificación en Scrum Foundation.',
        ],
        idiomas: ['Español (nativo)', 'Inglés (B1)'],
        habilidades: ['JavaScript', 'TypeScript', 'NestJS', 'PostgreSQL', 'Git'],
      },
    };
  }

  getRegistroAsistencia(): RegistroAsistencia {
    const { estudiante, empresaBeneficiaria } = this.datosMaestra;
    const registros: RegistroAsistenciaDia[] = [];
    const inicio = new Date('2025-12-01T00:00:00');
    let agregados = 0;
    while (agregados < 36) {
      const dia = inicio.getDay();
      if (dia !== 0 && dia !== 6) {
        const fecha = inicio.toISOString().slice(0, 10);
        registros.push({
          fecha,
          horaIngreso: '08:00',
          almuerzo: '13:00 - 14:00',
          horaSalida: '18:00',
          horasDia: 10,
          firma: '',
          observaciones: '',
        });
        agregados++;
      }
      inicio.setDate(inicio.getDate() + 1);
    }
    return {
      estudiante: { nombre: estudiante.nombre, cedula: estudiante.cedula },
      empresa: empresaBeneficiaria.razonSocial,
      registros,
      horasAutonomas: 0,
      subtotalHorasPractica: 36 * 10,
    };
  }

  getInformeAprendizaje(): InformeAprendizaje {
    const { estudiante, empresaBeneficiaria } = this.datosMaestra;
    const puestos = [
      'Desarrollo de Backend',
      'Desarrollo de Frontend',
      'Análisis de Requisitos',
      'Pruebas de Software',
      'Base de Datos',
      'Documentación Técnica',
      'Soporte e Integración',
      'Despliegue y DevOps',
    ];
    const semanas: InformeSemana[] = puestos.map((puesto, i) => ({
      semana: i + 1,
      rangoFechas: `Semana ${i + 1}`,
      puestoAprendizaje: puesto,
      actividadesRealizadas: `Apoyo en tareas de ${puesto.toLowerCase()} dentro del proyecto institucional.`,
      actividadesAutonomas: 'Estudio de documentación y cursos complementarios.',
      reflexion: 'He reforzado mis conocimientos prácticos y el trabajo en equipo.',
      observacionesEmpresa: 'Buen desempeño y compromiso.',
    }));
    return {
      estudiante: { nombre: estudiante.nombre, cedula: estudiante.cedula },
      empresa: empresaBeneficiaria.razonSocial,
      semanas,
      totalSemanas: semanas.length,
    };
  }

  getEvaluacionEmpresarial(): EvaluacionEmpresarial {
    const { estudiante, empresaBeneficiaria, carrera } = this.datosMaestra;
    const criteriosBase = [
      'Puntualidad y asistencia',
      'Responsabilidad',
      'Trabajo en equipo',
      'Capacidad técnica',
      'Iniciativa',
      'Comunicación',
      'Resolución de problemas',
      'Ética profesional',
      'Adaptabilidad',
      'Calidad del trabajo',
    ];
    const puntajes = [6, 6, 5.5, 6, 5.5, 6, 5.5, 6, 6, 5.5];
    const criterios: CriterioEmpresarial[] = criteriosBase.map((criterio, i) => ({
      id: i + 1,
      criterio,
      puntaje: puntajes[i],
      maximo: 6,
    }));
    const suma = puntajes.reduce((a, b) => a + b, 0);
    const promedioCriterios = Number((suma / criterios.length).toFixed(2));
    return {
      estudiante: { nombre: estudiante.nombre, cedula: estudiante.cedula },
      empresa: empresaBeneficiaria.razonSocial,
      tutorEmpresarial: empresaBeneficiaria.tutorEmpresarial,
      criterios,
      defensaProyecto: { notaParcial: 6.2, notaFinal: 6.5 },
      promedioCriterios,
      notaFinalEmpresa: 6.45,
    };
  }

  getEvaluacionInstituto(): EvaluacionInstituto {
    const { estudiante, carrera } = this.datosMaestra;
    const criteriosBase = [
      'Alcance del proyecto',
      'Metodología',
      'Innovación',
      'Documentación',
      'Sostenibilidad',
      'Impacto institucional',
      'Presentación y defensa',
    ];
    const puntajes = [7.5, 7, 7, 7.5, 6.5, 7, 7.5];
    const criterios: CriterioInstituto[] = criteriosBase.map((criterio, i) => ({
      id: i + 1,
      criterio,
      puntaje: puntajes[i],
      maximo: 10,
    }));
    return {
      estudiante: { nombre: estudiante.nombre, cedula: estudiante.cedula },
      instituto: 'Instituto Tecnológico Superior Yavirac',
      tutorAcademico: carrera.tutorAcademico,
      defensaProyecto: { nota: 7.2 },
      criteriosProyecto: criterios,
      notaFinalEmpresa: 6.45,
      notaFinalInstituto: 7.2,
      notaFinalConsolidada: 7.175,
    };
  }

  async guardarDocumento(
    codigo: string,
    titulo: string,
    contenido: Record<string, any>,
  ): Promise<DocumentoEntity> {
    const documento = this.documentoRepository.create({
      codigo_formato: codigo,
      titulo,
      contenido,
    });
    return this.documentoRepository.save(documento);
  }

  getTodosLosDocumentos() {
    return {
      datos: this.getDatosMaestra(),
      cartaCompromiso: this.getCartaCompromiso(),
      curriculum: this.getCurriculum(),
      registroAsistencia: this.getRegistroAsistencia(),
      informeAprendizaje: this.getInformeAprendizaje(),
      evaluacionEmpresarial: this.getEvaluacionEmpresarial(),
      evaluacionInstituto: this.getEvaluacionInstituto(),
    };
  }
}

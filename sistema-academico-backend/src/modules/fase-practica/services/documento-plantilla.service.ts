import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstudianteEntity } from '../domain/estudiante.entity';
import { EmpresaEntity } from '../domain/empresa.entity';
import { PracticaEntity } from '../domain/practica.entity';
import { RegistroDiarioEntity } from '../domain/registro-diario.entity';
import { InformeAprendizajeEntity } from '../domain/informe-aprendizaje.entity';
import { BitacoraSemanalEntity } from '../domain/bitacora-semanal.entity';
import { EvaluacionPracticaEntity } from '../domain/evaluacion-practica.entity';
import { CvDatoAcademicoEntity } from '../domain/cv-dato-academico.entity';
import { CvExperienciaLaboralEntity } from '../domain/cv-experiencia-laboral.entity';
import { CvPracticaDualEntity } from '../domain/cv-practica-dual.entity';
import { NucleoEstructuranteEntity } from '../domain/nucleo-estructurante.entity';
import {
  DatosEstudiante,
  DatosCarrera,
  DatosProyectoEmpresarial,
  DatosEmpresaBeneficiaria,
  PeriodoAcademico,
  CronogramaFecha,
  DatosMaestra,
  CartaCompromiso,
  Curriculum,
  RegistroAsistenciaDia,
  RegistroAsistencia,
  InformeAprendizajeEncabezado,
  InformeSemana,
  InformeAprendizaje,
  CriterioEmpresarial,
  EvaluacionEmpresarial,
  CriterioInstituto,
  EvaluacionInstituto,
} from '../dto/documentos.types';

@Injectable()
export class DocumentoPlantillaService {
  constructor(
    @InjectRepository(EstudianteEntity)
    private readonly estudianteRepository: Repository<EstudianteEntity>,
    @InjectRepository(EmpresaEntity)
    private readonly empresaRepository: Repository<EmpresaEntity>,
    @InjectRepository(PracticaEntity)
    private readonly practicaRepository: Repository<PracticaEntity>,
    @InjectRepository(RegistroDiarioEntity)
    private readonly registroDiarioRepository: Repository<RegistroDiarioEntity>,
    @InjectRepository(InformeAprendizajeEntity)
    private readonly informeRepository: Repository<InformeAprendizajeEntity>,
    @InjectRepository(BitacoraSemanalEntity)
    private readonly bitacoraRepository: Repository<BitacoraSemanalEntity>,
    @InjectRepository(EvaluacionPracticaEntity)
    private readonly evaluacionRepository: Repository<EvaluacionPracticaEntity>,
    @InjectRepository(CvDatoAcademicoEntity)
    private readonly cvDatoAcademicoRepository: Repository<CvDatoAcademicoEntity>,
    @InjectRepository(CvExperienciaLaboralEntity)
    private readonly cvExperienciaLaboralRepository: Repository<CvExperienciaLaboralEntity>,
    @InjectRepository(CvPracticaDualEntity)
    private readonly cvPracticaDualRepository: Repository<CvPracticaDualEntity>,
    @InjectRepository(NucleoEstructuranteEntity)
    private readonly nucleoRepository: Repository<NucleoEstructuranteEntity>,
    private readonly dataSource: DataSource,
  ) {}

  private async obtenerIdPractica(usuario: any): Promise<number> {
    const practica = await this.practicaRepository.findOne({
      where: { id_empresa: usuario.idEmpresa ?? 1 },
    });

    if (!practica) {
      const primera = await this.practicaRepository.find({
        order: { id_practica: 'ASC' },
        take: 1,
      });
      return primera[0]?.id_practica ?? 1;
    }

    return practica.id_practica;
  }

  async getDatosMaestra(usuario: any): Promise<DatosMaestra> {
    const estudiante = await this.estudianteRepository.findOne({
      where: { id_estudiante: usuario.idEstudiante },
    });

    if (!estudiante) {
      throw new Error('Estudiante no encontrado');
    }

    const practica = await this.practicaRepository.findOne({
      where: { id_empresa: usuario.idEmpresa ?? 1 },
    });

    const empresa = practica
      ? await this.empresaRepository.findOne({ where: { id_empresa: practica.id_empresa } })
      : await this.empresaRepository.findOne({ where: { id_empresa: 1 } });

    const tutorEmpresarial = practica?.tutor_empresarial;

    let carreraNombre = '';
    let nivelNombre = '';
    let periodoCodigo = '';
    let periodoNombre = '';
    let periodoInicio = '';
    let periodoFin = '';
    let coordinadorNombre = '';
    let tutorAcademicoNombre = '';
    let fechaInicioFase = '';
    let fechaFinFase = '';

    const matricula = await this.dataSource.query(
      `SELECT m.id_matricula, m.id_carrera, m.id_periodo, c.nombre as carrera_nombre, c.codigo as carrera_codigo
       FROM matricula m
       JOIN carrera c ON c.id_carrera = m.id_carrera
       WHERE m.id_estudiante = $1 AND m.estado = 'ACTIVO'
       LIMIT 1`,
      [usuario.idEstudiante],
    );

    if (matricula.length > 0) {
      const m = matricula[0];
      carreraNombre = m.carrera_nombre ?? '';

      const periodo = await this.dataSource.query(
        `SELECT codigo, nombre, fecha_inicio, fecha_fin FROM periodo_academico WHERE id_periodo = $1 LIMIT 1`,
        [m.id_periodo],
      );
      if (periodo.length > 0) {
        periodoCodigo = periodo[0].codigo ?? '';
        periodoNombre = periodo[0].nombre ?? '';
        periodoInicio = periodo[0].fecha_inicio ?? '';
        periodoFin = periodo[0].fecha_fin ?? '';
      }

      const periodoCarrera = await this.dataSource.query(
        `SELECT pc.fecha_inicio_fase_practica, pc.fecha_fin_fase_practica, pc.id_coordinador,
                doc.nombres as coordinador_nombres, doc.apellidos as coordinador_apellidos
         FROM periodo_carrera pc
         LEFT JOIN docente doc ON doc.id_docente = pc.id_coordinador
         WHERE pc.id_periodo = $1 AND pc.id_carrera = $2
         LIMIT 1`,
        [m.id_periodo, m.id_carrera],
      );

      if (periodoCarrera.length > 0) {
        fechaInicioFase = periodoCarrera[0].fecha_inicio_fase_practica ?? '';
        fechaFinFase = periodoCarrera[0].fecha_fin_fase_practica ?? '';
        coordinadorNombre = periodoCarrera[0].coordinador_nombres && periodoCarrera[0].coordinador_apellidos
          ? `${periodoCarrera[0].coordinador_nombres} ${periodoCarrera[0].coordinador_apellidos}`
          : '';
      }

      const nivel = await this.dataSource.query(
        `SELECT n.nombre as nivel_nombre
         FROM matricula_detalle md
         JOIN oferta_asignatura oa ON oa.id_oferta_asignatura = md.id_oferta_asignatura
         JOIN asignatura a ON a.id_asignatura = oa.id_asignatura
         JOIN nivel n ON n.id_nivel = a.id_nivel
         WHERE md.id_matricula = $1
         LIMIT 1`,
        [m.id_matricula],
      );

      if (nivel.length > 0) {
        nivelNombre = nivel[0].nivel_nombre ?? '';
      }
    }

    if (practica) {
      const tutor = await this.dataSource.query(
        `SELECT nombres, apellidos FROM docente WHERE id_docente = $1 LIMIT 1`,
        [practica.id_docente],
      );

      if (tutor.length > 0) {
        tutorAcademicoNombre = `${tutor[0].nombres} ${tutor[0].apellidos}`;
      }
    }

    const nucleo = await this.nucleoRepository.findOne({
      where: { id_carrera: matricula.length > 0 ? matricula[0].id_carrera : 1 },
    });

    const carrera: DatosCarrera = {
      coordinador: coordinadorNombre,
      tutorAcademico: tutorAcademicoNombre,
      nucleoEstructurante: nucleo?.nombre ?? '',
      objetivoNucleoEstructurante: nucleo?.objetivo ?? '',
    };

    const proyectoEmpresarial: DatosProyectoEmpresarial = {
      nombre: practica?.nombre_proyecto ?? '',
      cobertura: practica?.cobertura_localizacion ?? '',
      plazo: practica?.plazo_ejecucion ?? '',
      empresaAsignada: empresa?.razon_social ?? '',
      fechaInicio: fechaInicioFase || (practica?.fecha_inicio ?? ''),
      fechaFin: fechaFinFase || (practica?.fecha_fin ?? ''),
    };

    const empresaBeneficiaria: DatosEmpresaBeneficiaria = {
      razonSocial: empresa?.razon_social ?? '',
      representanteLegal: empresa?.representante_legal ?? '',
      tutorEmpresarial: tutorEmpresarial ? `${tutorEmpresarial.nombres} ${tutorEmpresarial.apellidos}` : '',
      direccion: empresa?.direccion ?? '',
      ubicacion: '',
    };

    const periodoAcademico: PeriodoAcademico = {
      codigo: periodoCodigo,
      nombre: periodoNombre,
      fechaInicio: periodoInicio,
      fechaFin: periodoFin,
    };

    const cronograma: CronogramaFecha[] = [];
    if (fechaInicioFase) {
      cronograma.push({ fecha: fechaInicioFase, descripcion: 'Inicio de fase práctica' });
    }
    if (fechaFinFase) {
      cronograma.push({ fecha: fechaFinFase, descripcion: 'Fin de fase práctica' });
    }

    return {
      estudiante: {
        nombre: `${estudiante.nombres} ${estudiante.apellidos}`,
        cedula: estudiante.cedula,
        carrera: carreraNombre,
        curso: nivelNombre,
        nivel: nivelNombre,
        email: estudiante.correo ?? '',
        telefono: estudiante.telefono ?? '',
        estadoCivil: estudiante.estado_civil ?? '',
        tipoSangre: estudiante.tipo_sangre ?? '',
        domicilio: estudiante.domicilio ?? '',
        contactoEmergenciaNombre: estudiante.contacto_emergencia_nombre ?? '',
        contactoEmergenciaTelefono: estudiante.contacto_emergencia_telefono ?? '',
      },
      carrera,
      proyectoEmpresarial,
      empresaBeneficiaria,
      periodoAcademico,
      cronograma,
    };
  }

  async getCartaCompromiso(usuario: any): Promise<CartaCompromiso> {
    const datos = await this.getDatosMaestra(usuario);
    const { estudiante, empresaBeneficiaria } = datos;

    return {
      encabezado: `D.M. Quito, ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
      cuerpo: [
        `Yo, ${estudiante.nombre} con C.C. ${estudiante.cedula} estudiante de ${estudiante.curso} de la carrera ${estudiante.carrera} en modalidad dual, DEL INSTITUTO SUPERIOR TECNOLÓGICO DE TURISMO Y PATRIMONIO YAVIRAC, asignado/a a ${empresaBeneficiaria.razonSocial}`,
        'De acuerdo con el proyecto de carrera aprobado y vigente, en cumplimiento del currículo de la carrera, y en el marco del convenio firmado, me presento y, expreso mi interés y predisposición de realizar prácticas de formación dual, con el fin de cumplir con la planificación, ejecución, control y evaluación del proceso de desarrollo de las competencias laborales como estudiante de la carrera.',
        'Soy una persona que cumple con el perfil de ingreso de la carrera, y busco aprender y desarrollar los conocimientos, habilidades-destrezas y actitudes del perfil de egreso, y lograr las competencias como profesional de mi carrera.',
        'Por lo cual, solicito su aceptación para realizar mi proceso de formación práctica en el entorno laboral real en modalidad dual.',
        'A la vez que, me comprometo con acatar la normativa general vigente con las obligaciones establecidas en el Artículo 16 (Obligaciones generales del estudiante en modalidad dual) del Reglamento para Carreras y Programas en Modalidad de Formación Dual vigente, así como también, la normativa interna de la entidad formadora y, la normativa del Instituto.',
        'Reconociendo y aceptando entre otras prohibiciones expresas durante la Fase Práctica, las que se determinan a continuación:',
        'También me comprometo en:',
        'Y así mismo, me comprometo en elaborar y presentar todos los documentos necesarios para validar el proceso de formación en modalidad dual, de acuerdo con lo establecido por la entidad receptora formadora y/o el Instituto, los cuáles deberán estar correctamente llenados y firmados.',
        'El incumplimiento a lo comprometido con la entidad receptora formadora y/o del Instituto, será causal para la toma de medidas disciplinarias conforme a las responsabilidades del proceso de formación en modalidad dual .',
        'De no dar cumplimiento con lo antes citado, puede conllevar bajo el debido proceso a la pérdida de la fase práctica.',
        'De manera libre y voluntaria acepto lo expresado y firmo como esta acta compromiso como constancia.',
      ],
      prohibicionesIntro: 'Reconociendo y aceptando entre otras prohibiciones expresas durante la Fase Práctica, las que se determinan a continuación:',
      prohibiciones: [
        'Prohibición de consumo de alcohol.',
        'Prohibición de consumo de sustancias estupefacientes, psicotrópicos y estimulantes.',
        'Prohibición de tratos groseros e irrespetuosos a compañeros y del entorno (compañeros y demás personas involucradas)',
        'Prohibición de desacatar las directrices de tutores empresariales y también de tutores académicos del instituto.',
      ],
      compromisosIntro: 'También me comprometo en:',
      compromisosConfidencialidad: [
        'Garantizar la confidencialidad, reserva y protección de los datos e información proporcionados por la entidad receptora formadora, durante y después de mi fase práctica.',
        'Y, promover un entorno social armónico, precautelar y salvaguardar la propiedad ajena y los bienes que pertenecen al sitio.',
      ],
      cierre: [
        'Y así mismo, me comprometo en elaborar y presentar todos los documentos necesarios para validar el proceso de formación en modalidad dual, de acuerdo con lo establecido por la entidad receptora formadora y/o el Instituto, los cuáles deberán estar correctamente llenados y firmados.',
        'El incumplimiento a lo comprometido con la entidad receptora formadora y/o del Instituto, será causal para la toma de medidas disciplinarias conforme a las responsabilidades del proceso de formación en modalidad dual.',
        'De manera libre y voluntaria acepto lo expresado y firmo como esta acta compromiso como constancia.',
      ],
      estudiante: { nombre: estudiante.nombre, cedula: estudiante.cedula },
      espacioFirma: { lugar: 'D.M. Quito', fecha: new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
    };
  }

  async getCurriculum(usuario: any): Promise<Curriculum> {
    const datos = await this.getDatosMaestra(usuario);
    const { estudiante } = datos;

    const datosAcademicos = await this.cvDatoAcademicoRepository.find({
      where: { id_estudiante: usuario.idEstudiante },
    });

    const experienciaLaboral = await this.cvExperienciaLaboralRepository.find({
      where: { id_estudiante: usuario.idEstudiante },
    });

    const practicasDuales = await this.cvPracticaDualRepository.find({
      where: { id_estudiante: usuario.idEstudiante },
    });

    return {
      datosPersonales: {
        nombre: estudiante.nombre,
        cedula: estudiante.cedula,
        estadoCivil: estudiante.estadoCivil,
        telefono: estudiante.telefono,
        domicilio: estudiante.domicilio,
        emailInstitucional: estudiante.email,
      },
      datosAcademicos: datosAcademicos.map(item => ({
        anio: item.anio,
        institucion: item.institucion,
        tituloMencion: item.titulo_mencion,
        notaFinal: item.nota_final?.toString() ?? '',
      })),
      experienciaLaboral: experienciaLaboral.map(item => ({
        anio: item.anio,
        institucion: item.institucion,
        cargo: item.cargo,
        actividades: item.actividades,
      })),
      practicasDualesPrevias: practicasDuales.map(item => ({
        anio: item.anio_periodo,
        institucion: item.institucion,
        cargo: item.cargo,
        actividadesRealizadas: item.actividades_realizadas,
      })),
      informacionAdicional: [],
    };
  }

  async getRegistroAsistencia(usuario: any): Promise<RegistroAsistencia> {
    const datos = await this.getDatosMaestra(usuario);
    const { estudiante, empresaBeneficiaria, carrera, periodoAcademico } = datos;

    const registros = await this.registroDiarioRepository.find({
      where: { id_practica: await this.obtenerIdPractica(usuario) },
      order: { fecha: 'ASC' },
    });

    const registrosFormateados: RegistroAsistenciaDia[] = registros.map(registro => ({
      fecha: registro.fecha,
      horaIngreso: registro.hora_ingreso ?? '',
      almuerzo: registro.hora_salida_almuerzo && registro.hora_regreso_almuerzo
        ? `${this.formatearHora(registro.hora_salida_almuerzo)} - ${this.formatearHora(registro.hora_regreso_almuerzo)}`
        : '',
      horaSalida: this.formatearHora(registro.hora_salida ?? ''),
      horasDia: 8,
      firma: registro.firma_estudiante ? 'S' : 'N',
      observaciones: registro.observaciones ?? '',
    }));

    return {
      empresa: empresaBeneficiaria.razonSocial,
      carrera: estudiante.carrera,
      tutorAcademico: carrera.tutorAcademico,
      periodoAcademico: periodoAcademico.nombre,
      tutorEmpresarial: empresaBeneficiaria.tutorEmpresarial,
      nivel: estudiante.nivel,
      nucleoEstructurante: carrera.nucleoEstructurante,
      estudiante: {
        nombre: estudiante.nombre,
        cedula: estudiante.cedula,
        email: estudiante.email,
        telefono: estudiante.telefono,
        contactoEmergenciaNombre: estudiante.contactoEmergenciaNombre,
        contactoEmergenciaTelefono: estudiante.contactoEmergenciaTelefono,
        tipoSangre: estudiante.tipoSangre,
        domicilio: estudiante.domicilio,
      },
      registros: registrosFormateados,
      horasAutonomas: 0,
      subtotalHorasPractica: registrosFormateados.length * 8,
    };
  }

  async getInformeAprendizaje(usuario: any): Promise<InformeAprendizaje> {
    const datos = await this.getDatosMaestra(usuario);
    const { empresaBeneficiaria, periodoAcademico, carrera } = datos;

    const encabezado: InformeAprendizajeEncabezado = {
      empresa: empresaBeneficiaria.razonSocial,
      nivel: datos.estudiante.nivel,
      cicloAcademico: periodoAcademico.nombre,
      fechaInicio: datos.proyectoEmpresarial.fechaInicio,
      fechaFin: datos.proyectoEmpresarial.fechaFin,
      tutorAcademico: carrera.tutorAcademico,
      tutorEmpresarial: empresaBeneficiaria.tutorEmpresarial,
      nucleoEstructurante: carrera.nucleoEstructurante,
      carrera: datos.estudiante.carrera,
      objetivoNucleoEstructurante: carrera.objetivoNucleoEstructurante,
      totalSemanas: 8,
    };

    const idPractica = await this.obtenerIdPractica(usuario);
    const informe = await this.informeRepository.findOne({
      where: { id_practica: idPractica },
    });

    const bitacoras = await this.bitacoraRepository.find({
      where: { id_informe: informe?.id_informe ?? 1 },
      order: { semana: 'ASC' },
    });

    const semanas: InformeSemana[] = bitacoras.map(bitacora => ({
      semana: bitacora.semana,
      fechaInicio: bitacora.fecha_inicio_semana ?? '',
      fechaFin: bitacora.fecha_fin_semana ?? '',
      rangoFechas: `${bitacora.fecha_inicio_semana ?? ''} - ${bitacora.fecha_fin_semana ?? ''}`,
      puestoAprendizaje: bitacora.puesto_aprendizaje ?? '',
      actividadesRealizadas: bitacora.actividades_realizadas ?? '',
      actividadesAutonomas: bitacora.actividades_autonomas ?? '',
      reflexion: '',
      observacionesEmpresa: '',
    }));

    return {
      encabezado,
      semanas,
      reflexionAprendizaje: '',
      observacionesEmpresa: '',
    };
  }

  async getEvaluacionEmpresarial(usuario: any): Promise<EvaluacionEmpresarial> {
    const datos = await this.getDatosMaestra(usuario);
    const { estudiante, empresaBeneficiaria, carrera } = datos;

    const evaluaciones = await this.evaluacionRepository.find({
      where: { id_practica: await this.obtenerIdPractica(usuario), tipo_evaluador: 'EMPRESA' },
    });

    const promedioCriterios = evaluaciones.length > 0 ? Number((evaluaciones.reduce((a, b) => a + (b.nota_final_calculada ?? 0), 0) / evaluaciones.length).toFixed(2)) : 0;

    const evaluacionPrincipal = evaluaciones[0];

    return {
      estudiante: { nombre: estudiante.nombre, cedula: estudiante.cedula },
      empresa: empresaBeneficiaria.razonSocial,
      tutorEmpresarial: empresaBeneficiaria.tutorEmpresarial,
      nivel: estudiante.nivel,
      cicloAcademico: datos.periodoAcademico.nombre,
      nucleoEstructurante: carrera.nucleoEstructurante,
      carrera: estudiante.carrera,
      fechaInicio: datos.proyectoEmpresarial.fechaInicio,
      fechaFin: datos.proyectoEmpresarial.fechaFin,
      criterios: [],
      defensaProyecto: [],
      promedioCriterios: evaluacionPrincipal?.promedio_desempeno ?? promedioCriterios,
      notaPonderadaSobre7: Number(((evaluacionPrincipal?.promedio_desempeno ?? promedioCriterios) * 7 / 6).toFixed(2)),
      notaParcialDefensa: evaluacionPrincipal?.nota_parcial_defensa ?? 0,
      notaFinalDefensa: evaluacionPrincipal?.nota_final_defensa ?? 0,
      notaPonderadaDefensa: evaluacionPrincipal?.nota_ponderada_defensa ?? 0,
      notaFinalEmpresa: evaluacionPrincipal?.nota_final_empresa ?? promedioCriterios,
      observaciones: 'Sin novedad',
    };
  }

  async getEvaluacionInstituto(usuario: any): Promise<EvaluacionInstituto> {
    const datos = await this.getDatosMaestra(usuario);
    const { estudiante, empresaBeneficiaria, carrera } = datos;

    const evaluaciones = await this.evaluacionRepository.find({
      where: { id_practica: await this.obtenerIdPractica(usuario), tipo_evaluador: 'INSTITUTO' },
    });

    const promedioCriterios = evaluaciones.length > 0 ? Number((evaluaciones.reduce((a, b) => a + (b.nota_final_calculada ?? 0), 0) / evaluaciones.length).toFixed(2)) : 0;

    const evaluacionPrincipal = evaluaciones[0];

    return {
      estudiante: { nombre: estudiante.nombre, cedula: estudiante.cedula },
      empresa: empresaBeneficiaria.razonSocial,
      tutorEmpresarial: empresaBeneficiaria.tutorEmpresarial,
      tutorAcademico: carrera.tutorAcademico,
      nivel: estudiante.nivel,
      cicloAcademico: datos.periodoAcademico.nombre,
      nucleoEstructurante: carrera.nucleoEstructurante,
      carrera: estudiante.carrera,
      fechaInicio: datos.proyectoEmpresarial.fechaInicio,
      fechaFin: datos.proyectoEmpresarial.fechaFin,
      defensaProyecto: [],
      notaParcialDefensa: evaluacionPrincipal?.nota_parcial_defensa ?? 0,
      notaFinalDefensa: evaluacionPrincipal?.nota_final_defensa ?? 0,
      notaPonderadaDefensa: evaluacionPrincipal?.nota_ponderada_defensa ?? 0,
      criteriosProyecto: [],
      promedioProyecto: evaluacionPrincipal?.promedio_proyecto_empresarial ?? promedioCriterios,
      notaPonderadaProyecto: evaluacionPrincipal?.nota_ponderada_proyecto ?? Number((promedioCriterios * 7 / 10).toFixed(2)),
      notaFinalEmpresa: promedioCriterios,
      notaFinalInstituto: evaluacionPrincipal?.nota_final_instituto ?? promedioCriterios,
      notaFinalConsolidada: Number(((evaluacionPrincipal?.nota_final_instituto ?? promedioCriterios) / 2).toFixed(2)),
      observaciones: 'Sin novedad',
    };
  }

  async getTodosLosDocumentos(usuario: any) {
    const datosMaestra = await this.getDatosMaestra(usuario);
    const cartaCompromiso = await this.getCartaCompromiso(usuario);
    const curriculum = await this.getCurriculum(usuario);
    const registroAsistencia = await this.getRegistroAsistencia(usuario);
    const informeAprendizaje = await this.getInformeAprendizaje(usuario);
    const evaluacionEmpresarial = await this.getEvaluacionEmpresarial(usuario);
    const evaluacionInstituto = await this.getEvaluacionInstituto(usuario);

    return {
      datos: datosMaestra,
      cartaCompromiso,
      curriculum,
      registroAsistencia,
      informeAprendizaje,
      evaluacionEmpresarial,
      evaluacionInstituto,
    };
  }

  private formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const [y, m, d] = fecha.split('-');
    return `${d}/${m}/${y}`;
  }

  private formatearHora(hora: string): string {
    if (!hora) return '';
    if (hora.includes(':')) {
      const [h, m] = hora.split(':');
      return `${h}:${m}`;
    }
    return hora;
  }
}

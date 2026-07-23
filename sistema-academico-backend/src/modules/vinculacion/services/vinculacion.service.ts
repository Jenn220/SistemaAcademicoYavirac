import {Injectable,NotFoundException,Inject,ConflictException,InternalServerErrorException} from '@nestjs/common';
import { VinculacionActividadEstudiante } from '../domain/vinculacion_actividad_estudiante.entity';
import { VinculacionAsistenciaTutor } from '../domain/vinculacion-asistencia-tutor.entity';
import { VinculacionEstudianteEntity } from '../domain/vinculacion-estudiante.entity';
import { VinculacionInforme } from '../domain/vinculacion-informe.entity';
import { VinculacionObjetivo } from '../domain/vinculacion-objetivo.entity';

import { IVinculacionRepository, VINCULACION_REPOSITORY } from '../ports/vinculacion.repository.port';

import { CreateAsistenciaTutorDto } from '../dto/create-asistencia-tutor.dto';
import { CreateActividadEstudianteDto } from '../dto/create-actividad-estudiante.dto';
import { CreateVinculacionDto } from '../dto/create-vinculacion.dto';
import { CreateInformeDto } from '../dto/create-informe.dto';
import { CreateVinculacionObjetivoDto } from '../dto/create-objetivo.dto';

@Injectable()
export class VinculacionService {
  constructor(
    @Inject(VINCULACION_REPOSITORY)
    private readonly vinculacionRepository: IVinculacionRepository,
  ) { }

  // ====================================================================
  // 1. MÉTODOS DE CREACIÓN (POST / INSERT)
  // Reciben los DTOs del controlador, llaman al repositorio y 
  // manejan los errores (ej. llaves duplicadas o fallos del servidor).
  // ====================================================================

  async crearVinculacion(datos: CreateVinculacionDto) {
    try {
      const resultado = await this.vinculacionRepository.crearVinculacion(datos);

      return {
        statusCode: 201,
        message: 'Proyecto de vinculación creado exitosamente',
        data: resultado
      };
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : String(error);

      // Controlamos la violación de restricción única de Postgres
      if (mensaje.includes('llave duplicada') || mensaje.includes('unique constraint')) {
        throw new ConflictException(
          `El estudiante con el detalle de matrícula ID ${datos.id_matricula_detalle} ya tiene un proyecto de vinculación registrado.`
        );
      }
      throw new InternalServerErrorException(`Error interno al crear la vinculación: ${mensaje}`);
    }
  }

  async crearActividadEstudiante(datos: CreateActividadEstudianteDto) {
    try {
      const resultado = await this.vinculacionRepository.crearActividadEstudiante(datos);

      return {
        statusCode: 201,
        message: 'Actividad de estudiante registrada exitosamente',
        data: resultado
      };
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(`Error interno al registrar la actividad: ${mensaje}`);
    }
  }

  async crearAsistenciaTutor(datos: CreateAsistenciaTutorDto) {
    try {
      const resultado = await this.vinculacionRepository.crearAsistenciaTutor(datos);

      return {
        statusCode: 201,
        message: 'Asistencia de tutor registrada exitosamente (Hexagonal)',
        data: resultado
      };
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(`Error interno al registrar la asistencia del tutor: ${mensaje}`);
    }
  }

  async crearObjetivo(datos: CreateVinculacionObjetivoDto) {
    try {
      const resultado = await this.vinculacionRepository.crearObjetivo(datos);
      return {
        statusCode: 201,
        message: 'Objetivo de vinculación registrado exitosamente',
        data: resultado
      };
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(`Error interno al registrar el objetivo: ${mensaje}`);
    }
  }

  async crearInforme(datos: CreateInformeDto) {
    try {
      const resultado = await this.vinculacionRepository.crearInforme(datos);

      return {
        statusCode: 201,
        message: 'Informe de vinculación registrado exitosamente',
        data: resultado
      };
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(`Error interno al registrar el informe: ${mensaje}`);
    }
  }


  // ====================================================================
  // 2. CONSULTAS SIMPLES (GET / FIND)
  // Retornan listados directos desde el repositorio sin mayor transformación.
  // ====================================================================

  async obtenerVinculacionesEstudiantes(): Promise<VinculacionEstudianteEntity[]> {
    return await this.vinculacionRepository.obtenerVinculacionesEstudiantes();
  }

  async obtenerTodasLasActividades(): Promise<VinculacionActividadEstudiante[]> {
    return await this.vinculacionRepository.obtenerTodasLasActividades();
  }

  async obtenerAsistenciasTutor(): Promise<VinculacionAsistenciaTutor[]> {
    return await this.vinculacionRepository.obtenerAsistenciasTutor();
  }

  async obtenerInformes(): Promise<VinculacionInforme[]> {
    return await this.vinculacionRepository.obtenerInformes();
  }

  async obtenerTodosLosObjetivos(): Promise<VinculacionObjetivo[]> {
    return await this.vinculacionRepository.obtenerTodosLosObjetivos();
  }


  // ====================================================================
  // 3. VALIDACIONES Y ACCESOS (LÓGICA DE NEGOCIO)
  // Definen si un usuario puede o no entrar a ciertas vistas del sistema.
  // ====================================================================

  async verificarAccesoVinculacion(idEstudiante: number) {
    // 1. Añadimos "as any" al final para romper la restricción del objeto vacío `{}`
    const vinculacionActiva = await this.vinculacionRepository.buscarVinculacionActiva(idEstudiante) as any;

    // 2. Ahora TypeScript te dejará leer las propiedades libremente sin errores
    if (!vinculacionActiva) {
      return {
        acceso_permitido: false,
        estado: "NO_MATRICULADO",
        mensaje: "No te encuentras matriculado en el módulo de Vinculación con la Comunidad.",
        permisos: [],
        datos_proyecto: null
      };
    }

    if (vinculacionActiva.estado === 'APROBADO') {
      return {
        acceso_permitido: true,
        estado: "APROBADO",
        mensaje: "Has finalizado tu vinculación. Puedes descargar tus certificados.",
        permisos: ["LEER_REPORTES", "DESCARGAR_CERTIFICADO"],
        datos_proyecto: vinculacionActiva
      };
    }

    return {
      acceso_permitido: true,
      estado: "ACTIVO",
      mensaje: "Bienvenido a tu panel de Vinculación.",
      permisos: ["LEER_REPORTES", "SUBIR_BITACORAS", "EDITAR_PERFIL"],
      datos_proyecto: vinculacionActiva
    };
  }


  // ====================================================================
  // 4. REPORTES Y DOCUMENTOS (GET COMPLEJOS)
  // Toman la "data cruda" del Repositorio, formatean fechas, calculan 
  // totales y estructuran el JSON perfecto para el Frontend/PDFs.
  // ====================================================================

  async obtenerActaCompromiso(idVinculacion: number) {
    const data = await this.vinculacionRepository.obtainActaCompromisoRaw(idVinculacion);

    if (!data) {
      throw new NotFoundException(`No se encontró información para el acta de compromiso con ID ${idVinculacion}`);
    }

    // Retornamos el objeto limpio y formateado para el Frontend
    return {
      titulo: "ACTA COMPROMISO DE PARTICIPACIÓN EN VINCULACIÓN CON LA COMUNIDAD",
      instituto: 'Instituto Superior Tecnológico de Turismo y Patrimonio "YAVIRAC"',
      estudiante: data.estudiante,
      cedula: data.cedula_identidad,
      carrera: data.carrera,
      nivel: data.nivel || "Tercero", // Por si viene vacío, un valor por defecto
      entidad_beneficiaria: data.entidad_beneficiaria,
      docente_tutor: data.docente_tutor
    };
  }

  async obtenerInicioActividadesTutor(idVinculacion: number) {
    const data = await this.vinculacionRepository.obtainInicioActividadesTutorRaw(idVinculacion);

    if (!data) {
      throw new NotFoundException(`No se encontró información de inicio de actividades para el ID ${idVinculacion}`);
    }

    // Formatea la fecha a dd/mm/aaaa
    const formatearFecha = (fechaStr: string) => {
      if (!fechaStr) return '';
      const fecha = new Date(fechaStr);
      return fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'UTC'
      });
    };

    // Retornamos únicamente el payload de datos puros que alimentará al Google Sheets / Frontend
    return {
      coordinador: "Ing. Raúl Páez", // Fallback de coordinación
      tutor_nombre: data.tutor_nombre,
      tutor_cedula: data.tutor_cedula,
      proyecto_nombre: data.proyecto_nombre,
      fecha_inicio: formatearFecha(data.fecha_proyecto),
      carrera: data.carrera,
      descripcion_actividades: data.descripcion_actividades || ""
    };
  }

  async obtenerReporteConsolidado(idVinculacion: number) {
    const resultados = await this.vinculacionRepository.obtainReporteConsolidadoRaw(idVinculacion);

    if (!resultados || resultados.length === 0) {
      throw new NotFoundException(`No se encontró información para el proyecto de vinculación con ID ${idVinculacion}`);
    }

    const primerRegistro = resultados[0];

    const actividades = resultados
      .filter((row: any) => row.fecha !== null)
      .map((row: any) => {
        const fechaParseada = new Date(row.fecha);
        const fechaFormateada = !isNaN(fechaParseada.getTime())
          ? fechaParseada.toLocaleDateString('es-ES', { timeZone: 'UTC' })
          : row.fecha;

        return {
          fecha: fechaFormateada,
          hora_entrada: row.hora_inicio,
          hora_salida: row.hora_fin,
          total_horas: parseFloat(row.horas_total),
          actividad_realizada: row.actividades_realizadas
        };
      });

    return {
      cabecera: {
        carrera: primerRegistro.carrera,
        entidad_beneficiaria: primerRegistro.entidad_beneficiaria,
        estudiante: `${primerRegistro.est_nombres} ${primerRegistro.est_apellidos}`,
        nombre_proyecto: primerRegistro.nombre_proyecto,
        docente_tutor: `${primerRegistro.doc_nombres} ${primerRegistro.doc_apellidos}`,
        tutor_entidad_receptora: primerRegistro.tut_nombres
          ? `${primerRegistro.tut_nombres} ${primerRegistro.tut_apellidos}`
          : 'BARRIGA OLIVO SUSAN JACQUELINE',
        periodo_academico: primerRegistro.periodo_academico
      },
      actividades: actividades,
      totales: {
        total_horas: parseFloat(primerRegistro.total_horas_estudiante || 0),
        observaciones: "Ninguna"
      }
    };
  }

  async obtenerReporteAsistenciaTutor(idVinculacion: number) {
    const resultados = await this.vinculacionRepository.obtainReporteAsistenciaTutorRaw(idVinculacion);

    if (!resultados || resultados.length === 0) {
      throw new NotFoundException(`No se encontró información del tutor para la vinculación con ID ${idVinculacion}`);
    }

    const primerRegistro = resultados[0];

    // Mapeamos las horas del tutor
    let totalHorasAcumuladas = 0;
    const actividades = resultados
      .filter((row: any) => row.fecha !== null)
      .map((row: any) => {
        const fechaParseada = new Date(row.fecha);
        const fechaFormateada = !isNaN(fechaParseada.getTime())
          ? fechaParseada.toLocaleDateString('es-ES', { timeZone: 'UTC' })
          : row.fecha;

        const horas = parseFloat(row.horas_total || 0);
        totalHorasAcumuladas += horas;

        return {
          fecha: fechaFormateada,
          hora_entrada: row.hora_inicio,
          hora_salida: row.hora_fin,
          total_horas: horas,
          actividad_realizada: row.actividades_realizadas
        };
      });

    return {
      cabecera: {
        carrera: primerRegistro.carrera,
        institucion: primerRegistro.entidad_beneficiaria,
        docente_tutor: primerRegistro.docente_tutor,
        periodo_academico: primerRegistro.periodo_academico
      },
      actividades: actividades,
      totales: {
        suma_total_horas: totalHorasAcumuladas,
        observaciones: "Ninguna",
        // Aquí puedes poner al coordinador fijo o traerlo de la base si tienes una tabla de coordinadores
        coordinador_carrera: "Ing. Raúl Páez"
      }
    };
  }

  async obtenerInformeActividades(idVinculacion: number) {
    const resultados = await this.vinculacionRepository.obtainInformeActividadesRaw(idVinculacion);

    if (!resultados || resultados.length === 0) {
      throw new NotFoundException(`No se encontró información de actividades para la vinculación con ID ${idVinculacion}`);
    }

    const primerRegistro = resultados[0];

    // Separar las asignaturas si vienen concatenadas, si no, un arreglo vacío
    const listaAsignaturas = primerRegistro.asignaturas
      ? primerRegistro.asignaturas.split(' | ')
      : [];

    // Mapeo exclusivo de datos dinámicos
    const actividades = resultados
      .filter((row: any) => row.fecha !== null)
      .map((row: any) => {
        const fechaParseada = new Date(row.fecha);
        const fechaFormateada = !isNaN(fechaParseada.getTime())
          ? fechaParseada.toLocaleDateString('es-ES', { timeZone: 'UTC' })
          : row.fecha;

        return {
          fecha: fechaFormateada,
          actividad: row.actividades_realizadas,
          // 👇 Parche temporal hasta que exista en la BD
          resultado_aprendizaje: "Aplica los conocimientos adquiridos para el desarrollo y optimización del entorno digital."
        };
      });

    const formatFechaCabecera = (f: any) => f ? new Date(f).toLocaleDateString('es-ES', { timeZone: 'UTC' }) : 'N/A';

    // Retornamos SOLO lo que cambia por estudiante
    return {
      cabecera: {
        fundacion: primerRegistro.entidad_beneficiaria,
        nivel: primerRegistro.nivel,
        estudiante: primerRegistro.estudiante,
        cedula: primerRegistro.cedula_identidad,
        ciclo_academico: primerRegistro.ciclo_academico,
        asignatura_1: listaAsignaturas[0] || 'N/A',
        asignatura_2: listaAsignaturas[1] || 'N/A',
        inicia: formatFechaCabecera(primerRegistro.inicia),
        finaliza: formatFechaCabecera(primerRegistro.finaliza),
        docente_tutor: primerRegistro.docente_tutor,
        titulo_proyecto: primerRegistro.nombre_proyecto
      },
      informe_actividades: actividades
    };
  }

  async obtenerInformeFinal(idVinculacion: number) {
    const resultados = await this.vinculacionRepository.obtainInformeFinalRaw(idVinculacion);

    if (!resultados || resultados.length === 0) {
      throw new NotFoundException(`No se encontró información para el informe final con ID ${idVinculacion}`);
    }

    const primerRegistro = resultados[0];
    let totalHorasAcumuladas = 0;

    // 1. Mapeo de actividades reales
    const actividades = resultados
      .filter((row: any) => row.actividad_fecha !== null)
      .map((row: any) => {
        const fechaParseada = new Date(row.actividad_fecha);
        const fechaFormateada = !isNaN(fechaParseada.getTime())
          ? fechaParseada.toLocaleDateString('es-ES', { timeZone: 'UTC' })
          : row.actividad_fecha;

        const horas = parseFloat(row.actividad_horas || 0);
        totalHorasAcumuladas += horas;

        return {
          fecha: fechaFormateada,
          actividades: row.actividades_realizadas,
          horas_cumplidas: horas,
          observaciones: "Ninguna"
        };
      });

    // 2. Mapeo de Objetivos Reales
    const objetivosReales = primerRegistro.objetivos_proyecto || [];

    // Funciones de ayuda para fechas
    const formatFecha = (f: any) => f ? new Date(f).toLocaleDateString('es-ES', { timeZone: 'UTC' }) : 'N/A';
    const fechaHoy = new Date().toLocaleDateString('es-ES');

    // 3. Función para convertir nota numérica a letras
    const convertirNotaALetras = (nota: number): string => {
      const notasEnLetras: Record<number, string> = {
        10: "Diez", 9: "Nueve", 8: "Ocho", 7: "Siete",
        6: "Seis", 5: "Cinco", 4: "Cuatro", 3: "Tres",
        2: "Dos", 1: "Uno", 0: "Cero"
      };

      const entera = Math.floor(nota);
      const decimal = Math.round((nota - entera) * 100);

      let texto = notasEnLetras[entera] || entera.toString();
      if (decimal > 0) {
        texto += ` con ${decimal}/100`;
      }
      return texto;
    };

    // Extraemos la nota asegurándonos de que sea un número
    const notaNumerica = parseFloat(primerRegistro.nota_final || 0);

    return {
      datos_generales: {
        carrera: primerRegistro.carrera,
        fecha_informe: fechaHoy,
        estudiante: primerRegistro.estudiante,
        cedula: primerRegistro.cedula,
        email: primerRegistro.email_estudiante,
        telefono: primerRegistro.telefono_estudiante,
        nombre_proyecto: primerRegistro.nombre_proyecto,
        fecha_inicio: formatFecha(primerRegistro.fecha_inicio),
        fecha_final: formatFecha(primerRegistro.fecha_fin),
        entidad_beneficiaria: primerRegistro.entidad_beneficiaria,
        direccion_entidad: primerRegistro.direccion_entidad,

        // Datos reales de la Empresa
        telefono_entidad: primerRegistro.telefono_entidad || "N/A",
        email_entidad: primerRegistro.email_entidad || "N/A",
        tutor_entidad: "Pendiente en BD",
        docente_tutor: primerRegistro.docente_tutor
      },
      resumen_actividades: actividades,
      total_horas_cumplidas: totalHorasAcumuladas,

      // Objetivos reales mapeados desde la base
      objetivos_proyecto: objetivosReales.map((obj: any) => ({
        objetivo: obj.objetivo,
        actividades: "Ver detalle de actividades",
        avance: "100%",
        resultados: "Completado"
      })),

      reflexion_estudiante: "Los estudiantes desarrollaron habilidades blandas y técnicas acorde a las actividades.",

      // Evaluación real desde la base
      evaluacion_final: {
        nota_final: primerRegistro.nota_final || "Sin calificar",
        // ¡Aquí aplicamos la magia de la conversión!
        nota_letras: primerRegistro.nota_final ? convertirNotaALetras(notaNumerica) : "N/A",
        observaciones: "Pendiente en BD",
        coordinador: "Pendiente en BD"
      }
    };
  }

  async obtenerCertificadoVinculacion(idVinculacion: number) {
    const data = await this.vinculacionRepository.obtainCertificadoVinculacionRaw(idVinculacion);

    if (!data) {
      throw new NotFoundException(`No se encontró información para generar el certificado con ID ${idVinculacion}`);
    }

    // Función para formatear fechas a formato largo: "24 de noviembre de 2025"
    const formatearFechaLarga = (fechaStr: string) => {
      if (!fechaStr) return 'Fecha no registrada';
      const fecha = new Date(fechaStr);
      return fecha.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC'
      });
    };

    // La fecha de emisión suele ser el día en que se imprime el certificado
    const fechaEmision = new Date().toLocaleDateString('es-ES', {
      day: 'numeric', month: 'long', year: 'numeric'
    });

    return {
      fecha_emision: `Quito, ${fechaEmision}`,
      estudiante: data.estudiante,
      cedula: data.cedula,
      carrera: data.carrera,
      proyecto: data.proyecto || data.nombre_proyecto, // Manejo por si viene con un nombre u otro
      fecha_inicio: formatearFechaLarga(data.fecha_inicio),
      fecha_fin: formatearFechaLarga(data.fecha_fin),
      total_horas: data.total_horas_estudiante || 0,
      institucion: data.institucion,
      representante: data.representante || "BARRIGA OLIVO SUSAN JACQUELINE" // Fallback
    };
  }



async verificarRequisitosCierre(idVinculacion: number) {
    const requisitos = {
      horas_completas: false,
      tiene_informe_final: false,
      acta_generada: false,
      tutor_asistio: false
    };

    const observaciones: string[] = [];
    let porcentajeCumplimiento = 0;

    // 1. Verificamos horas consolidadas
    try {
      const reporte = await this.obtenerReporteConsolidado(idVinculacion);
      if (reporte.totales.total_horas >= 160) {
        requisitos.horas_completas = true;
        porcentajeCumplimiento += 25;
      } else {
        observaciones.push(`Faltan horas. Tiene ${reporte.totales.total_horas}/160.`);
      }
    } catch (e) {
      observaciones.push("No se encontraron registros de horas o bitácoras.");
    }

    // 2. Verificamos si existe el Informe Final
    try {
      const informeFinal = await this.obtenerInformeFinal(idVinculacion);
      if (informeFinal && informeFinal.resumen_actividades.length > 0) {
        requisitos.tiene_informe_final = true;
        porcentajeCumplimiento += 25;
      }
    } catch (e) {
      observaciones.push("No se ha redactado ni subido el Informe Final del proyecto.");
    }

    // 3. Verificamos si tiene el acta inicial
    try {
      const acta = await this.obtenerActaCompromiso(idVinculacion);
      if (acta) {
        requisitos.acta_generada = true;
        porcentajeCumplimiento += 25;
      }
    } catch (e) {
      observaciones.push("Falta el Acta de Compromiso inicial.");
    }

    // 4. Verificamos si el tutor registró visitas/asistencia
    try {
      const asistenciaTutor = await this.obtenerReporteAsistenciaTutor(idVinculacion);
      if (asistenciaTutor.actividades.length > 0) {
        requisitos.tutor_asistio = true;
        porcentajeCumplimiento += 25;
      }
    } catch (e) {
      observaciones.push("El Docente Tutor aún no ha registrado sus visitas a la entidad.");
    }

    return {
      id_vinculacion: idVinculacion,
      puede_cerrar_proyecto: porcentajeCumplimiento === 100,
      progreso_cierre: `${porcentajeCumplimiento}%`,
      checklist_requisitos: requisitos,
      acciones_pendientes: observaciones
    };
  }
}

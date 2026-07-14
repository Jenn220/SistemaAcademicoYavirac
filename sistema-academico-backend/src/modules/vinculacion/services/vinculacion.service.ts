import { Injectable, NotFoundException, Inject, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { VinculacionActividadEstudiante } from '../domain/vinculacion_actividad_estudiante.entity'; 
import { VinculacionAsistenciaTutor } from '../domain/vinculacion-asistencia-tutor.entity';
import { VinculacionEstudianteEntity } from '../domain/vinculacion-estudiante.entity';
import { VinculacionInforme } from '../domain/vinculacion-informe.entity';

import { CreateAsistenciaTutorDto } from '../dto/create-asistencia-tutor.dto'; // Importamos el nuevo DTO
import { IVinculacionRepository, VINCULACION_REPOSITORY } from '../ports/vinculacion.repository.port';
import { CreateActividadEstudianteDto } from '../dto/create-actividad-estudiante.dto';
import { CreateVinculacionDto } from '../dto/create-vinculacion.dto';
import { CreateInformeDto } from '../dto/create-informe.dto';

@Injectable()
export class VinculacionService {
  constructor(
    @Inject(VINCULACION_REPOSITORY)
    private readonly vinculacionRepository: IVinculacionRepository,
  ) {}

  async obtenerTodasLasActividades(): Promise<VinculacionActividadEstudiante[]> {
    return await this.vinculacionRepository.obtenerTodasLasActividades();
  }

  async obtenerAsistenciasTutor(): Promise<VinculacionAsistenciaTutor[]> {
    return await this.vinculacionRepository.obtenerAsistenciasTutor();
  }

  async obtenerVinculacionesEstudiantes(): Promise<VinculacionEstudianteEntity[]> {
    return await this.vinculacionRepository.obtenerVinculacionesEstudiantes();
  }

  async obtenerInformes(): Promise<VinculacionInforme[]> {
    return await this.vinculacionRepository.obtenerInformes();
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





  async obtenerReporteConsolidado(idVinculacion: number) {
    // TIPEO CORREGIDO: Asegúrate de que en tu puerto e interfaz se llame "obtenerReporteConsolidadoRaw"
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

  // ==========================================
  // NUEVO MÉTODO POST PARA ASISTENCIA TUTOR
  // ==========================================
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
}

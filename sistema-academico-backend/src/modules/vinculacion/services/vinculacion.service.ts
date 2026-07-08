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
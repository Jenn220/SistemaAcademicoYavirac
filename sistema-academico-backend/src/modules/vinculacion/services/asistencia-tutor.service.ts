import { 
  Injectable, 
  Inject, 
  NotFoundException, 
  InternalServerErrorException, 
  BadRequestException, 
  ConflictException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VinculacionEstudianteEntity } from '../domain/vinculacion-estudiante.entity';

import { 
  VINCULACION_ASISTENCIA_TUTOR_PORT, 
  IVinculacionAsistenciaTutorPort 
} from '../ports/asistencia-tutor.port';

import { CreateAsistenciaTutorDto } from '../dto/create-asistencia-tutor.dto';
import { UpdateAsistenciaTutorDto } from '../dto/update-asistencia-tutor.dto';

@Injectable()
export class AsistenciaTutorService {
  constructor(
    @Inject(VINCULACION_ASISTENCIA_TUTOR_PORT) 
    private readonly repository: IVinculacionAsistenciaTutorPort,
    @InjectRepository(VinculacionEstudianteEntity)
    private readonly vinculacionRepo: Repository<VinculacionEstudianteEntity>,
  ) {}

  // ========== CALCULAR DIFERENCIA DE HORAS ==========
  private calcularDiferenciaHoras(horaInicio: string, horaFin: string): number {
    const [hInicio, mInicio] = horaInicio.split(':').map(Number);
    const [hFin, mFin] = horaFin.split(':').map(Number);

    const inicioMinutos = hInicio * 60 + mInicio;
    const finMinutos = hFin * 60 + mFin;

    if (finMinutos <= inicioMinutos) {
      throw new BadRequestException('La hora de salida debe ser posterior a la hora de entrada.');
    }

    return parseFloat(((finMinutos - inicioMinutos) / 60).toFixed(2));
  }

  // ========== OBTENER VINCULACIÓN POR ESTUDIANTE ==========
  async obtenerVinculacionPorEstudiante(idEstudiante: number): Promise<VinculacionEstudianteEntity | null> {
    const query = `
      SELECT vinc.*
      FROM vinculacion_estudiante vinc
      INNER JOIN matricula_detalle md ON md.id_matricula_detalle = vinc.id_matricula_detalle
      INNER JOIN matricula m ON m.id_matricula = md.id_matricula
      WHERE m.id_estudiante = $1
        AND vinc.estado = 'EN_CURSO'
      ORDER BY vinc.id_vinculacion DESC
      LIMIT 1
    `;
    const results = await this.vinculacionRepo.query(query, [idEstudiante]);
    return results.length > 0 ? results[0] : null;
  }

  // ========== OBTENER ASISTENCIAS POR DOCENTE ==========
  async obtenerAsistenciasTutorPorDocente(idDocente: number) {
    try {
      const data = await this.repository.obtainAsistenciasTutorPorDocenteRaw(idDocente);
      return data || [];
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(
        `Error al obtener las asistencias del docente ${idDocente}: ${mensaje}`
      );
    }
  }

  // ========== OBTENER REPORTE DE ASISTENCIA ==========
  async obtenerReporteAsistenciaTutor(idVinculacion: number) {
    try {
      const resultados = await this.repository.obtainReporteAsistenciaTutorRaw(idVinculacion);
      if (!resultados || resultados.length === 0) return null;

      const primerRegistro = resultados[0];

      const actividades = resultados
        .filter((row: any) => row.id_asistencia !== null && row.id_asistencia !== undefined)
        .map((row: any) => {
          let fechaFormateada = row.fecha;

          if (row.fecha) {
            const fechaParseada = new Date(row.fecha);
            fechaFormateada = !isNaN(fechaParseada.getTime())
              ? fechaParseada.toISOString().split('T')[0]
              : row.fecha;
          }

          const horasCalculadas = this.calcularDiferenciaHoras(
            row.hora_inicio || '00:00',
            row.hora_fin || '00:00'
          );

          return {
            id: row.id_asistencia,
            fecha: fechaFormateada,
            hora_entrada: row.hora_inicio,
            hora_salida: row.hora_fin,
            total_horas: horasCalculadas,
            actividad_realizada: row.actividades_realizadas || '',
          };
        });

      const sumaTotalHoras = actividades.reduce(
        (acc: number, act: { total_horas: number }) => acc + act.total_horas,
        0
      );

      const coordinador = primerRegistro.coordinador_carrera?.trim();

      return {
        cabecera: {
          carrera: primerRegistro.carrera,
          institucion: primerRegistro.entidad_beneficiaria,
          docente_tutor: primerRegistro.docente_tutor,
          periodo_academico: primerRegistro.periodo_academico,
        },
        actividades: actividades,
        totales: {
          suma_total_horas: sumaTotalHoras,
          observaciones: primerRegistro.observacion_reporte || 'Ninguna',
          coordinador_carrera: (coordinador && coordinador !== '') ? coordinador : 'Sin Coordinador Asignado',
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      const mensaje = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(
        `Error al generar el reporte de asistencia del tutor: ${mensaje}`
      );
    }
  }

  // ========== CREAR ASISTENCIA TUTOR ==========
  async crearAsistenciaTutor(datos: CreateAsistenciaTutorDto) {
    try {
      if (datos.id_vinculacion) {
        const existeFecha = await this.repository.buscarPorFechaYVinculacion(
          datos.id_vinculacion,
          datos.fecha
        );

        if (existeFecha) {
          throw new ConflictException(
            `Ya existe un registro de asistencia del tutor para la fecha ${datos.fecha}`
          );
        }
      }

      const horasCalculadas = this.calcularDiferenciaHoras(datos.hora_inicio, datos.hora_fin);

      const datosAInsertar = {
        ...datos,
        horas_total: horasCalculadas,
      };

      const resultado = await this.repository.crearAsistenciaTutor(datosAInsertar);
      return { 
        statusCode: 201, 
        message: 'Registro de asistencia creado exitosamente', 
        data: resultado 
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }

      const mensaje = error instanceof Error ? error.message : String(error);
      
      if (mensaje.includes('llave duplicada') || mensaje.includes('unique constraint') || mensaje.includes('23505')) {
        throw new ConflictException(`Ya existe un registro de asistencia para la fecha ${datos.fecha}`);
      }
      
      throw new InternalServerErrorException(`Error interno al crear la asistencia: ${mensaje}`);
    }
  }

  // ========== ACTUALIZAR ASISTENCIA TUTOR ==========
  async actualizarAsistenciaTutor(id: number, datos: UpdateAsistenciaTutorDto) {
    try {
      const registroActual = await this.repository.buscarPorId(id);
      if (!registroActual) {
        throw new NotFoundException(`El registro de asistencia con ID ${id} no existe.`);
      }

      const idVinculacion = datos.id_vinculacion || registroActual.id_vinculacion;

      const fechaActualStr = registroActual.fecha instanceof Date
        ? registroActual.fecha.toISOString().split('T')[0]
        : String(registroActual.fecha).split('T')[0];

      if (datos.fecha && datos.fecha !== fechaActualStr) {
        const existeFecha = await this.repository.buscarPorFechaYVinculacion(
          idVinculacion,
          datos.fecha
        );

        if (existeFecha && String(existeFecha.id_asistencia_tutor) !== String(id)) {
          throw new ConflictException(
            `Ya existe un registro de asistencia del tutor para la fecha ${datos.fecha}`
          );
        }
      }

      const horaInicio = datos.hora_inicio || registroActual.hora_inicio;
      const horaFin = datos.hora_fin || registroActual.hora_fin;

      let horasCalculadas: number | undefined = undefined;
      if (horaInicio && horaFin) {
        horasCalculadas = this.calcularDiferenciaHoras(horaInicio, horaFin);
      }

      const datosAActualizar = {
        ...datos,
        ...(horasCalculadas !== undefined && { horas_total: horasCalculadas }),
      };

      const resultado = await this.repository.actualizarAsistenciaTutor(id, datosAActualizar);

      return { 
        statusCode: 200, 
        message: 'Asistencia actualizada exitosamente', 
        data: resultado 
      };
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof BadRequestException || 
          error instanceof ConflictException) {
        throw error;
      }
      
      const mensaje = error instanceof Error ? error.message : String(error);

      if (mensaje.includes('llave duplicada') || mensaje.includes('unique constraint') || mensaje.includes('23505')) {
        throw new ConflictException('Ya existe un registro con estos datos para la fecha especificada.');
      }

      throw new InternalServerErrorException(`Error interno al actualizar la asistencia: ${mensaje}`);
    }
  }

  // ========== ELIMINAR ASISTENCIA TUTOR ==========
  async eliminarAsistenciaTutor(id: number) {
    try {
      const eliminado = await this.repository.eliminarAsistenciaTutor(id);
      if (!eliminado) {
        throw new NotFoundException(`El registro de asistencia con ID ${id} no existe.`);
      }
      return { statusCode: 200, message: `Asistencia con ID ${id} eliminada exitosamente.` };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      const mensaje = error instanceof Error ? error.message : String(error);

      if (
        mensaje.includes('violates foreign key constraint') ||
        mensaje.includes('viola la llave foránea') ||
        mensaje.includes('23503')
      ) {
        throw new BadRequestException(
          `No se puede eliminar la asistencia con ID ${id} porque existen otros registros asociados.`
        );
      }

      throw new InternalServerErrorException(`Error interno al intentar eliminar la asistencia: ${mensaje}`);
    }
  }
}
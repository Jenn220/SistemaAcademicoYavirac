import { 
  Injectable, 
  Inject, 
  NotFoundException, 
  InternalServerErrorException, 
  BadRequestException, 
  ConflictException 
} from '@nestjs/common';

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
  ) {}

  // 🧮 Auxiliar: Calcula las horas entre dos horas "HH:mm:ss" o "HH:mm"
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

  // =========================================================================
  // 📊 MÉTODOS DE CONSULTA Y REPORTES
  // =========================================================================

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

  // =========================================================================
  // 👨‍🏫 GESTIÓN CRUD DE REGISTROS DE ASISTENCIA DEL TUTOR
  // =========================================================================

  async crearAsistenciaTutor(datos: CreateAsistenciaTutorDto) {
    try {
      // 1. Validar que la fecha no esté duplicada para esta vinculación
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

      // 2. Calcular automáticamente la diferencia de horas
      const horasCalculadas = this.calcularDiferenciaHoras(datos.hora_inicio, datos.hora_fin);

      // 3. Formatear payload con las horas calculadas
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

async actualizarAsistenciaTutor(id: number, datos: UpdateAsistenciaTutorDto) {
  try {
    // 1. Obtener registro existente
    const registroActual = await this.repository.buscarPorId(id);
    if (!registroActual) {
      throw new NotFoundException(`El registro de asistencia con ID ${id} no existe.`);
    }

    const idVinculacion = datos.id_vinculacion || registroActual.id_vinculacion;

    // Formatear la fecha actual a YYYY-MM-DD para evitar conflicto de tipos (string vs Date)
    const fechaActualStr = registroActual.fecha instanceof Date
      ? registroActual.fecha.toISOString().split('T')[0]
      : String(registroActual.fecha).split('T')[0];

    // 2. Validar duplicado de fecha si se cambia
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

    // 3. Recálculo inteligente de horas
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
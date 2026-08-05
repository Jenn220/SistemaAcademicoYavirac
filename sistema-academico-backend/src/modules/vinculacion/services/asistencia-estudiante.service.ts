import { 
  Injectable, 
  Inject, 
  NotFoundException, 
  InternalServerErrorException, 
  BadRequestException, 
  ConflictException 
} from '@nestjs/common';

import { CreateActividadEstudianteDto } from '../dto/create-actividad-estudiante.dto';
import { UpdateActividadEstudianteDto } from '../dto/update-actividad-estudiante.dto';
import { IVinculacionAsistenciaEstudiantePort, VINCULACION_ASISTENCIA_ESTUDIANTE_PORT } from '../ports/asistencia-estudiante.port';

@Injectable()
export class AsistenciaEstudianteService {
  constructor(
    @Inject(VINCULACION_ASISTENCIA_ESTUDIANTE_PORT) 
    private readonly repository: IVinculacionAsistenciaEstudiantePort,
  ) {}

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

  async obtenerAsistenciaEstudiante(idVinculacion: number) {
    try {
      const resultados = await this.repository.obtenerAsistenciaEstudianteRaw(idVinculacion);

      if (!resultados || resultados.length === 0) {
        return null;
      }

      const primerRegistro = resultados[0];

      const actividades = resultados
        .filter((row: any) => row.id_actividad !== null && row.id_actividad !== undefined)
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
            id: row.id_actividad,
            fecha: fechaFormateada,
            hora_entrada: row.hora_inicio,
            hora_salida: row.hora_fin,
            total_horas: horasCalculadas,
            descripcion: row.descripcion || '',
          };
        });

      const sumaTotalHoras = actividades.reduce((acc, act) => acc + act.total_horas, 0);

      const tutorEntidad =
        primerRegistro.tutor_entidad && primerRegistro.tutor_entidad.trim() !== ''
          ? primerRegistro.tutor_entidad.trim()
          : 'Sin Tutor Receptora Asignado';

      return {
        cabecera: {
          carrera: primerRegistro.carrera,
          entidad_beneficiaria: primerRegistro.entidad_beneficiaria,
          estudiante: `${primerRegistro.est_nombres || ''} ${primerRegistro.est_apellidos || ''}`.trim(),
          nombre_proyecto: primerRegistro.nombre_proyecto,
          docente_tutor: `${primerRegistro.doc_nombres || ''} ${primerRegistro.doc_apellidos || ''}`.trim(),
          tutor_entidad_receptora: tutorEntidad,
          periodo_academico: primerRegistro.periodo_academico,
        },
        actividades: actividades,
        totales: {
          total_horas: sumaTotalHoras,
          observaciones: primerRegistro.observacion_reporte || 'Ninguna',
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      const mensaje = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(`Error al obtener reporte de asistencia: ${mensaje}`);
    }
  }

  async crearActividadEstudiante(datos: CreateActividadEstudianteDto) {
    try {
      if (datos.id_vinculacion) {
        const existeFecha = await this.repository.buscarPorFechaYVinculacion(
          datos.id_vinculacion,
          datos.fecha,
        );

        if (existeFecha) {
          throw new ConflictException(
            `Ya existe un registro de asistencia para la fecha ${datos.fecha}`,
          );
        }
      }

      const horasCalculadas = this.calcularDiferenciaHoras(datos.hora_inicio, datos.hora_fin);

      const datosAInsertar = {
        ...datos,
        horas_total: horasCalculadas,
        resultado_aprendizaje: datos.resultado_aprendizaje ?? '',
      };

      const actividadCreada = await this.repository.crearActividadEstudiante(datosAInsertar);

      if (datos.observacion !== undefined && datos.id_vinculacion) {
        await this.repository.guardarObservacion({
          id_vinculacion: datos.id_vinculacion,
          tipo_reporte: 'ASISTENCIA_ESTUDIANTE',
          observacion: datos.observacion,
        });
      }

      return { 
        statusCode: 201, 
        message: 'Actividad de estudiante registrada exitosamente', 
        data: actividadCreada 
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      const mensaje = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(`Error interno al crear la actividad: ${mensaje}`);
    }
  }

  async actualizarActividadEstudiante(
    id: number, 
    datos: UpdateActividadEstudianteDto,
    user?: any,
    idVinculacion?: number | string
  ) {
    try {
      const registroActual = await this.repository.buscarPorId(id);
      if (!registroActual) {
        throw new NotFoundException(`La actividad con ID ${id} no existe.`);
      }

      let idVinculacionFinal: string | number | null | undefined = idVinculacion;
      const roles = user?.roles || user?.roles_usuario || [];

      if (roles.includes('ESTUDIANTE')) {
        if (!idVinculacionFinal || idVinculacionFinal === 'undefined') {
          const idEstudiante = user?.idEstudiante || user?.sub;
          if (idEstudiante) {
            idVinculacionFinal = await this.repository.obtenerIdVinculacionPorEstudiante(idEstudiante);
          }
        }

        if (!idVinculacionFinal || String(registroActual.id_vinculacion) !== String(idVinculacionFinal)) {
          throw new BadRequestException('No tienes permiso para modificar esta actividad.');
        }
      } else {
        idVinculacionFinal = registroActual.id_vinculacion;
      }

      if (datos.fecha && datos.fecha !== registroActual.fecha) {
        const existeFecha = await this.repository.buscarPorFechaYVinculacion(
          idVinculacionFinal!,
          datos.fecha
        );

        if (existeFecha && String(existeFecha.id_actividad_estudiante) !== String(id)) {
          throw new ConflictException(
            `Ya existe un registro de asistencia para la fecha ${datos.fecha}`
          );
        }
      }

      const horaInicio = datos.hora_inicio || (registroActual as any).hora_inicio;
      const horaFin = datos.hora_fin || (registroActual as any).hora_fin;
      
      let horasCalculadas: number | undefined = undefined;
      if (horaInicio && horaFin) {
        horasCalculadas = this.calcularDiferenciaHoras(horaInicio, horaFin);
      }

      const datosAActualizar = {
        ...datos,
        ...(horasCalculadas !== undefined && { horas_total: horasCalculadas }),
      };

      const resultado = await this.repository.actualizarActividadEstudiante(id, datosAActualizar);

      return { 
        statusCode: 200, 
        message: 'Actividad actualizada exitosamente', 
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

      throw new InternalServerErrorException(`Error interno al actualizar la actividad: ${mensaje}`);
    }
  }

  async eliminarActividadEstudiante(id: number, user: any, idVinculacion?: number | string) {
    try {
      const roles = user?.roles || user?.roles_usuario || [];
      const esEstudiante = roles.includes('ESTUDIANTE');

      let idVinculacionFinal: string | number | null | undefined = idVinculacion;

      if (esEstudiante) {
        if (!idVinculacionFinal || idVinculacionFinal === 'undefined') {
          const idEstudiante = user?.idEstudiante || user?.sub;
          if (idEstudiante) {
            idVinculacionFinal = await this.repository.obtenerIdVinculacionPorEstudiante(idEstudiante);
          }
        }

        if (!idVinculacionFinal || idVinculacionFinal === 'undefined') {
          throw new BadRequestException(
            'El estudiante autenticado no posee un proceso de vinculación registrado.'
          );
        }
      }

      const eliminado = await this.repository.eliminarActividadEstudiante(
        id,
        esEstudiante ? idVinculacionFinal : undefined,
      );

      if (!eliminado) {
        throw new NotFoundException(
          `La actividad con ID ${id} no existe o no pertenece a tu perfil.`
        );
      }

      return { 
        statusCode: 200, 
        message: `Actividad con ID ${id} eliminada exitosamente.` 
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      const mensaje = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(`Error interno al eliminar: ${mensaje}`);
    }
  }
}
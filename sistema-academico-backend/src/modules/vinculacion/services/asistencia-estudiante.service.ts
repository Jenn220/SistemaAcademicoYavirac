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

  // Auxiliar: Calcula las horas entre dos horas "HH:mm:ss" o "HH:mm"
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
  // 📊 REPORTE DE ASISTENCIA INDIVIDUAL
  // =========================================================================

  async obtenerAsistenciaEstudiante(idVinculacion: number) {
    try {
      const resultados = await this.repository.obtenerAsistenciaEstudianteRaw(idVinculacion);

      if (!resultados || resultados.length === 0) {
        return null;
      }

      const primerRegistro = resultados[0];

      // Mapeo de actividades recalculando dinámicamente las horas reales por fila
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

      // Suma dinámica real de todas las horas acumuladas en las actividades
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

  // =========================================================================
  // 🎓 GESTIÓN DE BITÁCORA / ACTIVIDADES DIARIAS DEL ESTUDIANTE
  // =========================================================================

 async crearActividadEstudiante(datos: CreateActividadEstudianteDto) {
  try {
    // 1. Validar fecha duplicada
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

    // 2. Calcular diferencia de horas
    const horasCalculadas = this.calcularDiferenciaHoras(datos.hora_inicio, datos.hora_fin);

    // 3. Insertar la actividad
    const datosAInsertar = {
      ...datos,
      horas_total: horasCalculadas,
      resultado_aprendizaje: datos.resultado_aprendizaje ?? '',
    };

    const actividadCreada = await this.repository.crearActividadEstudiante(datosAInsertar);

    // 🟢 4. Guardar u actualizar la observación general si viene en el payload
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
    // 1. Obtener la actividad existente para validar pertenencia y combinar horas
    const registroActual = await this.repository.buscarPorId(id);
    if (!registroActual) {
      throw new NotFoundException(`La actividad con ID ${id} no existe.`);
    }

    // 2. Seguridad: Si es un estudiante, verificar que la actividad le pertenezca
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
      // Si es un rol administrativo/docente, tomamos la vinculación directamente del registro actual
      idVinculacionFinal = registroActual.id_vinculacion;
    }

    // 🟢 3. VALIDACIÓN DE FECHA DUPLICADA
    // Solo validamos si envían una fecha nueva y es diferente a la fecha que ya tenía el registro
    if (datos.fecha && datos.fecha !== registroActual.fecha) {
      const existeFecha = await this.repository.buscarPorFechaYVinculacion(
        idVinculacionFinal!,
        datos.fecha
      );

      // Si existe un registro con la nueva fecha y NO es el mismo registro actual
      if (existeFecha && String(existeFecha.id_actividad_estudiante) !== String(id)) {
        throw new ConflictException(
          `Ya existe un registro de asistencia para la fecha ${datos.fecha}`
        );
      }
    }

    // 4. Recálculo inteligente de horas
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

    // 🟢 Opción A: Permitimos null en la unión de tipos para compatibilidad con la BD
    let idVinculacionFinal: string | number | null | undefined = idVinculacion;

    if (esEstudiante) {
      // Si no venía id_vinculacion en el JWT, lo resolvemos desde la BD usando idEstudiante o sub
      if (!idVinculacionFinal || idVinculacionFinal === 'undefined') {
        const idEstudiante = user?.idEstudiante || user?.sub;
        if (idEstudiante) {
          idVinculacionFinal = await this.repository.obtenerIdVinculacionPorEstudiante(idEstudiante);
        }
      }

      // Si no se encuentra una vinculación válida (evalúa null, undefined o "undefined")
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
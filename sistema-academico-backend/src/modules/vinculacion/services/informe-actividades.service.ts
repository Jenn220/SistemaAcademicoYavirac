import { Injectable, Inject, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { 
  INFORME_ACTIVIDADES_PORT, 
  IInformeActividadesPort 
} from '../ports/informe-actividades.port';
import { UpdateResultadoAprendizajeDto } from '../dto/update-resultado-aprendizaje.dto';

@Injectable()
export class InformeActividadesService {
  constructor(
    @Inject(INFORME_ACTIVIDADES_PORT) 
    private readonly repository: IInformeActividadesPort,
  ) {}

  async obtenerInformeActividades(idVinculacion: number) {
    const resultados = await this.repository.obtainInformeActividadesRaw(idVinculacion);
    if (!resultados || resultados.length === 0) return null;

    const primerRegistro = resultados[0];
    const listaAsignaturas = primerRegistro.asignaturas ? primerRegistro.asignaturas.split(' | ') : [];

    const actividades = resultados
      .filter((row: any) => row.fecha !== null)
      .map((row: any) => {
        const fechaParseada = new Date(row.fecha);
        const fechaFormateada = !isNaN(fechaParseada.getTime())
          ? fechaParseada.toLocaleDateString('es-ES', { timeZone: 'UTC' })
          : row.fecha;

        return {
          id: row.id_actividad_estudiante,
          fecha: fechaFormateada,
          actividad: row.actividades_realizadas,
          resultado_aprendizaje: row.resultado_aprendizaje || 'Sin resultado de aprendizaje especificado',
        };
      });

    const formatFechaCabecera = (f: any) => {
      if (!f) return 'N/A';
      const fecha = new Date(f);
      return !isNaN(fecha.getTime()) ? fecha.toLocaleDateString('es-ES', { timeZone: 'UTC' }) : 'N/A';
    };

  return {
      cabecera: {
        fundacion: primerRegistro.entidad_beneficiaria,
        nivel: primerRegistro.nivel || 'N/A',
        estudiante: primerRegistro.estudiante,
        cedula: primerRegistro.cedula_identidad,
        ciclo_academico: primerRegistro.ciclo_academico,
        asignatura_1: listaAsignaturas[0] || 'N/A',
        asignatura_2: listaAsignaturas[1] || 'N/A',
        inicia: formatFechaCabecera(primerRegistro.inicia),
        finaliza: formatFechaCabecera(primerRegistro.finaliza),
        docente_tutor: primerRegistro.docente_tutor,
        titulo_proyecto: primerRegistro.nombre_proyecto,
      },
      informe_actividades: actividades,
      // ✅ AGREGA ESTA LÍNEA AQUÍ:
      reflexion_estudiante: primerRegistro.reflexion_estudiante || "Sin reflexión registrada.",
    };
  }

  async obtenerActividadPorId(idActividad: number): Promise<any> {
    const actividad = await this.repository.obtenerActividadPorId(idActividad);
    if (!actividad) {
      throw new NotFoundException(`Actividad con ID ${idActividad} no encontrada`);
    }
    return actividad;
  }

  async actualizarResultadoAprendizaje(
    idActividad: number,
    dto: UpdateResultadoAprendizajeDto,
    user: any,
    idVinculacionUser?: number,
  ) {
    const roles = user?.roles || user?.roles_usuario || [];
    const esEstudiante = roles.includes('ESTUDIANTE');

    if (esEstudiante) {
      const actividades = await this.repository.obtainInformeActividadesRaw(Number(idVinculacionUser));
      const lePertenece = actividades.some((row: any) => 
        Number(row.id_actividad_estudiante || row.id) === idActividad
      );

      if (!lePertenece) {
        throw new NotFoundException(
          `La actividad con ID ${idActividad} no existe o no pertenece a tu perfil.`
        );
      }
    }

    await this.repository.actualizarResultadoAprendizaje(idActividad, dto.resultado_aprendizaje);

    return {
      statusCode: 200,
      message: 'Resultado de aprendizaje actualizado exitosamente.',
    };
  }

  async actualizarReflexionEstudiante(idVinculacion: number, observaciones: string) {
    try {
      // ✅ Usamos el método definido en el puerto e implementado en el adaptador
      await this.repository.guardarOActualizarObservacion(
        idVinculacion, 
        'ASISTENCIA_ESTUDIANTE', 
        observaciones
      );

      return {
        statusCode: 200,
        message: 'Reflexión del estudiante actualizada exitosamente.',
        reflexion_estudiante: observaciones,
      };
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(`Error al actualizar la reflexión: ${mensaje}`);
    }
  }
}
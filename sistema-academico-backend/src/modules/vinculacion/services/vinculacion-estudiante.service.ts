import { 
  Injectable, 
  Inject, 
  NotFoundException, 
  InternalServerErrorException, 
  BadRequestException, 
  ConflictException 
} from '@nestjs/common';

// 1. IMPORTAR EL PUERTO Y EL TOKEN DE ESTUDIANTES
import { 
  VINCULACION_ESTUDIANTE_PORT, 
  IVinculacionEstudiantePort 
} from '../ports/vinculacion-estudiante.port';

import { CreateVinculacionDto } from '../dto/create-vinculacion.dto';
import { UpdateVinculacionDto } from '../dto/update-actividad-estudiante.dto';

@Injectable()
export class VinculacionEstudianteService {
  constructor(
    // 2. INYECTAR CON EL TOKEN DE ESTUDIANTES
    @Inject(VINCULACION_ESTUDIANTE_PORT)
    private readonly repository: IVinculacionEstudiantePort,
  ) {}

  async crearVinculacion(datos: CreateVinculacionDto) {
    try {
      const resultado = await this.repository.crearVinculacion(datos);
      return { statusCode: 201, message: 'Proyecto de vinculación creado exitosamente', data: resultado };
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : String(error);
      if (mensaje.includes('llave duplicada') || mensaje.includes('unique constraint')) {
        throw new ConflictException('Ya existe una vinculación con esos datos.');
      }
      throw new InternalServerErrorException(`Error interno: ${mensaje}`);
    }
  }

  async eliminarVinculacionEstudiante(id: number) {
    try {
      const eliminado = await this.repository.eliminarVinculacionEstudiante(id);
      if (!eliminado) {
        throw new NotFoundException(`La vinculación de estudiante con ID ${id} no existe.`);
      }
      return { statusCode: 200, message: `Vinculación con ID ${id} eliminada exitosamente.` };
    } catch (error) {
      this.manejarErrorEliminacion(error, 'la vinculación del estudiante', id);
    }
  }

  async verificarAccesoVinculacion(idEstudiante: number) {
    const vinculacionActiva = await this.repository.buscarVinculacionActiva(idEstudiante) as any;

    if (!vinculacionActiva) {
      return { acceso_permitido: false, estado: "NO_MATRICULADO", mensaje: "No te encuentras matriculado." };
    }

    if (vinculacionActiva.estado === 'APROBADO') {
      return { acceso_permitido: true, estado: "APROBADO", mensaje: "Has finalizado tu vinculación." };
    }

    return { acceso_permitido: true, estado: "ACTIVO", mensaje: "Bienvenido a tu panel." };
  }

  async obtenerVinculacionesEstudiantes() {
    try {
      const resultado = await this.repository.obtenerVinculacionesEstudiantes();
      return {
        statusCode: 200,
        data: resultado,
      };
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(`Error al obtener vinculaciones: ${mensaje}`);
    }
  }

  // 🟢 LÓGICA DE NEGOCIO PARA VERIFICAR REQUISITOS DE CIERRE
  async verificarRequisitosCierre(idVinculacion: number) {
    try {
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
        const reporte = await this.repository.obtenerReporteConsolidado(idVinculacion);
        if (reporte?.totales?.total_horas >= 160) {
          requisitos.horas_completas = true;
          porcentajeCumplimiento += 25;
        } else {
          const horasActuales = reporte?.totales?.total_horas ?? 0;
          observaciones.push(`Faltan horas. Tiene ${horasActuales}/160.`);
        }
      } catch (e) {
        observaciones.push("No se encontraron registros de horas o bitácoras.");
      }

      // 2. Verificamos si existe el Informe Final
      try {
        const informeFinal = await this.repository.obtenerInformeFinal(idVinculacion);
        if (informeFinal && informeFinal.resumen_actividades && informeFinal.resumen_actividades.length > 0) {
          requisitos.tiene_informe_final = true;
          porcentajeCumplimiento += 25;
        } else {
          observaciones.push("No se ha redactado ni subido el Informe Final del proyecto.");
        }
      } catch (e) {
        observaciones.push("No se ha redactado ni subido el Informe Final del proyecto.");
      }

      // 3. Verificamos si tiene el acta inicial
      try {
        const acta = await this.repository.obtenerActaCompromiso(idVinculacion);
        if (acta) {
          requisitos.acta_generada = true;
          porcentajeCumplimiento += 25;
        } else {
          observaciones.push("Falta el Acta de Compromiso inicial.");
        }
      } catch (e) {
        observaciones.push("Falta el Acta de Compromiso inicial.");
      }

      // 4. Verificamos si el tutor registró visitas/asistencia
      try {
        const asistenciaTutor = await this.repository.obtenerReporteAsistenciaTutor(idVinculacion);
        if (asistenciaTutor && asistenciaTutor.actividades && asistenciaTutor.actividades.length > 0) {
          requisitos.tutor_asistio = true;
          porcentajeCumplimiento += 25;
        } else {
          observaciones.push("El Docente Tutor aún no ha registrado sus visitas a la entidad.");
        }
      } catch (e) {
        observaciones.push("El Docente Tutor aún no ha registrado sus visitas a la entidad.");
      }

      return {
        statusCode: 200,
        data: {
          id_vinculacion: idVinculacion,
          puede_cerrar_proyecto: porcentajeCumplimiento === 100,
          progreso_cierre: `${porcentajeCumplimiento}%`,
          checklist_requisitos: requisitos,
          acciones_pendientes: observaciones
        }
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      const mensaje = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(`Error al verificar requisitos de cierre: ${mensaje}`);
    }
  }

  // Helper privado propio del servicio
  private manejarErrorEliminacion(error: any, nombreEntidad: string, id: number): never {
    if (error instanceof NotFoundException) throw error;
    const mensaje = error instanceof Error ? error.message : String(error);
    if (mensaje.includes('violates foreign key constraint') || mensaje.includes('viola la llave foránea')) {
      throw new BadRequestException(`No se puede eliminar ${nombreEntidad} con ID ${id} porque existen otros registros asociados.`);
    }
    throw new InternalServerErrorException(`Error interno al intentar eliminar ${nombreEntidad}: ${mensaje}`);
  }

  async actualizarVinculacionEstudiante(id: number, datos: UpdateVinculacionDto) {
    try {
      const resultado = await this.repository.actualizarVinculacionEstudiante(id, datos);
      if (!resultado) {
        throw new NotFoundException(`La vinculación de estudiante con ID ${id} no existe o no pudo ser actualizada.`);
      }
      return {
        statusCode: 200,
        message: 'Vinculación de estudiante actualizada exitosamente',
        data: resultado,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      const mensaje = error instanceof Error ? error.message : String(error);

      if (mensaje.includes('violates foreign key constraint') || mensaje.includes('viola la llave foránea')) {
        throw new NotFoundException('El estudiante o proyecto asociado no existe.');
      }

      throw new InternalServerErrorException(`Error al actualizar la vinculación: ${mensaje}`);
    }
  }
}
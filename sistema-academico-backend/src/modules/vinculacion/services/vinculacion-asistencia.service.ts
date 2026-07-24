import { 
  Injectable, 
  Inject, 
  NotFoundException, 
  InternalServerErrorException, 
  BadRequestException, 
  ConflictException 
} from '@nestjs/common';

// 1. IMPORTAR EL PUERTO Y SU TOKEN CORRESPONDIENTE
import { 
  VINCULACION_ASISTENCIA_PORT, 
  IVinculacionAsistenciaPort 
} from '../ports/vinculacion-asistencia.port';

import { CreateAsistenciaTutorDto } from '../dto/create-asistencia-tutor.dto';
import { UpdateAsistenciaTutorDto } from '../dto/update-asistencia-tutor.dto';


@Injectable()
export class VinculacionAsistenciaService {
  constructor(
    // 2. USAR EL TOKEN Y LA INTERFAZ DE ASISTENCIA
    @Inject(VINCULACION_ASISTENCIA_PORT)
    private readonly repository: IVinculacionAsistenciaPort,
  ) {}

  async crearAsistenciaTutor(datos: CreateAsistenciaTutorDto) {
    try {
      const resultado = await this.repository.crearAsistenciaTutor(datos);
      return { 
        statusCode: 201, 
        message: 'Registro de asistencia creado exitosamente', 
        data: resultado 
      };
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : String(error);
      
      if (mensaje.includes('llave duplicada') || mensaje.includes('unique constraint')) {
        throw new ConflictException('Ya existe un registro de asistencia con estos datos.');
      }
      
      throw new InternalServerErrorException(`Error interno al crear la asistencia: ${mensaje}`);
    }
  }

  async obtenerAsistenciasPorVinculacion(idVinculacion: number) {
    // Si tu puerto define obtenerTodasLasAsistencias() u obtenerAsistenciasPorVinculacion(), 
    // asegúrate de llamar al nombre exacto definido en 'vinculacion-asistencia.port.ts'
    const asistencias = await this.repository.obtenerTodasLasAsistencias();
    return {
      statusCode: 200,
      data: asistencias
    };
  }

  async actualizarAsistenciaTutor(id: number, datos: UpdateAsistenciaTutorDto) {
    try {
      const resultado = await this.repository.actualizarAsistenciaTutor(id, datos);
      
      if (!resultado) {
        throw new NotFoundException(`El registro de asistencia con ID ${id} no existe o no pudo ser actualizado.`);
      }

      return { 
        statusCode: 200, 
        message: 'Asistencia actualizada exitosamente', 
        data: resultado 
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(`Error interno al actualizar la asistencia: ${error instanceof Error ? error.message : String(error)}`);
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
      this.manejarErrorEliminacion(error, 'la asistencia del tutor', id);
    }
  }

  // Helper privado propio de esta clase
  private manejarErrorEliminacion(error: any, nombreEntidad: string, id: number): never {
    if (error instanceof NotFoundException) {
      throw error;
    }

    const mensaje = error instanceof Error ? error.message : String(error);

    if (
      mensaje.includes('violates foreign key constraint') ||
      mensaje.includes('viola la llave foránea') ||
      mensaje.includes('23503')
    ) {
      throw new BadRequestException(
        `No se puede eliminar ${nombreEntidad} con ID ${id} porque existen otros registros asociados en el sistema.`
      );
    }

    throw new InternalServerErrorException(
      `Error interno al intentar eliminar ${nombreEntidad}: ${mensaje}`
    );
  }

  async obtenerAsistenciasTutor() {
    try {
      const asistencias = await this.repository.obtenerAsistenciasTutor();
      return {
        statusCode: 200,
        data: asistencias,
      };
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(
        `Error al obtener las asistencias: ${mensaje}`,
      );
    }
  }
}
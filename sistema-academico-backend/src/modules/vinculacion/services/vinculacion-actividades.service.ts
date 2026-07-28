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
  VINCULACION_ACTIVIDADES_PORT, 
  IVinculacionActividadesPort 
} from '../ports/vinculacion-actividades.port';

import { CreateActividadEstudianteDto } from '../dto/create-actividad-estudiante.dto';
import { UpdateActividadEstudianteDto } from '../dto/update-actividad-estudiante.dto';

@Injectable()
export class VinculacionActividadesService {
  constructor(
    // 2. CAMBIAR EL TOKEN AL PUERTO ESPECÍFICO DE ACTIVIDADES
    @Inject(VINCULACION_ACTIVIDADES_PORT)
    private readonly repository: IVinculacionActividadesPort,
  ) {}

  async crearActividadEstudiante(datos: CreateActividadEstudianteDto) {
    try {
      const resultado = await this.repository.crearActividadEstudiante(datos);
      return { 
        statusCode: 201, 
        message: 'Actividad de estudiante creada exitosamente', 
        data: resultado 
      };
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : String(error);
      
      if (mensaje.includes('llave duplicada') || mensaje.includes('unique constraint')) {
        throw new ConflictException('Ya existe una actividad registrada con estos datos para esta vinculación.');
      }
      
      throw new InternalServerErrorException(`Error interno al crear la actividad: ${mensaje}`);
    }
  }

  async obtenerActividadesPorVinculacion(idVinculacion: number) {
    const actividades = await this.repository.obtenerTodasLasActividades();
    return {
      statusCode: 200,
      data: actividades
    };
  }

  async actualizarActividadEstudiante(id: number, datos: UpdateActividadEstudianteDto) {
    try {
      const resultado = await this.repository.actualizarActividadEstudiante(id, datos);
      
      if (!resultado) {
        throw new NotFoundException(`La actividad con ID ${id} no existe o no pudo ser actualizada.`);
      }

      return { 
        statusCode: 200, 
        message: 'Actividad actualizada exitosamente', 
        data: resultado 
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(`Error interno al actualizar la actividad: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async eliminarActividadEstudiante(id: number) {
    try {
      const eliminado = await this.repository.eliminarActividadEstudiante(id);
      if (!eliminado) {
        throw new NotFoundException(`La actividad de estudiante con ID ${id} no existe.`);
      }
      return { statusCode: 200, message: `Actividad con ID ${id} eliminada exitosamente.` };
    } catch (error) {
      this.manejarErrorEliminacion(error, 'la actividad', id);
    }
  }

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
  async obtenerTodasLasActividades() {
    try {
      const actividades = await this.repository.obtenerTodasLasActividades();
      return {
        statusCode: 200,
        data: actividades,
      };
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(
        `Error al obtener las actividades: ${mensaje}`,
      );
    }
  }
}
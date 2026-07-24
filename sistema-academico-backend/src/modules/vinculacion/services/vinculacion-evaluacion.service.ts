import { 
  Injectable, 
  Inject, 
  NotFoundException, 
  InternalServerErrorException, 
  BadRequestException, 
  ConflictException
} from '@nestjs/common';

// 1. IMPORTAR EL PUERTO Y EL TOKEN DE EVALUACIONES
import { 
  VINCULACION_EVALUACION_PORT, 
  IVinculacionEvaluacionPort 
} from '../ports/vinculacion-evaluacion.port';

import { UpdateDetalleEvaluacionDto } from '../dto/update-detalle-evaluacion.dto';
import { CreateEvaluacionDto } from '../dto/create-evaluacion.dto';
import { CreateDetalleEvaluacionDto } from '../dto/create-detalle-evaluacion.dto';
import { UpdateEvaluacionDto } from '../dto/update-evaluacion.dto';

@Injectable()
export class VinculacionEvaluacionService {
  constructor(
    // 2. INYECTAR EL PUERTO CORRESPONDIENTE
    @Inject(VINCULACION_EVALUACION_PORT)
    private readonly repository: IVinculacionEvaluacionPort,
  ) {}

  async actualizarDetalleEvaluacion(id: number, datos: UpdateDetalleEvaluacionDto) {
    try {
      const resultado = await this.repository.actualizarDetalleEvaluacion(id, datos);
      if (!resultado) {
        throw new NotFoundException(`El detalle de evaluación con ID ${id} no existe o no pudo ser actualizado.`);
      }
      return { statusCode: 200, message: 'Detalle de evaluación actualizado exitosamente', data: resultado };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      const mensaje = error instanceof Error ? error.message : String(error);

      if (mensaje.includes('violates foreign key constraint') || mensaje.includes('viola la llave foránea')) {
        throw new NotFoundException(`La evaluación o el ítem de catálogo asociado no existe en la base de datos.`);
      }
      throw new InternalServerErrorException(`Error al actualizar el detalle de evaluación: ${mensaje}`);
    }
  }

  async eliminarEvaluacion(id: number) {
    try {
      const eliminado = await this.repository.eliminarEvaluacion(id);
      if (!eliminado) throw new NotFoundException(`La evaluación con ID ${id} no existe.`);
      return { statusCode: 200, message: `Evaluación eliminada exitosamente.` };
    } catch (error) {
      this.manejarErrorEliminacion(error, 'la evaluación', id);
    }
  }

  async eliminarDetalleEvaluacion(id: number) {
    try {
      const eliminado = await this.repository.eliminarDetalleEvaluacion(id);
      if (!eliminado) throw new NotFoundException(`El detalle de evaluación con ID ${id} no existe.`);
      return { statusCode: 200, message: `Detalle de evaluación eliminado exitosamente.` };
    } catch (error) {
      this.manejarErrorEliminacion(error, 'el detalle de evaluación', id);
    }
  }

  private manejarErrorEliminacion(error: any, nombreEntidad: string, id: number): never {
    if (error instanceof NotFoundException) throw error;
    const mensaje = error instanceof Error ? error.message : String(error);
    if (mensaje.includes('violates foreign key constraint') || mensaje.includes('viola la llave foránea')) {
      throw new BadRequestException(`No se puede eliminar ${nombreEntidad} con ID ${id} por registros asociados.`);
    }
    throw new InternalServerErrorException(`Error interno: ${mensaje}`);
  }
  async obtenerTodasLasEvaluaciones() {
    try {
      const evaluaciones = await this.repository.obtenerTodasLasEvaluaciones();
      return {
        statusCode: 200,
        data: evaluaciones,
      };
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(
        `Error al obtener las evaluaciones: ${mensaje}`,
      );
    }
  }

async obtenerDetallesEvaluacion(idEvaluacion?: number) {
  try {
    const detalles = await this.repository.obtenerDetallesEvaluacion(idEvaluacion);
    
    if (idEvaluacion && (!detalles || detalles.length === 0)) {
      throw new NotFoundException(`No se encontraron detalles para la evaluación con ID ${idEvaluacion}`);
    }

    return { statusCode: 200, data: detalles };
  } catch (error) {
    if (error instanceof NotFoundException) throw error;
    const mensaje = error instanceof Error ? error.message : String(error);
    throw new InternalServerErrorException(`Error al obtener los detalles: ${mensaje}`);
  }
}
  async obtenerEvaluacionPorVinculacion(idVinculacion: number) {
    try {
      const evaluacion = await this.repository.obtenerEvaluacionPorVinculacion(idVinculacion);
      if (!evaluacion) {
        throw new NotFoundException(`No se encontró evaluación para la vinculación con ID ${idVinculacion}`);
      }
      return {
        statusCode: 200,
        data: evaluacion,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      const mensaje = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(
        `Error al obtener la evaluación de la vinculación: ${mensaje}`,
      );
    }
  }

  async crearEvaluacion(datos: CreateEvaluacionDto) {
    try {
      const resultado = await this.repository.crearEvaluacion(datos);
      return { 
        statusCode: 201, 
        message: 'Evaluación creada exitosamente', 
        data: resultado 
      };
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : String(error);
      
      if (mensaje.includes('violates foreign key constraint') || mensaje.includes('viola la llave foránea')) {
        throw new NotFoundException('La vinculación o rúbrica especificada no existe.');
      }

      if (mensaje.includes('llave duplicada') || mensaje.includes('unique constraint')) {
        throw new ConflictException('Ya existe una evaluación registrada para esta vinculación.');
      }
      
      throw new InternalServerErrorException(`Error interno al crear la evaluación: ${mensaje}`);
    }
  }

  // 2. Opcional: Si vas a soportar creación de detalles de evaluación
  async crearDetalleEvaluacion(datos: CreateDetalleEvaluacionDto) {
    try {
      const resultado = await this.repository.crearDetalleEvaluacion(datos);
      return { 
        statusCode: 201, 
        message: 'Detalle de evaluación creado exitosamente', 
        data: resultado 
      };
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(`Error interno al crear el detalle: ${mensaje}`);
    }
  }

  async actualizarEvaluacion(id: number, datos: UpdateEvaluacionDto) {
    try {
      const resultado = await this.repository.actualizarEvaluacion(id, datos);
      if (!resultado) {
        throw new NotFoundException(`La evaluación con ID ${id} no existe o no pudo ser actualizada.`);
      }
      return { 
        statusCode: 200, 
        message: 'Evaluación actualizada exitosamente', 
        data: resultado 
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      const mensaje = error instanceof Error ? error.message : String(error);

      if (mensaje.includes('violates foreign key constraint') || mensaje.includes('viola la llave foránea')) {
        throw new NotFoundException(`La vinculación o rúbrica especificada no existe.`);
      }

      throw new InternalServerErrorException(`Error al actualizar la evaluación: ${mensaje}`);
    }
  }
}
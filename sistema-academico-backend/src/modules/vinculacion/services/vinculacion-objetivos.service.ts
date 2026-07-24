import { 
  Injectable, 
  Inject, 
  NotFoundException, 
  InternalServerErrorException, 
  BadRequestException, 
  ConflictException 
} from '@nestjs/common';

// 1. IMPORTAR EL PUERTO Y SU TOKEN
import { 
  VINCULACION_OBJETIVOS_PORT, 
  IVinculacionObjetivosPort 
} from '../ports/vinculacion-objetivos.port';

import { CreateVinculacionObjetivoDto } from '../dto/create-objetivo.dto';
import { UpdateObjetivoDto } from '../dto/update-objetivo.dto';


@Injectable()
export class VinculacionObjetivosService {
  constructor(
    // 2. INYECTAR CON EL TOKEN DE OBJETIVOS
    @Inject(VINCULACION_OBJETIVOS_PORT)
    private readonly repository: IVinculacionObjetivosPort,
  ) {}

  async crearObjetivo(datos: CreateVinculacionObjetivoDto) {
    try {
      const resultado = await this.repository.crearVinculacionObjetivo(datos);
      return { 
        statusCode: 201, 
        message: 'Objetivo de vinculación creado exitosamente', 
        data: resultado 
      };
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : String(error);
      
      if (mensaje.includes('llave duplicada') || mensaje.includes('unique constraint')) {
        throw new ConflictException('Ya existe un objetivo registrado con estos datos para esta vinculación.');
      }
      
      throw new InternalServerErrorException(`Error interno al crear el objetivo: ${mensaje}`);
    }
  }

  async obtenerObjetivosPorVinculacion(idVinculacion: number) {
    const objetivos = await this.repository.obtenerObjetivosPorVinculacion(idVinculacion);
    return {
      statusCode: 200,
      data: objetivos
    };
  }

  async actualizarObjetivo(id: number, datos: UpdateObjetivoDto) {
    try {
      const resultado = await this.repository.actualizarVinculacionObjetivo(id, datos);
      
      if (!resultado) {
        throw new NotFoundException(`El objetivo con ID ${id} no existe o no pudo ser actualizado.`);
      }

      return { 
        statusCode: 200, 
        message: 'Objetivo actualizado exitosamente', 
        data: resultado 
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(`Error interno al actualizar el objetivo: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async eliminarObjetivo(id: number) {
    try {
      const eliminado = await this.repository.eliminarVinculacionObjetivo(id);
      if (!eliminado) {
        throw new NotFoundException(`El objetivo con ID ${id} no existe.`);
      }
      return { statusCode: 200, message: `Objetivo con ID ${id} eliminado exitosamente.` };
    } catch (error) {
      this.manejarErrorEliminacion(error, 'el objetivo', id);
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
  async obtenerTodosLosObjetivos() {
  try {
    const objetivos = await this.repository.obtenerTodosLosObjetivos(); // Asegúrate de que el puerto/repo lo tenga
    return {
      statusCode: 200,
      data: objetivos,
    };
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : String(error);
    throw new InternalServerErrorException(`Error al obtener los objetivos: ${mensaje}`);
  }
}
}
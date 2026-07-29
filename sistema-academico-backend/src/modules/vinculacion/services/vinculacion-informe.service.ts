import { 
  Injectable, 
  Inject, 
  NotFoundException, 
  InternalServerErrorException, 
  BadRequestException, 
  ConflictException 
} from '@nestjs/common';

// 1. IMPORTAR EL PUERTO Y EL TOKEN DE INFORMES
import { 
  VINCULACION_INFORME_PORT, 
  IVinculacionInformePort 
} from '../ports/vinculacion-informe.port';

import { CreateInformeDto } from '../dto/create-informe.dto';
import { UpdateInformeDto } from '../dto/update-informe.dto';

@Injectable()
export class VinculacionInformeService {
  constructor(
    // 2. INYECTAR EL PUERTO CORRESPONDIENTE
    @Inject(VINCULACION_INFORME_PORT)
    private readonly repository: IVinculacionInformePort,
  ) {}

  async crearInforme(datos: CreateInformeDto) {
    try {
      const resultado = await this.repository.crearInforme(datos);
      return { 
        statusCode: 201, 
        message: 'Informe creado exitosamente', 
        data: resultado 
      };
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : String(error);
      
      if (mensaje.includes('llave duplicada') || mensaje.includes('unique constraint')) {
        throw new ConflictException('Ya existe un informe registrado con estos datos.');
      }
      
      throw new InternalServerErrorException(`Error interno al crear el informe: ${mensaje}`);
    }
  }

  async obtenerInformesPorVinculacion(idVinculacion: number) {
    const informes = await this.repository.obtenerInformesPorVinculacion(idVinculacion);
    return {
      statusCode: 200,
      data: informes
    };
  }

  async actualizarInforme(id: number, datos: UpdateInformeDto) {
    try {
      const resultado = await this.repository.actualizarInforme(id, datos);
      
      if (!resultado) {
        throw new NotFoundException(`El informe con ID ${id} no existe o no pudo ser actualizado.`);
      }

      return { 
        statusCode: 200, 
        message: 'Informe actualizado exitosamente', 
        data: resultado 
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(`Error interno al actualizar el informe: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async eliminarInforme(id: number) {
    try {
      const eliminado = await this.repository.eliminarInforme(id);
      if (!eliminado) {
        throw new NotFoundException(`El informe con ID ${id} no existe.`);
      }
      return { statusCode: 200, message: `Informe con ID ${id} eliminado exitosamente.` };
    } catch (error) {
      this.manejarErrorEliminacion(error, 'el informe', id);
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

  async obtenerInformes() {
    try {
      const informes = await this.repository.obtenerInformes();
      return {
        statusCode: 200,
        data: informes,
      };
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(
        `Error al obtener los informes: ${mensaje}`,
      );
    }
  }
}
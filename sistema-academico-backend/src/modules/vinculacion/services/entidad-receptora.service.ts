import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';

import { CreateEntidadReceptoraDto } from '../dto/create-entidad-receptora.dto';
import { ENTIDAD_RECEPTORA_PORT, IEntidadReceptoraPort } from '../ports/entidad-receptora.port';


@Injectable()
export class EntidadReceptoraService {
  constructor(
    @Inject(ENTIDAD_RECEPTORA_PORT)
    private readonly entidadPort: IEntidadReceptoraPort,
  ) {}

  async crear(createDto: CreateEntidadReceptoraDto) {
    try {
      const nuevaEntidad = await this.entidadPort.crearEntidad(createDto);
      
      return {
        success: true,
        message: 'Entidad receptora creada con éxito',
        data: nuevaEntidad,
      };
    } catch (error) {
      // 👇 Verificamos el tipo de error
      if (error instanceof Error) {
        throw new InternalServerErrorException('Error al crear la entidad receptora: ' + error.message);
      }
      // Fallback por si se lanzó algo que no era un Error estándar
      throw new InternalServerErrorException('Error desconocido al crear la entidad receptora');
    }
  }

  async obtenerTodas() {
    try {
      return await this.entidadPort.obtenerTodas();
    } catch (error: any) {
      throw new InternalServerErrorException('Error al obtener entidades receptoras: ' + error.message);
    }
  }

  async obtenerPorId(idEntidad: number) {
    try {
      const entidad = await this.entidadPort.obtenerPorId(idEntidad);
      if (!entidad) {
        throw new NotFoundException(`Entidad receptora con ID ${idEntidad} no encontrada`);
      }
      return entidad;
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al buscar la entidad receptora: ' + error.message);
    }
  }

}
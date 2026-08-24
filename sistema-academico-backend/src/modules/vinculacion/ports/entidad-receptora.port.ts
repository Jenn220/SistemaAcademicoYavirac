import { CreateEntidadReceptoraDto } from '../dto/create-entidad-receptora.dto';

export const ENTIDAD_RECEPTORA_PORT = 'ENTIDAD_RECEPTORA_PORT';

export interface IEntidadReceptoraPort {
  obtenerTodas(): Promise<any[]>;
  obtenerPorId(idEntidad: number): Promise<any | null>;
  crearEntidad(data: CreateEntidadReceptoraDto): Promise<any>;
}
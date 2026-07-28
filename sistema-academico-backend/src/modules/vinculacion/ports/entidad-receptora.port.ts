import { CreateEntidadReceptoraDto } from '../dto/create-entidad-receptora.dto'; // Ajusta la ruta del DTO si es necesario

// 👇 ESTA LÍNEA ES LA QUE TE FALTA O ESTÁ MAL ESCRITA
export const ENTIDAD_RECEPTORA_PORT = 'ENTIDAD_RECEPTORA_PORT';

export interface IEntidadReceptoraPort {
    obtenerTodas(): Promise<any[]>;
    obtenerPorId(idEntidad: number): Promise<any | null>;
  crearEntidad(data: CreateEntidadReceptoraDto): Promise<any>;
}
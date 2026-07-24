import { VinculacionInforme } from '../domain/vinculacion-informe.entity';
import { CreateInformeDto } from '../dto/create-informe.dto';
import { UpdateInformeDto } from '../dto/update-informe.dto';

// Token de Inyección de Dependencias
export const VINCULACION_INFORME_PORT = 'VINCULACION_INFORME_PORT';

export interface IVinculacionInformePort {
  crearInforme(datos: CreateInformeDto): Promise<any>;
  obtenerInformesPorVinculacion(idVinculacion: number): Promise<any[]>;
  actualizarInforme(id: number, datos: UpdateInformeDto): Promise<any | null>;
  eliminarInforme(id: number): Promise<boolean>;
  obtenerInformes(): Promise<VinculacionInforme[]>;
}
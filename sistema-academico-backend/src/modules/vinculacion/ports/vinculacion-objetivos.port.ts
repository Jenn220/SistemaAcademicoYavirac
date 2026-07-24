import { VinculacionObjetivo } from '../domain/vinculacion-objetivo.entity';
import { CreateVinculacionObjetivoDto } from '../dto/create-objetivo.dto';
import { UpdateObjetivoDto } from '../dto/update-objetivo.dto';


// Token de Inyección de Dependencias
export const VINCULACION_OBJETIVOS_PORT = 'VINCULACION_OBJETIVOS_PORT';

export interface IVinculacionObjetivosPort {
  crearVinculacionObjetivo(datos: CreateVinculacionObjetivoDto): Promise<any>;
  obtenerObjetivosPorVinculacion(idVinculacion: number): Promise<any[]>;
  actualizarVinculacionObjetivo(id: number, datos: UpdateObjetivoDto): Promise<any | null>;
  obtenerTodosLosObjetivos(): Promise<VinculacionObjetivo[]>;
  eliminarVinculacionObjetivo(id: number): Promise<boolean>;
}
import { UpdateInicioActividadesDto } from '../dto/update-inicio-actividades.dto';

export const VINCULACION_INICIO_ACTIVIDADES_PORT = 'VINCULACION_INICIO_ACTIVIDADES_PORT';

export interface IVinculacionInicioActividadesPort {
  obtenerIniciosActividadesPorDocenteRaw(idDocente: number): Promise<any>;
  obtainInicioActividadesTutorRaw(idVinculacion: number): Promise<any>;
  actualizarInicioActividadesRaw(idVinculacion: number, dto: UpdateInicioActividadesDto): Promise<any>;
}
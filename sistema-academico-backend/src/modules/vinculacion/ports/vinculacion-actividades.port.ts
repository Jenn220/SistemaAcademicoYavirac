import { VinculacionActividadEstudiante } from '../domain/vinculacion_actividad_estudiante.entity';
import { CreateActividadEstudianteDto } from '../dto/create-actividad-estudiante.dto';
import { UpdateActividadEstudianteDto } from '../dto/update-actividad-estudiante.dto';

export const VINCULACION_ACTIVIDADES_PORT = 'VINCULACION_ACTIVIDADES_PORT';

export interface IVinculacionActividadesPort {
  crearActividadEstudiante(datos: CreateActividadEstudianteDto): Promise<VinculacionActividadEstudiante>;
  obtenerTodasLasActividades(): Promise<VinculacionActividadEstudiante[]>;
  actualizarActividadEstudiante(id: number, datos: UpdateActividadEstudianteDto): Promise<VinculacionActividadEstudiante | null>;
  eliminarActividadEstudiante(id: number): Promise<boolean>;
}
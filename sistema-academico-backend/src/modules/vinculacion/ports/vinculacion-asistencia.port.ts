import { VinculacionAsistenciaTutor } from '../domain/vinculacion-asistencia-tutor.entity';
import { CreateAsistenciaTutorDto } from '../dto/create-asistencia-tutor.dto';
import { UpdateAsistenciaTutorDto } from '../dto/update-asistencia-tutor.dto';

// Token de Inyección de Dependencias para NestJS
export const VINCULACION_ASISTENCIA_PORT = 'VINCULACION_ASISTENCIA_PORT';

// Interfaz que define los métodos que el adaptador debe implementar
export interface IVinculacionAsistenciaPort {
  crearAsistenciaTutor(datos: CreateAsistenciaTutorDto): Promise<VinculacionAsistenciaTutor>;
  obtenerTodasLasAsistencias(): Promise<VinculacionAsistenciaTutor[]>;
  actualizarAsistenciaTutor(id: number, datos: UpdateAsistenciaTutorDto): Promise<VinculacionAsistenciaTutor | null>;
  eliminarAsistenciaTutor(id: number): Promise<boolean>;
  obtenerAsistenciasTutor(): Promise<VinculacionAsistenciaTutor[]>;
}
import { VinculacionAsistenciaTutor } from '../domain/vinculacion-asistencia-tutor.entity';
import { CreateAsistenciaTutorDto } from '../dto/create-asistencia-tutor.dto';
import { UpdateAsistenciaTutorDto } from '../dto/update-asistencia-tutor.dto';

export const VINCULACION_ASISTENCIA_TUTOR_PORT = 'VINCULACION_ASISTENCIA_TUTOR_PORT';

export interface IVinculacionAsistenciaTutorPort {
  obtainAsistenciasTutorPorDocenteRaw(idDocente: number): Promise<any>;
  obtainReporteAsistenciaTutorRaw(idVinculacion: number): Promise<any>;
  crearAsistenciaTutor(datos: CreateAsistenciaTutorDto): Promise<any>;
  actualizarAsistenciaTutor(id: number, datos: UpdateAsistenciaTutorDto): Promise<any>;
  eliminarAsistenciaTutor(id: number): Promise<any>;
  buscarPorId(id: number): Promise<VinculacionAsistenciaTutor | null>;
  buscarPorFechaYVinculacion(idVinculacion: number, fecha: string): Promise<VinculacionAsistenciaTutor | null>;
}
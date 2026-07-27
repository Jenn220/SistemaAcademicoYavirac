import { VinculacionEstudianteEntity } from '../domain/vinculacion-estudiante.entity';
import { CreateVinculacionDto } from '../dto/create-vinculacion.dto';
import { UpdateVinculacionEstudianteDto } from '../dto/update-vinculacion-estudiante.dto';

export const VINCULACION_ESTUDIANTE_PORT = 'VINCULACION_ESTUDIANTE_PORT';

export interface IVinculacionEstudiantePort {
  crearVinculacion(datos: CreateVinculacionDto): Promise<VinculacionEstudianteEntity>;
  obtenerVinculacionesEstudiantes(): Promise<VinculacionEstudianteEntity[]>;
  buscarVinculacionActiva(idEstudiante: number): Promise<any>;
  actualizarVinculacionEstudiante(id: number, datos: UpdateVinculacionEstudianteDto): Promise<VinculacionEstudianteEntity | null>;
  eliminarVinculacionEstudiante(id: number): Promise<boolean>;
  verificarRequisitosCierre(idVinculacion: number): Promise<any>;
  obtenerReporteConsolidado(idVinculacion: number): Promise<any>;
  obtenerInformeFinal(idVinculacion: number): Promise<any>;
  obtenerActaCompromiso(idVinculacion: number): Promise<any>;
  obtenerReporteAsistenciaTutor(idVinculacion: number): Promise<any>;
}
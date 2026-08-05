import { VinculacionActividadEstudiante } from "../domain/vinculacion_actividad_estudiante.entity";
import { CreateObservacionDto } from "../dto/create-observacion.dto";

export const VINCULACION_ASISTENCIA_ESTUDIANTE_PORT = Symbol('VINCULACION_ASISTENCIA_ESTUDIANTE_PORT');

export interface IVinculacionAsistenciaEstudiantePort {
  crearActividadEstudiante(datos: any): Promise<any>;
  actualizarActividadEstudiante(id: number, datos: any): Promise<any>;
  eliminarActividadEstudiante(idActividad: number, idVinculacionPropia?: string | number): Promise<boolean>;
  obtenerAsistenciaEstudianteRaw(idVinculacion: number): Promise<any[]>;
  buscarPorFechaYVinculacion(id_vinculacion: number | string, fecha: string): Promise<any | null>;
  buscarPorId(idActividad: number): Promise<VinculacionActividadEstudiante | null>;
  obtenerIdVinculacionPorEstudiante(idEstudiante: number | string): Promise<string | null>;
  guardarObservacion(dto: CreateObservacionDto): Promise<any>;
}
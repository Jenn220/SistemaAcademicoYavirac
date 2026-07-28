import { DetalleEvaluacionVinculacion } from '../domain/detalle-evaluacion-vinculacion.entity';
import { EvaluacionVinculacion } from '../domain/vinculacion-evaluacion';
import { CreateDetalleEvaluacionDto } from '../dto/create-detalle-evaluacion.dto';
import { CreateEvaluacionDto } from '../dto/create-evaluacion.dto';
import { UpdateDetalleEvaluacionDto } from '../dto/update-detalle-evaluacion.dto';
import { UpdateEvaluacionDto } from '../dto/update-evaluacion.dto';

// Token de Inyección de Dependencias
export const VINCULACION_EVALUACION_PORT = 'VINCULACION_EVALUACION_PORT';

export interface IVinculacionEvaluacionPort {
  actualizarEvaluacion(id: number, datos: UpdateEvaluacionDto): unknown;
  actualizarDetalleEvaluacion(id: number, datos: UpdateDetalleEvaluacionDto): Promise<any>;
  eliminarEvaluacion(id: number): Promise<boolean>;
  eliminarDetalleEvaluacion(id: number): Promise<boolean>;
  obtenerTodasLasEvaluaciones(): Promise<EvaluacionVinculacion[]>;
obtenerDetallesEvaluacion(idEvaluacion?: number): Promise<DetalleEvaluacionVinculacion[]>;
  obtenerEvaluacionPorVinculacion(idVinculacion: number): Promise<EvaluacionVinculacion | null>;
  crearEvaluacion(datos: CreateEvaluacionDto): Promise<any>;

  // 🟢 AGREGAR ESTA LÍNEA (Si vas a usar creación de detalles):
  crearDetalleEvaluacion(datos: CreateDetalleEvaluacionDto): Promise<any>;
}
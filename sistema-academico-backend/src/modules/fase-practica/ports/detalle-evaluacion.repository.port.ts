import { DetalleEvaluacionEntity } from '../domain/detalle-evaluacion.entity';

export const DETALLE_EVALUACION_REPOSITORY = 'DetalleEvaluacionRepository';

export interface IDetalleEvaluacionRepository {
  create(entity: Partial<DetalleEvaluacionEntity>): Promise<DetalleEvaluacionEntity>;
  findByEvaluacion(idEvaluacion: number): Promise<DetalleEvaluacionEntity[]>;
  findOne(id: number): Promise<DetalleEvaluacionEntity | null>;
  update(id: number, entity: Partial<DetalleEvaluacionEntity>): Promise<DetalleEvaluacionEntity>;
  remove(id: number): Promise<void>;
}

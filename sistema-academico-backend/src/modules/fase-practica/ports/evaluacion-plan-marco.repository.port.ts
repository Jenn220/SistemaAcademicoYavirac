import { CreateEvaluacionPlanMarcoDto } from '../dto/create-evaluacion-plan-marco.dto';
import { UpdateEvaluacionPlanMarcoDto } from '../dto/update-evaluacion-plan-marco.dto';
import { EvaluacionPlanMarcoEntity } from '../domain/evaluacion-plan-marco.entity';

export const EVALUACION_PLAN_MARCO_REPOSITORY = 'EvaluacionPlanMarcoRepository';

export interface IEvaluacionPlanMarcoRepository {
  create(dto: CreateEvaluacionPlanMarcoDto): Promise<EvaluacionPlanMarcoEntity>;
  findByPractica(idPractica: number): Promise<EvaluacionPlanMarcoEntity[]>;
  findById(id: number): Promise<EvaluacionPlanMarcoEntity | null>;
  findByItemPlanMarco(idItemPm: number): Promise<EvaluacionPlanMarcoEntity | null>;
  update(id: number, dto: UpdateEvaluacionPlanMarcoDto): Promise<EvaluacionPlanMarcoEntity>;
  remove(id: number): Promise<void>;
}

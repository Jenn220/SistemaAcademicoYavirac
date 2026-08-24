import { PlanRotacionEntity } from '../domain/plan-rotacion.entity';
import { CreatePlanRotacionDto } from '../dto/create-plan-rotacion.dto';
import { UpdatePlanRotacionDto } from '../dto/update-plan-rotacion.dto';

export const PLAN_ROTACION_REPOSITORY = 'PlanRotacionRepository';

export interface IPlanRotacionRepository {
  create(dto: CreatePlanRotacionDto): Promise<PlanRotacionEntity>;
  findByPractica(idPractica: number, skip?: number, take?: number): Promise<PlanRotacionEntity[]>;
  findById(id: number): Promise<PlanRotacionEntity | null>;
  update(id: number, dto: UpdatePlanRotacionDto): Promise<PlanRotacionEntity>;
  remove(id: number): Promise<void>;
}

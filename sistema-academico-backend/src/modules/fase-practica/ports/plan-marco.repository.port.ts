import { CreatePlanMarcoDto } from '../dto/create-plan-marco.dto';
import { UpdatePlanMarcoDto } from '../dto/update-plan-marco.dto';
import { PlanMarcoFormacionEntity } from '../domain/plan-marco-formacion.entity';

export const PLAN_MARCO_REPOSITORY = 'PlanMarcoRepository';

export interface IPlanMarcoRepository {
  create(dto: CreatePlanMarcoDto): Promise<PlanMarcoFormacionEntity>;
  findByPractica(idPractica: number, skip?: number, take?: number): Promise<PlanMarcoFormacionEntity[]>;
  findById(id: number): Promise<PlanMarcoFormacionEntity | null>;
  update(id: number, dto: UpdatePlanMarcoDto): Promise<PlanMarcoFormacionEntity>;
  remove(id: number): Promise<void>;
}

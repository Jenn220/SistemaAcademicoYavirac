import { PlanRotacionSemanaEntity } from '../domain/plan-rotacion-semana.entity';
import { CreatePlanRotacionSemanaDto } from '../dto/create-plan-rotacion-semana.dto';
import { UpdatePlanRotacionSemanaDto } from '../dto/update-plan-rotacion-semana.dto';

export const PLAN_ROTACION_SEMANA_REPOSITORY = 'PlanRotacionSemanaRepository';

export interface IPlanRotacionSemanaRepository {
  create(dto: CreatePlanRotacionSemanaDto): Promise<PlanRotacionSemanaEntity>;
  findByPlanRotacion(idPlanRotacion: number): Promise<PlanRotacionSemanaEntity[]>;
  findOne(id: number): Promise<PlanRotacionSemanaEntity | null>;
  update(id: number, dto: UpdatePlanRotacionSemanaDto): Promise<PlanRotacionSemanaEntity>;
  remove(id: number): Promise<void>;
  deleteByPlanRotacion(idPlanRotacion: number): Promise<void>;
}

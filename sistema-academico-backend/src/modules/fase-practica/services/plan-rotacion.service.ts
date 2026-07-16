import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { PLAN_ROTACION_REPOSITORY, IPlanRotacionRepository } from '../ports/plan-rotacion.repository.port';
import { CreatePlanRotacionDto } from '../dto/create-plan-rotacion.dto';
import { UpdatePlanRotacionDto } from '../dto/update-plan-rotacion.dto';
import { PlanRotacionEntity } from '../domain/plan-rotacion.entity';

@Injectable()
export class PlanRotacionService {
  constructor(
    @Inject(PLAN_ROTACION_REPOSITORY)
    private readonly planRotacionRepository: IPlanRotacionRepository,
  ) {}

  async create(dto: CreatePlanRotacionDto): Promise<PlanRotacionEntity> {
    return this.planRotacionRepository.create(dto);
  }

  async findByPractica(idPractica: number, skip?: number, take?: number): Promise<PlanRotacionEntity[]> {
    return this.planRotacionRepository.findByPractica(idPractica, skip, take);
  }

  async findById(id: number): Promise<PlanRotacionEntity> {
    const plan = await this.planRotacionRepository.findById(id);
    if (!plan) throw new NotFoundException(`No se encontró el plan de rotación con id ${id}`);
    return plan;
  }

  async update(id: number, dto: UpdatePlanRotacionDto): Promise<PlanRotacionEntity> {
    await this.findById(id);
    return this.planRotacionRepository.update(id, dto);
  }

  async remove(id: number): Promise<void> {
    await this.findById(id);
    return this.planRotacionRepository.remove(id);
  }
}

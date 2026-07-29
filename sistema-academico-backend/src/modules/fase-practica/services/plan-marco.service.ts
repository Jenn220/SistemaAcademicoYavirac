import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { PLAN_MARCO_REPOSITORY, IPlanMarcoRepository } from '../ports/plan-marco.repository.port';
import { CreatePlanMarcoDto } from '../dto/create-plan-marco.dto';
import { UpdatePlanMarcoDto } from '../dto/update-plan-marco.dto';

@Injectable()
export class PlanMarcoService {
  constructor(
    @Inject(PLAN_MARCO_REPOSITORY)
    private readonly planMarcoRepo: IPlanMarcoRepository,
  ) {}

  async create(dto: CreatePlanMarcoDto) {
    return this.planMarcoRepo.create(dto);
  }

  async findByPractica(idPractica: number, skip?: number, take?: number) {
    return this.planMarcoRepo.findByPractica(idPractica, skip, take);
  }

  async findById(id: number) {
    const plan = await this.planMarcoRepo.findById(id);
    if (!plan) throw new NotFoundException(`Plan marco con id ${id} no encontrado`);
    return plan;
  }

  async update(id: number, dto: UpdatePlanMarcoDto) {
    await this.findById(id);
    return this.planMarcoRepo.update(id, dto);
  }

  async remove(id: number) {
    await this.findById(id);
    await this.planMarcoRepo.remove(id);
    return { deleted: true, id_plan_marco: id };
  }
}

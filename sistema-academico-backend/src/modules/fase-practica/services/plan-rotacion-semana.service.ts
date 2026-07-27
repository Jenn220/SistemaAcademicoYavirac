import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { PLAN_ROTACION_SEMANA_REPOSITORY, IPlanRotacionSemanaRepository } from '../ports/plan-rotacion-semana.repository.port';
import { CreatePlanRotacionSemanaDto } from '../dto/create-plan-rotacion-semana.dto';
import { UpdatePlanRotacionSemanaDto } from '../dto/update-plan-rotacion-semana.dto';
import { PlanRotacionSemanaEntity } from '../domain/plan-rotacion-semana.entity';

@Injectable()
export class PlanRotacionSemanaService {
  constructor(@Inject(PLAN_ROTACION_SEMANA_REPOSITORY) private readonly repo: IPlanRotacionSemanaRepository) {}

  async create(dto: CreatePlanRotacionSemanaDto): Promise<PlanRotacionSemanaEntity> {
    return this.repo.create(dto);
  }

  async findByPlanRotacion(idPlanRotacion: number): Promise<PlanRotacionSemanaEntity[]> {
    return this.repo.findByPlanRotacion(idPlanRotacion);
  }

  async findOne(id: number): Promise<PlanRotacionSemanaEntity> {
    const entity = await this.repo.findOne(id);
    if (!entity) throw new NotFoundException(`Semana de plan de rotación con id ${id} no encontrada`);
    return entity;
  }

  async update(id: number, dto: UpdatePlanRotacionSemanaDto): Promise<PlanRotacionSemanaEntity> {
    await this.findOne(id);
    return this.repo.update(id, dto);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    return this.repo.remove(id);
  }
}

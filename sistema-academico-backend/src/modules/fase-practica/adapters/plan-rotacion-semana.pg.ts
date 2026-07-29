import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanRotacionSemanaEntity } from '../domain/plan-rotacion-semana.entity';
import { PLAN_ROTACION_SEMANA_REPOSITORY, IPlanRotacionSemanaRepository } from '../ports/plan-rotacion-semana.repository.port';

@Injectable()
export class PlanRotacionSemanaPg implements IPlanRotacionSemanaRepository {
  constructor(
    @InjectRepository(PlanRotacionSemanaEntity)
    private readonly repository: Repository<PlanRotacionSemanaEntity>,
  ) {}

  async create(dto: Partial<PlanRotacionSemanaEntity>): Promise<PlanRotacionSemanaEntity> {
    const entity = this.repository.create(dto);
    const saved = await this.repository.save(entity);
    return saved as PlanRotacionSemanaEntity;
  }

  async findByPlanRotacion(idPlanRotacion: number): Promise<PlanRotacionSemanaEntity[]> {
    return this.repository.find({ where: { id_plan_rotacion: idPlanRotacion }, order: { semana: 'ASC' } });
  }

  async findOne(id: number): Promise<PlanRotacionSemanaEntity | null> {
    return this.repository.findOne({ where: { id_rotacion_semana: id } });
  }

  async update(id: number, dto: any): Promise<PlanRotacionSemanaEntity> {
    const entity = await this.findOne(id);
    if (!entity) throw new NotFoundException(`Semana de plan de rotación con id ${id} no encontrada`);
    Object.assign(entity, dto);
    return this.repository.save(entity);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.findOne(id);
    if (!entity) throw new NotFoundException(`Semana de plan de rotación con id ${id} no encontrada`);
    await this.repository.remove(entity);
  }
}

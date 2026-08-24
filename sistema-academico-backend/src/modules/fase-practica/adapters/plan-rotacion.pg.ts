import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanRotacionEntity } from '../domain/plan-rotacion.entity';
import { CreatePlanRotacionDto } from '../dto/create-plan-rotacion.dto';
import { UpdatePlanRotacionDto } from '../dto/update-plan-rotacion.dto';
import { PLAN_ROTACION_REPOSITORY, IPlanRotacionRepository } from '../ports/plan-rotacion.repository.port';

@Injectable()
export class PlanRotacionPg implements IPlanRotacionRepository {
  constructor(
    @InjectRepository(PlanRotacionEntity)
    private readonly planRotacionRepository: Repository<PlanRotacionEntity>,
  ) {}

  async create(dto: CreatePlanRotacionDto): Promise<PlanRotacionEntity> {
    const plan = this.planRotacionRepository.create(dto);
    return this.planRotacionRepository.save(plan);
  }

  async findByPractica(idPractica: number, skip?: number, take?: number): Promise<PlanRotacionEntity[]> {
    return this.planRotacionRepository.find({ where: { id_practica: idPractica }, skip, take });
  }

  async findById(id: number): Promise<PlanRotacionEntity | null> {
    return this.planRotacionRepository.findOne({ where: { id_plan_rotacion: id } });
  }

  async update(id: number, dto: UpdatePlanRotacionDto): Promise<PlanRotacionEntity> {
    const plan = await this.findById(id);
    if (!plan) throw new NotFoundException(`No se encontró el plan de rotación con id ${id}`);
    Object.assign(plan, dto);
    return this.planRotacionRepository.save(plan);
  }

  async remove(id: number): Promise<void> {
    const plan = await this.findById(id);
    if (!plan) throw new NotFoundException(`No se encontró el plan de rotación con id ${id}`);
    await this.planRotacionRepository.remove(plan);
  }
}

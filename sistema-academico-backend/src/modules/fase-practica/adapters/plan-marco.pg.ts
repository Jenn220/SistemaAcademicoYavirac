import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanMarcoFormacionEntity } from '../domain/plan-marco-formacion.entity';
import { CreatePlanMarcoDto } from '../dto/create-plan-marco.dto';
import { UpdatePlanMarcoDto } from '../dto/update-plan-marco.dto';
import { PLAN_MARCO_REPOSITORY, IPlanMarcoRepository } from '../ports/plan-marco.repository.port';

@Injectable()
export class PlanMarcoPg implements IPlanMarcoRepository {
  constructor(
    @InjectRepository(PlanMarcoFormacionEntity)
    private readonly planMarcoRepository: Repository<PlanMarcoFormacionEntity>,
  ) {}

  async create(dto: CreatePlanMarcoDto): Promise<PlanMarcoFormacionEntity> {
    const plan = this.planMarcoRepository.create(dto);
    return this.planMarcoRepository.save(plan);
  }

  async findByPractica(idPractica: number, skip?: number, take?: number): Promise<PlanMarcoFormacionEntity[]> {
    return this.planMarcoRepository.find({ where: { id_practica: idPractica }, skip, take });
  }

  async findById(id: number): Promise<PlanMarcoFormacionEntity | null> {
    return this.planMarcoRepository.findOne({ where: { id_plan_marco: id } });
  }

  async update(id: number, dto: UpdatePlanMarcoDto): Promise<PlanMarcoFormacionEntity> {
    const plan = await this.findById(id);
    if (!plan) throw new NotFoundException(`No se encontró el plan marco con id ${id}`);
    Object.assign(plan, dto);
    return this.planMarcoRepository.save(plan);
  }

  async remove(id: number): Promise<void> {
    const plan = await this.findById(id);
    if (!plan) throw new NotFoundException(`No se encontró el plan marco con id ${id}`);
    await this.planMarcoRepository.remove(plan);
  }
}

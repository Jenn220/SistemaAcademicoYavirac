import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { PLAN_ROTACION_REPOSITORY, IPlanRotacionRepository } from '../ports/plan-rotacion.repository.port';
import { CreatePlanRotacionDto } from '../dto/create-plan-rotacion.dto';
import { UpdatePlanRotacionDto } from '../dto/update-plan-rotacion.dto';
import { PlanRotacionEntity } from '../domain/plan-rotacion.entity';
import { ITEM_PLAN_MARCO_REPOSITORY, IItemPlanMarcoRepository } from '../ports/item-plan-marco.repository.port';
import { PeriodoContextService } from './periodo-context.service';

@Injectable()
export class PlanRotacionService {
  constructor(
    @Inject(PLAN_ROTACION_REPOSITORY)
    private readonly planRotacionRepository: IPlanRotacionRepository,
    @Inject(ITEM_PLAN_MARCO_REPOSITORY)
    private readonly itemPlanMarcoRepository: IItemPlanMarcoRepository,
    private readonly periodoContextService: PeriodoContextService,
  ) {}

  async create(dto: CreatePlanRotacionDto): Promise<PlanRotacionEntity> {
    const itemPlanMarco = await this.itemPlanMarcoRepository.findById(dto.id_item_pm);
    if (!itemPlanMarco) {
      throw new NotFoundException(`Item plan marco con id ${dto.id_item_pm} no encontrado`);
    }

    await this.periodoContextService.validarPeriodoActivoDesdePractica(dto.id_practica);

    const data = {
      id_practica: dto.id_practica,
      id_item_pm: dto.id_item_pm,
      puesto_aprendizaje: dto.puesto_aprendizaje != null ? dto.puesto_aprendizaje : itemPlanMarco.puesto_aprendizaje,
    };

    return this.planRotacionRepository.create(data);
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
    const plan = await this.findById(id);
    await this.periodoContextService.validarPeriodoActivoDesdePractica(plan.id_practica);
    return this.planRotacionRepository.update(id, dto);
  }

  async remove(id: number): Promise<void> {
    const plan = await this.findById(id);
    await this.periodoContextService.validarPeriodoActivoDesdePractica(plan.id_practica);
    return this.planRotacionRepository.remove(id);
  }
}

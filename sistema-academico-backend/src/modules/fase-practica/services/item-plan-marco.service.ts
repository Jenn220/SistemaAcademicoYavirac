import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ITEM_PLAN_MARCO_REPOSITORY, IItemPlanMarcoRepository } from '../ports/item-plan-marco.repository.port';
import { CreateItemPlanMarcoDto } from '../dto/create-item-plan-marco.dto';
import { UpdateItemPlanMarcoDto } from '../dto/update-item-plan-marco.dto';

@Injectable()
export class ItemPlanMarcoService {
  constructor(
    @Inject(ITEM_PLAN_MARCO_REPOSITORY)
    private readonly itemPlanMarcoRepo: IItemPlanMarcoRepository,
  ) {}

  async create(dto: CreateItemPlanMarcoDto) {
    return this.itemPlanMarcoRepo.create(dto);
  }

  async findByPlanMarco(idPlanMarco: number, skip?: number, take?: number) {
    return this.itemPlanMarcoRepo.findByPlanMarco(idPlanMarco, skip, take);
  }

  async findById(id: number) {
    const item = await this.itemPlanMarcoRepo.findById(id);
    if (!item) throw new NotFoundException(`Item plan marco con id ${id} no encontrado`);
    return item;
  }

  async update(id: number, dto: UpdateItemPlanMarcoDto) {
    await this.findById(id);
    return this.itemPlanMarcoRepo.update(id, dto);
  }

  async remove(id: number) {
    await this.findById(id);
    await this.itemPlanMarcoRepo.remove(id);
    return { deleted: true, id_item_pm: id };
  }
}

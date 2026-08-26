import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemPlanMarcoEntity } from '../domain/item-plan-marco.entity';
import { CreateItemPlanMarcoDto } from '../dto/create-item-plan-marco.dto';
import { UpdateItemPlanMarcoDto } from '../dto/update-item-plan-marco.dto';
import { ITEM_PLAN_MARCO_REPOSITORY, IItemPlanMarcoRepository } from '../ports/item-plan-marco.repository.port';

@Injectable()
export class ItemPlanMarcoPg implements IItemPlanMarcoRepository {
  constructor(
    @InjectRepository(ItemPlanMarcoEntity)
    private readonly itemPlanMarcoRepository: Repository<ItemPlanMarcoEntity>,
  ) {}

  async create(dto: CreateItemPlanMarcoDto): Promise<ItemPlanMarcoEntity> {
    const item = this.itemPlanMarcoRepository.create(dto);
    return this.itemPlanMarcoRepository.save(item);
  }

  async findByPlanMarco(idPlanMarco: number, skip?: number, take?: number): Promise<ItemPlanMarcoEntity[]> {
    return this.itemPlanMarcoRepository.find({ where: { id_plan_marco: idPlanMarco }, skip, take });
  }

  async findById(id: number): Promise<ItemPlanMarcoEntity | null> {
    return this.itemPlanMarcoRepository.findOne({ where: { id_item_pm: id } });
  }

  async update(id: number, dto: UpdateItemPlanMarcoDto): Promise<ItemPlanMarcoEntity> {
    const item = await this.findById(id);
    if (!item) throw new NotFoundException(`No se encontró el item plan marco con id ${id}`);
    Object.assign(item, dto);
    return this.itemPlanMarcoRepository.save(item);
  }

  async remove(id: number): Promise<void> {
    const item = await this.findById(id);
    if (!item) throw new NotFoundException(`No se encontró el item plan marco con id ${id}`);
    await this.itemPlanMarcoRepository.remove(item);
  }
}

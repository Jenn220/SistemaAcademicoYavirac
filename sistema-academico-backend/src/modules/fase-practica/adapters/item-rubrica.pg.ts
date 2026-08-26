import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemRubricaEntity } from '../domain/item-rubrica.entity';
import { ITEM_RUBRICA_REPOSITORY, IItemRubricaRepository } from '../ports/item-rubrica.repository.port';

@Injectable()
export class ItemRubricaPg implements IItemRubricaRepository {
  constructor(
    @InjectRepository(ItemRubricaEntity)
    private readonly repository: Repository<ItemRubricaEntity>,
  ) {}

  async create(entity: Partial<ItemRubricaEntity>): Promise<ItemRubricaEntity> {
    const item = this.repository.create(entity);
    return this.repository.save(item);
  }

  async findByPlanMarco(idEvaluacionPlanMarco: number): Promise<ItemRubricaEntity[]> {
    return this.repository.find({ where: { id_rubrica: idEvaluacionPlanMarco } });
  }

  async findOne(id: number): Promise<ItemRubricaEntity | null> {
    return this.repository.findOne({ where: { id_item: id } });
  }

  async update(id: number, entity: Partial<ItemRubricaEntity>): Promise<ItemRubricaEntity> {
    const item = await this.findOne(id);
    if (!item) throw new NotFoundException(`Item rubrica con id ${id} no encontrado`);
    Object.assign(item, entity);
    return this.repository.save(item);
  }

  async remove(id: number): Promise<void> {
    const item = await this.findOne(id);
    if (!item) throw new NotFoundException(`Item rubrica con id ${id} no encontrado`);
    await this.repository.remove(item);
  }
}

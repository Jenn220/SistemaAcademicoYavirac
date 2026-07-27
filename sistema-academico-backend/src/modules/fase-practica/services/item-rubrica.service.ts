import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ITEM_RUBRICA_REPOSITORY, IItemRubricaRepository } from '../ports/item-rubrica.repository.port';
import { CreateItemRubricaDto } from '../dto/create-item-rubrica.dto';
import { UpdateItemRubricaDto } from '../dto/update-item-rubrica.dto';
import { ItemRubricaEntity } from '../domain/item-rubrica.entity';

@Injectable()
export class ItemRubricaService {
  constructor(@Inject(ITEM_RUBRICA_REPOSITORY) private readonly repo: IItemRubricaRepository) {}

  async create(dto: CreateItemRubricaDto): Promise<ItemRubricaEntity> {
    return this.repo.create(dto);
  }

  async findByRubrica(idRubrica: number): Promise<ItemRubricaEntity[]> {
    return this.repo.findByPlanMarco(idRubrica);
  }

  async findOne(id: number): Promise<ItemRubricaEntity> {
    const item = await this.repo.findOne(id);
    if (!item) throw new NotFoundException(`Item de rúbrica con id ${id} no encontrado`);
    return item;
  }

  async update(id: number, dto: UpdateItemRubricaDto): Promise<ItemRubricaEntity> {
    await this.findOne(id);
    return this.repo.update(id, dto);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    return this.repo.remove(id);
  }
}

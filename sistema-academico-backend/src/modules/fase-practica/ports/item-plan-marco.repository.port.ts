import { CreateItemPlanMarcoDto } from '../dto/create-item-plan-marco.dto';
import { UpdateItemPlanMarcoDto } from '../dto/update-item-plan-marco.dto';
import { ItemPlanMarcoEntity } from '../domain/item-plan-marco.entity';

export const ITEM_PLAN_MARCO_REPOSITORY = 'ItemPlanMarcoRepository';

export interface IItemPlanMarcoRepository {
  create(dto: CreateItemPlanMarcoDto): Promise<ItemPlanMarcoEntity>;
  findByPlanMarco(idPlanMarco: number, skip?: number, take?: number): Promise<ItemPlanMarcoEntity[]>;
  findById(id: number): Promise<ItemPlanMarcoEntity | null>;
  update(id: number, dto: UpdateItemPlanMarcoDto): Promise<ItemPlanMarcoEntity>;
  remove(id: number): Promise<void>;
}

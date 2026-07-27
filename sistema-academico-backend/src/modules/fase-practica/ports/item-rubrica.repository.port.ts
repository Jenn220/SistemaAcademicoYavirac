import { ItemRubricaEntity } from '../domain/item-rubrica.entity';

export const ITEM_RUBRICA_REPOSITORY = 'ItemRubricaRepository';

export interface IItemRubricaRepository {
  create(entity: Partial<ItemRubricaEntity>): Promise<ItemRubricaEntity>;
  findByPlanMarco(idEvaluacionPlanMarco: number): Promise<ItemRubricaEntity[]>;
  findOne(id: number): Promise<ItemRubricaEntity | null>;
  update(id: number, entity: Partial<ItemRubricaEntity>): Promise<ItemRubricaEntity>;
  remove(id: number): Promise<void>;
}

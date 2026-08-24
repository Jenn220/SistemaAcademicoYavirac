import { RubricaEntity } from '../domain/rubrica.entity';
import { CreateRubricaDto } from '../dto/create-rubrica.dto';
import { UpdateRubricaDto } from '../dto/update-rubrica.dto';

export const RUBRICA_REPOSITORY = 'RubricaRepository';

export interface IRubricaRepository {
  create(dto: CreateRubricaDto): Promise<RubricaEntity>;
  findAll(skip?: number, take?: number): Promise<RubricaEntity[]>;
  findById(id: number): Promise<RubricaEntity | null>;
  update(id: number, dto: UpdateRubricaDto): Promise<RubricaEntity>;
  remove(id: number): Promise<void>;
}

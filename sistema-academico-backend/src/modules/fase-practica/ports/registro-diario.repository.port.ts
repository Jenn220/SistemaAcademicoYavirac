import { RegistroDiarioEntity } from '../domain/registro-diario.entity';
import { CreateRegistroDiarioDto } from '../dto/create-registro-diario.dto';
import { UpdateRegistroDiarioDto } from '../dto/update-registro-diario.dto';

export const REGISTRO_DIARIO_REPOSITORY = 'RegistroDiarioRepository';

export interface IRegistroDiarioRepository {
  create(dto: CreateRegistroDiarioDto): Promise<RegistroDiarioEntity>;
  findByPractica(idPractica: number, skip?: number, take?: number): Promise<RegistroDiarioEntity[]>;
  findById(id: number): Promise<RegistroDiarioEntity | null>;
  update(id: number, dto: UpdateRegistroDiarioDto): Promise<RegistroDiarioEntity>;
  remove(id: number): Promise<void>;
  createWithRecalculoHoras(dto: CreateRegistroDiarioDto): Promise<RegistroDiarioEntity>;
  updateWithRecalculoHoras(id: number, dto: UpdateRegistroDiarioDto): Promise<RegistroDiarioEntity>;
  removeWithRecalculoHoras(id: number): Promise<void>;
}

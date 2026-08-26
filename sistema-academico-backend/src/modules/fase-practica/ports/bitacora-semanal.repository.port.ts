import { BitacoraSemanalEntity } from '../domain/bitacora-semanal.entity';
import { CreateBitacoraSemanalDto } from '../dto/create-bitacora-semanal.dto';
import { UpdateBitacoraSemanalDto } from '../dto/update-bitacora-semanal.dto';

export const BITACORA_SEMANAL_REPOSITORY = 'BitacoraSemanalRepository';

export interface IBitacoraSemanalRepository {
  create(dto: CreateBitacoraSemanalDto): Promise<BitacoraSemanalEntity>;
  findByInforme(idInforme: number, skip?: number, take?: number): Promise<BitacoraSemanalEntity[]>;
  findById(id: number): Promise<BitacoraSemanalEntity | null>;
  update(id: number, dto: UpdateBitacoraSemanalDto): Promise<BitacoraSemanalEntity>;
  remove(id: number): Promise<void>;
}
